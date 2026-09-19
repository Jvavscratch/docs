---
title: Core
description: AST dispatch, the block accumulator, syntax rewriting, error reporting, and the per-build scratch directory.
---

# Core module

`core` is the middle of the compiler. It knows how to walk a Babel AST, how to
look up the generator for a node, how to chain the generated blocks together, and
how to report an error — but it does not know what any particular node compiles
*to*. It is deliberately ignorant of `generator`, which is what makes the
dependency direction work.

It is also where the compiler's mutable state lives: the block accumulator and
the per-build scratch directory.

## What is in the package

| File | Responsibility |
| --- | --- |
| `core/src/env/parseProgram.ts` | The AST walker. Parses source, applies third-party overrides, dispatches each statement, and links the results. |
| `core/src/env/transformSyntax.ts` | Babel-based rewrite pass that converts syntax Scratch cannot express into syntax it can. |
| `core/src/util/blocks.ts` | `BlockCluster`, `createBlock`, `createMutation`, `isSpiky`, `isSpikyType`. |
| `core/src/util/registry.ts` | The four dispatch tables and their accessors. |
| `core/src/util/evaluate.ts` | `evaluate()`: value dispatch. |
| `core/src/util/err.ts` | `JvavscratchError`, `Warn`, `FatalErr`, `ErrorPosition`. |
| `core/src/util/buildContext.ts` | The per-build scratch directory. |
| `core/src/index.ts` | Re-exports everything, so `@jvavscratch/core` is one flat import. |

The package publishes subpath exports as well — `@jvavscratch/core/env`,
`@jvavscratch/core/util` and `@jvavscratch/core/registry` — which is a
convenience only. Unlike `generator`, importing a `core` subpath is safe: `core`
has no registration side effect to skip.

## The block accumulator

Scratch's `project.json` models a script as a flat dictionary of blocks keyed by
opaque ID, with order carried entirely by `next` and `parent` pointers.
`BlockCluster` (`core/src/util/blocks.ts`) is the accumulator for that shape:

```ts
class BlockCluster {
    blocks: { [key: string]: Block } = {};
    constructor(inbuiltBlocks?: { [key: string]: Block }) { /* ... */ }
    addBlocks(blocks: { [key: string]: Block }) { /* shallow merge */ }
}
```

Two things follow from this design, and they explain most of the compiler's
structure:

- **Nothing is keyed by name.** There is no way to ask "where is the block for
  variable `x`" — only "which block has ID `abc`". Duplicate logical constructs
  produce duplicate blocks, and that is fine.
- **Order is pointer order.** Because IDs are random, the only way to know what
  runs next is to follow `next`. A generator that returns its blocks in the wrong
  order produces a script that runs in the wrong order with no error.

`createBlock()` and `createMutation()` build blocks with default values
(`parent: null`, `next: null`, empty `inputs`/`fields`, `topLevel: false`).
`createMutation()` additionally sets a `mutation` field, which Scratch requires
for procedure definitions, procedure calls, and list/broadcast blocks — those
opcodes are identified to the VM by their mutation, not just their opcode. Call
`createMutation` for anything in that family and `createBlock` for everything
else.

Every ID comes from `uuid()` in `types`, which uses `crypto.randomInt` rather
than `Math.random()`. IDs are therefore unpredictable but collision-checked, and
— relevant when diffing builds — different on every run.

### Boolean slots

Scratch only accepts a boolean reporter, another logical operator, or a binary
comparison in a boolean input slot. `isSpiky(opCode)` and `isSpikyType(lib, fn)`
answer "does this return a boolean?" for opcodes and for library functions
respectively, and the generators consult them before placing a value into a
condition.

The lists are explicit:

- **Spiky opcodes** — `sensing_touchingcolor`, `sensing_touchingobject`,
  `sensing_coloristouchingcolor`, `sensing_keypressed`,
  `sensing_mousedown`, and the operators `>`, `<`, `=`, `and`, `or`, `not`,
  `contains`.
- **Spiky library functions** — `operation.stringContains`, and `sensing`'s
  `touching`, `touchingColor`, `colorIsTouchingColor`, `mouseDown`, `keyDown`.

`isSpikyType` looks the function up in a hard-coded map, so a third-party library
function cannot declare itself spiky today — an extension that returns a boolean
must produce a comparison block or be wrapped by whoever consumes it.

## Dispatch: the registry

The registry (`core/src/util/registry.ts`) holds four `Map`s:

