---
title: Writing a Plugin
---

# Writing a Plugin

Plugins (compiler-extension packages) let you add new blocks, library functions,
and global variables to jvavscratch without modifying the compiler itself.

## Package structure

A plugin is a directory with this layout:

```
my-plugin/
  src/
    index.ts          # entry point — registers everything
    utils/
      library.ts      # re-export shim (overwritten each build)
      internal.ts     # re-export shim (overwritten each build)
  package.json
  tsconfig.json
```

::: warning
The `utils/library.ts` and `utils/internal.ts` files are **overwritten** by the
compiler on every build. Never put custom code in them.
:::

## Entry point

Your `src/index.ts` must export a single object with this shape:

```ts
module.exports = {
  globals: { /* ... */ },
  libraries: {
    blockLibraries: { /* ... */ },
    valueLibraries: { /* ... */ }
  },
  statement_implements: { /* ... */ },
  type_implements: { /* ... */ }
}
```

All four keys are optional — include only the contribution points you need.

## Contributing globals

Globals add variables that are available to every sprite:

```ts
const globals = {
  myGlobalVar: 'default value'
}
```

## Contributing libraries

Libraries add callable functions (like `motion.move()` or `math.abs()`).

### Block libraries (statements)

```ts
const blockLibraries = {
  mylib: {
    myFunction: (args, buildData) => {
      // args is the array of Scratch input slots
      // return value is ignored for block calls
    }
  }
}
```

### Value libraries (expressions)

```ts
const valueLibraries = {
  mylib: {
    myFunction: (args, buildData) => {
      // return a ScratchInput (reporter block)
    }
  }
}
```

## Contributing statement implementations

Statement implementations override how a Babel AST node type is compiled:

```ts
const statement_implements = {
  MyCustomNode: {
    name: 'MyCustomNode',
    body: (blockCluster, node, buildData) => {
      // Generate blocks into blockCluster
      return { keysGenerated: [...] }
    }
  }
}
```

## Contributing type implementations

Type implementations override how a Babel AST node type is evaluated as
an expression:

```ts
const type_implements = {
  MyCustomExpr: {
    name: 'MyCustomExpr',
    body: (blockCluster, node, parentId, buildData) => {
      return { isStaticValue: false, blockId: '...', block: [...] }
    }
  }
}
```

## Installing a plugin

Plugins are installed with `jvavscratch add <name>`, which downloads the
package from the Jvavscratch registry into `lib/<name>/`. The compiler
automatically loads all packages in `lib/` at build time.

## Precedence

When a third-party package registers a `statement_implements` or
`type_implements` entry for a node type, it takes priority over the
built-in generator for that node type. This lets you override the
compiler's default behaviour.

For libraries, the built-in table is checked **first** — a package
library with the same name as a built-in will not shadow it.
