---
title: Extending jvavscratch
description: How compiler-extension packages work — what they extend, the four contribution points, and how precedence is decided.
---

# Extending jvavscratch

jvavscratch is a fixed language. The set of Babel nodes it understands, the
libraries available as `motion.something()`, the operators it can emit — all of
that is decided by the compiler's source, not by the project being compiled.

A **compiler-extension package** is how you change that without forking the
compiler. It is the only supported extension mechanism, and it is unusual enough
to be worth understanding before you write one: it is not a runtime plugin, not
a bundler plugin, and not a Scratch extension.

## A package extends the compiler, not the program

This is the single most important thing to get right.

When you build a project, the CLI loads every directory in `lib/`, and for each
one it calls Node's `require()` on `lib/<name>/src/index.ts`. The module that
comes back is not shipped anywhere. Its **exports are merged into the compiler's
configuration**, and that configuration then changes how the *current build*
behaves.

```text
lib/demo/src/index.ts  --require()-->  the compiler process
                                            |
                                            +-- merges into `config`
                                            |
                            the build of THIS project uses the new config
```

Three consequences:

- There is **no runtime component**. The compiled `.sb3` contains only Scratch
  blocks; nothing from your package is present in it, and nothing in the `.sb3`
  can call back into your package.
- Your package runs with **the compiler's privileges** — it is ordinary Node
  code executing in the build process. It can read files, make network calls, or
  throw. It is trusted absolutely, which is why packages come from a registry
  you control rather than from a public index.
- Your contributions apply to **one build**. There is no state that persists
  between builds; the configuration is rebuilt from `lib/` every time.

## The four contribution points

A package's `src/index.ts` exports a CommonJS object. Every key is optional —
the CLI merges what it finds over a set of defaults — and the shape is:

```js
module.exports = {
    libraries: {
        blockLibraries: [],   // libraries used in statement position:  demo.doThing(...)
        valueLibraries: [],   // libraries used in value position:      demo.getValue(...)
    },
    globals: [],              // bare identifiers:  myConstant
    statement_implements: [], // override a Babel node type that runs as a statement
    type_implements: [],      // override a Babel node type that produces a value
};
```

The merge is done by `fillDefaults()`, which only fills in keys you did *not*
provide and recurses into nested plain objects. So `libraries` is merged
per-key: exporting only `valueLibraries` leaves `blockLibraries` as an empty
array rather than `undefined`. Exporting an empty array, on the other hand, is
identical to not exporting it.

::: warning The four collections must be arrays
`parseProgram` and `evaluate` iterate them by index:

```ts
for (let k = 0; k < packageData.statement_implements.length; k++) { … }
```

An object has no `.length`, so `0 < undefined` is false and the loop body never
runs. **A non-array `statement_implements` or `type_implements` is silently
ignored** — no error, no warning, just an override that does nothing. The same
applies to `globals` and the library arrays.
:::

### 1. `blockLibraries` and `valueLibraries`

A library is a named group of functions, looked up when the compiler meets a
member call:

```js
demo.log("hello");         // statement position -> libraries.blockLibraries
let x = demo.double(21);   // value position     -> libraries.valueLibraries
```

The same library name may appear in both lists, but they are **separate
namespaces** — there is no sharing between them, and a library in only one list
cannot be called from the other position. The built-ins follow the same rule:
`motion` has a block form and a value form, `control` has only a block form.