| Table | Key | Value | Registered by |
| --- | --- | --- | --- |
| `statements` | Babel node type, e.g. `IfStatement` | statement generator | `registerStatement` |
| `types` | Babel node type, e.g. `NumericLiteral` | value generator | `registerType` |
| `blockLibraries` | library name, e.g. `motion` | `{ fnName: impl }` | `registerLibrary("block", …)` |
| `valueLibraries` | library name, e.g. `list` | `{ fnName: impl }` | `registerLibrary("value", …)` |

The accessors are `getStatement`, `getType`, `getLibrary(kind, name)`,
`registeredCounts()` and — for tests only — `clearRegistry()`.

### Why a registry instead of a `require()` path

`core` cannot depend on `generator`, so it cannot import a generator to call it.
The original implementation resolved this by building a path at runtime:

```ts
// the old approach -- do not do this
const impl = require(join(__dirname, "../generator/" + node.type));
```

That approach had two failure modes. The split made the relative path point
nowhere, and — worse — the lookup appended a `.ts` extension, while the compiled
artifact is `.js`, so `existsSync("Foo.ts")` was always false. Whole node types
(`ExpressionStatement`, `CallExpression`, `types/CallExpression`) were silently
skipped and the only symptom was a build that produced almost nothing.

The relationship is now inverted: `generator`'s entry point registers all its
generators into these maps as an import side effect, and `core` only ever looks
names up. As a side benefit, built-in generators and third-party packages now
travel the same path.

::: danger Always import the generator package by its main entry
`import "@jvavscratch/generator"` runs the registration. A subpath import such as
`@jvavscratch/generator/optimise` does **not** — the tables stay empty and a
build emits a near-empty `project.json` with a single warning as the only clue.
This is the most common cause of "my build produced nothing".
:::

### Precedence is asymmetric — on purpose

Both `parseProgram` and `evaluate` check the third-party tables *before* the
built-in ones. A package that implements `IfStatement` therefore replaces the
built-in handling of `if` entirely, for the whole project. Library lookups go the
other way: the built-in library table is consulted first, and an installed
package only supplies a library that has no built-in of that name.

The asymmetry is intentional. Overriding a *node type* is a deliberate,
whole-language act, and the package author has opted into it. Overriding a
*library function* — `looks.say`, say — would silently change the meaning of
existing code in ways that are much harder to see.

## `parseProgram`

```ts
parseProgram(
    string: string | BlockStatement,
    sourceFilename: string,
    includeHat: boolean,
    packageData: { [key: string]: any },
    metadata?: { [key: string]: any }
): { blocks: { [key: string]: Block }, firstIndex: string }
```

This is the whole AST walker, in `core/src/env/parseProgram.ts`. It runs in four
phases.

### 1. Parse

If given a string, it runs `transformSyntax()` first (see below) and then
`babel.parse()` with `sourceType: 'module'` and the TypeScript and JSX plugins
enabled. A `BABEL_PARSER_SYNTAX_ERROR` becomes a `JvavscratchError` with the
position attached; any other parse failure falls through to `process.exit()`.

If given a `BlockStatement`, that is used directly — this is how procedure bodies
and other nested programs are compiled.

### 2. Build the hat block

When `includeHat` is true, one `topLevel: true` block is created and its opcode
is chosen from **the first comment in the file**. The comment must start with
`#`; its body is parsed by `parseFunctionCall` as `name(args)`, and the name
selects an opcode:

| Directive | Opcode |
| --- | --- |
| *(none, or anything unrecognised)* | `event_whenflagclicked` |
| `#whenThisSpriteClicked()` | `event_whenthisspriteclicked` |
| `#start_as_clone()` | `control_start_as_clone` |
| `#whenKeyPressed(key)` | `event_whenkeypressed`, `KEY_OPTION` field |
| `#whenBackdropSwitchesTo(name)` | `event_whenbackdropswitchesto` |
| `#whenGreaterThan(LOUDNESS\|TIMER, value)` | `event_whengreaterthan` |
| `#whenBroadcastReceived(name)` | `event_whenbroadcastreceived` |

Two details worth knowing. `#start_as_clone()` is the only directive prefixed
`control_`; everything else is prefixed `event_`. And `#whenKeyPressed` validates
its argument against an explicit list of 39 accepted key names — anything else,
including a typo, silently falls back to `space` rather than warning.

### 3. Dispatch each statement

For each top-level node in order:

1. `EmptyStatement` is skipped outright.
2. The third-party `statement_implements` table is scanned for a matching
   `name`; on a hit, that body is used.
3. Otherwise `getStatement(nodeType)` is consulted. A miss prints
      A missing impl prints a warning via `Warn()` and **skips the node** — the
   build continues.
