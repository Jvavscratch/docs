---
title: Modules
description: The seven packages jvavscratch is built from, what each one owns, and how they depend on each other.
---

# Modules

jvavscratch is not one program but a chain of seven packages. The compiler used to
live in a single repository; it was split apart so that each piece could be
versioned, published and reasoned about on its own. This chapter documents what
each package owns, which files matter, what its public surface is, and why the
boundaries were drawn where they are.

If you only want to *use* the compiler, read the [Guide](/guide/getting-started)
instead. This chapter is for people reading or changing the compiler itself.

## The packages at a glance

| Package | What it owns | Files worth knowing |
| --- | --- | --- |
| `types` | Pure type declarations and zero-dependency helpers. The Scratch `project.json` data model lives here. | `types/src/types/types.ts` (`BlockOpCode`, `Block`, `Mutation`, `Sprite`, `Project`, `buildData`, `generatedData`), `types/src/types/scratch-type.ts`, `types/src/types/scratch-uuid.ts` |
| `core` | AST dispatch and the compilation environment: the block accumulator, the dispatch registry, syntax rewriting, error reporting, the per-build scratch directory. | `core/src/util/blocks.ts` (`BlockCluster`, `createBlock`, `createMutation`, `isSpiky`), `core/src/util/registry.ts`, `core/src/util/evaluate.ts`, `core/src/util/err.ts`, `core/src/util/buildContext.ts`, `core/src/env/parseProgram.ts`, `core/src/env/transformSyntax.ts` |
| `utils` | Assembling the output: costumes, sounds, sprites, the `.sb3` zip, file-system helpers, and the package-authoring API. | `utils/src/util/build-util.ts`, `utils/src/util/fs.ts` (`FileBuffer`, `DirectoryBuffer`), `utils/src/util/lib-convert.ts` |
| `generator` | Every code generator, plus the optional optimiser. This is where a Babel node becomes Scratch blocks. | `generator/src/generator/<NodeType>.ts` (statements), `generator/src/generator/types/<NodeType>.ts` (values), `generator/src/generator/CallExpressionSub/<lib>.ts` (block libraries), `generator/src/optimise/**`, the generated `generator/src/index.ts` |
| `decompiler` | The other direction: `.sb3` back into a jvavscratch project. | `decompiler/src/decompiler/decompile-util.ts` |
| `cli` | The command line: yargs wiring, every command body, source-tree scanning, local config, the registry HTTP client, and the static assets a new project needs. | `cli/src/boot.ts`, `cli/src/cli/projectManager.ts`, `cli/src/cli/treeScan.ts`, `cli/src/cli/config.ts`, `cli/src/cli/registry.ts`, `cli/assets/` |
| `docs` | This VitePress site. | `docs/.vitepress/config.mjs` |

One more component exists but is **not** a published package: `registry/`, an
Express + SQLite package server that lives only on the author's machine. See
[Registry](/modules/registry) for that side of the story — and note that the
page describes a *local* service, not something you can clone from GitHub.

## Dependency direction

Dependencies run in a straight line. Nothing may point backwards, and the line
has no cycles:

```text
types  ←  core  ←  utils  ←  generator  ←  cli
                     ↑            ↑
                     └── decompiler
```

- `types` is a pure leaf: it depends on nothing and is safe to import anywhere.
- `core` depends only on `types`. It knows how to dispatch an AST node, but not
  what any particular node compiles to.
- `utils` depends on `types` and `core`. It knows how to turn a block dictionary
  into files on disk.
- `generator` and `decompiler` sit at the same level, both depending on `utils`.
- `cli` depends on everything.

The practical consequences:

- **Build in that order.** `npm run build` (`tsc`) emits `dist/*.d.ts`, and a
  package cannot typecheck until its dependencies' declarations exist:

  ```bash
  for p in types core utils generator decompiler cli; do (cd $p && npx tsc -p tsconfig.json); done
  ```

- **The arrow is why the dispatch registry exists.** `core` is the component that
  dispatches AST nodes to generators, yet it must not depend on `generator`. The
  relationship is inverted instead: importing `@jvavscratch/generator` pushes all
  42 built-in generators into `core`'s dispatch tables as a side effect. That
  mechanism is documented in full on the [Core](/modules/core) and
  [Generator](/modules/generator) pages, and it is the single most common source
  of "my build produced an almost empty project" reports — a subpath import such
  as `@jvavscratch/generator/optimise` skips the registration side effect.

## How a build crosses the packages

A single `jvavscratch build` touches all of them in order:

1. `cli/src/cli/projectManager.ts` validates the project and creates a private
   temporary directory for this build (`core/src/util/buildContext.ts`).
2. `cli` loads every package in `lib/` by `require()`-ing its `src/index.ts`,
   merging whatever it exports into one `config` object.
3. `cli/src/cli/treeScan.ts` maps sprite names to `.js` files.
4. `core`'s `parseProgram()` walks each file, asking the dispatch registry for a
   generator per node; `generator`'s implementations build blocks into a
   `BlockCluster` and record variables, lists, functions and classes along the
   way.
5. `utils`' `createSprite()` / `createCostume()` / `createSound()` assemble the
   Scratch targets, and `zipFolderToSb3()` writes `target/<name>.sb3`.

The full pipeline, step by step, with the exact failure modes of each stage, is
on the [CLI](/modules/cli) page.

## Tests

Tests live in `core/tests/` only — three files (`blocks.test.ts`,
`scratch-type.test.ts`, `scratch-uuid.test.ts`) covering 26 cases:

```bash
cd core && npm test
npx jest tests/blocks.test.ts              # a single file
npx jest -t 'should add blocks correctly'  # a single test by name
```

There is **no integration test suite**. To verify a compiler change, build a real
project and inspect the output:

```bash
node cli/dist/index.js build ./examples/pi-spigot
# -> examples/pi-spigot/target/pi-spigot/{project.json,*.sb3}
```

Block and asset IDs are random on every build, so diffing two `project.json`
files means normalising `\b[0-9a-f]{32}\b`, `\b[0-9a-f]{16}\b`, and the
five-character variable names that appear as identical adjacent pairs (for
example `["cf613","cf613"]`).

## Extending the compiler

Two pages cover the extension mechanism, from the two ends:

- [Extending jvavscratch](/extending) — the concepts: why a package extends the
  *compiler* rather than the compiled program, what the four contribution points
  are, and how precedence works.
- [Writing a Plugin](/plugins) — the practice: scaffold with `jvavscratch lib`,
  implement with the authoring API, install, build, publish.

## The rest of this chapter

- [CLI](/modules/cli) — commands, configuration, and the build pipeline.
- [Core](/modules/core) — dispatch, `BlockCluster`, syntax rewriting, errors.
- [Generator](/modules/generator) — the 42 generators, libraries, and the optimiser.
- [Decompiler](/modules/decompiler) — `.sb3` to project, and its limits.
- [Types](/modules/types) — the Scratch data model and the tuple builders.
- [Utils](/modules/utils) — packaging and the authoring API.
- [Registry](/modules/registry) — the local package backend.
- [Runtime](/modules/runtime) — a design draft; no runtime engine exists in the code.
