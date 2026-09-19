---
title: Contributing
---

# Contributing

jvavscratch is an ahead-of-time compiler that turns JavaScript source into Scratch 3.0
projects. It is developed in the open under the **MPL-2.0** licence, and contributions —
bug reports, fixes, new generators, documentation — are welcome.

This page covers what you need to know to get a change built, tested and reviewed. There is
no contributor licence agreement to sign, no code of conduct document, and no issue or pull
request templates: pull requests are read by a maintainer like any other change.

## Where the code lives

jvavscratch was split out of a single repository into one repository per package, under the
`Jvavscratch` GitHub organisation:

| Repository | Responsibility | Key files |
|---|---|---|
| `types` | Pure types and zero-dependency helpers | `src/types/types.ts` (the `BlockOpCode` enum, `Block`, `Mutation`, `Sprite`, `Project`, `buildData`, `generatedData`), `src/types/scratch-type.ts`, `src/types/scratch-uuid.ts` |
| `core` | AST dispatch and the compilation environment | `src/util/blocks.ts` (`BlockCluster`), `src/util/registry.ts` (dispatch tables), `src/util/evaluate.ts`, `src/util/err.ts`, `src/util/buildContext.ts`, `src/env/parseProgram.ts`, `src/env/transformSyntax.ts` |
| `utils` | Packaging and the package-author API | `src/util/build-util.ts`, `src/util/fs.ts`, `src/util/lib-convert.ts` |
| `generator` | Every code generator, plus the optimiser | `src/generator/<NodeType>.ts` (statements), `src/generator/types/<NodeType>.ts` (values), `src/generator/CallExpressionSub/<lib>.ts` (library functions), `src/optimise/**` |
| `decompiler` | `.sb3` back to a jvavscratch project | `src/decompiler/decompile-util.ts` |
| `cli` | The command line | `src/boot.ts` (yargs wiring), `src/cli/projectManager.ts` (**every command body**), `src/cli/treeScan.ts`, `src/cli/config.ts`, `src/cli/registry.ts` |
| `docs` | This VitePress site | — |
| `registry` | The package registry backend | `server.js`, `routes/`, `middleware/` — **local only, not published on GitHub** |

### The dependency direction is not negotiable

```
types  ←  core  ←  utils  ←  generator  ←  cli
                     ↑            ↑
                     └── decompiler
```

Arrows point in the direction of dependency, and **nothing may point backwards**. `core`
cannot import `generator`, `utils` cannot import `cli`, and so on. This is enforced by
convention rather than by tooling, so it is the first thing a reviewer will look at.

The consequence that surprises people: because `core` cannot depend on `generator`, the
built-in generators register *themselves* into `core`'s dispatch tables when
`@jvavscratch/generator` is imported. Anything that imports the generator must import the
package entry point (`@jvavscratch/generator`), never a subpath — a subpath does not run the
registration, and the build then emits a near-empty `project.json` with one warning as the
only clue.

## Building locally

Each package is independent and compiles itself with `tsc`:

```bash
npm run build     # tsc
npm run dev       # tsc -w
```

Because a package's `dist/*.d.ts` must exist before anything depending on it can typecheck,
build them in dependency order:

```bash
for p in types core utils generator decompiler cli; do (cd $p && npx tsc -p tsconfig.json); done
```

::: warning Do not run `npm install` inside a package while developing
Cross-package dependencies are declared as `github:Jvavscratch/<pkg>`, which npm resolves by
cloning the repository and running its `prepare` script. For local development, each
package's `node_modules/@jvavscratch/*` is a **symlink** to the sibling checkout, and
third-party dependencies resolve up to the container's `node_modules`. Running `npm install`
in a package directory replaces those symlinks with fresh clones of the published
repositories, and your local edits stop being used.
:::

Run the CLI from source while working on the compiler:

```bash
node cli/dev.js build ./examples/pi-spigot
```

