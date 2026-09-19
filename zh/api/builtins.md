# 内置函数

jvavscratch提供了一系列内置函数，这些函数对应Scratch中的常用积木，使开发者能够方便地控制角色行为和场景交互。

## 基本控制函数

### wait

```javascript
// 等待指定秒数
wait(1); // 等待1秒
wait(0.5); // 等待0.5秒
```

使程序暂停指定的秒数，对应Scratch中的「等待」积木。

### stop

```javascript
// 停止程序
stop(); // 停止所有脚本
stop("this script"); // 停止当前脚本
stop("other scripts in sprite"); // 停止角色中的其他脚本
```

停止运行中的脚本，可以选择停止范围。

### repeat

```javascript
// 重复执行指定次数
repeat(10, () => {
  sprite.move(10);
  sprite.turnRight(36);
});
```

重复执行指定的动作多次。

## 变量操作函数

### setVariable

```javascript
// 设置变量
setVariable("score", 0);
setVariable("playerName", "Hero");
```

创建或更新变量的值。

### changeVariable

```javascript
// 修改变量
changeVariable("score", 10); // 增加10
changeVariable("lives", -1); // 减少1
```

增加或减少变量的值。

### getVariable

```javascript
// 获取变量值
const currentScore = getVariable("score");
if (currentScore > 100) {
  sprite.say("恭喜，得分超过100！");
}
```

获取变量的当前值。

## 运算函数

### random

```javascript
// 生成随机数
const randomNum = random(1, 10); // 生成1到10之间的随机数
const randomChoice = random(0, array.length - 1);
```

生成指定范围内的随机整数。

### abs

```javascript
// 绝对值
const distance = abs(-10); // 结果为10
```

返回数字的绝对值。

### round

```javascript
// 四舍五入
const rounded = round(3.7); // 结果为4
```

将数字四舍五入到最接近的整数。

## 字符串函数

### join

```javascript
// 连接字符串
const message = join("你好，", getVariable("playerName"));
sprite.say(message);
```

连接两个字符串。

### length

```javascript
// 获取字符串长度
const textLength = length("Hello World"); // 结果为11
```

返回字符串的字符数量。

### substring

```javascript
// 截取字符串
const part = substring("Hello World", 0, 5); // 结果为"Hello"
```

从字符串中提取指定部分。

## 列表操作函数

### createList

```javascript
// 创建列表
createList("items", ["苹果", "香蕉", "橙子"]);
```

创建一个新的列表。

### addToList

```javascript
// 向列表添加项
addToList("items", "葡萄");
```

向列表末尾添加一个新项。

### deleteFromList

```javascript
// 从列表删除项
deleteFromList("items", 1); // 删除索引为1的项
```

从列表中删除指定索引的项。

## 注意事项

1. 所有内置函数都可以直接调用，无需导入
2. 函数名称与Scratch积木名称保持一致，方便对照
3. 数值型参数应使用数字类型，避免使用字符串
4. 布尔型参数应使用true/false，而不是"true"/"false"字符串
