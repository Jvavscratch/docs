# Runtime 模块

Runtime模块是jvavscratch的运行时执行环境，负责执行转换后的Scratch代码，管理运行时状态，并提供各种内置功能和服务。该模块模拟了Scratch的执行引擎，确保代码按预期运行。

## 模块功能

Runtime模块主要提供以下功能：

1. 执行jvavscratch代码
2. 管理运行时状态（变量、列表、精灵位置等）
3. 提供绘图和交互API
4. 处理事件和广播
5. 模拟Scratch内置积木功能
6. 性能监控和优化

## API概述

### 核心API

#### `Runtime.create(options)`

创建一个新的运行时实例。

**参数：**
- `options`: 运行时选项
  - `fps`: 帧率（默认：30）
  - `width`: 舞台宽度（默认：480）
  - `height`: 舞台高度（默认：360）
  - `headless`: 是否无头模式（默认：false）
  - `debug`: 是否开启调试（默认：false）

**返回值：**
- Runtime实例

**示例：**
```javascript
const { Runtime } = require('jvavscratch/runtime');
const runtime = Runtime.create({
  fps: 60,
  debug: true
});
```

#### `start()`

启动运行时。

**返回值：**
- Promise，解析为运行时实例

**示例：**
```javascript
await runtime.start();
```

#### `stop()`

停止运行时。

**返回值：**
- Promise

**示例：**
```javascript
await runtime.stop();
```

#### `loadProject(project)`

加载Scratch项目。

**参数：**
- `project`: 项目对象或项目文件路径

**返回值：**
- Promise

**示例：**
```javascript
// 从对象加载
await runtime.loadProject(projectData);

// 从文件加载
await runtime.loadProject('./project.sb3');
```

#### `execute(code)`

执行jvavscratch代码。

**参数：**
- `code`: 代码字符串或函数

**返回值：**
- Promise，解析为执行结果

**示例：**
```javascript
const result = await runtime.execute(`
  move(10);
  turnRight(15);
`);
```

### 状态管理API

#### `getState()`

获取当前运行时状态。

**返回值：**
- 状态对象

**示例：**
```javascript
const state = runtime.getState();
console.log(state.sprites.length);
```

#### `setState(updates)`

更新运行时状态。

**参数：**
- `updates`: 状态更新对象

**返回值：**
- Promise

**示例：**
```javascript
await runtime.setState({
  variables: {
    score: 100
  }
});
```

#### `getVariable(name, owner)`

获取变量值。

**参数：**
- `name`: 变量名称
- `owner`: 所有者（精灵ID或名称，可选）

**返回值：**
- 变量值

**示例：**
```javascript
const score = runtime.getVariable('score');
const playerHealth = runtime.getVariable('health', 'Player');
```

#### `setVariable(name, value, owner)`

设置变量值。

**参数：**
- `name`: 变量名称
- `value`: 变量值
- `owner`: 所有者（精灵ID或名称，可选）

**返回值：**
- Promise

**示例：**
```javascript
await runtime.setVariable('score', 150);
await runtime.setVariable('health', 80, 'Player');
```

### 精灵管理API

#### `getSprites()`

获取所有精灵。

**返回值：**
- 精灵数组

**示例：**
```javascript
const sprites = runtime.getSprites();
```

#### `getSprite(idOrName)`

获取指定精灵。

**参数：**
- `idOrName`: 精灵ID或名称

**返回值：**
- 精灵对象

**示例：**
```javascript
const cat = runtime.getSprite('Cat');
```

#### `createSprite(options)`

创建新精灵。

**参数：**
- `options`: 精灵选项
  - `name`: 精灵名称
  - `x`: x坐标
  - `y`: y坐标
  - `size`: 大小
  - `direction`: 方向
  - `costume`: 造型对象或名称

**返回值：**
- Promise，解析为创建的精灵对象

**示例：**
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

**参数：**
- `idOrName`: 精灵ID或名称

**返回值：**
- Promise

**示例：**
```javascript
await runtime.deleteSprite('Dog');
```

### 广播API

#### `broadcast(message)`

发送广播消息。

**参数：**
- `message`: 广播消息名称

**返回值：**
- Promise

**示例：**
```javascript
await runtime.broadcast('game over');
```

#### `whenIReceive(message, callback)`

注册广播接收器。

**参数：**
- `message`: 广播消息名称
- `callback`: 回调函数

**返回值：**
- 接收器ID（用于取消注册）

**示例：**
```javascript
const receiverId = runtime.whenIReceive('game over', () => {
  console.log('Game over received!');
});
```