`cli/dev.js` registers `ts-node` and loads `cli/src/boot.ts`, so it picks up your edits
without a build step. This is also the runner that makes the optimiser's overrides resolve —
see [Advanced topics](/advanced/index).

## Tests

The test suite is small and lives entirely in `core`:

```bash
cd core
npm test                                  # jest, roots: ./tests
npx jest tests/blocks.test.ts             # one file
npx jest -t 'should add blocks correctly' # one test by name
```

Three files — `blocks`, `scratch-type` and `scratch-uuid` — for **26 cases in total**. The
jest config maps `@jvavscratch/*` straight to the sibling packages' `src/`, so the tests run
without building `types` first.

::: warning There is no integration test suite
`core`'s 26 unit tests cover the block accumulator, the scratch-type constructors and the
UUID generator. Nothing tests the compiler end to end, and nothing tests the CLI. **A
compiler change is verified by compiling a real project and reading the output:**

```bash
node cli/dist/index.js build ./examples/pi-spigot
# -> examples/pi-spigot/target/pi-spigot/project.json
# -> examples/pi-spigot/target/pi-spigot/pi-spigot.sb3
```

`project.json` is the actual Scratch block dictionary. Read it, and if you changed
generation, open the `.sb3` in TurboWarp and check the project still behaves. A build that
exits 0 has proved very little.

