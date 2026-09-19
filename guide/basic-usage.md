---
title: Basic Usage
---

# Basic Usage

This page covers everything between "I have a project" and "I am shipping one": what each file in the project directory is for, how a build turns it into an `.sb3`, how sprites and assets are laid out, and how dependencies work.

## Project layout

```
my-project/
  jvavscratch.toml     project manifest
  project.d.json       the list of sprites to build
  src/                 JavaScript source, one file or one folder per sprite
  lib/                 installed compiler-extension packages
  assets/
    stage/             the stage: backdrops, sounds, global variable declarations
    <Sprite>/          one directory per sprite: costumes, sounds, sprite.json
  target/              build output (created and cleared by every build)
```

`src/`, `lib/` and `assets/` must all exist and be directories, and `jvavscratch.toml`'s neighbour `project.d.json` must exist. The build validates this up front and stops with a `ProjectError` if anything is missing — including `lib/`, which must exist even when you have no dependencies.

## `jvavscratch.toml`

The manifest. `name`, `description` and `version` are descriptive; the two options below change code generation.

```toml
name = "my-project"
description = ""
version = "0.0.1"
custom_block_return = true
list_index_base = 0

[dependencies]
example-package = "0.0.1"
```

| Key | Type | Default | Effect |
|---|---|---|---|
| `name` | string | — | Name of the output file (`target/<name>.sb3`) and of the unpacked directory. |
| `description` | string | `""` | Metadata only. |
| `version` | string | — | Metadata only; required by `jvavscratch publish`. |
| `custom_block_return` | boolean | `false` | Enables returning values from procedures. |
| `list_index_base` | `0` or `1` | `1` | Whether list indexes are zero- or one-based. |
| `[dependencies]` | table | empty | Package name → version, maintained by `add` / `remove` / `update`. |

### `custom_block_return`

Off by default. When on, a `function` that contains a `return` gets a return type, and both `let x = foo();` and `x = foo();` compile into a `procedures_call` block wired straight into the variable assignment. This uses TurboWarp's procedure-return support, so projects built with it should be opened in TurboWarp. See [Functions](/grammar/functions#returning-values).

### `list_index_base`

Controls whether `myList[0]` means the first element or `myList[1]` does.

It is a user-facing convention only — Scratch itself always stores one-based lists. With `list_index_base = 1` (the default) the index you write is passed through unchanged. With `list_index_base = 0` the compiler inserts a `+ 1` on every list read, write and index lookup, so your `myList[0]` addresses Scratch item 1 and your source reads like ordinary JavaScript.

Any value other than `0` or `1` logs a warning and falls back to `1`. This setting must be consistent across the whole project; there is no per-file override.

## `project.d.json`

The build is driven by this file, not by the contents of `src/`. Every name listed here must have a matching directory under `assets/`:

```json
{
  "sprites": ["Sprite1", "Sprite2"]
}
```

A name with no matching `assets/<name>/` directory is an error (`could not find sprite-data for included sprite`), and `stage` is rejected as a sprite name — the stage is implicit.

## Sprite sources in `src/`

Two layouts are understood:

```
src/Sprite1.js              one file is the whole sprite
```

```
src/Sprite1/foo.js          a folder is the whole sprite, one script per file
src/Sprite1/bar.js
```

Both mean sprite `Sprite1`, and each file becomes its own top-level script with its own hat block. A nested directory is ignored, *unless* its name begins with `&` — then every script inside it is taken out of the sprite and becomes a sprite of its own, named after the **file**:

```
src/Sprite1/foo.js          → sprite "Sprite1"
src/Sprite1/&Menu/bar.js    → sprite "bar"   (its own sprite, not part of Sprite1)
src/Sprite1/&Menu/baz.js    → sprite "baz"
```

Each of those standalone sprites needs its own `assets/<name>/` directory and an entry in `project.d.json`, exactly like any other sprite.

Three things about this layout cause most of the surprises people hit:

**Do not create both.** `src/Sprite1.js` and `src/Sprite1/` at the same time do not merge — the standalone file wins, the folder is discarded, and the build says nothing. The scripts in the folder are simply not compiled. If a file you are sure you edited has no effect on the output, check for a stray `src/<Sprite>.js` first.

**Files are compiled in filesystem order.** Within one sprite, files are compiled one after another, and a custom block must already have been seen by the compiler before a file that calls it is compiled. In practice directory order is name order, so a shared `a_helpers.js` sorts before `keys.js`; but the safe habit is to keep a block's definition in the same file as its call site, and to verify by looking at the build output.

**Every file gets a hat.** There is no "library file" that only defines things. A file with no directive starts with "when green flag clicked", so the code at its top level runs on the flag — which is normally what you want for variable initialisation, but it does mean an unused scratch file still contributes a script.

## Assets

`assets/` holds one directory per sprite plus a mandatory `assets/stage/`:

```
assets/
  stage/
    stage.json                 volume, currentCostume, globalVariables, globalLists
    backdrops/
      backdrops.json           [{ "name": "Backdrop1", "file": "stage.svg" }]
      stage.svg
    sound/
      sound.json               [ { "name": …, "file": … } ]
  Sprite1/
    sprite.json                x, y, direction, size, visible, layerOrder, privateVariables…
    costumes/
      costumes.json            [{ "name": "Costume1", "file": "default.svg" }]
      default.svg
    sound/
      sound.json
```

Rules the build enforces:

