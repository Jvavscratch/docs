---
title: 语言参考
---

# 语言参考

> **说明**:本文档是 jvavscratch 的**语言参考**,原为仓库根目录的主 `README.md`,现由文档站维护。它同时覆盖 CLI/项目结构、语言特性(编程、类与继承、事件块)、`jvavscratch` 包注册表以及包(package)开发规范。
>
> 正文保留了原文的英文表述(便于与英文版逐节对照);**中文提示框**是本次根据当前代码补的核对结论,用来标注与早期文档不符、或文档承诺而生成器里并不存在的语法。
>
> 如果你是第一次接触 jvavscratch,建议先读 [快速开始](/zh/guide/getting-started);本文档更偏向逐条的语法与规范参考。
>
> jvavscratch 是**提前(AOT)编译器**:源码在构建期被翻译成积木,产物里没有 JS 运行时。

<div align="center"> 
  
# Jvavscratch

**Convert JavaScript code to a usable Scratch project in realtime.**

</div>

---

This repository contains everything you need to start developing with JavaScript on [Scratch](https://scratch.mit.edu)!

## Prerequisites

**This project requires you to have the following tools installed:**
- [Node](https://nodejs.org) (version >= 16)

## Setup

### Installation

::: info 仓库结构(已更新)
2026-09 起项目已从单体仓库拆分为多个仓库,同属 GitHub 组织 `Jvavscratch`:`types`、`core`、`utils`、`generator`、`decompiler`、`cli`、`docs`。依赖方向是单向的:

```
types ← core ← utils ← generator / decompiler ← cli
```

请按 [安装指南](/zh/guide/installation) 获取 CLI。原来"`git clone` 根仓库再 `npm install`"的说法是拆分前的做法,已过期。

包管理后端(`registry`)是**独立、仅本地部署**的服务,见下文 [The `jvavscratch` registry](#the-jvavscratch-registry)。
:::

Welcome to the Jvavscratch documentation! This first thing you'll need to do is install the compiler. Once done, you should get a fancy message. Jvavscratch has been installed!

### CLI

You, the user, are provided with the handy CLI system, `jvavscratch`. You can run `jvavscratch -v` to check the current version.

Everything in Jvavscratch is handled in a project. There are 2 ways to create a project:
 - `jvavscratch init`: Creates a `jvavscratch` project in the current directory
 - `jvavscratch new [name = "my-project"] [path = "./"]`: Creates a `jvavscratch` project with the given name at the given location

Let's create a new project. we can run `jvavscratch new` to create a blank project, "my-project". There are now a handful of other commands we can use to make this project functional:
 - `jvavscratch run`: Builds & runs the currently-open project
 - `jvavscratch build`: Builds the currently-open project
 - `jvavscratch add [...lib]`: Add packages
 - `jvavscratch remove`: Remove packages
 - `jvavscratch update`: Update newly added packages in `jvavscratch.toml`

Currently, we're only interested in `jvavscratch run` and `jvavscratch build`. `jvavscratch run` will build your project into an `sb3`, and open it with the [TurboWarp](https://turbowarp.org/editor) app (if installed). `jvavscratch build` just builds the project into an `sb3`. The `sb3` and the generated `project.json` can be found in `target/`.

### File structure

Now lets focus on the file structure, since there's a lot going on. It should look something like:
```bash
my-project:
    > assets
        > Sprite1...
        > stage...
    > lib
    > src
        > Sprite1.js
    > target
    > jvavscratch.toml
    > project.d.json
```

`assets` simply contains.. assets for your project. That be costumes, sounds, etc. The purpose of `lib` will be covered later, so we don't need to worry about that now. `src` contains the scripts for our sprites, and `target` is where the built `sb3` will be placed. `jvavscratch.toml` will also be covered later. Finally, `project.d.json` contains project data.

::: info `jvavscratch.toml` 的两个新设置
- `list_index_base` —— 取 `0` 或 `1`,决定列表下标从 0 还是 1 开始;填其它值会告警并按 `1` 处理。
- `custom_block_return` —— 为 `true` 时,过程可以通过 TurboWarp 的 `procedures_return` 机制直接返回值(见 [Functions](#functions))。
:::

All of this is relatively simple. In `src`, we have a script named `Sprite1.js`. Since this is a standalone script with a name, it means that the script represents the entire sprite. We can't have another script representing the sprite.

To have multiple scripts representing a sprite, we can create a folder with the name of the sprite, and bundle all of our scripts. For example:

```bash
src
    > Sprite1
        > foo.js
        > bar.js
        > foobar.js
```

In this example, `foo`, `bar`, and `foobar` all belong to `Sprite1`. If you had *another* folder inside of that, it would be ignored, meaning:

```bash
src
    > Sprite1
        > foo.js
        > bar.js
        > mySubFolder
            > foobar.js
```

.. Is the exact same as the previous example. But, if that folders name starts with a "&", then the contents won't be ignored. E.x:

```bash
src
    > Sprite1
        > foo.js
        > bar.js
        > &mySubFolder
            > foobar.js
```
`foobar.js` will be treated as its own sprite, while `foo` and `bar` both belong to `Sprite1`.

The `assets` folder contains sub-folders for each sprite, and a special one named `stage` (which you MUST have for the `sb3` to build). Inside of that, you can find a structure similar to:

```bash
> Sprite1
    > costumes
        > costumes.json
        > default.svg

    > sound
        > sound.json

    >sprite.json
```

`sprite.json` contains details for the sprite that we're using; that be the `x`, `y`, `direction`, etc.
Both the `sound` and `costumes` folder house assets for either sounds or costumes. Each have a `.json` representing the scratch objects. For example, a costume with the name "Costume1" with a path of 'default.png' would be:

```json
[
  {
    "name": "Costume1",
    "file": "default.svg"
  }
]
```
> [!TIP]
> All files must be placed in the root of the `costumes` / `sound` folder. Do not add sub-folders. We also have a special `stage` sprite, which instead of building to a sprite, builds to (surprisingly), the stage!

::: info 构建的硬性前提
`project.d.json` 必须存在,`assets/`、`src/`、`lib/` **三者都必须存在且是目录**——`lib/` 即使为空也不能少,否则构建直接报错。精灵名不能叫 `stage`。
:::

# Programming

Opening the generated JS program, you should see something like:

```js
looks.say("Hello, World!");
```

This program is pretty self-explanitory. It makes the sprite say, "Hello, World!". There are a variety of JS features that are natively ported:

## Variables & assignment

All variables are global by default. If you have a variable and a list with the same name, the `sb3` will not build correctly.

```js
let x = 3; // Valid
let y = x; // Valid

y = 2 * 3; // Valid

// Reference to a list named 'example' (the _list_ will be omitted)
let z = _list_example

// hello_world.js

let myStr = "Hello, World!";
looks.say(myStr);
```

You can force a variable to be private by prefixing the name with `_l_`:
```js
let _l_test = 5; // local variable "test"
```

If needed, a global variable can be created by prefixing the name with `_g_`:
```js
let _g_test = 5; // global variable "test"
let _g__l_test = 5; // global variable "_l_test"
```

Although disabled, a cloud variable can be created by prefixing the name with `_c_`:
```js
let _c_test = 5; // cloud variable "test"
```

> [!WARNING]
> Cloud variables are currently disabled. They will be converted to a `global` variable instead, and the `_c_` prefix will be removed.

> [!CAUTION]
> Naming a cloud, global, or local variable the same name will cause the build to fail.

These variables are then referenced like normal:
```js
let _l_private = "private variable";
private = "test";
```

::: info 列表语法糖(文档此前未收录)
生成前会做这些改写,取值、赋值位置都适用:

```js
looks.say(myList[1]);     // -> list.getItem("myList", 1)
looks.say(myList.length); // -> list.length("myList")
myList[1] = 5;            // -> list.replace("myList", 1, 5)
```
:::

## Logical expressions

Keep in mind scratch is very strict with logical expressions. In some cases, Jvavscratch will attempt to solve them if they're not allowed in scratch, but it's better to know what the limitations are to avoid errors. A logical operator (`not`, `and`, `or`) can only have 2 possible values on either side. Another spiky block, a logical operator, or a binary operator (such as `<`, and `>`).

```js
5 && 3 // Invalid
5 < 2 && true // Valid
5 + 1 && false // Valid in some cases
```

> [!CAUTION]
> A `not` must be followed by a valid boolean expression (otherwise the entire program will not compile):
> ```js
> !("hello") // Invalid
> !(5 == 2) // Valid
> ```

::: info 条件与逻辑表达式的自动改写
`core/src/env/transformSyntax.ts` 会在生成前做这些改写:

- `if` / `while` 的条件若不是布尔表达式,会合成为 `not(equals(值, 0))`;
- 不在条件位置的 `&&` / `||` 会改写成三元表达式,以保留短路语义;
- 三元表达式(`a ? b : c`)本身 Scratch 表达不了,会改写成给临时变量赋值的 `if` / `else`。
:::

## Control flow

### If statements

`if statements` work the same they do in normal JS; however you cannot do single-line `if statements`, such as:

```js
if (foo) foo.bar();
```

You can also use `else` and `else if` to extend the `if statement`:

```js
if (foo) {
    foo.bar();
} else {
    bar.foo();
}

if (barfoo) {
    foo.baz();
} else if (f) {
    baz.foo();
}
```

### While statements

Again, like `if statements`, `while statements` work exactly like they do in native JS:

```js
while (foo) {
    bar();
}
```

The only exception to this is that passing `true` makes it a `forever` loop:

```js
while (true) {
    bar();
}

foo(); // This will not be in the final program,
       // Since you can't have any blocks after a 
       // "forever" block.
```

### For Statements

::: warning 核对结论:for 的三个部分都有约束
生成器会把 `for` 编译成 `repeat until`(条件取反),并把更新表达式挪到循环体开头。因此:

- **初始化部分**只能是标识符或赋值表达式。`for (let i = 0; ...)` 之所以可以,是因为 `transformSyntax` 先把 `let i = 0` 提升到循环外、循环内改写成赋值;**`for (var i = 0; ...)` 不会被提升,会直接报错**"The first argument of a For loop must be an identifier or assignment expression."
- **条件部分**必须是二元 / 逻辑 / 一元表达式;
- **更新部分**若写了,必须是 `++` / `--` 或赋值;不写则默认按 `i++` 处理。
:::

`for statements`, again, are exactly like normal JS; the only exception being the first parameter must be an identifier:

```js
let i = 0;
for (i; i < 10;) // The update may be omitted, as long as both semicolons are there.
{
    looks.say(i); 
}
```

::: warning 核对结论:原示例少了第二个分号
原文写的是 `for (i; i < 10)`——那**不是合法的 JavaScript**(for 的三个部分之间必须有分号),Babel 会直接报语法错误。请写成上面的 `for (i; i < 10;)`。
:::

### Switch statements

`switch statements`, in the final build, are compiled to `if statements`, so it's recomended you use `if statements` instead of them! `switch statements` still work as normal. `break` is not necessary as the code won't flow through, so you can ommit it from your code.

```js
switch(foo)
{
    case bar: 
        looks.say("foobar!");
        break; // Optional. Will be ignored!
    
    case foobar:
    case foobaz: 
        looks.say("foobar, or foobaz!");
        break; // Optional. Will be ignored!
}
```

::: warning 核对结论:`default:` 目前会让构建失败
`default:` 分支会生成一个 test 为 `null` 的 `IfStatement`,构建报错:

```
Property test of IfStatement expected node to be of a type ["Expression"] but instead got undefined
```

"switch 一切正常"的说法对 `default:` 不成立,请改成显式列举所有分支。另外,原文说"switch 编译成 if",这一点核对无误;留在代码里的 `break` 只会产生一条 `No impl for 'BreakStatement'` 告警,不影响结果。
:::

### Assignment

All compound operators (`++`, `--`, `+=`, `-=`, `*=`, `/=`) are present and can be used.

### Functions

All blocks provided in scratch (other than extension blocks, by default) are available for use.
Some blocks return values instead of blocks; meaning they won't work. For example:

```js
let x = operation.join("Hello, ", "World!"); // Works
operation.join("Hello, ", "World!"); // Unknown library "operation", Unknown function "join"
```

::: info 哪些库是"块形态",哪些是"值形态"
每个库要么是**块库**(调用会变成堆叠积木,只能当语句用),要么是**值库**(调用产出报告积木,只能当值用)。`math`、`operation`、`util` **只有值库**——单独写一行 `math.random(1, 5);` 是错的,`let n = math.random(1, 5);` 才对。下面这份清单原文把两者混在一起了,容易误用。
:::

Here is a list of all functions:
```js
motion.move(steps: number);
motion.turnRight(degrees: number);
motion.turnLeft(degrees: number);
motion.gotoXY(X: number, Y: number);
motion.goto(object: string); // "mouse" / "random",或精灵名
motion.glide(secs: number, x: number, y: number);
motion.glideTo(secs: number, target: string);
motion.point(direction: number);
motion.pointTowards(target: string);
motion.changeX(value: number);
motion.setX(value: number);
motion.changeY(value: number);
motion.setY(value: number);
motion.bounceOnEdge();
motion.setRotationStyle(value: string);

looks.sayForSeconds(message: string, time: number);
looks.say(message: string);
looks.thinkForSecs(message: string, time: number);
looks.think(message: string);
looks.switchCostumeTo(costume: string);
looks.switchBackdropTo(backdrop: string);
looks.switchBackdropToAndWait(backdrop: string);
looks.nextCostume();
looks.previousCostume();
looks.nextBackdrop();
looks.previousBackdrop();
looks.changeSizeBy(factor: number);
looks.setSizeTo(value: number);
looks.changeGraphicEffect(type: string, value: number);
looks.setGraphicEffect(type: string, value: number);
looks.clearGraphicEffects();
looks.setLayer(type: "front" | "back"); // 传数字不会报错,但一律当成 "front"
looks.changeLayer(type: "front" | "back", amount: number);
looks.show();
looks.hide();

sound.playSoundUntilDone(sound: string);
sound.playSound(sound: string);
sound.stopAllSounds();
sound.clearEffects();
sound.changeEffect(type: string, value: number);
sound.setEffect(type: string, value: number);
sound.changeVolume(value: number);
sound.setVolume(value: number);

broadcast.fire(name: string);
broadcast.fireYield(name: string);

control.wait(length: number);
control.waitUntil(expression: any); // E.x: control.waitUntil(operation.lessThan("x", 3));
control.stop(type: "all" | "this script" | "other scripts in sprite");
control.clone(target: string); // "myself" or sprite name
control.deleteClone();
control.heartbeat(length: number);

sensing.ask(question: string);
sensing.resetTimer();
sensing.setDragMode(type: string);

variable.show(name: string);
variable.hide(name: string);

list.newList(name: string, content: any[], isPrivate: boolean);
list.push(list: string, value: any);
list.pop(list: string);
list.shift(list: string);
list.clear(list: string);
list.insert(list: string, index: number, value: any);
list.deleteIndex(list: string, index: number);
list.replace(list: string, index: number, value: any);
list.show(list: string);
list.hide(list: string);

method.cleanup(classname: string); // Deletes all instances of a class
method.set(class: string, instance: string, property: string, newValue: any); // Sets a property of an instance
method.destroy(class: string, instance: string);

pen.clear();
pen.stamp();
pen.down();
pen.up();
pen.changeEffect(type: string, factor: number);
pen.setEffect(type: string, factor: number);
pen.changeSize(factor: number);
pen.setSize(size: number);
pen.setColor(hex: string);
```

::: warning 核对结论:上一版清单里这几处签名有误
逐条对照 `generator/src/generator/CallExpressionSub/` 与 `types/CallExpressionSub/` 后,原文清单与当前实现不符的地方:

- `looks.changeGraphicEffect()`(**无参**)—— 不存在。该函数 `minArgs: 2`,写无参调用会报 "Not enough arguments"。上面已改为只保留 `(type, value)` 形式。
- `looks.changeLayer(amount)` —— 实际需要 **2 个参数**:`changeLayer(type, amount)`,只传一个数字同样报 "Not enough arguments"。
- `looks.setLayer(layer)` —— 实际取的是字符串 `"front"` / `"back"`;传数字不会报错,但一律被当成 `"front"`。
- `math.mod(value)` —— 实现是 `OperatorMod`,需要 **2 个参数**:`math.mod(a, b)`。
- `sensing.touching` / `touchingColor` / `distanceTo` / `mouseDown` / `keyDown` / `itemOfObject` / `current` —— 这些**只在值库里**。原清单把它们和块函数排在一起,当成语句写(`sensing.touching("_mouse_");`)会告警 `Unknown function of library sensing` 并被丢弃;块形态的 `sensing` 库只有 `ask`、`resetTimer`、`setDragMode` 三个。
- 另外有两个函数文档里一直没写:`looks.clearGraphicEffects()`(块)、`sensing.colorIsTouchingColor(from, to)`(值)。
:::

#### Special constants

These are the read-only reporter functions — the constants the sprite already knows — followed by the rest of the value libraries. All of them produce a value, so use them where a value is expected:

```js
motion.x();
motion.y();
motion.direction();

looks.size();
looks.costumeIndex();
looks.costumeName();
looks.backdropIndex();
looks.backdropName();

sound.volume();

sensing.answer();
sensing.mouseX();
sensing.mouseY();
sensing.loudness();
sensing.timer();
sensing.daysSince2000();
sensing.username();
sensing.touching(object: string);
sensing.touchingColor(hex: string);
sensing.colorIsTouchingColor(from: string, to: string);
sensing.distanceTo(object: string);
sensing.mouseDown();
sensing.keyDown(key: string);
sensing.itemOfObject(a: string, b: string);
sensing.current(dateType: string);

math.random(min: number, max: number);
math.mod(dividend: number, divisor: number);
math.round(value: number);

math.operation(type: "abs"     |
                     "floor"   | 
                     "ceiling" | 
                     "sqrt"    | 
                     "sin"     | 
                     "cos"     | 
                     "tan"     | 
                     "asin"    | 
                     "atan"    | 
                     "in"      | 
                     "log"     | 
                     "e ^"     | 
                     "10 ^",
value: number);

math.pi();
math.pow(base: number, exponent: number); // This doesn't support negative exponents

operation.join(...string: string);
operation.getLetterOfString(letter: string, string: string);
operation.getLengthOfString(string: string);
operation.stringContains(stringA: string, stringB: string);

list.getItem(list: string, index: number);
list.getItemIndex(list: string, value: any);
list.length(list: string);
list.contains(list: string, value: any);

method.get(class: string, instance: string, property: string); // Gets a property of an instance
method.instancesOf(class: string); // How many instances of a class currently exist

util.getReturnAddress(functionName: string); // Returns a reference to the return address of a function
```

::: info `Math.*` 是上面这些值函数的别名
`Math` 调用会被改写到对应的值函数上:

```js
Math.floor(2.5); // -> math.operation("floor", 2.5)
Math.random();   // -> math.random(0, 1)
Math.PI;         // -> math.pi()
```
:::

> [!WARNING]
> `list.length("l")`（以及改写后会变成它的列表 `.length` 语法）会让 `transformSyntax` 的 `MemberExpression` 访问器陷入无限递归,构建时打印一条 `BABEL_TRANSFORM_ERROR` 栈信息。构建本身仍然成功、积木也照常生成,但**同一文件里其它所有改写都会被跳过**——比如 `**`、三元表达式会安静地保持原样不被翻译。把 `length` 调用单独放进一个文件可以规避。使用 `list.length("myList")` 显式调用形式也可以避免触发此问题。

You, the user, can also define your own functions like in normal JS:

```js
function foo(bar)
{
    looks.say(operation.join("foo", bar, "!"));
}

foo("bar");
```

We can make this function "run without screen refresh" by giving it the `turbo` prefix:

```js
function turbo_foo(bar)
{
    looks.say(operation.join("foo", bar, "!"));
}

turbo_foo("bar");
```

This function will have a name of `foo`, and will "run without screen refresh".

> [!CAUTION]
> Passing too many arguments, or too little, will cause the function to not run at all. The correct amount of arguments, if any, must be passed.

Functions can also be asynchronous by using the `async` keyword. In an asynchronous context, you can also call `await` to other asynchronous functions, however async arrow functions are not valid:

```js
async function myTest() {
    x = 5
    looks.sayForSeconds("`myTest` is yielding!", 2)
}

// `x` will first be set to 5. Then, 6 seconds later,
// it will be set to 10.
async function doCode() {
    // Wait for `myTest` to finish
    await myTest()
    looks.sayForSeconds("`MyTest` has finished yielding!", 2)
    control.wait(2)
    x = 10
}

// Call asynchronous function `doCode`
doCode()

// This code will run instantly,
// as `doCode` is an asynchronous 
// function.
looks.say("Hello!");
```

::: warning 核对结论:箭头函数与函数表达式都不支持
原文只说"async 箭头函数不合法",容易被读成同步箭头函数可用。实际上生成器里没有 `ArrowFunctionExpression` / `FunctionExpression` 的实现:

```js
let f = (x) => x + 1;               // error: No implementation for expression type 'ArrowFunctionExpression'.
let g = function (x) { return x; }; // error: No implementation for expression type 'FunctionExpression'.
```

请用具名的 `function` 声明。
:::

It is also possible to return certain values in synchronous  and asynchronous contexts. As scratch cannot return values via functions natively, you must `util.getReturnAddress` to get the returned value:

```js
function getPi() {
    return 3.141;
}

// First call the function 
getPi();
let x = util.getReturnAddress("getPi"); // We can now access the value via function
```

::: info 更推荐 `custom_block_return`
在 `jvavscratch.toml` 里写 `custom_block_return = true`,过程就可以走 TurboWarp 的 `procedures_return` 扩展直接返回值,不再需要临时变量和 `util.getReturnAddress`:

```js
function getPi() { return 3.141; }
let x = getPi(); // 调用本身就是值
```

关闭时(默认)才回落到上面那种"存进临时变量再读回来"的老办法。两种方式当前都能用。
:::

Although it is a messy approach, it is the best way internally to handle returning until it is supported. As mentioned, you can also return values via asynchronous functions:

```js
async function getPiAsync() {
    control.wait(5);
    return 3.141;
}

async function program() {
    let valueOfPi = 0;
    getPiAsync();

    valueOfPi = util.getReturnAddress("getPiAsync");
}

program();
```

Here is a more complex example using `return`:

```js
// We don't yield here, so
// we keep this as a synchronous 
// function.
function pi() {
    return 3.14149;
}

// Once again, there is no yielding here,
// so this is kept as a synchronous  function.
function getPi() {
    pi();
    return util.getReturnAddress("pi"); // Return the content of "pi"
}

// Note that this function
// doesn't need to be asynchronous, but is
// for this example.
async function program() {
    let x = 0; // Reset X
    getPi();

    x = util.getReturnAddress("getPi"); // Set x to the content of "getPi"
}

// Run the asynchronous function
// `program`. Note that this function
// doesn't need to be asynchronous, but is
// for this example.
program();
```

> [!CAUTION]
> There is no implementation for promises, and therefore making one function `await` another asynchronous  function causes the code to wait in an infinite loop. Only make functions that return asynchronous if they actually yield the thread. For example:
> ```js
> async function pi() {
>   return 3.141
> }
>
> async function program() {
>   await pi(); // This will cause an infinite loop, as by the time
>               // `pi` has returned, it starts waiting for the function
>               // to end (which will never happen, as it has already ended).
>
>               // If the `pi` function yielded / was synchronous , this would
>               // work fine.
> }
> ```


# Classes & Inheritance

> [!CAUTION]
> Classes are created at compile-time, meaning any modifications at runtime may cause them to break. Classes can be unstable if used incorrectly. Classes also don't automatically deconstruct themselves, so you must do that manually or they will not remove themselves (this means even when you restart the game, the old classes will exist).

A class can be created like in normal JS:

```js
class Apple {
    tastinessFactor = 0;

    // There is also an optional constructor
    constructor() {
       looks.sayForSeconds("A new apple was created! 😋", 2);
    }

    eat() {
        looks.say(
            operation.join(
                "The apple has a tastiness factor of: ", tastinessFactor
            )
        );
    }
}
```

Again, you can construct a class using the `new` keyword. A class **must** be appended to a variable:

```js
let myApple = new Apple(); // Creates an "Apple" with name "myApple". 
myApple.eat();

// Properties cannot be references like "instance.property", but rather by function:
let appleTastiness = method.get("Apple", "myApple", "tastinessFactor");

// As we cannot read directly from the instance, we can use a function to change a property too:
method.set("Apple", "myApple", "tastinessFactor", 500);

let apples = method.instancesOf("Apple"); // "1", as only 1 apple exists. If I ran this code
                                          // multiple times, it would increase as the previous
                                          // apples have not been destroyed.
```

As classes aren't cleaned up by default, you may need to use:

```js
let myApple = new Apple(); // Creates an "Apple" with name "myApple". 
myApple.eat();

method.destroy("Apple", "myApple"); // Destroys specifically "myApple" of the "Apple" class
method.cleanup("Apple"); // Destroys all instances of "Apple"
```

::: info 核对结论:上面的类示例可用
`ClassDeclaration` + `NewExpression` 会把每个实例注册成一个同名块库,所以 `myApple.eat()` 这类写法确实能编译(实测通过);`method.get` / `method.set` 要求类已声明,否则报 "Reference found to non-existant class"。
:::

## Inheritance

All inheritance does is "inherit" properties and functions from other classes. For example:
```js
class Fruit {
    color = "RED";
}

class Apple extends Fruit {
    tastinessFactor = 0;

    // There is also an optional constructor
    constructor() {
       looks.sayForSeconds("A new apple was created! 😋", 2);
    }

    eat() {
        looks.say(
            operation.join(
                "The apple with the color: '", color, "' has a tastiness factor of: ", tastinessFactor
            )
        );
    }
}

let myApple = new Apple(); // "A new apple was created! 😋"
method.set("Apple", "myApple", "tastinessFactor", 15);
method.set("Apple", "myApple", "color", "green");

myApple.eat(); // "The apple with the color: 'green' has a tastiness factor of: 15"
```

The `super` keyword has not been implemented and is not planned.

::: info `super(...)` 是静默丢弃的
`super()` 不会报错,也不会生成任何积木——调用被悄悄跳过。结论与原文一致:不要使用。
:::

## Why use classes?

As mentioned, classes are very unstable. A class is actually just a fixed space in an array, and any modifications to that array; and the whole class could be corrupted. Since classes don't deconstruct themselves too, it is up to you to figure out when that needs to happen.

Classes are also quite slow when calling methods as every property also has to be passed through (WITH the arguments of that function too). A "procedual" approach would most likely be better as that is what scratch is designed for.

# Event blocks

Sometimes, you may not want the green-flag to be the header block of your program. You can add a simple directive to change this; the following is a list of all the directives. Some directives require arguments to make them work (E.g, when KEY pressed). These directives MUST be on the first line:

```js
//#whenflagclicked() -> When Green flag clicked
//#whenthisspriteclicked() -> When this sprite clicked
//#start_as_clone() -> When I start as clone
//#whenkeypressed(Key: string) -> When key pressed  -> Example: #whenkeypressed("space")
//#whenbackdropswitchesto(Backdrop: string) -> When backdrop switches to  -> Example: #whenbackdropswitchesto("Backdrop1")
//#whengreaterthan(Type: "loudness" | "timer", Amount: number) -> When greater than  -> Example: #whengreaterthan("loudness", 5)
//#whenbroadcastreceived(Name: string) -> When broadcast received  -> Example: #whenbroadcastreceived("Message1")
```

::: info 核对结论:七条指令都能用,但有回退规则
实测七条指令生成的帽子积木都正确(`event_whenflagclicked` / `event_whenthisspriteclicked` / `control_start_as_clone` / `event_whenkeypressed` / `event_whenbackdropswitchesto` / `event_whengreaterthan` / `event_whenbroadcastreceived`)。

需要注意:实现取的是**文件里的第一条注释**,所以指令之前不能有别的注释;无法识别的按键名回退为 `space`,背景名回退为 `backdrop1`,比较类型回退为 `LOUDNESS`,广播名回退为 `message1`;**不是这七条之一的指令会被忽略**,脚本保持默认的绿旗帽子。
:::

# The `jvavscratch` registry

`jvavscratch` does more than just create projects; it's a whole package manager! Packages are fetched from the **`jvavscratch` registry**, a small Express + SQLite service that serves crate metadata, tarballs and a web front end.

::: warning 核对结论:registry 是"包管理后端",且只有本地部署
这里说的 registry 是**真实存在**的包管理服务(Express + SQLite,默认 `http://localhost:3000`),它自带仓库、**没有公开在 GitHub 上**——原文写的 `https://github.com/jvavscratch/jvavscratch-registry` 已经不存在。用 `jvavscratch registry set-url <url>` 换服务地址,`jvavscratch registry get-url` 查看当前地址。

另外要注意区分:文档的 [Registry 模块](/zh/modules/registry) 里描述的是编译器内部的"**组件注册表**"(组件与服务注册管理)。那个组件**从未实现**,只是设计草案,和这里的包管理后端不是一回事,只是重名。
:::

## Adding packages to a project

Open a project, and pick a package (along with a version). For example, lets choose `example-package`. We can simply run: `jvavscratch add example-package` to add it to the `lib` folder of our project.

> [!WARNING]
> This command may fail! It sends HTTP requests straight to the `git` api, meaning if you download too many packages in a short timeframe, errors may occur! It is actually better to specify the version you want to download (since it doesn't need to fetch the latest version, and instead downloads the specified version).

::: warning 核对结论:"直接打 git api"是过期说法
`add` 走的是 **registry 服务端**(`/api/v1/crates`),不再直连 GitHub API;只有 CLI 自更新(`jvavscratch update`)还会访问 GitHub。不过"显式指定版本更好"这句建议仍然成立:指定版本可以省掉一次"解析最新版本"的请求,也能避免碰上被 yank 的版本。另外包必须已经存在于 registry 里,否则会提示找不到。
:::

You can specify a specific version to download like so: `name@version`, for example: `example-package@0.0.1`.

## Removing packages from a project

Once the project is open, you can simply run: `jvavscratch remove <package-name>` to remove the given package(s). For example, `jvavscratch remove example-package`.

## Adding dependencies with `jvavscratch.toml`

Opening `jvavscratch.toml`, you may notice that you have a `[dependencies]` header, which contains a list of dependencies. You can add dependencies here, and run `jvavscratch update` to add them. Removing dependencies from this list won't work, as you'll have to use `jvavscratch remove`.

So, if you wanted to install `example-package`, version `0.0.1`:

```toml
[dependencies]
example-package = "0.0.1"
```

::: warning 核对结论:构建不再自动安装依赖
原文说这条命令"每次构建都会自动执行"——**已不成立**。现在的 `jvavscratch build` 只装载 `lib/` 里已经存在的包,不会去解析 `jvavscratch.toml`;改动 `[dependencies]` 后请手动跑 `jvavscratch add` 或 `jvavscratch update`。
:::

## What even is a package?

A package contains data that extends the functionalities of the Jvavscratch compiler itself. This means adding:

```
- Extra functions
- Extra globals
- Extra JS features
```

# Package specification

> [!TIP]
> Everything you need to know about compiling projects is above. All the content below is for people who want to extend and add more to Jvavscratch!

You can create a package using `jvavscratch lib [name = my-package] [path = "./"]`.
The file structure should look something like:

```bash
my-package
    > src
        > index.ts

    > utils
        > internal.ts
        > library.ts

    > jvavscratch.toml
```

Unsurprisingly, `src` contains the source for our package, in `ts`. `utils` simply contains some blank type annotations for us (`.d.ts` files sometimes don't work!)

::: warning 核对结论:`src/index.ts` 在构建期被 require,`utils/` 每次构建都会重写
包的 `src/index.ts` 是**在构建期被编译器 `require()`** 的,所以包扩展的是**编译器本身**,不是被编译出来的程序。同时,每次构建都会把 `lib/<包>/utils/library.ts` 与 `utils/internal.ts` **清空并重写成指向 `@jvavscratch/utils` 的 re-export 垫片**——不要编辑这两个文件,也不要指望构建时它们还是你写的内容。包目录里除 `src/`、`utils/` 外,`jvavscratch.toml` 也是脚手架的产物。
:::

Lets create a simple package that adds functions / globals with the value of `tau`, `pi` * 2.
What we're looking for is a function that returns a value, a library, specifically known as a "valueLibrary".
We can return (using `module.exports`) in this format to get ready to create our function:

```ts
module.exports = {
    libraries: {
        valueLibraries: [
            
        ]
    }
};
```

Now, in the `valueLibraries` array, we can use the `createValueFunction`, from the `library` class, to create our function:

```ts
import { CallExpression } from "@babel/types";
import { BlockClustering, buildData, createValueFunction } from "../utils/library";

module.exports = {
    libraries: {
        valueLibraries: [
            createValueFunction({
                body: ((callExpression: CallExpression, blockCluster: BlockClustering, parentId: string, buildData: buildData) => {
                    return {
                        block: null,
                        blockId: null,
                        isStaticValue: true,
                    }
                })
            })
        ]
    }
};
```

And that's a HUGE amount of code to what we just had a second ago. We create a value-function using the `createValueFunction` function (that sentence is hard to read, I know), where we pass a function of name `body`. All that this function actually does is return ANOTHER function which contains type-checking, and other things that you may need while making a function.

As of above, all we return is a blank block (that will error). `block` contains a scratch value, and `blockId`, along with `isStaticValue` can be ignored.

Since all we're doing is returning a scratch-type, we can use the `getScratchType` function, from the `internal` class, to return a scratch-number. In this case, we're returning `tau`:

```ts
return {
    block: getScratchType(ScratchType.number, Math.PI * 2),
    blockId: null,
    isStaticValue: true,
}
```

And that's that function done. But this code won't actually work. That's because this code is a standalone function and not part of a library. We can wrap it in a library with the `createLibrary` function:

```ts
import { CallExpression } from "@babel/types";
import { BlockClustering, buildData, createLibrary, createValueFunction } from "../utils/library";
import { getScratchType, ScratchType } from "../utils/internal";

module.exports = {
    libraries: {
        valueLibraries: [
            createLibrary("example", {
                tau: createValueFunction({
                    body: ((callExpression: CallExpression, blockCluster: BlockClustering, parentId: string, buildData: buildData) => {
                        return {
                            block: getScratchType(ScratchType.number, Math.PI * 2),
                            blockId: null,
                            isStaticValue: true,
                        }
                    })
                })
            })
        ]
    }
};
```

This code will allow us to use the `example.tau()` function in our programs.
And to use this code, it's as simple as dragging it into the `lib` folder of a project.
Then, we can use this code:

```js
let foo = example.tau();
```

Now we can compile and run, using `jvavscratch run`, and voila! We created our own function, nice!
But, wouldn't it be nicer if it was a global instead of a function? Well, we can do that, and its even EASIER:

```ts
import { createGlobal } from "../utils/library";
import { getScratchType, ScratchType } from "../utils/internal";

module.exports = {
    globals: [
        createGlobal("tau", (() => {
            return {
                block: getScratchType(ScratchType.number, Math.PI * 2),
                blockId: null,
                isStaticValue: true,
            }
        }))
    ]
};
```

Here we create a global named `tau`, which has a value of.. well tau.
We can now replace our JS code with:

```js
let foo = tau;
```

Compile and run...It works! We set `foo` to the global `tau`, which has the value of `PI` * 2! Great.

## Other features of packages

We can also add full blocks. It works exactly the same way `createValueFunction` works, but we use `createFunction` instead, and put it under `blockLibraries` instead of `valueLibraries`.  To actually
ADD blocks, we need to utilise `BlockCluster`s (the `BlockClustering` type). These allow us to add clusters
of blocks. We can use the method `addBlocks` to add an object full of blocks. A block can be created with the `CreateBlock` function, and it represents a scratch block. E.x:

```ts
let id = "test"; // All blocks need a Block ID.
                 // Refer to the sb3 file structure
                 // For more information!

blockCluster.addBlocks({
    [id]: createBlock({
        opcode: BlockOpCode.LooksHide
    })
});
```

> [!TIP]
> Usually, you are provided with a `ParentId`. This is should be the ID of the first block you add. If your function returns a VALUE, it is the ID of the block your value is going to be added too.

Finally, you're also provided with `implementations`, which allow you to override the code that runs when the program encounters a specific `babel` type. There are 2 types of `implementations`, `implements`, and `type_implements`.

::: warning 核对结论:导出名是 `statement_implements`,不是 `implements`
编译器实际读取的字段是 `statement_implements` 与 `type_implements`(见 `cli/src/cli/projectManager.ts` 里合并包配置的那段)。原文的 `implements` 是个笔误,照抄会不生效。

优先级也是不对称的:语句与值的派发表**先**查包的 `statement_implements` / `type_implements`(即包可以整体覆盖某个 Babel 节点类型的处理);而库函数是先查内置库,包只能补内置没有的库。
:::

`statement_implements` are used for a `babel` type that represent a block, or a group of blocks, for example, `IfStatement`. `type_implements` are used for `babel` types that represent values, like a `NumericLiteral`.

Like with globals, you can simply export it `implementations` under `statement_implements`, or `type_implements`, depending on the type.

> [!TIP]
> `implementations` actually override the default JS2Scratch scripts, meaning you could rewrite code for every aspect!

The `createImplementation` function is used to.. create an `implementation`. All you need to do to create an implementation, is to pass the `babel` type, along with a function that will be ran. E.x:

```ts
import { buildData, createImplementation } from "../utils/library";
import { getScratchType, ScratchType } from "../utils/internal";
import { NumericLiteral } from "@babel/types";
import { BlockCluster } from "@jvavscratch/core";

module.exports = {
    type_implements: createImplementation<NumericLiteral>("NumericLiteral", ((blockCluster: BlockCluster, NumericLiteral, buildData: buildData) => {
        console.log("Encountered a number!")
        
        return {
            isStaticValue: true,
            blockId: null,
            block: getScratchType(ScratchType.number, NumericLiteral.value)
        }
    }))
};
```
