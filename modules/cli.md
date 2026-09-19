---
title: CLI
description: Command reference, the six-step build pipeline, project and asset layout, and local configuration.
---

# CLI module

`cli` is the only package a user normally touches. It owns the command line, the
build pipeline, the source-tree scanner, the local configuration file, and the
HTTP client for the package registry.

It is also the package that ties everything else together: `cli` is the only
place that imports `generator`, `decompiler` and `utils` at the same time, and
therefore the only place where a complete compilation can happen.

## What is in the package

| File | Responsibility |
| --- | --- |
| `cli/src/index.ts` | The executable entry: a shebang plus `import './boot'`. `cli/dist/index.js` is what `jvavscratch` points at. |
| `cli/src/boot.ts` | yargs wiring only. Declares every command, its positionals and the two global flags, and wraps each handler in `handleCommand()`. Contains no logic. |
| `cli/src/cli/projectManager.ts` | **Every command body, and the whole build pipeline.** `buildProject()` lives here. |
| `cli/src/cli/treeScan.ts` | `createFileTree()`: maps sprite names to the list of `.js` files that belong to them. |
| `cli/src/cli/config.ts` | Reads and writes `~/.jvavscratch/config.json`. |
| `cli/src/cli/registry.ts` | The HTTP client for the registry API (`/api/v1/...`). |
| `cli/src/cli/index.ts` | Re-exports `projectManager` and `treeScan` for programmatic use. |
| `cli/assets/` | The files a scaffolded project or package is built from: `background.svg`, `ice_cream.svg`, and the `library.txt` / `internal.txt` shims written into every package. |
| `cli/dev.js` | Runs the CLI from TypeScript sources through ts-node instead of `dist/`. |

Splitting the wiring (`boot.ts`) from the bodies (`projectManager.ts`) means
adding a command never touches build logic, and every command shares one error
path.

## Error handling

Every handler is wrapped:

```ts
function handleCommand(handler: (argv: any) => Promise<void> | void) {
    return async (argv: any) => {
        try { await handler(argv); }
        catch (e) {
            // ProjectError and Error both print as a red `error:` line
            console.error(chalk.red("error: ") + e.message);
            process.exit(1);
        }
    };
}
```

So the contract for command bodies is: throw, don't print. `ProjectError` (also
from `projectManager.ts`) is the intended exception type; `error(string)` is a
helper that throws one and is typed `never`. Anything a handler prints itself is
progress output (`info`, `infoList`) or a warning (`warn`, yellow `warn: `).

Note the asymmetry: commands that are *missing a prerequisite* (no
`jvavscratch.toml`, not logged in, no `lib/` directory) print a red error and
`return` with exit code 0, whereas anything thrown exits 1. Scripts that rely on
the exit code should account for both.

## Commands

### Projects

| Command | Behaviour |
| --- | --- |
| `jvavscratch new [name] [path]` | Scaffolds a project. Defaults: `name` = `my-project`, `path` = `./`. Writes into `path` itself when `path` is `.`, otherwise into `path/<name>`. Refuses if the target already contains `project.d.json`. |
| `jvavscratch init` | Scaffolds in the current working directory, using its basename as the project name. |
| `jvavscratch build [path]` | Compiles the project at `path` (default `./`) to `target/<name>/` and `target/<name>.sb3`. |
| `jvavscratch run [path]` | Builds, then opens the `.sb3` in TurboWarp. |
| `jvavscratch decompile <sb3Path> [outputDir] [projectName]` | Extracts an `.sb3` and writes a jvavscratch project. `outputDir` defaults to `./`, `projectName` to the `.sb3` basename. |

`run` is Windows-only unless `--bypass` is given, and the check happens twice —
once in `boot.ts` before the build, once inside `runProject()`. On other
platforms it prints the path of the built `.sb3` and returns without building
first. On Windows it looks for TurboWarp at
`C:/Users/<user>/AppData/Local/Programs/TurboWarp/TurboWarp.exe` and launches it
with the `.sb3` as an argument; if that file does not exist the command errors
with `could not run build: cannot find turbowarp app`.

### Packages

| Command | Behaviour |
| --- | --- |
| `jvavscratch lib [name] [path]` | Scaffolds a compiler-extension package: a `jvavscratch.toml`, an `src/index.ts` containing `module.exports = {}`, and `utils/library.ts` + `utils/internal.ts`. Path semantics match `new`. See [Writing a Plugin](/plugins). |
| `jvavscratch add [libs...]` | Downloads each `name@version` from the registry into `lib/` and records it in `[dependencies]`. |
| `jvavscratch remove [libs...]` | Deletes `lib/<name>` and its `[dependencies]` entry. |
| `jvavscratch update` | For each `[dependencies]` entry, asks the registry for a non-yanked version and reinstalls when it differs (`*` always reinstalls). |
| `jvavscratch search <query>` | Prints name, version, description, download count and owner for each match. |
| `jvavscratch publish` | Tars `src/` (and `utils/`, if present) plus `README.md`, and uploads it with the metadata from `jvavscratch.toml`. |

