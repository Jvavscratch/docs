---
title: 扩展 jvavscratch
description: 编译器扩展包的工作方式——它们扩展什么、四个贡献点以及优先级如何决定。
---

# 扩展 jvavscratch

jvavscratch 是一门固定的语言。它理解的 Babel 节点集合、可用的 `motion.something()` 库、
它能生成的运算符——全部由编译器源码决定，不由被编译的项目决定。

**编译器扩展包**是在不 fork 编译器的情况下改变这一切的方式。它是唯一受支持的扩展机制，
而且它与你可能熟悉的其他扩展概念很不一样：它不是运行时插件、不是打包器插件、也不是 Scratch 扩展。

## 包扩展的是编译器，不是程序

这是最重要的一点。

构建项目时，CLI 会加载 `lib/` 下的每个目录，并对每个目录调用 Node 的
`require()` 来加载 `lib/<name>/src/index.ts`。返回的模块不会被发送到任何地方。
它的**导出会合并到编译器的配置中**，该配置随后改变*当前构建*的行为。

三个重要区别：

- **没有运行时组件**。编译后的 `.sb3` 只包含 Scratch 积木；你的包的任何内容都不会出现在其中。
- 你的包以**编译器的权限**运行——它是在构建进程中执行的普通 Node 代码。
- 你的贡献仅适用于**一次构建**。构建之间没有持久化状态。

## 四个贡献点

包的 `src/index.ts` 导出一个 CommonJS 对象。所有键都是可选的：

```js
module.exports = {
    libraries: {
        blockLibraries: [],   // 语句位置的库：demo.doThing(...)
        valueLibraries: [],   // 值位置的库：demo.getValue(...)
    },
    globals: [],              // 裸标识符：myConstant
    statement_implements: [], // 覆盖作为语句运行的 Babel 节点类型
    type_implements: [],      // 覆盖产生值的 Babel 节点类型
};
```

::: warning 四个集合必须是数组
`parseProgram` 和 `evaluate` 通过索引遍历它们。对象没有 `.length`，所以循环体永远不会执行。
**非数组的 `statement_implements` 或 `type_implements` 会被静默忽略**——没有错误，没有警告。
:::

### 1. `blockLibraries` 和 `valueLibraries`

库是命名的函数组，在编译器遇到成员调用时查找：

```js
demo.log("hello");         // 语句位置 -> blockLibraries
let x = demo.double(21);   // 值位置   -> valueLibraries
```

同名库可以同时出现在两个列表中，但它们是**独立的命名空间**。每个条目是
`{ name, functions }`，其中 `functions` 是 `{ fnName: implementation }` 的普通对象。

### 2. `globals`

全局变量在每个精灵中都可用：

```js
module.exports = { globals: { myConst: 42 } }
```

### 3. `statement_implements`

覆盖特定 Babel 节点类型的编译方式：

```js
module.exports = {
    statement_implements: [{
        name: 'MyNode',
        body: (blockCluster, node, buildData) => {
            return { keysGenerated: [...] }
        }
    }]
}
```

### 4. `type_implements`

覆盖特定 Babel 节点类型作为表达式时的求值方式：

```js
module.exports = {
    type_implements: [{
        name: 'MyExpr',
        body: (blockCluster, node, parentId, buildData) => {
            return { isStaticValue: false, blockId: '...', block: [...] }
        }
    }]
}
```

## 优先级

第三方包的 `statement_implements` 或 `type_implements` 条目**优先于**内置生成器。
对于库，内置表**先被检查**——同名的包库不会覆盖内置库。

## 包的安装

使用 `jvavscratch add <name>` 从 Jvavscratch 注册表下载包到 `lib/<name>/`。
编译器在构建时自动加载 `lib/` 中的所有包。详见 [编写插件](/plugins)。