Each entry is `{ name, functions }`, and `functions` is a plain object of
`{ fnName: implementation }`. The library name is what appears before the dot;
the function name is what appears after it. Prefer a distinctive library name: a
name that collides with a built-in is never reached, silently, as described
under [Precedence](#precedence).

Both kinds are called with the same four arguments, and it is worth knowing
exactly who allocates what:

```js
function myFunction(callExpression, blockCluster, parentId, buildData) { … }
```

- `callExpression` — the Babel `CallExpression` node. `callExpression.arguments`
  gives you the argument nodes, and `callExpression.loc` gives you a position for
  diagnostics.
- `blockCluster` — the accumulator. `addBlocks({ [id]: blockObject })`.
- `parentId` — **a block ID the compiler has already allocated for you.** If your
  function emits blocks, the first one should be registered under `parentId` and
  given `parent: null`; that is how your blocks are spliced into the surrounding
  script without your needing to know anything about it. A value function must
  instead return the ID of the block that computes its value.
- `buildData` — the per-statement context: `originalSource`, `listIndexBase`,
  `customBlockReturn`, `packages`, `isFunction`, `functionName`, `isAsync`.

A **block** function returns nothing (or its return value is ignored) and puts
its blocks into the cluster. A **value** function returns a `typeData`:

```js
return {
    isStaticValue: false,          // false: this is a real block, not a literal
    blockId: blockId,              // the block that computes the value
    block: [3, blockId, [4, ""]],  // the input tuple the caller will place
};
```

An implementation that cannot do its job should call `Warn("…")` and return
`{ err: true }` in statement position, or `{ err: true }` in value position;
either way the node is dropped silently.

### 2. `globals`

A global is a bare identifier that the compiler rewrites into a value. Where a
variable reference compiles to a variable block, a global compiles to whatever
your function returns:

```js
looks.say(DEMO_VERSION);   // DEMO_VERSION is not a variable; it is a global
```

Each entry is `{ name, functions }`, and `functions` is a **single function**,
not a table:

```js
{ name: "DEMO_VERSION", functions: (blockCluster) => typeData }
```

`Identifier` looks the name up in `globals` before it does anything else, and the
returned `typeData` is used as-is. A global is ideal for a constant: return
`isStaticValue: true` with a literal `block` and no blocks are emitted at all.

Note that `globals` is checked **before** the `_list_` prefix handling and before
the variable fallback, so a global can shadow a project variable. That is
occasionally useful and usually a bug.

### 3. `statement_implements` and `type_implements`

These are the sharp edge of the extension system: they do not add a function,
they **replace the compiler's handling of a whole Babel node type** — for every
occurrence in every file of the project being built.

```js
statement_implements: [
    { name: "IfStatement",     body: (blockCluster, node, buildData) => generatedData },
],
type_implements: [
    { name: "NumericLiteral",  body: (blockCluster, node, parentId, buildData) => typeData },
],
```

Each entry is a `{ name, body }` pair, where `name` is a Babel node type string
(`"IfStatement"`, `"ForStatement"`, `"NumericLiteral"`, `"BinaryExpression"`, …)
and `body` follows the matching generator contract exactly — the statement form
returns `generatedData`, the value form returns `typeData`.

The difference from a library is reach. `motion.move(10)` only ever compiles your
function; the built-in `IfStatement` generator compiles *every* `if` in the
project unless you override it. Two practical notes:

- An override applies to **the project being built**, so a package that
  overrides `IfStatement` changes the meaning of the language itself. There is no
  way to scope an override to one file or one sprite.
- An override does **not** have to delegate to the built-in. The built-in table
  is not consulted at all once your implementation is found, so an override that
  cannot handle a case has no fallback available — it must either produce the
  right blocks or drop the node.

`IfStatement` and `NumericLiteral` are the two most tempting targets and also the
two riskiest. Overriding `NumericLiteral` means every number literal in the
project goes through your code, and getting it slightly wrong will produce a
project that opens but computes nonsense.

## Precedence

The lookup order differs between the tables, deliberately:

| Lookup | Order |
| --- | --- |
| `statement_implements` vs. built-in statement generators | **Package first.** A hit short-circuits the built-in entirely. |
| `type_implements` vs. built-in value generators | **Package first.** Same. |
| Library names | **Built-in first.** A package only supplies a library with no built-in equivalent. |

So a package can wholly replace the handling of `IfStatement`, but cannot
replace `looks.say`. The asymmetry is intentional: overriding a *node type* is a
deliberate, whole-language decision that the package author has opted into, while
silently rebinding `looks.say` would change the meaning of existing source in a
way that is much harder to notice.

It follows that a package's library name must not collide with a built-in one —
`motion`, `looks`, `sound`, `control`, `sensing`, `pen`, `list`, `variable`,
`broadcast`, `method` for block libraries, and `list`, `looks`, `math`, `method`,
`motion`, `operation`, `sensing`, `sound`, `util` for value libraries. A
colliding library is never reached and produces no warning.

## Package anatomy

A package is a directory with three parts:

```text
demo/
  src/index.ts       # the entry point the compiler require()s
  utils/
    library.ts       # generated shim - do not edit
    internal.ts      # generated shim - do not edit
  jvavscratch.toml   # name, description, version, [dependencies]
```

`src/` is yours. `utils/` is not: at the start of **every** build, each
package's `utils/` is emptied and both files are rewritten with a one-line
re-export shim. Their original content — the scaffolded versions — is a
hand-written set of type declarations with the signatures of `createFunction`,
`createBlock`, `createGlobal`, `BlockOpCode` and friends, so that you can write
`src/index.ts` in TypeScript with autocompletion. The files themselves say
`// This doesn't even get ran. Everything here is non-functional.` and mean it.

Editing them is pointless: whatever you write is destroyed on the next build.
See [Limitations](#limitations) for what the rewritten version actually does
today.

## How packages are loaded

The pipeline, from `cli/src/cli/projectManager.ts`:

1. Every entry in `lib/` is checked: it must be a directory (a plain file is
   rejected with `found file-based package '<name>' - file-based packages
   currently aren't allowed`), containing `src/`, `src/index.ts` and `utils/`.
2. `lib/` is cloned into the build's scratch directory, so the project's own
   copy is never touched.
3. For each cloned package, `utils/` is emptied and the two shims are written.
4. `require()` is called on `<scratch>/lib/<name>/src/index.ts`.
5. The result is merged into the shared `config` with `fillDefaults()`.
6. The merged `config` is passed to `parseProgram()` for every file and stored in
   `buildData.packages`, where the generators read it.

Each package is announced twice in the console, once per phase: `Packaging demo`
and `Building demo`.

Because the entry point is `require()`d rather than compiled, the file it is
loaded from is **not processed by TypeScript**. A `.ts` extension on a CommonJS
file works only because Node treats unrecognised extensions as JavaScript; any
actual TypeScript syntax (`import`/`export`, type annotations, generics,
`interface`) is a syntax error at that point. There is no build step for a
package's source — no `tsc`, no bundler.

## Limitations

These are all reproducible today, and they shape what a package can actually do.

### The `utils/` shim does not resolve

The rewritten `utils/library.ts` is:

```ts
import { createFunction, createLibrary, … } from '../../../lib-convert';
export { createFunction, createLibrary, … };
```

`<scratch>/lib/demo/utils/` is three levels below `<scratch>/lib-convert`, which
does not exist — and the sibling `utils/internal.ts` points at
`../../../scratch-type`, which does not exist either. Attempting to use it fails
in one of two ways:

```text
error: Cannot find module '../utils/library'      # no extension given
error: Cannot find module '<scratch>/lib-convert'
       imported from <scratch>/lib/demo/utils/library.ts   # with .ts given
```

So **the authoring API in `utils/src/util/lib-convert.ts` is not reachable from
a package today.** A working package must be self-contained: plain JavaScript,
no imports, defining its own helpers and writing block objects literally. The
[Writing a Plugin](/plugins) page does exactly that.

### No module resolution from the scratch directory

The package is loaded from `os.tmpdir()`, e.g.
`/tmp/jvavscratch-build-ZdGLYk/lib/demo/src/index.ts`. Node resolves a bare
specifier by walking parent directories looking for `node_modules` — from there,
`/tmp/jvavscratch-build-ZdGLYk/lib/demo/node_modules`, `/tmp/node_modules` and
`/node_modules` — and none of them exist. So:

```text
error: Cannot find module '@jvavscratch/utils'
error: Cannot find package '@babel/types' imported from …/lib/demo/src/index.ts
```

`require()` of a **Node built-in** is fine (`crypto`, `path`, `fs` all work, and
`crypto` is how a self-contained package can generate block IDs). An absolute
path to a file in your own checkout also works, which is the escape hatch if you
need `lib-convert` before the shim is fixed.

### Everything else

- **No tests.** There is no test harness for packages, and no integration suite
  in the repository at all. The way to verify a package is to build a project
  that uses it and inspect `target/<name>/project.json`.
- **No version constraints.** `jvavscratch.toml`'s `[dependencies]` records
  versions, but `build` never reads them — whatever is in `lib/` is what gets
  loaded. `update` is the only command that consults the registry.
- **No sandbox.** A package runs inside the build process with full privileges.

## Where to go next

- [Writing a Plugin](/plugins) — scaffold one, implement it against this API, and
  build a working example end to end.
- [Core](/modules/core) — the contracts in full: `generatedData`, `typeData`,
  `buildData`, and how the chaining works.
- [Generator](/modules/generator) — the built-in implementations to model yours
  on, and the optimiser's separate override mechanism.