Because block and asset IDs are random per build, comparing two builds means normalising
them first — see [Diffing two builds](/advanced/index#diffing-two-builds) for a recipe.
:::

If you add a unit test, put it in `core/tests/`. If you fix a bug, a test that would have
caught it is the most valuable thing you can include.

## Working on the compiler

A change usually touches one generator. The contracts are stable and short:

```ts
// statements — generator/src/generator/<node.type>.ts
module.exports = (blockCluster: BlockCluster, node: T, buildData: buildData) => generatedData
// generatedData = { keysGenerated: string[], terminate?: boolean, err?: boolean, doNotParent?: boolean }

// values — generator/src/generator/types/<node.type>.ts
module.exports = (blockCluster, node, parentId, buildData) => typeData
// typeData = { isStaticValue, blockId, block: ScratchInput | null }
```

- Generators are CommonJS `module.exports = fn`. That is why the entry point uses `require()`
  and why `import x from "…"` on a generator file fails with TS1192.
- `parseProgram` links each returned group to the previous one by writing `next` on the last
  key and `parent` on the first, so **keys must be returned in execution order**.
- Return `terminate: true` to end a chain, `err: true` to drop a node silently. A node type
  with no registered implementation warns and is skipped.
- `buildData` carries `listIndexBase`, `customBlockReturn`, `isAsync`, `isFunction`,
  `functionName` and `packages` through every generator. Check it before inventing new
  plumbing.

### Adding a generator

1. Add the file under `generator/src/generator/` (statements) or
   `generator/src/generator/types/` (values).
2. **Re-run `generator/scripts/gen-index.js`.** `generator/src/index.ts` is generated; it
   `require()`s every generator and registers all of them.
3. Rebuild `generator`, then update `core` and `cli` if their interfaces changed.
4. Test it against a real project, then update the [language
   reference](/reference/language-reference) if the change is user-visible.

### Core data model, briefly

Everything is the shape of Scratch's `project.json`:

- `BlockCluster` is a `{[uuid]: Block}` dictionary plus `addBlocks()`. **Nothing is keyed by
  name** — ordering is carried entirely by `next`/`parent`.
- `ScratchInput` is the four-element tuple Scratch uses for an input slot. Build them with
  `getScratchType`, `getSubstack`, `getMenu`, `getVariable`, `getBlockNumber`, `getColor`,
  `getBroadcast` and `getList` from `@jvavscratch/types`, never by hand.
- `uuid()` uses `crypto.randomInt`, not `Math.random()`.
- `isSpiky()` / `isSpikyType()` classify opcodes and library functions that return booleans,
  because Scratch only accepts booleans, other logical operators or binary comparisons in a
  boolean slot. `core/src/env/transformSyntax.ts` exists to rewrite constructs Scratch cannot
  express (for example `**` to `math.pow`, a ternary to an if/else).

## House style

- **Match the file you are editing.** That goes for error messages especially: they are a mix
  of English and Chinese across `cli/src/boot.ts`, `utils/src/util/build-util.ts`,
  `core/src/env/transformSyntax.ts` and `decompiler/src/decompiler/decompile-util.ts`. Do not
  normalise them; write the language the surrounding code uses.
- **`strict: false` is deliberate**, matching the pre-split root configuration. Type errors
  are not a reliable signal in this codebase, so do not "fix" the config or add casts to
  silence it — make sure the behaviour is right.
- **The tsconfig template is shared** across packages: `target ES2020`, `module` and
  `moduleResolution` `Node16`, `rootDir: src`, `outDir: dist`, `declaration`, `declarationMap`,
  `sourceMap`, `strict: false`, and `"types": ["node"]`, which is mandatory. TypeScript 6 does
  not pick up `@types/node` implicitly here, rejects `moduleResolution: node10` (TS5107), and
  demands an explicit `rootDir` (TS5011).
- **Runtime data belongs in the build scratch directory.** Everything a build writes at
  runtime (scratchpad JSONs, cloned `lib/`, the temporary project used for asset renaming)
  goes through `getBuildScratchDir()` / `scratchFile()` from `@jvavscratch/core`. The one
  legitimate exception is static assets, which are resolved with `__dirname` into the
  package's own `assets/` directory — and which must therefore stay listed in `package.json`'s
  `files` array.
- **Never edit a package's `utils/` files.** During a build they are overwritten with
  re-export shims pointing at `@jvavscratch/utils`. Edit `src/`.

## Working on the registry

The `registry` repository is a **local-only** Express + SQLite service that stores compiler
extension packages. It has no GitHub remote and is not published; do not push it, and do not
add it as a `github:` dependency anywhere.

```bash
cd registry
JWT_SECRET=$(openssl rand -hex 32) npm start   # refuses to boot without JWT_SECRET
```

Its `storage/registry.db` holds real users' bcrypt hashes and their API tokens in plaintext.
It is gitignored on purpose. **Do not delete it and do not commit it.**

If you touch the HTTP surface, keep the CLI client (`cli/src/cli/registry.ts`) and the API
routes in sync, and keep the validation on the read routes as strict as the validation on
publish — the crate name and version end up in a filesystem path.

## Documentation

The documentation site is its own repository (`docs`), built with VitePress:

```bash
cd docs
npm install
npm run dev      # local preview
npm run build    # static build into dist/
```

Deployment is automatic: pushing to `main` triggers
`.github/workflows/deploy.yml`, which builds the site and publishes it with the
GitHub Actions Pages flow. There is no `deploy` script and nothing to push to a
`gh-pages` branch by hand.

The site is bilingual: the **English pages are at the site root**, and the Chinese pages live
under `zh/` (for example `/modules/utils` and `/zh/modules/utils`). When you add or change a
page, add the counterpart in the other language and link between them with absolute paths.

Two things to keep in mind:

- The README is the language reference — it is the authority on the dialect, and it lives in
  the docs as `reference/language-reference.md` (and `zh/reference/language-reference.md`).
  Chapter-by-chapter parity between the two is intentional; do not drop sections.
- `.vitepress/config.mjs` runs with dead-link checking enabled and an empty
  `ignoreDeadLinks` list. If you ever have to add an entry to it, keep it to that
  one page and delete the entry as soon as the target exists — never switch the
  option to `ignoreDeadLinks: true`, which would silently swallow every future
  dead link as well.

## Licence

Everything in the project is **MPL-2.0**. The licence text itself stays in English; only the
explanatory paragraphs around it are duplicated in both languages.