Version parsing is lenient and silent: `parseStrings()` accepts `name`,
`name@1.2.3` (also `@1.2`, `@1.2.3.4`… anything matching
`/^(\d+\.)?(\d+\.)?(\d+)$/`) and `name@latest`. Anything else — including a typo
in the version — becomes `*`, meaning "newest available". `add` prints a warning
and continues when one of several packages cannot be resolved.

`add` extracts the tarball with `tar.x({ file, cwd: dest, strip: 1 })`, so the
archive's top-level directory is stripped and `lib/<name>/src/index.ts` lands
where the build expects it.

### Account and settings

| Command | Behaviour |
| --- | --- |
| `jvavscratch login` | Prompts for username and password, stores the returned `api_token` and your username. |
| `jvavscratch register` | Prompts for username, email and password, then stores the token. |
| `jvavscratch registry set-url <url>` | Points the CLI at a different registry. |
| `jvavscratch registry get-url` | Prints the current registry URL. |
| `jvavscratch registry set-token <token>` | Stores an API token directly. |
| `jvavscratch registry logout` | Deletes the stored token and username. |

### Global flags

| Flag | Effect |
| --- | --- |
| `-o`, `--optimize` | Runs the alpha optimiser over each sprite's blocks. Prints `Optimization is still in its ALPHA form and may corrupt your project.` |
| `-b`, `--bypass` | Skips the TurboWarp platform check for `run`. |
| `-v`, `--version` | Prints the version. |
| `-h`, `--help` | Prints usage. |

`demandCommand(1)` makes a bare `jvavscratch` an error.

## The build pipeline

