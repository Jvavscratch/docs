# 事件块

jvavscratch提供了与Scratch事件块对应的JavaScript API，使开发者能够创建响应用户交互和其他事件的代码。

## 基本事件监听

### 当绿旗被点击

```javascript
// 当绿旗被点击时执行
whenFlag(() => {
  sprite.say("程序开始运行！");
  setupGame();
});
```

这对应于Scratch中的「当绿旗被点击」事件块。

### 当角色被点击

```javascript
// 当角色被点击时执行
whenClicked(() => {
  sprite.say("你点击了我！");
  playSound("clap");
});
```

这对应于Scratch中的「当角色被点击」事件块。

## 键盘事件

```javascript
// 当按下空格键时执行
whenKeyPressed("space", () => {
  sprite.jump(10);
  playSound("jump");
});

// 当按下方向键时执行
whenKeyPressed("right arrow", () => {
  sprite.move(5);
});

whenKeyPressed("left arrow", () => {
  sprite.move(-5);
});
```

可以监听各种键盘按键事件，包括方向键、字母键和功能键。

## 广播事件

```javascript
// 广播消息
function triggerGameStart() {
  broadcast("game start");
  sprite.say("游戏开始！");
}

// 接收广播消息
whenIReceive("game start", () => {
  startTimer();
  spawnEnemies();
});

whenIReceive("game over", () => {
  stopTimer();
  showScore();
});
```

广播机制允许不同部分的代码之间进行通信，类似于Scratch中的广播积木。

## 条件循环事件

```javascript
// 当条件为真时循环执行
whenCondition(() => score > 100, () => {
  sprite.say("恭喜，得分超过100！");
  levelUp();
});

// 重复直到条件满足
repeatUntil(() => isGameOver(), () => {
  updateGame();
  wait(0.1); // 等待0.1秒
});
```

条件循环事件允许代码在特定条件下重复执行。

## 自定义事件

```javascript
// 定义自定义事件处理器
const eventHandlers = {
  playerScored: [],
  enemyDefeated: []
};

// 注册事件监听器
function onPlayerScored(callback) {
  eventHandlers.playerScored.push(callback);
}

// 触发自定义事件
function notifyPlayerScored(points) {
  eventHandlers.playerScored.forEach(callback => callback(points));
}

// 使用自定义事件
onPlayerScored((points) => {
  sprite.say(`获得${points}分！`);
  updateScore(points);
});

// 在游戏中触发
notifyPlayerScored(10);
```

可以创建自定义事件系统来处理游戏中的各种交互。

## 注意事项

1. 避免在事件处理器中放置过于复杂的逻辑
2. 注意事件监听的生命周期，避免内存泄漏
3. 合理使用广播事件来解耦代码
4. 键盘事件应考虑用户体验，避免过于敏感的响应