4. The implementation is called as
   `data(blockCluster, program[i], buildData)`.

The `buildData` object handed to each generator is assembled here:

```ts
{
    instruction: i,               // index of this statement
    originalSource,               // the file text, for error snippets
    packages: packageData,        // the merged package config
    listIndexBase: metadata?.listIndexBase || 1,
    ...metadata                   // merged last, so it can override the above
}
```

Because `...metadata` is spread last, a `listIndexBase` passed in `metadata`
replaces the `|| 1` default rather than being merged with it. That is why the CLI
must pass a normalised value — see the `list_index_base` note on the
[CLI page](/modules/cli#project-and-asset-layout).

### 4. Handle the result

The `generatedData` a statement generator returns has four meaningful fields:

| Field | Effect |
| --- | --- |
| `keysGenerated: string[]` | The IDs of the blocks produced, **in execution order**. |
| `terminate?: boolean` | Stop walking the rest of the file. Used by `return`-like constructs. |
| `err?: boolean` | Drop this node **silently**. No warning, no block. |
| `doNotParent?: boolean` | Emit the blocks but do not link them into the chain. |

A falsy return value, an empty `keysGenerated`, or `err: true` all skip the
linking step. Otherwise the first key gets `parent = lastKey` and the previous
key gets `next = firstKey`, where `lastKey` starts as the hat block (or `null`
when there is no hat) and is updated to the **last** key of each group.

This is why the contract says *return keys in execution order*: the compiler
believes the array, and the last element is what the next statement attaches to.
A generator that returns its blocks out of order produces a scrambled script.

When `terminate` is true the loop breaks *before* updating `lastKey`, so the
blocks already linked stay linked and the remaining statements are never visited.

::: tip A fixed bug worth knowing about
The third-party override loop used to reuse the outer loop variable `i`, which
shadowed the statement index. The condition therefore compared
`program[i].type` against the *i*-th entry of the `statement_implements` array —
the pairing was effectively random and only lined up by coincidence. It now uses
a separate variable (`k`), so an override applies to the node type it names.
:::

## `evaluate`

```ts
evaluate(type: string, blockCluster: BlockCluster, instance: any, id: string, buildData: buildData): typeData
```

Value dispatch, in `core/src/util/evaluate.ts`. The shape mirrors `parseProgram`:
third-party `type_implements` first, then `getType(type)`, then call the
implementation as `data(blockCluster, instance, id, buildData)`.

The difference is what happens on a miss. A missing *statement* warns and is
skipped; a missing *type* raises a `JvavscratchError`, because there is no
sensible fallback for "I don't know what this expression is" — an earlier version
merely logged and then crashed with an unrelated `TypeError`. The error names the
offending type and points at the expression's `loc`:

```
error: No implementation for expression type 'ObjectPattern'.
```

A value generator returns a `typeData`:

| Field | Meaning |
| --- | --- |
| `isStaticValue` | The value was folded to a literal; no block reference is needed. |
| `blockId` | The ID of the block that computes it. |
| `block` | The `ScratchInput` tuple to place in the parent's `inputs`, or `null`. |

## `transformSyntax`

`core/src/env/transformSyntax.ts` exists because the user writes a JavaScript
dialect and Scratch only has a fraction of JavaScript's constructs. It is a
single Babel plugin with two entry points — `transformSyntax(code)` for text and
`transformAST(node)` for a subtree — and it rewrites:

| Source | Becomes | Why |
| --- | --- | --- |
| `a ** b` | `math.pow(a, b)` | Scratch has no exponentiation operator. |
| `cond ? a : b` | `let __jvavscratch_temp; if (cond) { __jvavscratch_temp = a } else { __jvavscratch_temp = b }` | Scratch has no ternary. |
| `a && b` | `a ? b : a` | No short-circuit operator; the ternary rewrite preserves the semantics. |
| `a \|\| b` | `a ? a : b` | Same. |
| `myList[i]` | `list.getItem("myList", i)` | Lists are Scratch list blocks, not arrays. |
| `myList[i] = v` | `list.replace("myList", i, v)` | Same. |
| `myList.length` | `list.length("myList")` | Same. |
| `Math.PI` | `math.pi()` | |
| `Math.abs(x)` etc. | `math.operation("abs", x)` | `floor`, `ceil`→`ceiling`, `sqrt`, `sin`, `cos`, `tan`, `log`. |
| `Math.round(x)`, `Math.pow(a,b)` | `math.round(x)`, `math.pow(a,b)` | |
| `Math.random()`, `Math.random(a,b)` | `math.random(0,1)`, `math.random(a,b)` | The no-argument form gets an explicit range. |
| `for (let i = 0; …)` | `let i = 0; for (i = 0; …)` | Scratch has no loop-scoped variable, so declarations are hoisted out of the loop. |

Two rules matter for correctness:

- **`&&`, `||` and ternaries are left alone inside a condition context** — the
  test of an `if`/`while`/`for`, or an operand of another logical expression.
  Only there can Scratch actually hold a boolean operator, so rewriting would be
  counterproductive.
- **A ternary cannot always be rewritten in place.** When it sits inside a
  function argument or another binary expression, the plugin replaces the
  expression with `__jvavscratch_temp` and inserts the declaration and `if`
  before the enclosing statement. That works, but it means the rest of the
  original expression is evaluated as a separate statement — a known
  simplification, commented as such in the source.

If the transform itself throws, the original code is returned unchanged and the
error is printed. The parse in `parseProgram` then sees the untransformed source.

## Errors

`core/src/util/err.ts` implements a Rust-like diagnostic printer. The
`JvavscratchError` constructor **prints and calls `process.exit(1)` itself** —
constructing one is a terminating action, not a throw, and the `new` is a
formality to satisfy the type checker. Its fields are `message`, `codeSnippet`,
`positions` (`ErrorPosition[]`), `filePath` and an optional `help`.

`ErrorPosition` carries `line`, `column`, `length` and an optional `message`
(the `help:` line), plus `displayLine` / `displayColumn` to point somewhere other
than the reported position.

Two smaller helpers:

- `Warn(message)` prints the message prefixed with `[Warn]:` in yellow and returns. Used for
  recoverable problems — an unimplemented node type, an unknown library.
- `FatalErr(message)` prints the message prefixed with `[Fatal]:` in red and exits.

The three mechanisms are not interchangeable. A syntax error is a
`JvavscratchError`; an unknown library function is a `Warn`; an unknown
*expression* type is a `JvavscratchError`. That spread is historical, and
generator code should follow the local convention of the file it edits.

## The build scratch directory

`core/src/util/buildContext.ts` is small but load-bearing:

```ts
setBuildScratchDir(dir)   // called by the CLI at the start of a build
getBuildScratchDir()      // lazily mkdtemp's a process-wide dir when unset
scratchFile(name)         // join(getBuildScratchDir(), name)
resetBuildScratchDir()    // clears the reference (tests)
```

The compiler keeps five mutable intermediate files — `fn.json` (functions),
`classData.json` (classes), `broadcasts.json`, `variables.json`, `lists.json` —
that the CLI empties at the start of a build and generators append to as
compilation proceeds. They are a side channel, not configuration: a generator
registers a function by writing to `fn.json`, and the assembly step reads it back
afterwards.

Before the split these lived in `src/assets/` and each package found them by
walking up from its own `__dirname` (`../assets` from `cli`, `../../assets` from
`generator`). That broke in three ways:

1. After the split, the two relative paths pointed at different places and the
   build failed outright.
2. The files were written into the **installed package directory** — an
   immediate `EACCES` under a global install or a read-only mount, and it
   polluted whatever `npm install` had unpacked.
3. The path was fixed, so **two concurrent builds destroyed each other's state**
   and produced garbled output.

The fix is that the CLI `mkdtempSync`s a directory per build, hands it over with
`setBuildScratchDir()`, and deletes it in a `finally`. The lazy `mkdtemp` in
`getBuildScratchDir()` exists so that a generator used on its own — in a test,
say — still behaves correctly without setup.

**Anything new that needs a runtime file goes through `scratchFile()`.** Writing
next to the compiled source reintroduces all three problems.

## Tests

`core` is the only package with tests: three files, 26 cases, run with jest and
`ts-jest`.

```bash
cd core && npm test
npx jest tests/blocks.test.ts              # one file
npx jest -t 'should add blocks correctly'  # one test by name
```

| File | Cases | Covers |
| --- | --- | --- |
| `core/tests/blocks.test.ts` | 11 | `BlockCluster`, `createBlock`, `createMutation`, `isSpiky` |
| `core/tests/scratch-type.test.ts` | 9 | the `ScratchInput` tuple builders |
| `core/tests/scratch-uuid.test.ts` | 6 | `uuid()` length, alphabet and uniqueness |

Nothing exercises `parseProgram`, `evaluate` or `transformSyntax`. Those are
verified by building a real project — see [Testing the compiler](/modules/#tests).
