---
title: 编写插件
---

# 编写插件

插件（编译器扩展包）让你在不修改编译器本身的情况下添加新的积木、库函数和全局变量。

## 包结构

插件是一个目录，包含以下结构：

```
my-plugin/
  src/
    index.ts          # 入口点——注册所有内容
    utils/
      library.ts      # 重导出垫片（每次构建时被覆盖）
      internal.ts     # 重导出垫片（每次构建时被覆盖）
  package.json
  tsconfig.json
```

::: warning
`utils/library.ts` 和 `utils/internal.ts` 文件在每次构建时都会被**覆盖**。
永远不要在里面放自定义代码。
:::

## 入口点

你的 `src/index.ts` 必须导出一个具有以下形状的对象：

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

四个键都是可选的——只包含你需要的贡献点。

## 安装插件

使用 `jvavscratch add <name>` 从 Jvavscratch 注册表下载包到 `lib/<name>/`。
编译器在构建时自动加载 `lib/` 中的所有包。

## 优先级

第三方包注册的 `statement_implements` 或 `type_implements` 条目会**优先于**内置生成器。
对于库，内置表**先被检查**——同名的包库不会覆盖内置库。

详细的 API 参考和示例请参阅[扩展 jvavscratch](/zh/extending)。