#### `cancelWhenIReceive(receiverId)`

取消注册广播接收器。

**参数：**
- `receiverId`: 接收器ID

**返回值：**
- 无

**示例：**
```javascript
runtime.cancelWhenIReceive(receiverId);
```

### 绘图API

#### `penDown()`

启用画笔。

**返回值：**
- 无

**示例：**
```javascript
runtime.penDown();
```

#### `penUp()`

禁用画笔。

**返回值：**
- 无

**示例：**
```javascript
runtime.penUp();
```

#### `setPenColor(color)`

设置画笔颜色。

**参数：**
- `color`: 颜色值（十六进制、RGB等）

**返回值：**
- 无

**示例：**
```javascript
runtime.setPenColor('#FF0000');
```

#### `clearPen()`

清除所有画笔痕迹。

**返回值：**
- 无

**示例：**
```javascript
runtime.clearPen();
```

### 声音API

#### `playSound(soundName, sprite)`

播放声音。

**参数：**
- `soundName`: 声音名称
- `sprite`: 精灵ID或名称（可选）

**返回值：**
- Promise

**示例：**
```javascript
await runtime.playSound('meow', 'Cat');
```

#### `stopAllSounds()`

停止所有声音。

**返回值：**
- 无

**示例：**
```javascript
runtime.stopAllSounds();
```

### 调试API

#### `log(message)`

记录日志。

**参数：**
- `message`: 日志消息

**返回值：**
- 无

**示例：**
```javascript
runtime.log('Debug info: ' + variableValue);
```

#### `assert(condition, message)`

断言条件，如果失败则抛出错误。

**参数：**
- `condition`: 条件表达式
- `message`: 错误消息

**返回值：**
- 无

**示例：**
```javascript
runtime.assert(score > 0, 'Score must be positive');
```

## 内置功能

### 运动积木

```javascript
// 移动
move(10);

// 转向
turnRight(15);
turnLeft(15);
pointInDirection(90);
pointTowards('Sprite1');

// 位置
setX(100);
setY(50);
glideTo(100, 50, 1); // 1秒内滑动到位置

// 外观
changeXBy(10);
changeYBy(10);
```

### 外观积木

```javascript
// 显示/隐藏
show();
hide();

// 大小
changeSizeBy(10);
setSizeTo(100);

// 造型
nextCostume();
switchCostumeTo('costume2');

// 特效
changeEffectBy('color', 25);
setEffectTo('color', 0);
clearEffects();
```

### 声音积木

```javascript
// 播放声音
playSound('pop');
playSoundUntilDone('pop');

// 音量
changeVolumeBy(-10);
setVolumeTo(100);

// 音调
changePitchBy(10);
setPitchTo(100);
```

### 事件积木

```javascript
// 当绿旗被点击
whenGreenFlag(() => {
  // 代码
});

// 当收到广播
whenIReceive('message', () => {
  // 代码
});

// 发送广播
broadcast('message');
broadcastAndWait('message');
```

### 控制积木

```javascript
// 等待
wait(1); // 等待1秒

// 重复
repeat(10, () => {
  // 代码
});

// 永远重复
forever(() => {
  // 代码
});

// 条件
if(condition, () => {
  // 代码
});

ifElse(condition, () => {
  // 条件为真时
}, () => {
  // 条件为假时
});
```

### 侦测积木

```javascript
// 触摸检测
touching('Sprite1');
touchingColor('#FF0000');
colorTouching('#FF0000', 'edge');

// 距离
distanceTo('Sprite1');

// 键盘/鼠标
keyPressed('space');
mouseDown();
mouseX();
mouseY();

// 计时器
timer();
resetTimer();
```

### 运算积木

```javascript
// 基本运算
add(1, 2);
subtract(5, 3);
multiply(2, 3);
divide(6, 2);

// 比较
lessThan(1, 2);
greaterThan(3, 2);
equals(5, 5);

// 逻辑
and(true, false);
or(true, false);
not(false);

// 随机
pickRandom(1, 10);

// 字符串
join('Hello', 'World');
letter(1, 'Hello');
lengthOf('Hello');
contains('Hello', 'ell');
```

### 变量积木

```javascript
// 设置变量
setVariable('score', 100);

// 改变变量
changeVariable('score', 10);

// 显示/隐藏变量
showVariable('score');
hideVariable('score');
```

### 列表积木

