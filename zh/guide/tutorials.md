---
title: 教程
---

# 教程

一个动手实践的教程。完成后你将构建一个包含移动、循环、变量、自定义函数、键盘事件、广播和返回值函数的小项目——并且你会查看每个功能生成的 Scratch 积木。

这里的所有内容都是完整的文件，可以直接粘贴并构建。三个部分是递进的：第 2 部分编辑第 1 部分的文件，第 3 部分将其变成多文件的 sprite。

前置条件：已安装 jvavscratch（[安装](/zh/guide/installation)），并阅读了[快速开始](/zh/guide/getting-started)页面。

## 第 1 部分——绘制正方形的脚本

创建项目：

```bash
jvavscratch new walking-cat
cd walking-cat
```

脚手架已经创建了 `src/Sprite1.js`，其中包含 `looks.say("Hello, World!");`。打开它并替换整个文件内容为：

```js
//#whenflagclicked()

motion.gotoXY(0, 0);
looks.sayForSeconds("Let's draw a square!", 1);

for (let i = 0; i < 4; i++) {
    motion.move(100);
    control.wait(0.3);
    motion.turnRight(90);
}

looks.say("Done!");
```

构建它：

```bash
jvavscratch build
```

然后在 TurboWarp 中打开 `target/walking-cat.sb3`，按下绿旗运行。

### 每行代码生成了什么

`//#whenflagclicked()` 是一个**帽子指令**：它选择此文件脚本挂载的帽子积木。对于 JavaScript 来说它只是一个注释，运行时零开销，且必须是文件中的第一个注释。完整列表请参见[事件积木](/zh/grammar/events)页面。

`motion.gotoXY(0, 0)` 编译为 `motion_gotoxy`，两个输入都被填充。每个内置库函数都是一对一映射到 Scratch 积木；`motion`、`looks`、`sound`、`control`、`sensing`、`list`、`variable`、`broadcast`、`pen` 和 `method` 是现有的库。

`for` 循环是有趣的部分。Scratch 没有 `for` 积木，所以编译器生成一个 **repeat-until** 循环，条件是你条件的取反，并将 `i++` 移到循环体顶部：

```
repeat until (not (i < 4))
    i = i + 1
    … body …
```

