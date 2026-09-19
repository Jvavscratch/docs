# 运动API

jvavscratch提供了丰富的运动API，使开发者能够控制角色的移动、旋转和位置。这些API对应Scratch中的运动类积木。

## 基本移动函数

### move

```javascript
// 向前移动指定步数
sprite.move(10); // 向前移动10步
sprite.move(-5); // 向后移动5步
```

使角色向前或向后移动指定的步数。正数值向前，负数值向后。

### turnRight / turnLeft

```javascript
// 旋转指定角度
sprite.turnRight(90); // 右转90度
sprite.turnLeft(45); // 左转45度
```

使角色向右或向左旋转指定的角度（度数）。

### pointInDirection

```javascript
// 指向指定方向
sprite.pointInDirection(90); // 指向右侧（90度）
sprite.pointInDirection(0); // 指向上方（0度）
sprite.pointInDirection(-90); // 指向左侧（-90度）
```

设置角色的朝向为指定的方向（度数）。0度为上方，90度为右侧，-90度为左侧，180度为下方。

## 位置控制函数

### goTo

```javascript
// 移动到指定坐标
sprite.goTo(0, 0); // 移动到舞台中心
sprite.goTo(100, 50); // 移动到指定坐标

// 移动到另一个角色
sprite.goTo(otherSprite);
```

将角色移动到舞台上的指定坐标位置，或者移动到另一个角色的位置。

### glideTo

```javascript
// 平滑移动到指定位置，需要时间参数
sprite.glideTo(2, 100, 50); // 用2秒时间平滑移动到(100,50)

// 平滑移动到另一个角色
sprite.glideTo(1, targetSprite);
```

使角色平滑地移动到指定位置，第一个参数是移动所需的时间（秒）。

### setX / setY

```javascript
// 设置X坐标
sprite.setX(100);

// 设置Y坐标
sprite.setY(-50);
```

单独设置角色的X或Y坐标。

### changeX / changeY

```javascript
// 修改X坐标
sprite.changeX(10); // 增加X坐标
sprite.changeX(-5); // 减少X坐标

// 修改Y坐标
sprite.changeY(5); // 增加Y坐标（向上）
sprite.changeY(-5); // 减少Y坐标（向下）
```

增加或减少角色的X或Y坐标值。

## 方向和位置信息函数

### direction

```javascript
// 获取或设置角色方向
const currentDirection = sprite.direction;
sprite.direction = 180; // 设置方向为向下
```

获取或设置角色的当前朝向角度。

### x / y

```javascript
// 获取或设置角色坐标
const xPosition = sprite.x;
const yPosition = sprite.y;
sprite.x = 50;
sprite.y = 25;
```

获取或设置角色的X和Y坐标。

## 运动辅助函数

### bounceOnEdge

```javascript
// 设置碰到边缘反弹
sprite.bounceOnEdge = true;

// 取消碰到边缘反弹
sprite.bounceOnEdge = false;
```

当角色碰到舞台边缘时，是否反弹。

### ifOnEdgeBounce

```javascript
// 如果碰到边缘则反弹
ifOnEdgeBounce();
```

如果角色碰到舞台边缘，则自动反弹。

### isTouching

```javascript
// 检查是否碰到其他角色或边缘
const isTouchingPlayer = sprite.isTouching(playerSprite);
const isTouchingEdge = sprite.isTouching("edge");

if (isTouchingEdge) {
  sprite.bounceOnEdge = true;
}
```

检查角色是否碰到另一个角色或舞台边缘。

## 注意事项

1. 舞台坐标范围通常为X: -240 到 240，Y: -180 到 180
2. 移动函数会根据角色当前的朝向计算移动方向
3. 使用glideTo函数时，角色在移动过程中可以被其他代码中断
4. 频繁调用移动函数可能导致角色移动不流畅，建议使用适当的等待时间