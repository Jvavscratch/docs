---
title: Project Analysis and Fix Plan (2026-01-27)
---

# Project Analysis and Fix Plan

::: warning Historical archive — not current documentation
This is an early design/fix note from the beginning of 2026. It records the analysis of, and plans
for, the codebase **as it stood then**; the conclusions may since have been superseded by the
implementation. Read it as history, not as a description of the project today.

In particular, notes like this one describe `registry` as a *component registry*. That component
does not exist in the code — the only real registry is the package-management backend
(Express + SQLite) used by `jvavscratch add`.
:::

## Project overview

Jvavscratch is a tool that converts JavaScript/TypeScript code into Scratch 3.0 (SB3) projects,
with a command-line interface for project management, building, running and decompiling.

## Problems found

### 1. Dependency-management problems

* **Broken workspace configuration**: `package.json` configured `workspaces`, but there was no
  actual workspace configuration, so the build scripts failed.
* **Import-path problems**: some cross-module import paths may have been wrong.
* **Missing dependency checks**: some imports were commented out, which may have left features
  missing.

### 2. Code defects

* **Class-name clash**: the `Error` class imported in `parseProgram.ts` clashed with JavaScript's
  built-in `Error`.
* **Type problem**: `transformSyntax.ts` used a `// @ts-ignore` comment, hiding a type-safety
  problem.
* **Property access**: `tree-optimise/index.ts` tried to access properties that may not exist.
* **Directory creation**: `decompileFromSB3` used a temporary directory without checking whether
  it existed.

### 3. Other issues

* **Unfinished TODOs**: the code contained several TODO comments, such as a missing file-type
  check.
* **Weak error handling**: some functions gave no detail when they failed.
* **Structural gaps**: some functions were only partially implemented — for example
  `parseFunctionCall` handled simple function calls only.

## Fix plan

### 1. Fix the dependency-management problems

* **Remove the useless workspace configuration** from `package.json`.
* **Fix the script commands**: drop the `--workspaces` argument from `package.json` scripts.
* **Check and fix the import paths** so that every cross-module import resolves.

### 2. Fix the code defects

* **Rename the clashing class**: rename the `Error` class in `err.ts` to `JvavscratchError`.
* **Fix the type problem**: resolve the type error in `transformSyntax.ts` and remove the
  `// @ts-ignore` comment.
* **Add property checks**: check that an object property exists before accessing it.
* **Fix directory creation**: make sure the temporary directory exists before using it.

### 3. Improve the code structure

* **Finish the TODOs**: implement the missing file-type check and the other TODO items.
* **Improve error handling**: add detailed error information to the critical functions.
* **Improve the implementations**: complete functions such as `parseFunctionCall`.

## Expected outcome

* The build failure is fixed.
* Type safety improves.
* Error handling is stronger.
* The code structure and maintainability improve.

## Fix steps

1. Edit `package.json`: remove the workspace configuration and fix the script commands.
2. Rename the `Error` class in `err.ts` to resolve the name clash.
3. Fix the type problem in `transformSyntax.ts`.
4. Improve error handling in `decompileFromSB3`.
5. Check and fix the remaining code problems.
6. Test the fixed functionality.
