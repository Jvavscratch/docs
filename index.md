---
title: jvavscratch
layout: home

hero:
  name: jvavscratch
  text: Compile JavaScript into Scratch projects
  tagline: Write Scratch 3.0 projects in JavaScript — ahead-of-time compiled, no runtime required.
  image:
    src: /logo.svg
    alt: jvavscratch logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Language Reference
      link: /reference/language-reference
    - theme: alt
      text: API
      link: /api/

features:
  - title: Familiar syntax
    details: Write Scratch projects in the JavaScript you already know — variables, functions, classes, and control flow.
    icon: 💻
  - title: Ahead-of-time compilation
    details: Source is translated into Scratch blocks at build time. The generated .sb3 contains blocks, not a JavaScript interpreter.
    icon: ⚙️
  - title: Faithful output
    details: Every construct is mapped onto real Scratch opcodes and packed into a native project.json, so the result opens in Scratch or TurboWarp like any other project.
    icon: 🔄
  - title: Extensible compiler
    details: Packages extend the compiler itself — adding globals, block libraries, or overriding how a whole Babel node type is generated.
    icon: 🧩
  - title: Decompiler included
    details: Turn an existing .sb3 back into a jvavscratch project you can keep editing.
    icon: 🔍
  - title: Open source
    details: Licensed under MPL-2.0 and developed in the open.
    icon: 📚
---

# jvavscratch

jvavscratch is an **ahead-of-time compiler** that turns JavaScript source files into Scratch 3.0
projects (`.sb3`). It is not an interpreter: it walks the Babel AST and maps each node onto a
Scratch block opcode, emitting the `project.json` block dictionary directly. The compiled output
runs on the Scratch VM with no JavaScript runtime embedded in it.

That means you can use the tools you already have — modules, classes, `async`/`await`, the
debugger in your editor, and version control — to build Scratch projects.

## Why jvavscratch?

- **Real development tooling.** Write source in files, keep it in Git, review changes in diffs. A project is a directory, not a single opaque blob.
- **Familiar language.** If you know JavaScript, you already know most of the dialect. See the [language reference](/reference/language-reference) for the exact subset.
- **Native output.** Builds produce an ordinary `.sb3` that opens in Scratch or TurboWarp, costumes and sounds included.
- **Round trips.** `jvavscratch decompile` turns an existing `.sb3` back into source you can edit.

## Architecture

jvavscratch is split into small packages with a strict dependency direction
(`types ← core ← utils ← generator / decompiler ← cli`):

- **`types`** — the Scratch data model: the `BlockOpCode` enum, `Block`/`Sprite`/`Project`, and the helpers that build Scratch input tuples. No dependencies of its own.
- **`core`** — the compilation environment: the `BlockCluster` accumulator, the AST dispatch tables, and the syntax transformations that rewrite constructs Scratch cannot express.
- **`utils`** — packaging helpers (assembling the `.sb3`) and the API package authors use to extend the compiler.
- **`generator`** — every code generator, one per Babel node type, plus the opt-in alpha optimiser.
- **`decompiler`** — `.sb3` back to a jvavscratch project.
- **`cli`** — the `jvavscratch` command itself.
- **`registry`** — the package registry backend that `jvavscratch add` installs from.

See [Modules](/modules/) for the full breakdown, or [Extending jvavscratch](/extending) if you
want to add your own generator.

## Quick links

- [Installation](/guide/installation)
- [Basic usage](/guide/basic-usage)
- [Grammar](/grammar/)
- [Frequently asked questions](/faq/)
- [Module documentation](/modules/)

## License

jvavscratch is licensed under the Mozilla Public License 2.0. See the
[license text](/license) for details.
