---
title: Utils module
---

# Utils module

`@jvavscratch/utils` is the shared toolbox of the compiler. It holds three things that have
very little to do with each other:

1. **Build helpers** (`src/util/build-util.ts`) — assembling costumes, sounds, sprites and
   finally the `.sb3` archive.
2. **A small synchronous file-system layer** (`src/util/fs.ts`) — the `DirectoryBuffer` /
   `FileBuffer` pair the CLI uses to scaffold projects and packages.
3. **`src/util/lib-convert.ts`** — the API that *compiler-extension packages* are written
   against. If you want to teach jvavscratch a new library function, a new global, or a
   whole new way of compiling a Babel node type, this is the file you import.

The first two are internal: they exist so the CLI and the build pipeline have somewhere
shared to live. The third is a public, documented interface — see
[the package specification](/reference/language-reference#package-specification) in the
language reference for the end-to-end walkthrough.

## Package layout

```
utils/
  src/
    index.ts                re-exports util/build-util, util/fs and util/lib-convert
    util/
      build-util.ts         .sb3 packaging, costume/sound/sprite assembly
      fs.ts                 DirectoryBuffer / FileBuffer / readFile
      lib-convert.ts        the package-author API
      index.ts
  assets/
    background.svg          fallback stage backdrop
    default.svg             fallback sprite costume
  dist/                     tsc output — this is what consumers require
```

The package publishes two entry points. The root re-exports everything:

```json
"exports": {
  ".":     { "types": "./dist/index.d.ts",     "require": "./dist/index.js"     },
  "./util": { "types": "./dist/util/index.d.ts", "require": "./dist/util/index.js" }
}
```

::: tip Dependencies point one way only
`utils` sits between `core` and `generator` in the dependency chain
(`types ← core ← utils ← generator ← decompiler ← cli`). It may import `@jvavscratch/core`
and `@jvavscratch/types`; it may never import `generator` or `cli`. Every package also
depends on `adm-zip` (for `.sb3` output) and `@babel/types` (for the AST types in the
`lib-convert` signatures).
:::

### What is *not* in this package

There is no `string`, `path`, `data`, `logger`, `validator` or `hash` helper module here —
`@jvavscratch/utils` never had one. Code that needs those reaches for Node's `path`, `fs`
and `crypto` directly, and the compiler's own string work is done inline by the generators
that need it. Anything you read elsewhere describing `jvavscratch/utils/string`,
`jvavscratch/utils/logger` and friends is describing an API that does not exist.

## `build-util.ts` — producing the `.sb3`

This is the module that turns the compiler's in-memory `project.json` plus a folder of
assets into something Scratch can open.

### `createCostume(options?)`

```ts
function createCostume({
    name = "default",
    path = "",
    bitmapResolution = 2,
    rotationCenterX = 0,
    rotationCenterY = 0,
} = {}): Costume
```

Copies the file at `path` into the build's scratch directory, renames it to a fresh random
asset ID while keeping its original extension, and returns a Scratch `Costume` record whose
`assetId` / `md5ext` / `dataFormat` point at the copy. `dataFormat` is derived from the file
extension, so a `.png` becomes `png` and an `.svg` becomes `svg`.

The copy is what makes builds reproducible from a clean checkout: asset files are only ever
read, never renamed in place.

### `createSound(options?)`

```ts
function createSound({ name = "default", path = "" } = {}): Sound
```

The same treatment for audio files — copy into the scratch directory, rename to a random
asset ID, and return a `Sound` record. There is no `bitmapResolution` here, and the default
`dataFormat` is `mp3` until the extension is parsed.

### `createSprite(options?)`

```ts
function createSprite({
    isStage = false,
    name = "default",
    variables = {}, lists = {}, broadcasts = {},
    blocks = {}, comments = {},
    currentCostume = 0, costumes = [], sounds = [],
    volume = 100, visible = true,
    x = 0, y = 0, size = 100, direction = 90,
    draggable = false, rotationStyle = "all around", layerOrder = 0,
}: Partial<Sprite> = {}): Sprite
```

Fills in a complete Scratch sprite record from whatever the build has collected. Two
behaviours are worth knowing about:

- **A sprite with no costumes gets a fallback.** The Stage receives
  `assets/background.svg`; every other sprite receives `assets/default.svg`. Both files ship
  in the package's own `assets/` directory — this is the one place where runtime data
  legitimately lives next to the code rather than in the build scratch directory, which is
  why `package.json`'s `files` array must keep listing `assets`.
- **A stage is always called `Stage`.** Passing `isStage: true` overwrites whatever `name`
  you passed, because that literal string is what the Scratch VM looks for.

### `zipFolderToSb3(folderPath)`

```ts
function zipFolderToSb3(folderPath: string): void
```

Recursively adds every file under `folderPath` to a new archive and writes it out as a
sibling of the folder — `<dir>/<folderName>.sb3`. A Scratch project is just a ZIP with
`project.json` and the assets at the top level, so there is nothing Scratch-specific in the
implementation: it uses `adm-zip` with no compression tricks.

### Folder helpers

The remaining exports are synchronous directory utilities, used by the build pipeline and by
the CLI's scaffolding commands:

| Function | Behaviour |
|---|---|
| `cloneFolderSync(source, destination)` | Recursively copy a directory tree. Throws if `source` is not a directory. |
| `copyAllSync(pathA, pathB)` | Recursively copy the *contents* of `pathA` into `pathB`, creating `pathB` if needed. |
| `deleteAllContents(dirPath)` | Recursively delete everything *inside* a directory, leaving the directory itself in place. |
| `fillDefaults(a, b)` | Fill in the keys of `b` that are missing (or `undefined`) on `a`, recursing into plain objects but not arrays. Returns `a`. |

`deleteAllContents` is what makes `target/` idempotent: each build starts by emptying it, so
a `.sb3` that is no longer produced cannot survive from a previous run.

## `fs.ts` — the buffer layer

`fs.ts` describes itself as "a better `fs` module", and for its one job that is fair: it lets
scaffolding code declare a directory tree as data and instantiate it in one call.

```ts
class FileBuffer {
    Name: string;
    Content: string;
    Type: "File";

    constructor(Name?: string, Content?: string);
    ChangeExtension(Ext: string): FileBuffer;
    Instantiate(At: string): string;
}

class DirectoryBuffer {
    Name: string;
    Content: (FileBuffer | DirectoryBuffer)[];
    Type: "Directory";

    constructor(Name?: string);
    Append(File: (FileBuffer | DirectoryBuffer)[]): DirectoryBuffer;
    Instantiate(At: string): string;
}

function readFile(path: string): string;
```

`Instantiate(At)` is where the work happens. A `FileBuffer` writes `Content` to
`join(At, Name)` and returns the path it wrote. A `DirectoryBuffer` deletes the target
directory if it already exists, creates it, instantiates every child inside it, and returns
the directory path.

That "delete if present, then create" behaviour is deliberate for generators — it makes
`DirectoryBuffer(...).Instantiate(...)` safe to call over an existing tree — but it also
means it will happily wipe a directory you point it at. Use it for output directories, not
for source trees.

A good example of the whole thing in use is the package scaffold
(`jvavscratch lib my-package`), which is really just:

```ts
new DirectoryBuffer("src").Append([
    new FileBuffer("index.ts", "module.exports = {};")
]).Instantiate(in_folder);

new DirectoryBuffer("utils").Append([
    new FileBuffer("internal.ts", readFileSync(/* assets/internal.txt */).toString()),
    new FileBuffer("library.ts",  readFileSync(/* assets/library.txt  */).toString()),
]).Instantiate(in_folder);
```

`readFile(path)` is the synchronous companion used throughout: read a file, get its contents
as UTF-8 text.

## The package-author API

Everything in this section is for **compiler-extension packages**: `.tar.gz` archives
installed into a project's `lib/` directory whose `src/index.ts` is `require()`d *by the
compiler* during a build. A package therefore extends the compiler itself — it does not run
inside the compiled Scratch project.

`src/util/lib-convert.ts` re-exports the names you need for signatures (`BlockOpCode`,
`buildData`, `typeData`, `Block`, `createBlock`, and the `BlockClustering` interface), and
adds the five constructors below — plus `createBlock`, re-exported from core.

### `createFunction(data)` — a library function that emits stack blocks

```ts
function createFunction<t = void>(data: {
    parseArguments?: boolean,        // default: false
    minimumArguments?: number,       // default: 0
    maximumArguments?: number,       // default: Number.MAX_SAFE_INTEGER
    argTypes?: string[],             // default: [] — Babel node types, e.g. "NumericLiteral"
    body: (
        callExpression: CallExpression,
        blockCluster: BlockClustering,
        parentId: string,
        buildData: buildData,
        parsedArguments?: typeData[],
    ) => t,
}): any
```

`createFunction` returns the function that the compiler will call when it meets
`library.fn(...)` in user source. The wrapper does the boring work before your `body` runs:

- **Arity is enforced.** Fewer than `minimumArguments` raises `Not enough arguments`; more
  than `maximumArguments` raises `Too many arguments`. Both are `JvavscratchError`s, which
  means they are reported with the source location of the call and abort the build.
- **Argument types are checked** — but against the *Babel node type* of each argument, not
  its runtime type. `argTypes: ["NumericLiteral"]` means "argument 1 must be a numeric
  literal in the source", and a mismatch raises
  `Expected 'NumericLiteral' for argument '1', got: 'Identifier'`. Entries you leave out
  (`argTypes[i]` undefined) are not checked, and extra arguments beyond the array are not
  checked either.
- **Arguments are evaluated only if `parseArguments` is true.** Each argument is passed
  through `evaluate()` and handed to your `body` as `parsedArguments`, in call order. When
  `parseArguments` is false (the default), `parsedArguments` is an empty array and your body
  is expected to handle `callExpression.arguments` itself — usually by calling `evaluate()`
  on the ones it wants.
- `parentId` is the block ID your blocks should be attached to; `buildData` carries the
  per-build context (`listIndexBase`, `customBlockReturn`, `isFunction`, `functionName`,
  `packages`, and so on).

### `createValueFunction(data)` — a library function that emits a reporter

```ts
const createValueFunction = createFunction;
```

There is no second implementation: `createValueFunction` *is* `createFunction`. The two names
exist only to document intent and to carry different return types (a value function's `body`
returns `typeData` rather than `void`), which TypeScript cannot express through a shared
`any`-typed alias. Use `createValueFunction` for anything you want to appear on the right-hand
side of an expression, and `createFunction` for anything that is a statement.

### `createLibrary(name, functions)`

```ts
function createLibrary(name: string, functions: any): { name: string, functions: any }
```

Wraps a table of functions under a namespace name. A library called `example` with a member
`tau` is what makes `example.tau()` resolvable in user source. Block libraries are exported
under `libraries.blockLibraries`, value libraries under `libraries.valueLibraries` — the
compiler looks in the block table when the call is used as a statement and in the value table
when it is used as a value, so a function that should work in both positions must be
registered in both.

### `createGlobal(name, body)`

```ts
function createGlobal(name: string, body: any): { name: string, functions: any }
```

Declares a bare identifier that the compiler resolves to a value with no call syntax. The
`Identifier` value generator walks `buildData.packages.globals`, finds the first entry whose
`name` matches, and calls the second argument as `body(blockCluster)` — so although the
parameter is named `functions` in the source and comes back out under that key, what you pass
is a single function returning `typeData`.

```ts
module.exports = {
    globals: [
        createGlobal("tau", (() => {
            return {
                block: getScratchType(ScratchType.number, Math.PI * 2),
                blockId: null,
                isStaticValue: true,
            };
        }))
    ]
};
```

With that in place, user source can write `let foo = tau;` with no parentheses. Globals are
also how the compiler itself injects procedure parameters into scope, so the mechanism is
exercised on every function that takes an argument.

### `createImplementation(name, body)`

```ts
function createImplementation(name: string, body: any): { name: string, body: any }
```

Pairs a **Babel node type string** with a replacement generator. Export the result under
`statement_implements` to take over a statement node such as `IfStatement`, or under
`type_implements` to take over a value node such as `NumericLiteral`.

Third-party implementations are consulted *before* the built-in ones, so this really is an
override: an implementation for `NumericLiteral` replaces the built-in numeric-literal
handling for the whole build. The body signature follows the node kind — statements get
`(blockCluster, node, buildData)` and must return `generatedData`; values get
`(blockCluster, node, parentId, buildData)` and must return `typeData`.

### `createBlock` and the scratch-type helpers

`createBlock(...)` is re-exported from `@jvavscratch/core` (`createBlock` is also available
directly from core). It builds a Scratch block with defaults:

```ts
blockCluster.addBlocks({
    [id]: createBlock({ opcode: BlockOpCode.LooksHide })
});
```

Every block needs an ID of your choosing; nothing in the output is keyed by name, so the
chain order is carried entirely by `next` / `parent`. For input slots, reach for the
constructors in `@jvavscratch/types` (`getScratchType`, `getSubstack`, `getMenu`,
`getVariable`, `getBlockNumber`, `getColor`, `getBroadcast`, `getList`) rather than writing
the four-element tuple by hand. Inside a package these are imported from the generated
`../utils/internal` shim.

::: warning Blocks must be returned in execution order
`parseProgram` links the block IDs a generator returns into one chain: it writes `next` on
the last key and `parent` on the first. Return them in the order they should run, and return
`terminate: true` when the chain ends.
:::

## A complete package

Putting the pieces together, a package that adds `example.tau()` and a `tau` global looks like
this (the full walkthrough, including the `jvavscratch.toml` and publish steps, is in
[the package specification](/reference/language-reference#package-specification)):

`src/index.ts`

```ts
import { CallExpression } from "@babel/types";
import { BlockClustering, buildData, createGlobal, createLibrary, createValueFunction } from "../utils/library";
import { getScratchType, ScratchType } from "../utils/internal";

module.exports = {
    libraries: {
        valueLibraries: [
            createLibrary("example", {
                tau: createValueFunction({
                    body: (callExpression: CallExpression, blockCluster: BlockClustering, parentId: string, buildData: buildData) => ({
                        block: getScratchType(ScratchType.number, Math.PI * 2),
                        blockId: null,
                        isStaticValue: true,
                    })
                })
            })
        ]
    },

    globals: [
        createGlobal("tau", (() => ({
            block: getScratchType(ScratchType.number, Math.PI * 2),
            blockId: null,
            isStaticValue: true,
        })))
    ]
};
```

Note that `tau` is a *static* value: `isStaticValue: true` with `blockId: null` tells the
compiler the value is already a literal and no block reference is needed. That is the
cheapest kind of extension — no blocks are emitted at all.

## How the build wires a package up

When a project is built, each directory in `lib/` is validated (it must contain `src/index.ts`
and a `utils/` directory), cloned into the build's scratch directory, and its
`utils/library.ts` and `utils/internal.ts` are **overwritten** with re-export shims pointing
at `lib-convert` and `scratch-type`. Then `require()` is called on the copied
`src/index.ts`, and the returned object is merged into the build's configuration:

```ts
{ libraries: { blockLibraries, valueLibraries }, globals, statement_implements, type_implements }
```

Two consequences:

- **Never edit a package's `utils/` files.** They are regenerated on every build, so any
  change you make there is discarded. Edit `src/`, and import the API from `../utils/library`
  the way the scaffold does.
- **A package is compiler code, not program code.** It runs in Node with the compiler's
  privileges, during the build. If you need something to happen *in Scratch*, it has to
  arrive as blocks.

## See also

- [Language reference · Package specification](/reference/language-reference#package-specification) — the worked example, start to finish.
- [Modules · Core](/modules/core) — `BlockCluster`, `evaluate` and the dispatch tables packages register into.
- [Modules · CLI](/modules/cli) — `jvavscratch lib`, `publish` and the other package commands.
- [Modules · Registry](/modules/registry) — where `jvavscratch add` fetches packages from.
