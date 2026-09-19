# 外观API

jvavscratch提供了丰富的外观API，使开发者能够控制角色的视觉效果，包括造型、大小、可见性和文字显示等。这些API对应Scratch中的外观类积木。

## 造型控制函数

### switchCostume

```javascript
// 切换到指定造型
sprite.switchCostume("造型1");
sprite.switchCostume(2); // 也可以使用索引
```

将角色切换到指定名称或索引的造型。

### nextCostume

```javascript
// 切换到下一个造型
sprite.nextCostume();
```

将角色切换到下一个造型，如果已经是最后一个造型，则切换到第一个。

### costumeNumber

```javascript
// 获取当前造型编号
const currentCostume = sprite.costumeNumber;
sprite.say(`当前造型: ${currentCostume}`);
```

获取或设置角色的当前造型编号。

## 大小控制函数

### setSize

```javascript
// 设置角色大小（百分比）
sprite.setSize(100); // 默认大小
sprite.setSize(50); // 缩小到50%
sprite.setSize(200); // 放大到200%
```

设置角色的大小，以原始大小的百分比表示。

### changeSize

```javascript
// 修改角色大小
sprite.changeSize(10); // 增加10%
sprite.changeSize(-5); // 减少5%
```

增加或减少角色的大小。

### size

```javascript
// 获取或设置角色大小
const currentSize = sprite.size;
sprite.say(`当前大小: ${currentSize}%`);
```

获取或设置角色的当前大小。

## 文字显示函数

### say

```javascript
// 显示说话气泡
sprite.say("你好，世界！");
sprite.say(`得分: ${getVariable("score")}`);
```

在角色头顶显示说话气泡，包含指定的文本。

### sayFor

```javascript
// 显示说话气泡一段时间
sprite.sayFor("Hello!", 2); // 显示2秒后消失
```

在角色头顶显示说话气泡，持续指定的秒数后消失。

### think

```javascript
// 显示思考气泡
sprite.think("我在想什么...");
```

在角色头顶显示思考气泡，包含指定的文本。

### thinkFor

```javascript
// 显示思考气泡一段时间
sprite.thinkFor("思考中...", 3); // 显示3秒后消失
```

在角色头顶显示思考气泡，持续指定的秒数后消失。

## 可见性控制函数

### show

```javascript
// 显示角色
sprite.show();
```

使角色变得可见。

### hide

```javascript
// 隐藏角色
sprite.hide();
```

使角色变得不可见。

### visible

```javascript
// 获取或设置角色可见性
const isVisible = sprite.visible;
sprite.visible = false; // 等同于hide()
sprite.visible = true; // 等同于show()
```

获取或设置角色的可见性状态。

## 特效控制函数

### setEffect

```javascript
// 设置特效值
sprite.setEffect("color", 50); // 设置颜色特效为50
sprite.setEffect("fisheye", 30); // 设置鱼眼特效为30
sprite.setEffect("whirl", 15); // 设置漩涡特效为15
sprite.setEffect("pixelate", 10); // 设置像素化特效为10
sprite.setEffect("mosaic", 5); // 设置马赛克特效为5
sprite.setEffect("brightness", 20); // 设置亮度特效为20
sprite.setEffect("ghost", 40); // 设置幽灵特效为40
```

设置指定类型的特效值。

### changeEffect

```javascript
// 修改特效值
sprite.changeEffect("color", 10); // 增加颜色特效
sprite.changeEffect("brightness", -15); // 减少亮度特效
```

增加或减少指定类型的特效值。

### clearEffects

```javascript
// 清除所有特效
sprite.clearEffects();
```

清除角色的所有特效，恢复原始外观。

## 注意事项

1. 角色必须有多个造型才能使用nextCostume函数
2. 特效值的有效范围通常为-100到100
3. 设置ghost特效为100会使角色完全透明，等同于hide()
4. 频繁切换造型可能导致动画效果不流畅，建议配合适当的等待时间