---
title: API Overview
---

# API Overview

jvavscratch is an **ahead-of-time (AOT) compiler**, not an interpreter. It reads the JavaScript
you write in `src/`, maps each construct onto a Scratch 3.0 opcode, and emits a `project.json`
that is zipped into `target/<name>.sb3`. There is no JavaScript engine in the output and no
runtime library to `require()`: by the time your program runs in Scratch, your source has already
been translated into blocks.

That shapes what "the API" means here. There are three distinct surfaces:

| Surface | What it is | Where it is documented |
|---|---|---|
| **Standard library** | The `library.function(...)` calls you write inside a project. This is the bulk of the API. | [Built-in Functions](/api/builtins), [Motion](/api/motion), [Looks](/api/looks), [Sound](/api/sound) |
| **CLI** | `jvavscratch build`, `run`, `decompile`, `new`, `lib`, `add`, … | [CLI module](/modules/cli) |
| **Package authoring API** | `createFunction`, `createValueFunction`, `createLibrary`, `createGlobal`, `createBlock`, `createImplementation` — used to extend the *compiler* itself | [Language reference](/reference/language-reference) ("Package specification") |

This section covers the standard library. Every entry lists the exact call signature, what each
argument does, which Scratch block it becomes, and a minimal example.

## Two call forms

A call such as `motion.move(10)` is dispatched by name, and the compiler keeps **two separate
tables**:

- the **block (statement) form**, used when the call is a statement of its own — `looks.say("hi");`
- the **value form**, used when the call appears inside an expression — `let x = motion.x();`

The same library name can appear in both tables. `motion.move(10)` is a statement, so it is looked
up in the block table and becomes a stack block; `motion.x()` sits inside an expression, so it is
looked up in the value table and becomes a reporter. A name that only exists in one table is not
callable in the other position, and the compiler says so:

```js
operation.join("Hello, ", "World!"); // ✗ "Unknown library, got: 'operation'"
let s = operation.join("Hello, ", "World!"); // ✓ operation is a value library
```

The built-in libraries are:

**Block form (10)** — `motion`, `looks`, `sound`, `control`, `sensing`, `pen`, `list`,
`variable`, `broadcast`, `method`

**Value form (9)** — `motion`, `looks`, `sound`, `sensing`, `list`, `method`, `math`,
`operation`, `util`

`control`, `pen`, `variable`, and `broadcast` are block-only (their blocks have no return value);
`math`, `operation` and `util` are value-only. Everything else has both forms, and the two forms
of a library are documented together — `motion.x()` in [Motion](/api/motion),
`list.getItem()` in [Built-in Functions](/api/builtins).

A library that is not built in is looked up in the packages installed in `lib/`. See
[Dependencies and packages](/reference/language-reference).

## Argument checking

Every library function declares a minimum argument count, and some declare required node types:

- **Too few arguments** is a hard error. The compiler prints a `error: Not enough arguments`
  diagnostic with a code frame and exits with status 1 — the build does not continue.
- **A missing or wrong-typed required argument** (used by `list.*`, `variable.*`, `method.*` and
  `math.operation`) is likewise a hard error, e.g.
  `Expected 'StringLiteral' for argument '1', got: 'NumericLiteral'`.
- **Extra arguments** are evaluated and then ignored, except where noted. This is not something to
  rely on.
- **An unknown library or function name** is a *warning*, not an error: the compiler prints
  `[Warn]: Unknown function of library motion, got: 'moveUp'` and drops the statement (or the
  value expression). A project can therefore build "successfully" while missing blocks you asked
  for — read the build output.

## Where list names, variables and broadcasts come from

Several functions take a **name as a string literal** rather than a value: `list.push("items", x)`,
`variable.show("score")`, `broadcast.fire("go")`. Those names are collected into
`assets/{variables,lists,broadcasts}.json` while the project compiles and become the project's
declared variables, lists and messages. A name you never mention anywhere else is still declared,
so `list.newList("items", [], false)` is self-sufficient; but a variable you only ever *read* must
still be introduced somewhere, or Scratch will not have it.

The single exception in style is `list.newList(name, contents, isPrivate)`, which needs a literal
name, an array literal, and a boolean literal — nothing else is accepted.

## Quick start

```js
// src/Sprite1.js
looks.say("Hello, World!");
```

That is the whole scaffold; `jvavscratch build` turns it into one green-flag script holding a
single `say` block. A slightly bigger program, using both call forms:

```js
let hits = 0;

//#whenkeypressed("space")
motion.move(10);
hits = hits + 1;
looks.say(operation.join("hits: ", hits));

if (sensing.touching("edge")) {
    motion.bounceOnEdge();
}
```

[Motion](/api/motion), [Looks](/api/looks) and [Sound](/api/sound) cover their libraries in
full; [Built-in Functions](/api/builtins) covers the rest, and [API Examples](/api/examples) has
complete, buildable programs. The [example index](/examples/) lists what is available to run today.

## Related reading

- [Language reference](/reference/language-reference) — the authoritative description of the
  dialect, including the expression rewrites (list indexing, `Math.*`, `**`, ternaries) that are
  described as library calls on these pages.
- [API Examples](/api/examples) — real programs, from a one-liner to a class-based one.
- [Example index](/examples/) — the runnable examples that ship in the repository.
