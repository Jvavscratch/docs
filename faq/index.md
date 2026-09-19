---
title: Frequently Asked Questions
---

# Frequently Asked Questions

Answers to common questions about jvavscratch. If your question is not covered here,
please open an issue on [GitHub](https://github.com/Jvavscratch/cli/issues).

## Basics

### What is jvavscratch?

jvavscratch is a compiler that takes JavaScript source files and turns them into
Scratch 3.0 project files (`.sb3`). It is **ahead-of-time compilation**, not a
live interpreter — the output contains no JavaScript runtime.

### What JavaScript features are supported?

jvavscratch supports a subset of JavaScript:

- Variable declarations (`let`, `_g_` prefix for global scope)
- Control flow (`if` / `else`, `while`, `for`, `for-in`, `switch`)
- Functions (regular and `async`, with `turbo_` prefix for no-screen-refresh)
- Classes (`class`, `extends`, `super`)
- Basic operators, string concatenation, ternary expressions
- Event directives (comment-based: `//#whenflagclicked`, etc.)

Features like closures, Promises, `async`/`await`, and modules are **not**
supported because Scratch has no equivalent.

### How is this different from writing Scratch blocks directly?

jvavscratch lets you write JavaScript and have it compiled to a `.sb3` file
without opening the Scratch editor. This is useful for:

- Text-based workflows (version control, code review)
- Programmatic project generation
- Developers who prefer JavaScript syntax

## Installation and setup

### What are the prerequisites?

- Node.js v16 or later
- npm (or pnpm/yarn)

### How do I install the CLI?

```bash
npm install -g github:Jvavscratch/cli
```

Then verify:

```bash
jvavscratch --version
```

### Do I need to install packages for each project?

Yes. Every project needs at least the default packages in `lib/`. Running
`jvavscratch new` or `jvavscratch init` scaffolds a project with the correct
`lib/` structure. Packages are downloaded from the Jvavscratch registry
(the `jvavscratch add` command), **not** from npm.

## Building projects

### How do I compile a project?

```bash
cd my-project
jvavscratch build
```

The output `.sb3` file is written to `target/<name>.sb3`.

### What does the `-o` flag do?

`jvavscratch build -o` enables the **alpha optimiser**, which post-processes
the block dictionary to try to reduce redundant blocks. It is experimental and
may produce incorrect output — always test the generated project.

### How do I decompile an existing .sb3?

```bash
jvavscratch decompile my-project.sb3
```

This creates a new project directory with the decompiled source.

## Common errors

### "Cannot find module" during build

This usually means a required package is missing from `lib/`. Re-run the
dependency installation or check that `lib/` is not empty.

### Generated .sb3 fails to open in Scratch

The most common cause is a syntax error in your JavaScript that jvavscratch
did not catch at build time. Check the `[Warn]:` and `[Fatal]:` lines in
the build output. If the file is valid but Scratch refuses it, open an issue.

### Variables and lists must have different names

If a variable and a list share the same name, the Scratch runtime cannot
distinguish them and the build will fail. Rename one of them.

### Blocks appear in the wrong order

Block order follows the **execution order** of your source code. If you see
blocks out of order, check that your generator returns keys in the correct
sequence (this is a contract the generators must honour).

## Performance

### Are generated projects as fast as hand-written Scratch?

Generally yes, for straightforward code. Complex JavaScript logic may produce
more blocks than a hand-optimised Scratch project. For performance-critical
projects, keep the control flow simple and avoid deep nesting.

### How long does a build take?

For small projects, under a second. Large projects with many sprites and
files may take several seconds. The build is I/O-bound (reading source files,
writing the zip), so fast disks help.

## Extending jvavscratch

### Can I add my own blocks?

Yes, through **compiler-extension packages**. A package can register new
statement implementations, value implementations, and library functions.
See [Extending jvavscratch](/extending) for details.

### Can I contribute?

Absolutely. The project is open source under MPL-2.0. See the
[Contributing Guide](/contributing) for how to get started.
