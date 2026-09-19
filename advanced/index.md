---
title: Advanced topics
---

# Advanced topics

This section covers the parts of jvavscratch that are opt-in or that you only meet once a
project grows: the **alpha optimiser**, the two engineering switches in `jvavscratch.toml`,
and a handful of things that make a compiler build easier to inspect when it misbehaves.

The everyday material lives elsewhere: [Grammar](/grammar/) for the language,
[API reference](/api/) for the block libraries, and [Modules](/modules/) for how the
compiler is put together.

## The alpha optimiser

jvavscratch compiles what you wrote, faithfully. The optimiser is a second pass that is
allowed to change it.

```bash
jvavscratch build ./my-project -o
# or: jvavscratch build ./my-project --optimize
```

::: danger ALPHA
The optimiser is explicitly alpha. Enabling it prints a warning at build time:

> Optimization is still in its ALPHA form and may corrupt your project.

It rewrites the finished block dictionary — it can fold expressions, restructure chains and
delete blocks — so always open the result and check that the project still behaves, rather
than assuming a passing build means a correct one.
:::

### How the pass runs

`optimiseTree()` (`generator/src/optimise/index.ts`) is a post-processing walk over the
finished, flat `{uuid: Block}` dictionary. It runs after every sprite and file has been
generated, and it is enabled per build by the `-o` flag — the block dictionary it produces is
what gets written into `project.json`.

1. **Find the chains.** The pass looks for top-level blocks whose opcode is one of the event
   headers — `event_whenflagclicked`, `event_whenkeypressed`, `event_whenthisspriteclicked`,
   `event_whenstageclicked`, `event_whenbackdropswitchesto`, `event_whengreaterthan`,
   `event_whenbroadcastreceived` — plus `procedures_definition`. From each header it follows
   `next` to the end of the script, building an ordered list of blocks. **A script whose
   first block is not one of those headers is never visited.**
2. **Rewrite stack blocks.** For each block in the chain, the opcode is split on `_` and
   looked up as a file — `looks_sayforsecs` becomes `blocks/looks/sayforsecs.ts`. A missing
   file means "leave this block alone", which is the case for almost every opcode.
3. **Rewrite reported values.** Every input and field of each block is then walked
   recursively, and each nested reporter is looked up the same way under `types/` —
   `operator_add` becomes `types/operator/add.ts`.
4. **Apply the result.** An override may return `{ block }` (replace the block that triggered
   it) or `{ block, program }` — where `program` replaces the *entire* dictionary, for
   rewrites that have to reach beyond the current script.
5. **Clean up.** Any block left with the opcode `jvavscratch_Unknown` is deleted from the
   final dictionary. That marker is how an override says "this block is gone", including in
   the middle of a chain, so it is not simply a matter of dropping a key.

### What ships today

Four overrides are in the tree, all for arithmetic:

| Override | Effect |
|---|---|
| `types/operator/add.ts` | Folds constant additions, flattens nested `+` chains into one, drops `+ 0` terms, and re-emits anything that could not be fully folded. |
| `types/operator/subtract.ts` | The same treatment for `-`. |
| `types/operator/multiply.ts` | The same treatment for `*`. |
| `types/operator/divide.ts` | The same treatment for `/`. |

So the visible effect today is on generated arithmetic: fewer blocks, and literals where the
compiler had emitted a chain of reporter blocks.

### Writing an override

The convention is entirely by filename, so adding one is a matter of creating a file in the
right place:

```
generator/src/optimise/
  blocks/<category>/<name>.ts     stack blocks   (looks_sayforsecs -> blocks/looks/sayforsecs.ts)
  types/<category>/<name>.ts      reporter/input blocks   (operator_add -> types/operator/add.ts)
```

An override is a CommonJS module exporting one function:

```ts
// generator/src/optimise/types/operator/add.ts
module.exports = function (program, parent, type) {
    // ...inspect and rewrite...
    return { block: parent.block, program };
};
```

- A **stack override** is called as `fn(program, blockData)` for the block in the chain.
- A **type override** is called as `fn(program, parent, typeData)` for a nested reporter, where
  `typeData` carries the reporter, its key, and the parent's `inputs`/`fields` key it came
  from (`originalArea`, `originalKey`) so the override knows where to write a replacement.
- Return `{ block }` to swap one block, or `{ block, program }` to also replace the whole
  dictionary. Marking a block `jvavscratch_Unknown` deletes it.

Each override file is helped by `optimise/util/program.ts` (recursive input cloning) and
`optimise/util/type.ts` (`isBlock`, `isBlockKey`, `isNumericValue`, `getValue`), which is
where to look for existing helpers before writing new ones.

::: warning Overrides are resolved as `.ts` files
The lookup builds a path ending in `.ts` next to the compiled optimiser. In a compiled
install that file does not exist — `tsc` emits `.js` — so the lookup misses and the pass
degenerates into the `jvavscratch_Unknown` cleanup. The overrides only take effect when the
generator is loaded from TypeScript source, which is what the CLI's development runner does:

```bash
node cli/dev.js build ./examples/pi-spigot -o
```

If you are working on an override and seeing no change, this is the reason.
:::

## Project options

Two keys in `jvavscratch.toml` change how a project compiles. Both are read once per build and
threaded into every generator through `buildData`.

### `custom_block_return`

```toml
custom_block_return = true
```

