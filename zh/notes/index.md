---
title: 早期设计笔记
---

# 早期设计笔记

这里收录的是项目早期的内部设计笔记,由原仓库 `.trae/documents/` 目录迁入。

::: warning 历史档案 · 不代表当前状态
这些笔记写于 2026 年初,记录的是**当时的**代码分析与计划。结论很可能已被后续实现取代,
请只把它们当作历史材料,以当前代码与正式文档([指南](/zh/guide/getting-started) /
[语法](/zh/grammar/) / [API](/zh/api/) / [模块](/zh/modules/))为准。

另外,这类笔记把 `registry` 说成"组件和服务注册管理"的**组件注册表**——那个组件在代码里
**并不存在**。真正存在的 `registry` 是 `jvavscratch add` 对接的**包管理后端**
(Express + SQLite,见 [Registry 模块](/zh/modules/registry)),只是名字相同而已。
:::

## 笔记列表

- [早期笔记 · 用 Jvavscratch 实现冒泡排序](/zh/notes/bubble-sort-walkthrough)
  —— 文件名虽为"冒泡排序",实际内容是一份《项目分析与修复计划》。
- [早期笔记 · 项目分析与修复计划(20260125)](/zh/notes/early-plan-20260125)
  —— 与上一篇基本相同的分析,修复步骤略有差异。
- [早期笔记 · 项目分析与修复计划(20260127)](/zh/notes/early-plan-20260127)
  —— 同一份分析的最后一次修订版。

三篇笔记的内容高度重合,讨论的都是:移除无效的 `workspaces` 配置、`err.ts` 中 `Error` 类的命名冲突、`transformSyntax.ts` 的 `@ts-ignore` 类型问题、`tree-optimise/index.ts` 的属性访问、`decompileFromSB3` 的目录创建,以及若干 TODO 与错误处理的完善。
