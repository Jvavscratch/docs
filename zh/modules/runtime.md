---
title: Runtime 模块
---

# Runtime 模块

::: warning 设计草案 · 尚未实现
**jvavscratch 里没有 `Runtime` 模块。** 本组织下任何仓库里都不存在执行引擎、`Runtime` 类、
`Runtime.create()`,或本页描述的任何方法 —— 全仓 grep 找不到任何实现。下面全部内容都是
一份**提案**,保留它是因为它记录了一个曾被考虑过的方向,而不是因为它可用。

请先读[今天实际发生的事](#今天实际发生的事)。如果你是在找「在 jvavscratch 源码里可以调用
哪些函数」,你要看的是 [API 参考](/zh/api/),不是这一页。
:::

这个设想是:一个 JavaScript 侧的运行环境,用来**承载**编译好的工程 —— 启动与停止、逐帧
推进、把工程的变量和精灵暴露给宿主程序,并让调试器有东西可以附着。它会是 jvavscratch 目前
缺失的那一半:编译器把源码变成积木,而它负责跑那些积木。

## 今天实际发生的事

jvavscratch 是**提前(AOT)编译器**。整个过程里没有任何解释执行的环节:

- 源文件被解析成 Babel AST,每个节点被映射到 Scratch 积木 opcode,结果直接写成一份普通的
  `project.json`,再打包成 `.sb3`([模块 · Core](/zh/modules/core)、
  [模块 · Generator](/zh/modules/generator))。
- **jvavscratch 工程的运行时就是 Scratch VM** —— Scratch 本身,或 TurboWarp。启动工程、
  执行脚本、保存变量状态、移动精灵、用画笔绘制:这些都是 VM 的工作,而且它靠的是积木,
  不是 JavaScript。
- `jvavscratch run [path]` 会构建工程并在 TurboWarp 里打开 `.sb3`。这条命令只预配置了
  Windows。在其他平台上它会提示平台不匹配,让你要么自己构建再手动打开,要么加 `--bypass`
  跳过这项检查 —— 但 TurboWarp 可执行文件仍然是在默认的 Windows 用户级安装路径下查找的
  (`C:/Users/<你>/AppData/Local/Programs/TurboWarp/TurboWarp.exe`),所以在其他平台上跳过
  检查的结局是 `cannot find turbowarp app`,而不是工程被跑起来。

所以,这份设计里关于「执行引擎」的**形态** —— 工程被加载、精灵在动、广播被送达、变量在变 ——
是真实发生的事情。只不过它发生在 VM 内部,由生成的积木驱动,前面并没有一层 JavaScript API。

### 这份草案里哪些部分对应着真实存在的东西

| 草案中的内容 | 在代码里对应什么 |
|---|---|
| 内置积木目录(`move`、`turnRight`、`setX`、`show`、`playSound`……) | 编译器的内置块库,位于 `generator/src/generator/CallExpressionSub/{motion,looks,control,sensing,sound,pen,list,variable,broadcast,method}.ts`。它们是**构建期**到 opcode 的映射,不是宿主函数。名字和草案里的相当接近,权威列表见 [API 参考](/zh/api/)。 |
| 运行时状态:变量、列表、精灵位置、造型 | Scratch VM 的状态,由编译器生成的 `data_*`、`motion_*`、`looks_*` 积木产生。 |
| 广播、画笔、声音 | `event_broadcast*`、`pen_*`、`sound_*` 这些 opcode。广播是能用的;但不存在「注册接收器」的 API —— `当接收到` 是由方言里的 `whenIReceive` 构造编译出来的。 |
| 「执行 jvavscratch 代码」 | 编译它,然后让 VM 跑产物。不存在 `execute(code)` 这种入口。 |
| 其余全部 —— `Runtime.create`、`loadProject`、插件、worker、`runInWorker`、性能分析、对象池、`batchUpdate`、注册表式事件发射器、`setRenderPriority` | **没有对应物。** 下表之后的任何内容,在任何地方都没有实现。 |

::: tip 提 issue,而不是提 PR
如果你希望其中某一项变成现实,有用的第一步是写一个 issue 说明使用场景(无头测试运行器?
调试器?CI 里检查工程还能不能跑?),那是一个很大的设计决策,不是一个可以顺手补上的空缺。
:::

## 设想的 API(设计草案)

本页余下部分就是这份草案当初写下的样子。其中没有一项被实现。

### 核心

#### `Runtime.create(options)`

创建一个新的运行时实例。

- `options.fps`:帧率(默认 `30`)
- `options.width`:舞台宽度(默认 `480`)
- `options.height`:舞台高度(默认 `360`)
- `options.headless`:是否无头模式(默认 `false`)
- `options.debug`:是否开启调试输出(默认 `false`)

```javascript
const { Runtime } = require('jvavscratch/runtime');
const runtime = Runtime.create({
  fps: 60,
  debug: true
});
```

#### `start()`

启动运行时。返回一个解析为实例的 Promise。

```javascript
await runtime.start();
```

#### `stop()`

停止运行时。

```javascript
await runtime.stop();
```

#### `loadProject(project)`

加载 Scratch 工程,参数可以是工程对象,也可以是工程文件路径。

```javascript
await runtime.loadProject(projectData);
await runtime.loadProject('./project.sb3');
```

#### `execute(code)`

执行 jvavscratch 源码,并以执行结果兑现 Promise。

```javascript
const result = await runtime.execute(`
  move(10);
  turnRight(15);
`);
```

### 状态管理

#### `getState()`

获取当前运行时状态。

```javascript
const state = runtime.getState();
console.log(state.sprites.length);
```

#### `setState(updates)`

应用一次状态更新。

```javascript
await runtime.setState({
  variables: {
    score: 100
  }
});
```

#### `getVariable(name, owner)`

读取变量,可选地限定到某个精灵。

```javascript
const score = runtime.getVariable('score');
const playerHealth = runtime.getVariable('health', 'Player');
```

#### `setVariable(name, value, owner)`

写入变量,可选地限定到某个精灵。

```javascript
await runtime.setVariable('score', 150);
await runtime.setVariable('health', 80, 'Player');
```

### 精灵管理

#### `getSprites()`

获取所有精灵。

```javascript
const sprites = runtime.getSprites();
```

#### `getSprite(idOrName)`

按 ID 或名字获取一个精灵。

```javascript
const cat = runtime.getSprite('Cat');
```

#### `createSprite(options)`

创建精灵。选项:`name`、`x`、`y`、`size`、`direction`、`costume`。

```javascript
const newSprite = await runtime.createSprite({
  name: 'Dog',
  x: 0,
  y: 0,
  size: 100
});
```

#### `deleteSprite(idOrName)`

删除精灵。

```javascript
await runtime.deleteSprite('Dog');
```

### 广播

#### `broadcast(message)`

发送广播消息。

```javascript
await runtime.broadcast('game over');
```

#### `whenIReceive(message, callback)`

注册广播接收器,返回一个可用于取消注册的 ID。

```javascript
const receiverId = runtime.whenIReceive('game over', () => {
  console.log('Game over received!');
});
```

#### `cancelWhenIReceive(receiverId)`

取消注册广播接收器。

```javascript
runtime.cancelWhenIReceive(receiverId);
```

### 画笔

#### `penDown()`

启用画笔。

```javascript
runtime.penDown();
```

#### `penUp()`

禁用画笔。

```javascript
runtime.penUp();
```

#### `setPenColor(color)`

按十六进制值或 RGB 设置画笔颜色。

```javascript
runtime.setPenColor('#FF0000');
```

#### `clearPen()`

清除所有画笔痕迹。

```javascript
runtime.clearPen();
```

### 声音

#### `playSound(soundName, sprite)`

播放声音,可选地由指定精灵播放。

```javascript
await runtime.playSound('meow', 'Cat');
```

#### `stopAllSounds()`

停止所有声音。

```javascript
runtime.stopAllSounds();
```

### 调试

#### `log(message)`

记录一行日志。

```javascript
runtime.log('Debug info: ' + variableValue);
```

#### `assert(condition, message)`

断言一个条件,不成立时抛出错误。

```javascript
runtime.assert(score > 0, 'Score must be positive');
```

### 内置积木目录

::: warning 这些不是运行时调用
下面这份目录,是草案设想「宿主程序如何调用内置功能」的样子。在真实的编译器里,这些标识符
是 jvavscratch 源码可用的**内置块库**:`.js` 文件里的 `move(10)` 会编译成
`motion_movesteps` 积木。实际存在的清单见 [API 参考](/zh/api/);这些构造在方言里怎么写,
见[语法](/zh/grammar/)。
:::

运动:

```javascript
move(10);

turnRight(15);
turnLeft(15);
pointInDirection(90);
pointTowards('Sprite1');

setX(100);
setY(50);
glideTo(100, 50, 1); // 1 秒内滑动到该位置

changeXBy(10);
changeYBy(10);
```

外观:

```javascript
show();
hide();

changeSizeBy(10);
setSizeTo(100);

nextCostume();
switchCostumeTo('costume2');

changeEffectBy('color', 25);
setEffectTo('color', 0);
clearEffects();
```

声音:

```javascript
playSound('pop');
playSoundUntilDone('pop');

changeVolumeBy(-10);
setVolumeTo(100);

changePitchBy(10);
setPitchTo(100);
```

事件:

```javascript
whenGreenFlag(() => {
  // 代码
});

whenIReceive('message', () => {
  // 代码
});

broadcast('message');
broadcastAndWait('message');
```

控制:

```javascript
wait(1); // 等待 1 秒

repeat(10, () => {
  // 代码
});

forever(() => {
  // 代码
});

if (condition, () => {
  // 代码
});

ifElse(condition, () => {
  // 条件为真时
}, () => {
  // 条件为假时
});
```

侦测:

```javascript
touching('Sprite1');
touchingColor('#FF0000');
colorTouching('#FF0000', 'edge');

distanceTo('Sprite1');

keyPressed('space');
mouseDown();
mouseX();
mouseY();

timer();
resetTimer();
```

运算:

```javascript
add(1, 2);
subtract(5, 3);
multiply(2, 3);
divide(6, 2);

lessThan(1, 2);
greaterThan(3, 2);
equals(5, 5);

and(true, false);
or(true, false);
not(false);

pickRandom(1, 10);

join('Hello', 'World');
letter(1, 'Hello');
lengthOf('Hello');
contains('Hello', 'ell');
```

变量:

```javascript
setVariable('score', 100);

changeVariable('score', 10);

showVariable('score');
hideVariable('score');
```

列表:

```javascript
addItem('apple', 'fruits');

insertItemAt(1, 'orange', 'fruits');

deleteItemAt(1, 'fruits');
deleteAllOf('fruits');

replaceItemAt(1, 'grape', 'fruits');

itemAt(1, 'fruits');
itemNumber('apple', 'fruits');
lengthOfList('fruits');
listContains('fruits', 'apple');
```

### 事件系统

草案里宿主机侧的事件发射器,用于观察运行中的工程:

```javascript
runtime.on('start', () => {
  console.log('Runtime started');
});

runtime.on('stop', () => {
  console.log('Runtime stopped');
});

runtime.on('frame', (frame) => {
  console.log('Frame:', frame);
});

runtime.on('sprite:created', (sprite) => {
  console.log('Sprite created:', sprite.name);
});

runtime.on('variable:changed', (name, value, owner) => {
  console.log(`Variable ${name} changed to ${value}`);
});
```

| 事件名称 | 触发条件 | 回调参数 |
|---|---|---|
| `start` | 运行时启动时 | 无 |
| `stop` | 运行时停止时 | 无 |
| `frame` | 每帧更新时 | `frameNumber` |
| `project:loaded` | 工程加载完成时 | `projectData` |
| `sprite:created` | 创建精灵时 | `sprite` |
| `sprite:deleted` | 删除精灵时 | `spriteId` |
| `variable:changed` | 变量变化时 | `name`, `value`, `owner` |
| `list:changed` | 列表变化时 | `name`, `items`, `owner` |
| `broadcast` | 发送广播时 | `message` |
| `key:down` | 按键按下时 | `key` |
| `key:up` | 按键释放时 | `key` |
| `mouse:down` | 鼠标按下时 | `x`, `y` |
| `mouse:up` | 鼠标释放时 | `x`, `y` |
| `mouse:move` | 鼠标移动时 | `x`, `y` |
| `error` | 发生错误时 | `error` |

### 性能优化

批量更新,给那些否则要为每次属性写入付一次往返代价的调用方:

```javascript
runtime.batchUpdate(() => {
  setVariable('score', 100);
  setVariable('level', 2);
  changeSizeBy(10);
});
```

精灵与资源的对象池:

```javascript
runtime.setOption('useObjectPool', true);
runtime.setOption('objectPoolSize', 100);
```

渲染优先级:

```javascript
runtime.setRenderPriority('sprite1', 10);

sprite.disableRender = true;
```

### 扩展与插件

```javascript
runtime.registerFunction('customFunction', (a, b) => {
  return a * b;
});

await runtime.loadPlugin('./plugins/myPlugin.js');

runtime.usePlugin({
  name: 'myPlugin',
  init(runtime) {
    // 初始化插件
  }
});
```

### 工作线程

```javascript
const result = await runtime.runInWorker(() => {
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }
  return sum;
});
```

### 调试与性能分析

```javascript
const runtime = Runtime.create({ debug: true });

runtime.enableDebug();
runtime.getDebugInfo();

runtime.startProfiling();
await runtime.execute(someCode);
const profile = runtime.stopProfiling();
console.log(profile);
```

草案里给出的排错清单:

1. **代码执行无反应**
   - 检查是否调用了 `start()`。
   - 检查源码是否有语法错误。
   - 检查错误日志。

2. **性能问题**
   - 减少不必要的精灵和特效。
   - 使用批量操作。
   - 简化循环体。

3. **渲染问题**
   - 检查精灵位置和大小。
   - 确认造型和背景正确加载。
   - 验证舞台尺寸设置。

### 草案里的用法约定

1. **资源管理**:及时释放不再使用的资源。
2. **代码组织**:把复杂逻辑拆分为多个函数。
3. **错误处理**:用 `try`/`catch` 捕获可能的错误。
4. **性能考虑**:避免在每帧执行昂贵的操作。
5. **调试习惯**:用日志和性能分析,而不是靠猜。

## 另见

- [模块 · Registry](/zh/modules/registry) —— 另一个设计草案,以及那个**确实实现了**的 registry 后端。
- [API 参考](/zh/api/) —— 在 jvavscratch 源码里真正可以调用的函数。
- [语法 · 事件块](/zh/grammar/events) —— 方言里事件处理是怎么写的。
- [指南 · 基本使用](/zh/guide/basic-usage) —— 构建并运行一个工程。