Controls how a `return` statement inside a procedure is compiled.

- **Off (default).** A returned value is written into a hidden temporary variable, and the
  call site reads it back. This is plain Scratch: any project, any VM, no extensions.
- **On.** A procedure that contains a `return` compiles to `procedures_return` — the
  return-value opcode from the **TurboWarp** return extension — and call sites consume the
  value directly. The result is cleaner blocks and a real expression rather than a
  variable round-trip, but **the project now requires TurboWarp**; vanilla Scratch will not
  run it.

Turning it on does not by itself make every procedure return a value: only functions that
actually contain a `return` statement are marked (`FunctionDeclaration` records the function
in the build's `fn.json` scratchpad with a `returnType`, and `ReturnStatement` branches on
it). Procedures without a `return` compile the same way either way.

### `list_index_base`

```toml
list_index_base = 0
```

Chooses whether list indices are zero-based or one-based in *source*.

- **`1` (default)** — the number you write is the Scratch item number. `items[1]` is the first
  item.
- **`0`** — the number you write is a zero-based offset, matching JavaScript. The compiler
  emits an extra `+ 1` on every list access so the generated block still addresses the right
  item: `items[0]` becomes `item 1 of items`.

```toml
# zero-based, matching the JavaScript habit
list_index_base = 0
```

**Any value other than 0 or 1** is rejected with a warning and treated as `1`. The setting is
carried in `buildData.listIndexBase` and consulted where list access is generated
(`CallExpressionSub/list.ts` and `MemberExpression`), so it applies uniformly to the
list-library functions and to bracket syntax. Note that it changes *your source's* indices
only — the compiled project still contains ordinary one-based Scratch list blocks.

## Build and debug tips

### Rebuilding the compiler

Each package compiles itself, in dependency order, and a package's `dist/*.d.ts` has to exist
before anything that depends on it can typecheck:

```bash
for p in types core utils generator decompiler cli; do (cd $p && npx tsc -p tsconfig.json); done
```

See [Contributing](/contributing) for the full story, including why you should not run
`npm install` inside a package directory while working with the sibling checkouts.

### Inspecting a build

A build writes both an unpacked directory and an archive:

```bash
jvavscratch build ./examples/pi-spigot
# -> examples/pi-spigot/target/pi-spigot/project.json
# -> examples/pi-spigot/target/pi-spigot/pi-spigot.sb3
```

`project.json` is the file to read when a build "succeeds" but the project does not behave.
It is the actual Scratch block dictionary — there is no intermediate form to inspect, and no
JavaScript in the output at all.

### Diffing two builds

Block IDs and asset IDs are randomised on every build, so two builds of identical source
produce `project.json` files that differ everywhere. Normalise before diffing:

- 32-hex-character IDs (block and asset IDs),
- 16-hex-character IDs (variable/list/broadcast IDs and generated block IDs),
- the five-character variable names, which appear as identical adjacent pairs such as
  `["cf613","cf613"]`.

A practical recipe:

```bash
norm() {
  sed -E 's/\b[0-9a-f]{32}\b/ID32/g; s/\b[0-9a-f]{16}\b/ID16/g; s/\["([0-9a-f]{5})","\1"\]/["VAR","VAR"]/g' "$1"
}
norm build-a/project.json > a.norm
norm build-b/project.json > b.norm
diff a.norm b.norm
```

Anything still differing after that is a real change in the generated blocks — which is the
point of normalising.

### The build scratch directory

Every build gets its own temporary directory under the system temp directory, and removes it
afterwards. That is deliberate: it means concurrent builds cannot clobber each other's state
and a build never writes into the package installation directory. If you are adding runtime
data of your own, put it in the scratch directory (`getBuildScratchDir()` / `scratchFile()`
from `@jvavscratch/core`) rather than next to the compiled source.

The scratchpads inside it — `fn.json`, `classData.json`, `variables.json`, `lists.json`,
`broadcasts.json` — are **build state**, not configuration: they are emptied at the start of
every build and accumulate as the generators run. Reading them mid-build is a useful way to
see what the compiler thinks it has collected.

### A near-empty `project.json` and a single warning

If a build emits a `project.json` with almost no blocks and one warning, the usual cause is
a generator import that bypassed registration. Generators register themselves into the
compiler's dispatch tables as a side effect of importing **the package entry point**; a
subpath import such as `@jvavscratch/generator/optimise` loads the file without running that
registration, so the tables stay empty and every node type is skipped with a warning.

If you are writing code that imports the generator, import `@jvavscratch/generator`, never a
subpath. See [Modules · Core](/modules/core) for the dispatch tables themselves.

### When something is missing

Two failures come up often enough to be worth recognising immediately:

- **`lib/` must exist.** A build validates `project.d.json` and the `assets/`, `src/` and
  `lib/` directories up front. A missing `lib/` is a hard error even when the project has no
  dependencies — an empty directory is enough.
- **`assets/stage/` must exist**, and no sprite may be named `stage`. The Stage's asset
  directory is not optional, and `stage` is reserved.

## See also

- [Modules · Generator](/modules/generator) — where the optimiser and the generators live.
- [Modules · Core](/modules/core) — dispatch tables, `buildData` and the scratchpads.
- [Contributing](/contributing) — build order, tests, and how to verify a compiler change.
- [Guide · Basic usage](/guide/basic-usage) — the everyday commands.