`buildProject(argv, at, name)` is a thin wrapper: it creates one private
temporary directory, hands it to `setBuildScratchDir()`, calls
`buildProjectInner()` and removes the directory in a `finally`. The scratch
directory is where all intermediate state lives — see
[Build scratch directory](#the-build-scratch-directory) below.

`buildProjectInner()` then runs six steps, in this order.

### 1. Validate

- `project.d.json` must exist and parse; its `sprites` must be an array of
  strings (anything else errors with the offending field).
- `assets/`, `src/` and `lib/` must all exist **and be directories**. A missing
  `lib/` is a hard error even when you have no packages, so a fresh project
  always ships an empty one.
- Every `sprites` entry must exist as a directory under `assets/` — otherwise
  `could not find sprite-data for included sprite '<name>'` — and must contain a
  `sprite.json`. A sprite literally named `stage` is rejected:
  `cannot create sprite named 'stage'!`.
- For each sprite, `costumes/costumes.json` and `sound/sound.json` are read and
  validated by `validatePropSchema`: the file must parse to an array, every
  entry must have string `name` and `file` properties, and the referenced file
  must exist and be a file. `x` / `y` default to `0`.
- The stage is read from `assets/stage/` with `stage.json`,
  `backdrops/backdrops.json` and `sound/sound.json`, validated the same way.
- Every directory in `lib/` must contain `src/index.ts` and a `utils/`
  directory. File-based packages error with
  `found file-based package '<name>' - file-based packages currently aren't allowed`.

Each failure is a `ProjectError`, so the user sees one red line and exit code 1.

### 2. Reset the scratch files

Four intermediate files are emptied at the start of a build:

| File | Reset to | Meaning |
| --- | --- | --- |
| `broadcasts.json` | `[]` | Broadcast names used anywhere in the project. |
| `fn.json` | `{}` | The function registry: per function, its `endCode` / `retCode` variable names and whether it is async. |
| `classData.json` | `{}` | The class registry. |
| `variables.json`, `lists.json` | `[]` | Reset *per sprite*, immediately before that sprite's blocks are generated. |

These files are **state, not configuration**. Generators append to them as a
side channel while the whole project compiles, and the assembly step reads them
back. This is why a build cannot resume half-way, and why the files must never
be edited by hand.

### 3. Load packages

Each directory in the project's `lib/` is cloned into `<scratch>/lib/`, and then
its `utils/library.ts` and `utils/internal.ts` are **overwritten** with
re-export shims (the templates are `cli/assets/library.txt` and
`cli/assets/internal.txt`). Never edit those files in a package — whatever you
write is destroyed on the next build.

Then each package's `src/index.ts` is `require()`d, and its exports are merged
into a single `config`:

```ts
// what a package's index.ts is expected to export
{
    libraries: { blockLibraries: [], valueLibraries: [] },
    globals: [],
    statement_implements: [],
    type_implements: [],
}
```

`fillDefaults()` fills in any missing keys, so a package may export only the
parts it uses. Each package is announced twice in the output: `Packaging <name>`
and `Building <name>`. What the four contribution points mean is covered in
[Extending jvavscratch](/extending).

### 4. Scan the source tree

`createFileTree(resolve(src))` produces `{ spriteName: [absoluteFilePaths] }`:

- `src/Sprite1.js` and any `.js` file under `src/Sprite1/` both belong to the
  sprite `Sprite1`.
- A `.js` file directly in `src/` becomes a sprite named after the file.
- Nested directories are folded into the enclosing sprite — unless the directory
  name starts with `&`, in which case it becomes a sprite of its own (with the
  `&` still in the name).
- Only `.js` files are collected; anything else is ignored.
- Sprites whose file list ends up empty are dropped from the map.

### 5. Generate blocks

For each sprite, the costume and sound descriptors are turned into project
assets (`createCostume` / `createSound`), then every file is read and compiled:

```ts
let program = parseProgram(content, basename(file), true, config,
                           { listIndexBase, customBlockReturn }).blocks;
if (isOptimised) program = optimiseTree(program);
blocks = { ...blocks, ...program };
```

With `-o`, `optimiseTree()` post-processes each file's dictionary before it is
merged. All files end up in one flat block dictionary for the sprite — block IDs
are unique, so a flat merge is safe.

### 6. Assemble and emit

For each sprite (plus the stage), variables come from three places: the
`variables.json` scratch file, `privateVariables` in `sprite.json`, and — for the
stage only — `globalVariables` / `globalLists`. Lists work the same way.
Broadcasts are collected from `broadcasts.json` and attached to the stage target.

`createSprite()` builds the Scratch target; note that it **forces the stage's
name to `Stage`** regardless of what you called the directory.

The project object is:

```jsonc
{
  "targets": [ /* sprites in project.d.json order, then the stage */ ],
  "monitors": [],
  "extensions": [],
  "meta": {
    "semver": "3.0.0",
    "vm": "0.2.0",
    "agent": "<your OS username>",
    "platform": { "name": "TurboWarp", "url": "https://turbowarp.org/" }
  }
}
```

The stage is appended last, after every sprite, rather than first as a
hand-authored `project.json` usually is. TurboWarp and Scratch both accept it.

Output goes to `<project>/target/`: the directory is created if missing and
wiped first if not, then `<scratch>/tmp/<name>/project.json` (plus the copied
asset files) and `<scratch>/tmp/<name>.sb3` are copied in. The build finishes
with `Finished <name> [optimized|unoptimized] in <seconds>s` — the timer starts
after validation, so it measures generation and assembly only.

::: warning Two asset fallbacks that do not work
When a sprite has no `costumes/` directory, the CLI substitutes a single
`{ name: "Costume1", file: …/cli/assets/ice_cream.svg }` object instead of an
array; when the stage has no `backdrops/`, it substitutes
`background.svg` the same way; and a project whose `project.d.json` has no
`stage` entry gets `sounds: {}`. All three are then passed to a `.forEach` in
the assembly loop, so each one fails with `value.costumes.forEach is not a
function` or `value.sounds.forEach is not a function`. **A missing `costumes/`
or `sound/` directory is therefore fatal**, not optional. The two SVG files
themselves are real and are used by `jvavscratch new` when it scaffolds a
project.
:::

## The build scratch directory

`core/src/util/buildContext.ts` owns the per-build temporary directory.
`buildProject()` uses `mkdtempSync(join(os.tmpdir(), "jvavscratch-build-"))`, so
every build gets a fresh, private directory that is deleted in a `finally`,
even when the build throws.

Everything transient goes there: the cloned `lib/`, the rewritten package
`utils/`, the scratch JSON files, and the `tmp/temp_project` directory used to
rename assets to their random IDs. That is deliberate — it fixes three problems
the old fixed-path layout had:

1. The old paths pointed inside the **installed package directory**, which fails
   with `EACCES` on a global install or a read-only mount and pollutes
   `node_modules`.
2. The old paths were fixed, so **concurrent builds wiped out each other's
   intermediate state** and emitted garbled projects. Two builds can now run at
   the same time.
3. After the repository split, `cli` and `generator` no longer shared an
   `../../assets` to point at, so the old relative paths were bound to break.

If you add a runtime data file to the compiler, put it in the scratch directory
via `scratchFile("<name>.json")` — not next to the compiled source.

## Project and asset layout

```text
<project>/
  jvavscratch.toml   # name, description, version, custom_block_return, list_index_base, [dependencies]
  project.d.json     # { "sprites": ["Sprite1", ...] }
  src/               # sprite JavaScript sources
  lib/               # installed packages (must exist)
  assets/
    stage/           # stage.json, backdrops/backdrops.json + files, sound/sound.json
    <Sprite>/        # sprite.json, costumes/costumes.json + files, sound/sound.json
  target/            # build output (recreated on every build)
```

`costumes.json` / `backdrops.json` / `sound.json` are arrays of
`{ "name": ..., "file": ... }` with optional `x` / `y` rotation centres, and the
referenced files must sit **flat** in the same folder — no subdirectories.

`jvavscratch.toml` is a small TOML file:

```toml
name = "pi-spigot"
description = ""
version = "0.0.1"
custom_block_return = true
list_index_base = 0

[dependencies]
example-package = "0.0.1"
```

| Key | Effect |
| --- | --- |
| `name` | The project name used in output paths and console output. |
| `description`, `version` | Metadata; also what `publish` sends to the registry. |
| `list_index_base` | `0` for zero-based list indexing, `1` for one-based. Anything else warns (`Invalid list_index_base '<x>', defaulting to 1.`). |
| `custom_block_return` | Enables Scratch's procedure return values at call sites. |
| `[dependencies]` | Recorded by `add`, read by `update`. `build` does **not** install anything — the packages in `lib/` are what gets loaded. |

The file is read **from the process working directory** when the CLI starts, not
from the `path` argument. Run `jvavscratch build` from inside the project
directory (or `cd` there first); `jvavscratch build ./some/project` compiles that
project's sources but picks up `./jvavscratch.toml` from where you are standing.

::: warning Two known quirks in the current implementation
- `list_index_base` is resolved with `projectData.list_index_base || 1`, so a
  value of `0` falls back to `1` and zero-based indexing is not reachable from
  the toml.
- `custom_block_return` is applied when generating call sites (the
  `procedures_call` mutation gets `"return": "1"`), but not inside procedure
  bodies: the body is parsed with `{ isFunction: true, functionName }` only, so
  the `return` statement still compiles to the temporary-variable form and no
  `procedures_return` block is emitted.
:::

## Local configuration

`cli/src/cli/config.ts` keeps `~/.jvavscratch/config.json`:

```json
{
  "registry": "http://localhost:3000",
  "api_token": "jvs_...",
  "username": "you"
}
```

The registry defaults to `http://localhost:3000`; a missing or unparsable file
yields that default rather than an error. `setConfig()` merges, so writing the
token never drops the username.

## The registry client

`cli/src/cli/registry.ts` is a thin `fetch` wrapper. All requests go to
`<registry>/api/v1/...`; the one-time password endpoints send JSON, publishing
sends multipart `FormData`, and authenticated calls send
`Authorization: Bearer <token>`.

| Function | Endpoint |
| --- | --- |
| `searchCrates(query, page, perPage)` | `GET /api/v1/crates?q=&page=&per_page=` |
| `getCrate(name)` | `GET /api/v1/crates/:name` (404 becomes `null`) |
| `getCrateVersion(name, version)` | `GET /api/v1/crates/:name/:version` |
| `downloadCrate(name, version)` | `GET /api/v1/crates/:name/:version/download` |
| `publishCrate(tarball, metadata)` | `PUT /api/v1/crates/new` |
| `login`, `register` | `POST /api/v1/account/login`, `POST /api/v1/account/register` |
| `yankVersion`, `unyankVersion`, `addOwner`, … | `/api/v1/crates/:name/...` |

Note that package *downloads* come from this service, not from the GitHub API.
The only remaining GitHub-touching path in the CLI is the `update` command's
mention of self-updating; installing a package never touches GitHub.

## Adding a command

1. Add the `yargs` declaration to `cli/src/boot.ts` — positionals, flags and
   description.
2. Add the body to `cli/src/cli/projectManager.ts`, throwing `ProjectError` (or
   using the `error()` helper) for anything the user can fix.
3. Wrap it in `handleCommand()` in `boot.ts` so failures print one red line.
4. Rebuild the package: `cd cli && npm run build` (or `npx tsc -p tsconfig.json`).

There is no plugin system for CLI commands; a command is a code change.
