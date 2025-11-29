---
title: jvavscratch
layout: home

hero:
  name: jvavscratch
  text: JavaScript到Scratch的转换工具
  tagline: 将JavaScript代码转换为Scratch项目，让编程学习更加高效
  image:
    src: /logo.svg
    alt: jvavscratch Logo
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 语法参考
      link: /grammar/
    - theme: alt
      text: API文档
      link: /api/

features:
  - title: 简单易用
    details: 使用熟悉的JavaScript语法编写Scratch项目，降低学习门槛
    icon: 💻
  - title: 功能丰富
    details: 支持变量、函数、类、控制流等JavaScript核心特性
    icon: 🚀
  - title: 无缝转换
    details: 自动将JavaScript代码转换为Scratch积木块，保留逻辑结构
    icon: 🔄
  - title: 灵活扩展
    details: 模块化设计，支持自定义扩展和插件开发
    icon: 🧩
  - title: 反编译支持
    details: 支持将Scratch项目反编译回JavaScript代码进行编辑
    icon: 🔍
  - title: 开源免费
    details: 基于MPL-2.0开源协议，社区驱动开发
    icon: 📚
---

# jvavscratch

jvavscratch 是一个强大的工具，允许开发者使用JavaScript语法编写代码，并将其转换为Scratch项目文件(.sb3)。通过jvavscratch，你可以利用JavaScript的强大功能来创建复杂的Scratch项目，同时保留Scratch的直观性和教育价值。

## 为什么选择jvavscratch？

- **提高开发效率**：使用JavaScript的高级特性快速开发复杂逻辑
- **降低学习曲线**：对于熟悉JavaScript的开发者，可以立即开始创建Scratch项目
- **保留Scratch特性**：生成的项目完全兼容Scratch平台，保留所有交互功能
- **团队协作**：支持版本控制和团队协作开发Scratch项目

## 项目架构

jvavscratch 由以下几个核心模块组成：

- **CLI**：命令行工具，提供项目创建、编译等功能
- **Core**：核心转换引擎，处理语法分析和代码转换
- **Generator**：负责生成Scratch项目文件(.sb3)
- **Decompiler**：将Scratch项目反编译为JavaScript代码
- **Types**：提供类型定义，支持TypeScript
- **Utils**：通用工具函数库
- **Registry**：组件和服务注册管理

## 快速链接

- [安装指南](/guide/installation)
- [基本使用](/guide/basic-usage)
- [语法参考](/grammar/)
- [常见问题](/faq/)
- [模块文档](/modules/)

## 许可证

本项目使用MPL-2.0许可证。详情请查看[许可证文档](/license)。