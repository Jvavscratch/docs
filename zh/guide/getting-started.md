# 快速开始

本指南将帮助您快速上手jvavscratch，了解如何安装和使用这个工具。

## 前提条件

在开始之前，请确保您的环境满足以下要求：

- Node.js v14 或更高版本
- npm 或 yarn
- Git

## 安装

您可以通过npm全局安装jvavscratch CLI：

```bash
npm install -g jvavscratch-cli
```

或者，如果您想直接从源码安装：

```bash
git clone https://github.com/jvavscratch/jvavscratch.git
cd jvavscratch
npm install
npm run build
npm link
```

## 创建您的第一个项目

使用jvavscratch CLI创建一个新的项目：

```bash
jvavscratch init my-project
cd my-project
```

## 编写您的第一个程序

在项目目录中，创建一个名为`main.js`的文件，并添加以下代码：

```js
//#whenflagclicked()

function main() {
  // 移动角色
  motion.move(10);
  // 显示消息
  looks.say("Hello, Scratch!");
  // 等待一秒
  control.wait(1);
  // 旋转角色
  motion.turnRight(90);
}

main();
```

## 编译项目

运行以下命令将JavaScript代码编译为Scratch项目：

```bash
jvavscratch build
```

编译成功后，您将在`dist`目录中找到生成的`project.sb3`文件，您可以将其导入到Scratch编辑器中运行。

## 下一步

- 查看[语法文档](/grammar/)了解支持的JavaScript特性
- 探索[API文档](/api/)了解可用的Scratch块
- 查看[模块文档](/modules/)了解jvavscratch的架构