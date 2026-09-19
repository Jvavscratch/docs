---
title: Generator
description: One generator per Babel node, the four built-in library tables, procedure machinery, and the alpha optimiser.
---

# Generator module

`generator` is where JavaScript becomes Scratch. Every construct in the language
— `if`, `for`, `let`, `foo()`, `a + b`, `looks.say(...)` — has exactly one
implementation here, and each implementation builds Scratch blocks.

It is the largest package in the repository and the only one that depends on
`utils` purely for the `createGlobal` / `createLibrary` helpers.

## What is in the package

The layout *is* the dispatch table. A generator's file name is the key it
registers under, so the directory tells you which table it lands in:

| Directory | Registered as | Key | Example |
| --- | --- | --- | --- |
| `generator/src/generator/<NodeType>.ts` | `registerStatement` | Babel node type | `IfStatement.ts`, `ForStatement.ts` |
| `generator/src/generator/types/<NodeType>.ts` | `registerType` | Babel node type | `BinaryExpression.ts`, `NumericLiteral.ts` |
| `generator/src/generator/CallExpressionSub/<lib>.ts` | `registerLibrary("block", …)` | library name | `motion.ts`, `looks.ts` |
| `generator/src/generator/types/CallExpressionSub/<lib>.ts` | `registerLibrary("value", …)` | library name | `math.ts`, `list.ts` |

```text
generator/src/
  index.ts                       # generated: the registration file
  generator/                     # 13 statement generators
    CallExpressionSub/           # 10 block libraries
    types/                       # 10 value generators
      CallExpressionSub/         # 9 value libraries
  optimise/                      # the alpha post-pass (not a generator)
```

## The registration entry

`generator/src/index.ts` is **generated** by `generator/scripts/gen-index.js`. It
`require()`s every generator and hands it to `core`:

```ts
import { registerStatement, registerType, registerLibrary } from "@jvavscratch/core";

registerStatement("IfStatement", require("./generator/IfStatement"));
registerType("NumericLiteral", require("./generator/types/NumericLiteral"));
registerLibrary("block", "motion", require("./generator/CallExpressionSub/motion"));
registerLibrary("value", "math", require("./generator/types/CallExpressionSub/math"));

export * from "./optimise";
```

In total **42 implementations** are registered: 13 statement generators, 10 value
generators, 10 block libraries and 9 value libraries. The script counts them and
writes the number into the banner, so the comment cannot drift.

Two rules:

- **Re-run the script after adding or removing a generator file**:
  `node scripts/gen-index.js`. Nothing scans the directory at runtime. A new file
  that is not in `index.ts` is invisible; a deleted file left in `index.ts` makes
  the entry throw on import.
- **`require()` is not optional here.** Every generator is CommonJS in the
  `module.exports = fn` form. Writing `import x from "./generator/Foo"` makes tsc
  report TS1192 (the module has no default export), because a
  `module.exports = fn` assignment produces no named exports and no `.d.ts` for
  them.

::: danger Import the package by its main entry
Importing `@jvavscratch/generator` is what runs this file. A subpath import such
as `@jvavscratch/generator/optimise` loads the optimiser without the
registrations, leaving `core`'s tables empty — a build then emits a near-empty
`project.json` with a single warning as the only symptom.
:::

## Statement generators

Contract:

```ts
module.exports = (blockCluster: BlockCluster, node: T, buildData: buildData) => generatedData
```

```ts
type generatedData = {
    keysGenerated: string[]   // IDs of the blocks produced, in EXECUTION ORDER
    terminate?: boolean       // stop walking the rest of the file
    err?: boolean             // drop this node silently
    doNotParent?: boolean     // emit blocks but do not link them into the chain
}
```

The full semantics of the return value — including how `parseProgram` links the
first key to the previous group and the last key to the next — are on the
[Core page](/modules/core#4-handle-the-result). The short version: **the array
order is the program order.** The compiler trusts it.

`terminate` is what `return`-like nodes use to cut a chain short; `err` is the
"this construct is not supported, say nothing" escape hatch, and it is genuinely
silent — there is no warning, only a missing block, so prefer an explicit
`Warn()` plus `err` when the user could have fixed their code.

## Value generators

Contract:

```ts
module.exports = (blockCluster: BlockCluster, node: T, parentId: string, buildData: buildData) => typeData
```

```ts
type typeData = {
    isStaticValue: boolean          // folded to a literal; no block reference
    blockId: string | null
    block: ScratchInput | null      // the tuple to place in the parent's inputs
}
```

`parentId` is the ID of the block that is consuming this value — a generator that
emits a *separate* block (rather than a literal) sets that block's `parent` to
`parentId`. `Identifier.ts` is a good minimal example: it looks the name up in
the package globals, handles the `_list_` prefix that marks a list reference,
and otherwise returns a variable-or-list tuple with `isStaticValue: true`, since
a bare variable reference needs no block of its own.

A value generator that cannot produce a value calls `Warn()` and returns
`{ err: true }`. Note that `evaluate()` — not the generator — raises the hard
error when there is no implementation for a node type at all, so a value
generator never needs to check whether it is registered.

::: warning Calling an unregistered function crashes
`CallExpression` reads `fn.json` and immediately dereferences
`fnData[originalName].async`. A bare call to a function that was never declared
with `function` therefore throws a `TypeError` rather than producing a
diagnostic. Declare the function, or call a library function instead.
:::

## How calls are dispatched

`generator/src/generator/CallExpression.ts` handles every bare call and every
`lib.fn(...)` in statement position; `generator/src/generator/types/CallExpression.ts`
handles the value position. Both follow the same steps.

**`lib.fn(...)`** — the callee is a member expression, so the library name and
the function name are both known:

1. Look the library up in `core`'s built-in table (`getLibrary("block", name)`
   or `getLibrary("value", name)`).
