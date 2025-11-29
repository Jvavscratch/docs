# 基本使用

本指南将介绍jvavscratch的基本使用方法，帮助您开始编写和转换JavaScript代码为Scratch项目。

## 项目结构

一个典型的jvavscratch项目具有以下结构：

```
my-project/
├── src/
│   ├── main.js       # 主程序入口
│   └── utils.js      # 工具函数（可选）
├── assets/           # 资源文件（可选）
│   ├── costumes/     # 角色造型
│   ├── backdrops/    # 背景
│   └── sounds/       # 声音文件
├── jvavscratch.json  # 项目配置文件
└── package.json      # NPM配置文件
```

## 配置文件

`jvavscratch.json`是项目的配置文件，用于指定项目的基本信息和编译选项：

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "My jvavscratch project",
  "main": "src/main.js",
  "output": "dist/project.sb3",
  "options": {
    "target": "scratch3",
    "optimize": true
  }
}
```

## 基本语法

### 事件块

每个jvavscratch程序都需要一个事件块来指定程序的入口点。事件块必须放在文件的第一行：

```js
//#whenflagclicked()
```

其他可用的事件块：

```js
//#whenthisspriteclicked()  // 当角色被点击时
//#start_as_clone()          // 当克隆体启动时
//#whenkeypressed("space")   // 当按下空格键时
//#whenbackdropswitchesto("Backdrop1")  // 当背景切换到特定背景时
//#whenbroadcastreceived("message")  // 当接收到广播时
```

### 变量

在jvavscratch中，使用`let`声明变量：

```js
let x = 10;
let name = "Scratch";
```

变量默认是全局的。您可以通过前缀来修改变量的作用域：

```js
let _l_count = 0;  // 局部变量
let _g_score = 100;  // 全局变量
```

### 函数

您可以定义自己的函数：

```js
function greet(name) {
  looks.say(operation.join("Hello, ", name, "!"));
}

greet("World");
```

### Scratch块的使用

jvavscratch提供了对应于Scratch块的JavaScript函数：

```js
// 运动
motion.move(10);
motion.turnRight(90);

// 外观
looks.say("Hello");
looks.changeSizeBy(10);

// 声音
sound.playSound("meow");

// 控制
control.wait(1);

// 侦测
sensing.ask("What's your name?");
```

## 编译项目

要编译您的jvavscratch项目，请在项目目录中运行：

```bash
jvavscratch build
```

这将生成一个Scratch项目文件（.sb3），您可以在Scratch编辑器中导入并运行它。

## 运行开发服务器

如果您希望在开发过程中实时预览更改，可以使用开发服务器：

```bash
jvavscratch dev
```

这将启动一个开发服务器，并在您修改代码时自动重新编译项目。

## 常见问题

### 为什么我的程序不能编译？

检查以下几点：

1. 是否在文件开头添加了事件块（如`//#whenflagclicked()`）
2. 是否使用了jvavscratch不支持的JavaScript特性
3. 是否正确导入了所需的模块

### 如何导入外部资源？

您可以将图像和声音文件放在项目的`assets`目录中，然后在配置文件中指定它们：

```json
{
  "assets": {
    "costumes": ["assets/costumes"],
    "sounds": ["assets/sounds"],
    "backdrops": ["assets/backdrops"]
  }
}
```