- `assets/stage/` and `assets/stage/stage.json` must exist, or the build fails. (If the project's `sprites` list somehow omits `stage`, the compiler falls back to a built-in backdrop instead of refusing to build — but the scaffolding always creates the directory, and you should keep it.)
- Costume and sound manifests are `[{ "name": ..., "file": ... }]`. Both keys are required and must be strings, and the referenced file must exist in the same folder.
- **Asset files must sit flat.** Names are resolved relative to the manifest's own directory; sub-directories inside `costumes/` or `sound/` are not searched.
- Costume entries may carry optional `x` and `y`, which become the costume's rotation centre.
- A `costumes.json`-less sprite falls back to a built-in costume, and a `sound.json`-less sprite to no sounds, so a minimal sprite is legal — but a `costumes/` folder without `costumes.json` inside it is an error.
- A sprite named `stage` is rejected.

### Declaring global variables and lists

This is the one piece of the asset layer that is easy to miss, because it has no bearing on whether the build succeeds.

Variables created with a plain `let` are global, but the compiler has nowhere to register them: the `variables` map of a target is assembled from `_l_` declarations (which become sprite-private) and from `assets/<Sprite>/sprite.json`'s `privateVariables`. Globals come from **`assets/stage/stage.json`**:

```json
{
  "volume": 100,
  "currentCostume": 0,
  "globalVariables": ["score", "lives"],
  "globalLists": { "highscores": [] }
}
```

Every global the program reads or writes should be listed in `globalVariables`, and every list in `globalLists` (an object of name → initial contents). Blocks referencing a variable that is not declared in any of those three places still compile — the block's field just names a variable the project does not have — so a missing entry shows up in the editor as a variable that is not in the palette, and in TurboWarp as a runtime surprise rather than a build error.

## Building

```bash
jvavscratch build [path]     # default path: ./
jvavscratch build -o         # also run the alpha optimiser
```

A build:

1. Validates `project.d.json`, `assets/`, `src/` and `lib/`.
2. Resets the per-build scratch state (function signatures, class data, variables, lists, broadcasts).
3. Copies every `lib/<pkg>/` into a scratch directory and regenerates each package's `utils/` shims.
4. Scans `src/` into sprite → files.
5. Compiles every file into one flat block dictionary per sprite.
6. Assembles the stage and each sprite, collects variables/lists/broadcasts, writes `target/<name>/project.json`, and zips it into `target/<name>.sb3`.

Every build gets its own temporary working directory, so concurrent builds cannot corrupt each other and your installed packages are never written to.

`target/` is cleared at the start of every build. Do not keep anything there.

Because block IDs and asset IDs are random per build, two builds of unchanged sources produce a diff in `project.json` even when nothing changed semantically. Normalise 32-hex IDs, 16-hex IDs and the five-character generated variable names before diffing.

## Dependencies

Dependencies are **compiler extensions**: a package's `src/index.ts` is `require()`d by the compiler during the build, so a package adds block generators, library functions, globals or even replacement implementations of whole syntax node types. It extends the compiler, not the program being compiled.

```bash
jvavscratch add example-package               # latest non-yanked version
jvavscratch add example-package@0.0.1         # a specific version
jvavscratch remove example-package
jvavscratch update                            # re-resolve everything in [dependencies]
jvavscratch search scratch                   # search the registry
jvavscratch publish                           # publish the current directory as a package
```

`add` downloads a `.tar.gz` from the **package registry** (the `/api/v1/crates` endpoints) and unpacks it into `lib/<name>/`, recording the resolved version in `jvavscratch.toml`. It does not fetch from GitHub. Only the CLI's own self-update path talks to GitHub.

`[dependencies]` in the manifest is a record, not a trigger: **`jvavscratch build` does not install or update anything.** If you add a line to `[dependencies]` by hand, run `jvavscratch update` to actually fetch it. Removing a line by hand does not uninstall anything either — use `jvavscratch remove`.

A package must have `src/index.ts` and a `utils/` directory. Both are validated before the build copies the package, and file-based packages are rejected. The `utils/` files are **regenerated on every build** into re-export shims pointing at `@jvavscratch/utils`; never edit them, because your changes will be overwritten and nothing will tell you.

If the registry is unreachable, `add` warns and continues rather than failing the build. Check the configured URL with `jvavscratch registry get-url`.

## Running and decompiling

```bash
jvavscratch run [path]        # build, then open in TurboWarp
jvavscratch decompile <sb3> [outputDir] [projectName]
```

`run` is Windows-only unless you pass `--bypass`. `decompile` turns an `.sb3` back into a jvavscratch project, which is the supported way to inspect what an unfamiliar project does.

## Common mistakes

| Symptom | Cause |
|---|---|
| `could not find \`lib\` directory` | An empty `lib/` still has to exist. |
| `could not find sprite-data for included sprite 'X'` | `project.d.json` names a sprite with no `assets/X/`. |
| `cannot create sprite named 'stage'` | `stage` is reserved. |
| Edits to a script have no effect | Both `src/X.js` and `src/X/` exist; the file wins. |
| A custom block "does not exist" at the call site | The call was compiled before the definition — different file, or the definition is below the call. |
| A variable is missing from the Scratch palette | It is global but not listed in `stage.json`'s `globalVariables`. |
| Warnings about unknown libraries/functions, blocks missing | A typo in a library or function name; unknown calls are skipped, not fatal. |
| `project.json` is nearly empty | The optimizer ran on a project whose generators never registered — check that the CLI imports `@jvavscratch/generator` by its main entry. |

## Next steps

- [Tutorials](/guide/tutorials) — a worked example that uses variables, loops, custom blocks, events and return values.
- [Grammar](/grammar/) — the dialect, topic by topic.
- [FAQ](/faq/) — short answers to common questions.
