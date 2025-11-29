# jvavscratch 模块文档

jvavscratch采用模块化设计，将不同功能组织成独立的模块。本章节将详细介绍每个模块的功能、结构和使用方法，帮助开发者更好地理解和使用jvavscratch。

## 模块概览

jvavscratch由以下几个核心模块组成：

| 模块名称 | 主要职责 | 文件位置 |
|---------|---------|--------|
| CLI | 命令行接口，提供项目创建、编译等功能 | `jvavscratch/cli` |
| Core | 核心转换引擎，处理语法分析和代码转换 | `jvavscratch/core` |
| Generator | 负责生成Scratch项目文件(.sb3) | `jvavscratch/generator` |
| Decompiler | 将Scratch项目反编译为JavaScript代码 | `jvavscratch/decompiler` |
| Types | 提供类型定义，支持TypeScript | `jvavscratch/types` |
| Utils | 通用工具函数库 | `jvavscratch/utils` |
| Registry | 组件和服务注册管理 | `jvavscratch/registry` |

## 模块依赖关系

各模块之间存在一定的依赖关系：

- **CLI** 模块依赖于 **Core**、**Generator** 和 **Decompiler** 模块，作为用户交互的入口
- **Core** 模块是核心，被其他多个模块依赖
- **Generator** 和 **Decompiler** 模块依赖于 **Core** 和 **Utils** 模块
- **Types** 模块提供类型定义，被其他所有模块引用
- **Utils** 模块提供通用工具函数，被其他模块广泛使用
- **Registry** 模块管理组件注册，被 **Core** 和其他模块使用

## 模块使用指南

点击以下链接查看每个模块的详细文档：

- [CLI模块](/modules/cli)：命令行工具的使用方法和参数说明
- [Core模块](/modules/core)：核心转换引擎的架构和API
- [Generator模块](/modules/generator)：Scratch项目生成器的工作原理
- [Decompiler模块](/modules/decompiler)：反编译器的使用和限制
- [Types模块](/modules/types)：类型系统和类型定义
- [Utils模块](/modules/utils)：工具函数库的使用方法
- [Registry模块](/modules/registry)：组件注册和管理

## 扩展模块

如果您想扩展jvavscratch的功能，可以：

1. 为现有模块添加新功能
2. 创建新的插件模块
3. 修改核心模块以支持新特性

详细的扩展指南请参考[扩展jvavscratch](/extending)文档。