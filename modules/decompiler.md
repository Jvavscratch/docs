---
title: Decompiler
description: Turning an .sb3 back into a jvavscratch project — what it does, which opcodes it covers, and where it breaks.
---

# Decompiler module

`decompiler` is the only package that runs the compiler backwards: it reads a
Scratch `.sb3`, walks the block dictionary, and writes a jvavscratch project.
It is also the smallest package — one implementation file, two exported
functions.

Its limits are worth reading before you use it. The decompiler is a
**best-effort reconstruction**, not an inverse of the compiler, and a project it
produces cannot currently be rebuilt without manual repair. The
[Limitations](#limitations) section below lists the concrete, reproducible
reasons.

## What is in the package

| File | Responsibility |
| --- | --- |
| `decompiler/src/decompiler/decompile-util.ts` | Everything: unzipping, block walking, code emission, asset copying. |
| `decompiler/src/decompiler/index.ts` | `export * from './decompile-util'`. |
| `decompiler/src/index.ts` | Re-exports the above; the package's main entry. |

Three functions are exported:

```ts
unzipSB3(sb3Path: string, tempDir: string): Promise<void>
createjvavscratchProject(tempDir: string, projectDir: string, projectName: string): Promise<void>
copyAssets(tempDir: string, projectDir: string): Promise<void>
```

`createjvavscratchProject` calls `copyAssets` itself, so a caller normally uses
only the first two.

The code generator — `generateJavaScriptFromBlocks` — is **not** exported. There
is no supported way to decompile a single sprite or a block dictionary from
outside the package.

## Entry points

`unzipSB3` extracts with `adm-zip` (`extractAllTo(tempDir, true)`) after
clearing `tempDir` if it exists, and then asserts that `project.json` is
present — an `.sb3` without one throws
`Invalid SB3 file format: missing project.json file`. Failures are rewrapped as
`Failed to extract SB3 file: …`.

`createjvavscratchProject` clears or creates the output directory, reads
`project.json`, and writes:

```text
<projectDir>/
  jvavscratch.toml        # name, description, author, version
  project.d.json          # { "sprites": ["Stage", "<Sprite>", ...] }
  src/
    Stage/Stage.js        # the stage's blocks
    <Sprite>.js           # one file per sprite
  lib/                    # empty
  assets/
    costumes/             # see "Assets" below
    sounds/
```

and finally `createProjectDirectories()` ensures `assets`, `assets/costumes`,
`assets/sounds`, `lib` and `src` all exist.

The `.toml` it writes deliberately matches the shape `buildProject` expects:

```toml
name = "opttest"
description = "Decompiled Jvavscratch project from Scratch"
author = ""
version = "1.0.0"
```

Note what is absent: no `custom_block_return`, no `list_index_base`, no
`[dependencies]`. A decompiled project therefore always builds with the default
one-based list indexing and procedure returns disabled.

## How the code is generated

For each target, `generateJavaScriptFromBlocks(blocks, variables, lists)` emits a
file in three passes.

**1. Declarations.** Variables and lists are collected from the target's
`variables` / `lists` maps *and* from the blocks themselves (`data_*` blocks
referencing a `VARIABLE` or `LIST` field). Cloud variables — those whose name
starts with `☁` — are skipped. Each variable becomes `let <name> = <initial>;`.
Lists become one of:

```js
list.newList("numbers", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], false);  // a list literally named "numbers"
list.newList("<name>", [<initial items>], false);
list.createList("<name>");
```

The `numbers` case is hard-coded, and it *ignores* the list's real contents.

A second hard-coded touch is worth flagging, because it silently changes
behaviour: after collecting initial values, the generator overwrites the
recorded value for eight well-known names.

```ts
variableInitialValues['len'] = 0;
variableInitialValues['i'] = 1;
variableInitialValues['j'] = 1;
variableInitialValues['k'] = 1;
variableInitialValues['result'] = "";
variableInitialValues['separator'] = "";
variableInitialValues['current'] = "";
variableInitialValues['next'] = "";
```

So a project whose `i` starts at `7` decompiles to `let i = 1;`.

**2. Find the scripts.** `findTopLevelBlocks` returns every block that nothing
references through an `inputs` entry or a `next` pointer, and then adds every
block whose opcode starts with `event_`. Block order is object-key order from the
JSON, so it follows how the project was serialised rather than how the scripts
look on the Scratch canvas.

**3. Emit.** Each script is walked by `decompileBlock(blocks, blockId, block,
indentation)`, which returns a string. A statement case appends its own line and
falls through to a shared tail that recurses into `block.next`; an expression
case returns a snippet with no semicolon, which the caller inlines.
`processInput` turns an input tuple into a snippet: a string index is looked up
in the block dictionary (and, for operators, list accessors and sensing, inlined
without a semicolon); an array index yields a literal, with a number-looking
string emitted as a number and a known variable name emitted bare.

The indentation parameter is threaded through but nested statements inside a
`control_if` are produced by the same recursive call, so the output is
approximately rather than reliably indented.

### Opcode coverage

The `switch` in `decompileBlock` handles these 57 opcodes:

| Category | Opcodes |
| --- | --- |
| Events | `event_whenflagclicked` |
| Data | `data_variable`, `data_listcontents`, `data_setvariableto`, `data_changevariableby`, `data_addtolist`, `data_deletealloflist`, `data_deleteoflist`, `data_replaceitemoflist`, `data_itemoflist`, `data_lengthoflist` |
| Control | `control_repeat`, `control_repeat_until`, `control_if`, `control_if_else`, `control_wait`, `control_stop` |
| Looks | `looks_say`, `looks_sayforsecs`, `looks_think`, `looks_thinkforsecs`, `looks_show`, `looks_hide`, `looks_switchcostumeto`, `looks_nextcostume`, `looks_setsizeto`, `looks_changesizoby` |
| Operators | `operator_equals`, `operator_greaterthan`, `operator_gt`, `operator_lessthan`, `operator_lt`, `operator_not`, `operator_add`, `operator_subtract`, `operator_multiply`, `operator_divide`, `operator_join` |
| Procedures | `procedures_definition`, `procedures_call` |
| Motion | `motion_movesteps`, `motion_turnright`, `motion_turnleft`, `motion_gotoxy`, `motion_changexby`, `motion_changeyby`, `motion_pointindirection`, `motion_glidesecstoxy` |
| Sound | `sound_play`, `sound_playuntildone`, `sound_stopallsounds`, `sound_changevolumeby`, `sound_setvolumeto` |
| Sensing | `sensing_touchingobject`, `sensing_mousedown`, `sensing_mousex`, `sensing_mousey`, `sensing_keyoptions` |

Anything else becomes a comment, and nothing else — there is no error and no
warning:

```js
// Unsupported block: control_forever
// Looks block: looks_seteffectto
```

Because the fallback categorises by opcode *prefix*, most unsupported blocks are
at least tagged with the right family. The gaps are substantial: `control_forever`,
`control_wait_until`, `event_whenkeypressed`, `event_broadcast`,
`operator_and`, `operator_or`, `operator_mod`, `sensing_askandwait`,
`sensing_keypressed`, `data_showvariable`, `looks_seteffectto`, the clone blocks
and `procedures_return` are all unhandled.

## Using it from the CLI

```bash
jvavscratch decompile <sb3Path> [outputDir] [projectName]
```

`decompileFromSB3` in `cli/src/cli/projectManager.ts` validates that the `.sb3`
exists, derives the project name from `projectName` or the `.sb3` basename, and
computes `projectDir = join(outputDir, name)`. Extraction goes to
`<cwd>/tmp/sb3_extract_<timestamp>`, which is removed afterwards — along with the
wrapper `<cwd>/tmp` directory's contents, though the empty `tmp` directory
itself is left behind.

Note that this is the one place the CLI still uses `process.cwd()` for a working
path rather than the scratch directory, and that `outputDir` defaults to `./`.
Unlike the build commands, a decompile failure is reported through `warn()` and
then `error()`, so the exit path depends on whether the throw happened inside or
outside the `try`.

## Limitations

Everything here was reproduced against a project built by this compiler and then
decompiled back.

### A decompiled project does not rebuild

`jvavscratch build` on a freshly decompiled project fails immediately:

```
error: could not find sprite-data for included sprite 'Stage'
```

Two independent causes, both in the asset layer:

- **No per-sprite asset directories.** The decompiler creates `assets/`,
  `assets/costumes/` and `assets/sounds/`, but the build looks for
  `assets/<Sprite>/sprite.json`, `assets/<Sprite>/costumes/costumes.json` and a
  complete `assets/stage/`. None of those are produced.
- **`copyAssets` looks in the wrong place.** It copies `<tempDir>/costumes` and
  `<tempDir>/sounds`, but an `.sb3` stores its assets **flat at the archive
  root** — `project.json` next to `<md5>.svg` files, with no `costumes` or
  `sounds` subdirectory. A standard `.sb3` therefore copies nothing at all and
  both destination directories end up empty.

The `lib/` directory is created (which matters, since a missing `lib/` is a hard
error), and `src/` and `project.d.json` are well-formed, so the manual repair is
confined to the asset tree: add `assets/<Sprite>/` with a `sprite.json`,
`costumes/costumes.json` and `sound/sound.json` for every sprite, plus a
`assets/stage/` with `stage.json` and `backdrops/backdrops.json`.

### Statement chains are emitted twice

`decompileBlock` handles a hat by recursing into `block.next` inside its own
`case`, and then the shared tail at the end of the function recurses into
`block.next` again. Every statement after a hat is therefore emitted twice. A
four-statement script decompiles as `s, a, b, s, s, a, b, s`.

### Two opcode readers use the wrong key names

- **`looks_say` reads `block.fields.MESSAGE[0]`**, but Scratch stores the message
  as an **input**, not a field. The lookup yields `undefined`, so every
  `say` decompiles to `looks.say("")` — the text is lost, whether it was a
  literal or a variable.
- **`operator_add`/`subtract`/`multiply`/`divide` read `OPERAND1`/`OPERAND2`**,
  but those blocks use `NUM1`/`NUM2` in Scratch 3. (`operator_equals`,
  `greaterthan` and `lessthan` do use `OPERAND1`/`OPERAND2`, which is why the
  comparison cases work.) Both operands come back as `null`.

Together these two turn `looks.say(1 + 2)` into `looks.say("")`, and
`let a = 1 + 2 + 3;` into `a = null + null;`.

### Variables lose their kind

A `let x = 1;` and a later `x = 2;` both decompile to plain assignment, with a
single `let x = "";` at the top of the file. Declarations are only emitted at
file scope, so a variable used inside a procedure body is declared in the wrong
place, and a parameter's initial value is never set.

## Working on it

The package has no tests, and its dependencies (`@jvavscratch/types`,
`@jvavscratch/utils`) are used only for `deleteAllContents` and `copyAllSync` —
the decompiler does not read the `Block` type or the opcode enum, it works on
`any`. That is convenient but is also why the key-name mistakes above survived:
nothing type-checks `block.fields.MESSAGE`.

The quickest way to verify a change is the one the rest of the project uses —
build a project, decompile it, and read the generated `src/`:

```bash
node cli/dist/index.js build ./examples/pi-spigot
node cli/dist/index.js decompile ./examples/pi-spigot/target/pi-spigot.sb3 /tmp/roundtrip
cat /tmp/roundtrip/pi-spigot/src/Sprite1.js
```
