---
title: jvavscratch
layout: home

hero:
  name: jvavscratch
  text: 把 JavaScript 编译成 Scratch 工程
  tagline: 用 JavaScript 写 Scratch 3.0 工程 —— 提前编译,产物不含运行时。
  image:
    src: /logo.svg
    alt: jvavscratch logo
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 语言参考
      link: /zh/reference/language-reference
    - theme: alt
      text: API
      link: /zh/api/

features:
  - title: 熟悉的语法
    details: 用你已经会的 JavaScript 写 Scratch 工程 —— 变量、函数、类、控制流都能用。
    icon: 💻
  - title: 提前编译
    details: 源码在构建期就被翻译成 Scratch 积木。产出的 .sb3 里是积木,不是一个 JavaScript 解释器。
    icon: ⚙️
  - title: 原生产物
    details: 每个构造都映射到真实的 Scratch 积木 opcode,并打包成原生 project.json,用 Scratch 或 TurboWarp 直接打开即可。
    icon: 🔄
  - title: 可扩展的编译器
    details: 扩展包扩展的是**编译器本身** —— 可以添加全局变量、积木库,甚至整体改写某个 Babel 节点类型的生成方式。
    icon: 🧩
  - title: 自带反编译器
    details: 把已有的 .sb3 反编译回 jvavscratch 工程,继续编辑。
    icon: 🔍
  - title: 开源
    details: 采用 MPL-2.0 许可证,开放开发。
    icon: 📚
---

# jvavscratch

jvavscratch 是一个**提前(AOT)编译器**,把 JavaScript 源码文件转换成 Scratch 3.0 工程(`.sb3`)。
它**不是解释器**:它遍历 Babel AST,把每个节点映射成一个 Scratch 积木 opcode,直接产出
`project.json` 的积木字典。编译产物在 Scratch 虚拟机上运行,**里面没有嵌入任何 JavaScript 运行时**。

也就是说,你可以用上已经顺手的工具 —— 模块、类、`async`/`await`、编辑器里的调试器、以及版本控制
—— 来做 Scratch 工程。

## 为什么用 jvavscratch?

- **真正的开发工具链。** 源码是文件,可以放进 Git,改动能在 diff 里逐行审阅。一个工程是一个目录,而不是一坨不可读的数据。
- **熟悉的语言。** 会 JavaScript 就基本会这门方言。精确支持的范围见[语言参考](/zh/reference/language-reference)。
- **原生产物。** 构建产出一个普通的 `.sb3`,含服装与声音,用 Scratch 或 TurboWarp 直接打开。
- **可以来回转换。** `jvavscratch decompile` 把已有的 `.sb3` 变回可继续编辑的源码。

## 项目架构

jvavscratch 拆成若干小包,依赖方向严格单向
(`types ← core ← utils ← generator / decompiler ← cli`):

- **`types`** —— Scratch 数据模型:`BlockOpCode` 枚举、`Block`/`Sprite`/`Project`,以及构造 Scratch 输入元组的辅助函数。自身零依赖。
- **`core`** —— 编译环境:`BlockCluster` 累加器、AST 派发表,以及把 Scratch 表达不了的构造改写掉的语法转换。
- **`utils`** —— 打包辅助(组装 `.sb3`),以及包作者用来扩展编译器的 API。
- **`generator`** —— 全部代码生成器(每个 Babel 节点类型一个),外加可选的 alpha 优化器。
- **`decompiler`** —— `.sb3` 反编译回 jvavscratch 工程。
- **`cli`** —— `jvavscratch` 命令本身。
- **`registry`** —— `jvavscratch add` 安装包时所用的包管理后端。

完整拆分见[模块文档](/zh/modules/);想自己加生成器请看[扩展 jvavscratch](/zh/extending)。

## 快速链接

- [安装指南](/zh/guide/installation)
- [基本使用](/zh/guide/basic-usage)
- [语法参考](/zh/grammar/)
- [常见问题](/zh/faq/)
- [模块文档](/zh/modules/)

## 许可证

本项目使用 Mozilla Public License 2.0。详情见[许可证文档](/zh/license)。
