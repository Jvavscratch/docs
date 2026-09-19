---
title: Getting Started
---

# Getting Started

This page takes you from nothing to a `.sb3` you can open in TurboWarp. It assumes jvavscratch is already installed — see [Installation](/guide/installation) if it is not.

## What jvavscratch actually does

jvavscratch is an **ahead-of-time (AOT) compiler**. It reads JavaScript source files, walks their syntax tree, and emits Scratch 3.0 blocks — the `project.json` block dictionary — which is then zipped into an `.sb3`.

The important consequence: **there is no JavaScript runtime in the output.** Nothing in the built project interprets your source. Your loops, functions and variables were translated into Scratch blocks at build time. That is why the dialect is a subset of JavaScript rather than all of it: a construct the compiler cannot express as blocks has no fallback path to run under.

## Create a project

```bash
jvavscratch new my-project
cd my-project
```

`new` takes two optional positional arguments: the project name (default `my-project`) and the parent directory to create it in (default `./`). To scaffold into the current directory instead, using that directory's name:

```bash
mkdir my-project && cd my-project
jvavscratch init
```

You get this:

```
my-project/
  jvavscratch.toml    project manifest: name, version, compiler options, dependencies
  project.d.json      { "sprites": ["Sprite1"] }
  src/
    Sprite1.js        the script for sprite "Sprite1"
  lib/                installed compiler-extension packages (may be empty, must exist)
  assets/
    Sprite1/          costume/sound data for the sprite
    stage/            the stage's backdrop and global variable declarations
  target/             build output
```

Both `new` and `init` refuse to run when `project.d.json` already exists, so you cannot scaffold over an existing project by accident.

## Write your first program

Open `src/Sprite1.js`. It already contains one line:

```js
looks.say("Hello, World!");
```

Replace it with something that moves:

```js
//#whenflagclicked()

let greetings = 3;

looks.say("Ready?");

for (let i = 0; i < greetings; i++) {
    motion.move(50);
    motion.turnRight(120);
    control.wait(0.4);
}

looks.say("That was a triangle!");
```

Two things are worth noticing before you build.

The first line is a **hat directive**. Every script in Scratch begins with a hat block, and this comment selects which one. Leaving it out is legal — the file then starts with "when green flag clicked", which is what the snippet above asks for anyway. Directives are covered in full on the [Event Blocks](/grammar/events) page.

The rest is the JS dialect. `let` declares a variable, `for` becomes a repeat-until loop, `motion.move(...)` and `looks.say(...)` are built-in library calls that map one-to-one onto Scratch blocks. If you write something the dialect does not support, the build stops with a source-located error rather than silently producing a broken project.

## Build it

```bash
jvavscratch build
```

```
Building my-project
Finished my-project [unoptimized] in 0.19s
```

You now have two artefacts:

```
my-project/target/my-project/project.json    the Scratch project, unpacked
my-project/target/my-project.sb3             the same project, zipped
```

Pass a path to build a project somewhere else without `cd`-ing into it:

```bash
jvavscratch build ../other-project
```

The optimizer is opt-in and **alpha** — it rewrites the finished block dictionary and warns when you enable it:

```bash
jvavscratch build -o
```

Do not enable it until you have a working build to compare against.

## Open it in TurboWarp

Drag `target/my-project.sb3` onto the [TurboWarp editor](https://turbowarp.org/editor), or:

```bash
jvavscratch run
```

`run` builds and then launches the TurboWarp desktop app. That integration is pre-configured for Windows only; on other platforms the command prints instructions and stops:

```
The `run` command automatically opens TurboWarp, which is only pre-configured for Windows.
Use `jvavscratch build` to compile the project, then open the .sb3 manually.
Or use --bypass if you have TurboWarp installed elsewhere.
```

`--bypass` skips the platform check and tries to launch TurboWarp anyway. Use TurboWarp rather than the vanilla Scratch editor: the compiler targets TurboWarp, and if you turn on `custom_block_return` the generated blocks rely on TurboWarp's procedure-return support.

Click the green flag. The sprite should draw a triangle, pausing between sides.

## Where to go next

- [Basic Usage](/guide/basic-usage) — what every file in the project does, and the options in `jvavscratch.toml`.
- [Tutorials](/guide/tutorials) — a three-part walkthrough that ends with events, custom blocks and return values.
- [Grammar](/grammar/) — the language reference for the dialect, by topic.
- [Language Reference](/reference/language-reference) — the flat catalogue of every built-in block function.