```javascript
// 添加项
addItem('apple', 'fruits');

// 插入项
insertItemAt(1, 'orange', 'fruits');

// 删除项
deleteItemAt(1, 'fruits');
deleteAllOf('fruits');

// 替换项
replaceItemAt(1, 'grape', 'fruits');

// 获取项
itemAt(1, 'fruits');
itemNumber('apple', 'fruits');
lengthOfList('fruits');
listContains('fruits', 'apple');
```

## 事件系统

Runtime模块提供了丰富的事件系统，可以监听各种运行时事件：

```javascript
// 监听运行时启动
runtime.on('start', () => {
  console.log('Runtime started');
});

// 监听运行时停止
runtime.on('stop', () => {
  console.log('Runtime stopped');
});

// 监听帧更新
runtime.on('frame', (frame) => {
  console.log('Frame:', frame);
});

// 监听精灵创建
runtime.on('sprite:created', (sprite) => {
  console.log('Sprite created:', sprite.name);
});

// 监听变量变化
runtime.on('variable:changed', (name, value, owner) => {
  console.log(`Variable ${name} changed to ${value}`);
});
```

### 可用事件

| 事件名称 | 触发条件 | 回调参数 |
|---------|---------|--------|
| start | 运行时启动时 | 无 |
| stop | 运行时停止时 | 无 |
| frame | 每帧更新时 | frameNumber |
| project:loaded | 项目加载完成时 | projectData |
| sprite:created | 创建精灵时 | sprite |
| sprite:deleted | 删除精灵时 | spriteId |
| variable:changed | 变量变化时 | name, value, owner |
| list:changed | 列表变化时 | name, items, owner |
| broadcast | 发送广播时 | message |
| key:down | 按键按下时 | key |
| key:up | 按键释放时 | key |
| mouse:down | 鼠标按下时 | x, y |
| mouse:up | 鼠标释放时 | x, y |
| mouse:move | 鼠标移动时 | x, y |
| error | 发生错误时 | error |

## 性能优化

### 批量操作

对于多次状态更新，使用批量操作可以提高性能：

```javascript
runtime.batchUpdate(() => {
  // 多个更新操作
  setVariable('score', 100);
  setVariable('level', 2);
  changeSizeBy(10);
});
```

### 对象池

Runtime会自动维护精灵和资源的对象池，减少内存分配和垃圾回收：

```javascript
// 启用对象池（默认开启）
runtime.setOption('useObjectPool', true);

// 设置最大对象池大小
runtime.setOption('objectPoolSize', 100);
```

### 优化渲染

```javascript
// 设置渲染优先级
runtime.setRenderPriority('sprite1', 10);

// 禁用未使用精灵的渲染
sprite.disableRender = true;
```

## 高级用法

### 自定义扩展

可以通过Runtime模块的扩展机制添加自定义功能：

```javascript
// 注册自定义函数
runtime.registerFunction('customFunction', (a, b) => {
  return a * b;
});

// 调用自定义函数
execute(`
  const result = customFunction(5, 3);
  console.log(result);
`);
```

### 插件系统

Runtime支持插件系统，可以加载外部插件扩展功能：

```javascript
// 加载插件
await runtime.loadPlugin('./plugins/myPlugin.js');

// 或从对象加载
runtime.usePlugin({
  name: 'myPlugin',
  init(runtime) {
    // 初始化插件
  }
});
```

### 多线程支持

对于复杂计算，可以使用多线程功能：

```javascript
// 在工作线程中执行
const result = await runtime.runInWorker(() => {
  // 复杂计算
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }
  return sum;
});
```

## 调试与排错

### 启用调试模式

```javascript
// 创建运行时时启用调试
const runtime = Runtime.create({ debug: true });

// 或动态开启调试
runtime.enableDebug();

// 查看调试信息
runtime.getDebugInfo();
```

### 性能分析

```javascript
// 开始性能分析
runtime.startProfiling();

// 执行代码
await runtime.execute(someCode);

// 结束性能分析
const profile = runtime.stopProfiling();
console.log(profile);
```

### 常见问题排查

1. **代码执行无反应**
   - 检查是否调用了`start()`方法
   - 确保代码语法正确
   - 检查错误日志

2. **性能问题**
   - 减少不必要的精灵和效果
   - 使用批量操作
   - 优化循环逻辑

3. **渲染问题**
   - 检查精灵位置和大小
   - 确认造型和背景正确加载
   - 验证舞台尺寸设置

## 最佳实践

1. **资源管理**：及时释放不再使用的资源
2. **代码组织**：将复杂逻辑拆分为多个函数
3. **错误处理**：使用try/catch捕获可能的错误
4. **性能考虑**：避免在每帧执行昂贵的操作
5. **调试习惯**：定期使用日志和调试功能监控运行状态