这就是为什么 `for` 需要明确的初始化、测试和更新形式——参见[控制流](/zh/grammar/control-flow#for-语句)页面。

`control.wait(0.3)` 是 `control_wait`。没有它四条边会在单帧内绘制完成，你将看不到任何移动；Scratch 只在让出执行权时才重绘。

### 试试看

- 将 `motion.turnRight(90)` 改为 `motion.turnRight(120)` 并重新运行——sprite 会画出一个三角形。程序结构没有变化。
- 在循环前添加 `looks.switchCostumeTo("Costume1")`（如果 sprite 有多个造型）；如果造型名称不存在，该调用会静默跳过，不会产生警告。

## 第 2 部分——变量和自定义函数

现在让 sprite 计分并"无屏幕刷新"地绘制正方形。

替换 `src/Sprite1.js` 为：

```js
//#whenflagclicked()

let score = 0;
let stepSize = 25;

function turbo_square(side) {
    for (let i = 0; i < 4; i++) {
        motion.move(side);
        motion.turnRight(90);
    }
}

function addScore(points) {
    score = score + points;
    looks.say(operation.join("Score: ", score));
}

motion.gotoXY(0, 0);
turbo_square(80);
addScore(10);
```

构建并运行。sprite 会立即画出一个没有停顿的正方形，然后显示 `Score: 10`。

### 变量

`let score = 0;` 创建一个名为 `score` 的 Scratch 变量，因为没有前缀所以它是**全局变量**。在项目中其他地方读取 `score` 有效，其积木字段就是变量名。

声明变量本身不会将其放入 Scratch 面板。全局变量从舞台的资源数据中注册，所以需要在 `assets/stage/stage.json` 中添加名称：

```json
{
  "volume": 100,
  "currentCostume": 0,
  "globalVariables": ["score"],
  "globalLists": {}
}
```

对每个需要成为真实项目变量的全局变量都要这样做。否则积木仍然可以编译和运行，但变量不会在编辑器的变量面板中显示。详见[声明全局变量和列表](/zh/guide/basic-usage#声明全局变量和列表)。

如果变量应属于某个 sprite 而不是整个项目，使用 `_l_` 前缀——`let _l_speed = 5;` 将 `speed` 声明为 sprite 私有变量。没有块作用域：循环或函数体内的 `let` 不会限制在其内部。详见[变量和赋值](/zh/grammar/variables)。

### 自定义函数

`function addScore(points) { … }` 编译为 `procedures_definition`（"定义"帽子积木）加上 `addScore(10)` 出现处的调用积木。参数成为过程参数，函数体中的 `points` 标识符是参数报告器。

有两个规则很重要，违反时都会导致令人困惑的失败：

1. **函数必须在调用它的代码编译之前定义。** 没有变量提升。将 `addScore` 移到 `addScore(10)` 下方会导致构建失败并报错 `Cannot read properties of undefined (reading 'async')`——这是一个内部错误泄露，而非友好提示。跨文件同理：文件按顺序编译，所以共享的辅助函数必须放在调用者之前的文件中。
2. **参数数量必须完全匹配。** 传入过多或过少参数会导致调用积木的签名与定义不匹配；Scratch 会静默拒绝执行该过程。不会有任何警告。

### Turbo 函数

`function turbo_square(side)`——`turbo_` 前缀表示生成的自定义积木启用了**无屏幕刷新运行**。前缀会从积木名称中去除：积木名称是 `square`，在源码中调用为 `turbo_square(80)`。将它用于几何运算、列表扫描等需要在一帧内完成的工作。

### 组合表达式

`operation.join("Score: ", score)` 是 `operator_join` 积木。注意库函数必须被**求值**——单独一行的 `operation.join(...)` 不会编译出有用的积木，因为产生值的积木不能作为独立语句。将其放入 `looks.say(...)`、赋值或条件中：

```js
let label = operation.join("Score: ", score);   // 正确
operation.join("Score: ", score);               // 警告：无法获取函数的值
```

## 第 3 部分——事件和多脚本

Scratch 程序是事件驱动的：每个脚本从一个帽子积木开始。在 jvavscratch 中，一个脚本是一个文件，所以一个有三个行为的 sprite 是一个包含三个文件的文件夹。

删除 `src/Sprite1.js` 并创建文件夹结构：

```
src/
  Sprite1/
    a_setup.js
    keys.js
    receive.js
```

::: warning 注意不要同时存在
如果 `src/Sprite1.js` 和 `src/Sprite1/` 同时存在，独立文件会优先生效，文件夹会被静默忽略。切换到文件夹时请删除文件——如果编辑的脚本似乎没有效果，请先检查是否有残留文件。
:::

`src/Sprite1/a_setup.js`——绿旗脚本和共享辅助函数：

```js
//#whenflagclicked()

let score = 0;

function turbo_bounce(times) {
    for (let i = 0; i < times; i++) {
        motion.move(20);
        motion.bounceOnEdge();
    }
}

looks.say("Press space!");
```

`src/Sprite1/keys.js`——键盘帽子积木，调用辅助函数并发送广播：

```js
//#whenkeypressed("space")

score = score + 1;
turbo_bounce(3);
broadcast.fire("scored");
```

`src/Sprite1/receive.js`——监听该广播的第二个脚本：

```js
//#whenbroadcastreceived("scored")

looks.sayForSeconds(operation.join("Score is now ", score), 1);
```

构建并运行，按几次空格。每次按下会让 sprite 跳跃并更新分数，两个脚本彼此独立——它们仅通过广播通信。

### 为什么 `a_setup.js` 这样命名

`keys.js` 调用了 `turbo_bounce`，该函数定义在 `a_setup.js` 中。文件按构建时看到的顺序编译，实际上就是名称顺序，所以 `a_setup.js` 在 `keys.js` 之前编译，定义在调用时已经可用。将其重命名为 `z_setup.js` 会导致构建失败。

如果不想依赖这个规则，将辅助函数放在调用者所在的同一个文件中。规则仅关于*编译顺序*，而非作用域：自定义函数一旦编译就是 sprite 全局的。

### 指令编译结果

`//#whenkeypressed("space")` 编译为 `event_whenkeypressed`，其 key 字段被设置。Scratch 识别的 key 字符串有 `space`、`up arrow`、`down arrow`、`left arrow`、`any` 以及单个字符 `a`–`z` 和 `0`–`9`；其他值会回退到 `space`。`//#whenbroadcastreceived("scored")` 编译为 `event_whenbroadcastreceived`，消息名称在其字段中——广播也会注册到项目中，出现在编辑器的广播菜单中。`broadcast.fire("scored")` 发送广播。

发送和接收的消息是必须完全匹配的纯字符串。没有共享的枚举，拼写错误不是编译错误——它只是一个永远不会启动的脚本。

## 第 4 部分——从函数返回值

Scratch 过程不原生支持返回值。jvavscratch 有两种解决方式；较新的一种是显式开关。

在 `jvavscratch.toml` 中添加：

```toml
name = "walking-cat"
description = ""
version = "0.0.1"
custom_block_return = true

[dependencies]
```

然后在 `src/Sprite1/a_setup.js` 的 `looks.say("Press space!")` 行上方添加：

```js
function turbo_double(n) {
    return n * 2;
}

let doubled = turbo_double(21);
looks.say(operation.join("21 doubled is ", doubled));
```

启用 `custom_block_return = true` 后，`let doubled = turbo_double(21);` 编译为一个 `procedures_call` 积木，其 mutation 携带返回类型，直接嵌入为 `set variable` 积木的输入。在 TurboWarp 中，该调用会求值为函数返回的值。

顺序仍然重要：`turbo_double` 定义在调用它的代码之上，且在同一个文件中。

较旧的机制在 `custom_block_return` 关闭时工作，调用函数后从编译器生成的变量中读取结果：

```js
turbo_double(21);
let doubled = util.getReturnAddress("turbo_double");
```

这读取过程体写入的一个隐藏变量。它有效，但容易出错：`util.getReturnAddress` 需要函数的*源*名称，所以 `turbo_` 前缀的函数必须带前缀查找，而没有返回值的函数会给你变量当前持有的值。推荐使用 `custom_block_return`。

## 检查你的工作

构建成功并不一定意味着编译了你想要的内容。未知库、未知函数和未实现的语句会报告为警告然后**跳过**，所以拼写错误会产生警告和缺失的积木而非错误：

```
[Warn]: Unknown function of library looks, got: 'sayForSecond'
[Warn]: No `impl` for 'BreakStatement'
```

阅读构建输出。如果运行项目时积木缺失，在查看源代码之前先搜索输出中的 `Warn`。

解压后的 `target/walking-cat/project.json` 是生成内容的真实依据。它是 Scratch 项目格式，所以你可以直接检查任何积木字典：

```bash
node -e "const p=require('./target/walking-cat/project.json');
for (const t of p.targets) console.log(t.name, Object.keys(t.blocks).length, 'blocks', t.variables, t.lists);"
```

## 下一步

- [语法](/zh/grammar/)——逐主题介绍该方言，包括*不*支持的构造及其原因。
- [语言参考](/zh/reference/language-reference)——所有内置积木函数和平常量的完整列表。
- [FAQ](/zh/faq/)——人们最常遇到的问题的简短回答。
