---
title: Early Design Notes
---

# Early Design Notes

This section preserves the project's early internal design notes, moved here from the
`.trae/documents/` directory of the original repository.

::: warning Historical archive — not current documentation
These notes were written in early 2026 and record **the code analysis and plans of that time**.
They are kept for the record only. Their conclusions may since have been superseded by the
implementation, and they do **not** describe the current state of the project.

In particular, they describe `registry` as a *component registry* — a registry of components and
services inside the compiler. No such thing exists in the code. The only registry that really
exists is the **package-management backend** (Express + SQLite) that `jvavscratch add` talks to,
which is an unrelated thing that happens to share the name.

For anything current, use the [guide](/guide/getting-started), [grammar](/grammar/),
[API](/api/) and [module](/modules/) sections instead.
:::

## Notes

- [Early note · Bubble sort in jvavscratch](/notes/bubble-sort-walkthrough)
  — despite the file name, the contents are a *project analysis and fix plan*.
- [Early note · Project analysis and fix plan (2026-01-25)](/notes/early-plan-20260125)
  — substantially the same analysis, with slightly different fix steps.
- [Early note · Project analysis and fix plan (2026-01-27)](/notes/early-plan-20260127)
  — the last revision of the same analysis.

The three notes overlap heavily. All of them discuss removing a useless `workspaces` setting, a
name clash on the `Error` class in `err.ts`, the `@ts-ignore` in `transformSyntax.ts`, property
access in `tree-optimise/index.ts`, directory creation in `decompileFromSB3`, and assorted TODOs
and error-handling gaps.