2. On a miss, scan `buildData.packages.libraries.blockLibraries` /
   `valueLibraries` for a package that declares that name.
3. If neither has it: `Warn("Unknown library, got: '...'")` and `{ err: true }`.
4. Look the function up inside the table. A miss warns with
   `Unknown function of library <lib>, got: '<fn>'` and returns `{ err: true }`.
5. Call it as `impl(callExpression, blockCluster, id, buildData)`.

Note the order: **built-ins win**. A package cannot shadow `looks.say`. Only a
library name with no built-in equivalent reaches the package tables. That is the
opposite of how node-type overrides behave — see
[Core's precedence note](/modules/core#precedence-is-asymmetric-on-purpose).

**`foo(...)`** — a bare identifier callee. The name is looked up in
`fn.json` (the function registry written by `FunctionDeclaration`) and compiled
to a `procedures_call` mutation. A name beginning with `turbo_` has the prefix
stripped from the Scratch procedure code and sets `warp: "true"`, making the
procedure run without screen refresh.

**`new Foo(...)`** is handled by `types/NewExpression.ts`, and `method` is a
library in both tables for method-style calls on class instances.

### Arity and types are the library's business

There is no shared argument-checking layer for built-in libraries. Each library
file carries its own local `createFunction` helper, and each function body does
its own validation. Both `motion.ts` and every other built-in library use the
same local helper, whose body signature is:

```ts
createFunction({ minArgs, body: (parsedArguments, callExpression, blockCluster, parentID) => void })
```

Be aware that this is **not** the `createFunction` exported from
`utils/src/util/lib-convert.ts`. The names collide, the argument orders differ,
and the package-authoring one takes `parsedArguments` *last* rather than first.
Inside `generator/`, always use the local helper.

## Libraries

The ten built-in block libraries and nine value libraries:

| Kind | Names |
| --- | --- |
| block (`CallExpressionSub/`) | `motion`, `looks`, `sound`, `control`, `sensing`, `pen`, `list`, `variable`, `broadcast`, `method` |
| value (`types/CallExpressionSub/`) | `list`, `looks`, `math`, `method`, `motion`, `operation`, `sensing`, `sound`, `util` |

The two lists overlap but are not the same. `control`, `pen`, `variable` and
`broadcast` have no value form, because their blocks do not report anything —
calling one where a value is expected is a build error. `math`, `operation` and
`util` have no statement form. `list`, `looks`, `method`, `motion` and `sensing`
have both.

A library table is a plain object:

```ts
module.exports = {
    move: createFunction({ minArgs: 1, body: (args, _call, cluster, parentID) => {
        cluster.addBlocks({
            [parentID]: createBlock({
                opcode: BlockOpCode.MotionMoveSteps,
                inputs: { STEPS: args[0].block },
            }),
        });
    }}),
    // ...
};
```

The block is registered under `parentID` — the ID the caller allocated — which
is how a library call slots into the surrounding script without knowing anything
about it. A library function that *reports* a value instead returns a `typeData`
and lets the caller place it.

## Procedure machinery

Scratch procedures are the most stateful part of the compiler, and most of that
state lives in `fn.json`.

`FunctionDeclaration` walks the body looking for a top-level `ReturnStatement`;
if it finds one the function is treated as returning a value, and (when
`custom_block_return` is on) it records `returnType: "1"`. It then writes an
entry into `fn.json` keyed by the **original** name:

```jsonc
{
  "myFunction": {
    "async": false,       // declared with `async function`
    "endCode": "a1b2c",   // a 5-char variable name used as the completion flag
    "retCode": "d4e5f",   // present only when the body contains a return
    "returnType": "1"     // present only when custom_block_return is on
  }
}
```

`CallExpression` reads that same file, which is why the two are coupled through a
scratch file rather than a call: the function may be declared after its call
site, or in another sprite's file.

For an **async** function the generated call site is not a plain
`procedures_call`. The compiler emits an `event_broadcast`, two
`control_waituntil` loops polling the `endCode` variable for the values `0` then
`1`, and a separate `event_whenbroadcastreceived` hat that actually calls the
procedure — a hand-rolled completion protocol, since Scratch has no await. When
the call site is itself inside an async function (`buildData.isAsync`), the
sequence includes the flag-reset step before the call.

```jsonc
// the procedures_call mutation
{
  "tagName": "mutation",
  "children": [],
  "proccode": "myFunction %s %s",   // one %s per argument
  "argumentids": "[\"myFunction_0\",\"myFunction_1\"]",
  "warp": "false"                    // "true" for a turbo_ prefixed name
}
```

`proccode` is built as `fnName + " " + "%s ".repeat(argCount).trimEnd()` — note
the space between the name and the first `%s`, and that a zero-argument function
has a bare name with no trailing space. The `argumentids` string is assembled by
hand, so the JSON inside it must stay syntactically valid.

::: warning `custom_block_return` only half-lands
The call site is generated with `"return": "1"` in its mutation when the flag is
on *and* the function has a return, but the function body is parsed with
`{ isFunction: true, functionName }` alone — `customBlockReturn` and
`listIndexBase` never reach it, so no `procedures_return` block is emitted on the
definition side. See the [CLI page](/modules/cli#project-and-asset-layout) for
the full note.
:::

## `buildData`

One object travels down through every generator, and it is the sanctioned way to
pass context around:

| Field | Meaning |
| --- | --- |
| `instruction` | Index of the current statement within the file. |
| `originalSource` | The raw file text, used to render error snippets. |
| `packages` | The merged package config: `libraries`, `globals`, `statement_implements`, `type_implements`. |
| `listIndexBase` | 0 or 1; list accessors adjust indices accordingly. |
| `customBlockReturn` | Whether procedure return values are enabled. |
| `isAsync` | Whether the enclosing function is async. |
| `isFunction` | Whether the code being generated is a procedure body. |
| `functionName` | The name of that procedure. |

Check `buildData` before inventing new plumbing. `FunctionDeclaration` also
clones it (`JSON.parse(JSON.stringify(buildData))`) before parsing the body and
extends the copy, which is how `isFunction` and `functionName` get in.

## The optimiser

`generator/src/optimise/` is an **opt-in, explicitly alpha** post-pass enabled by
`jvavscratch build -o`. It runs *after* a file's blocks have been generated and
*before* they are merged.

The design is a file-per-opcode override scheme:

1. `createTree()` finds every top-level block whose opcode is in `HEADER_BLOCKS`
   — the seven hat blocks plus `procedures_definition` — and walks each `next`
   chain, recursively collecting the blocks reachable through `inputs` and
   `fields`.
2. For every block in that tree, the opcode is split on `_`:
   `looks_sayforsecs` → category `looks`, name `sayforsecs`. A stack block looks
   for `optimise/blocks/<category>/<name>.ts`; a reporter looks for
   `optimise/types/<category>/<name>.ts`.
3. A missing file means "leave it alone". A present file is `require()`d and
   called as `(program, block)` (stack) or `(program, parent, type)` (reporter),
   and may return `{ block }` or `{ block, program }` — the latter replacing the
   entire block dictionary.
4. Finally, any block whose opcode is `jvavscratch_Unknown` is dropped, which is
   how an override deletes a block it has folded away.

The four overrides that ship today are all arithmetic folding, in
`optimise/types/operator/`: `add`, `subtract`, `multiply`, `divide`. They
accumulate literal operands, remove addends of zero, and so on. There is no
`optimise/blocks/` directory at all yet.

::: warning The overrides do not currently fire
The lookup builds a path ending in `.ts`:

```ts
let path = join(__dirname, 'types', category, name + ".ts");
if (existsSync(path)) { /* ... */ }
```

`tsc` emits only `.js` into `dist/`, and the published package's `files` list
contains `dist` but not `src`, so at runtime that `existsSync` is always false
and no override is ever loaded. Building the same project twice — once with `-o`
and once without — produces byte-identical output after ID normalisation; the
only difference is that the optimiser prints `- Optimizing <sprite>` and the
`Finished … [optimized]` line.

A second issue sits in the same code path: when a reporter override *is* found,
`optimiseTypes` writes the result back to the **parent** block's key
(`program[block.key] = data.block`) rather than to the key of the reporter it was
asked about, so a working override would overwrite the enclosing block.

Treat `-o` as a no-op that may become destructive. The `jvavscratch_Unknown`
sweep is the one part that runs.
:::

## Adding a generator

1. Add `generator/src/generator/<NodeType>.ts` (statement),
   `generator/src/generator/types/<NodeType>.ts` (value), or a file under one of
   the `CallExpressionSub/` directories (library).
2. Follow the local conventions: `module.exports = (...) => ...`, take blocks
   from `createBlock` / `createMutation`, build tuples with the helpers in
   `types/src/types/scratch-type.ts`, and use `Warn()` for recoverable problems.
3. Run `node scripts/gen-index.js` to add it to `index.ts`.
4. Rebuild `generator`, then rebuild whatever imports it. Because registration is
   an import side effect, `core` itself does not change.
