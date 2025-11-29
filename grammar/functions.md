# 函数

在jvavscratch中，函数是代码复用和模块化的重要手段。函数可以将JavaScript代码转换为Scratch中的自定义积木。

## 函数声明

### 基本函数声明

```javascript
// JavaScript函数声明
function moveForward(distance) {
  sprite.move(distance);
}

// 调用函数
moveForward(10);
```

在Scratch中，这会被转换为一个名为`moveForward`的自定义积木，接受一个参数。

### 箭头函数

```javascript
// 箭头函数
const turnRight = (degrees) => {
  sprite.turnRight(degrees);
};

// 单行箭头函数
const sayHello = () => sprite.say("Hello!");
```

箭头函数也可以被转换为Scratch自定义积木，但要注意箭头函数没有自己的`this`绑定。

## 参数和返回值

### 函数参数

```javascript
function calculateSum(a, b) {
  return a + b;
}

const result = calculateSum(5, 3);
```

参数会被转换为Scratch积木的输入槽。

### 返回值

```javascript
function isGreaterThan(a, b) {
  return a > b;
}

if (isGreaterThan(10, 5)) {
  sprite.say("10大于5");
}
```

函数返回值可以在条件判断或赋值语句中使用。

## 函数作为参数

```javascript
function repeatAction(times, action) {
  for (let i = 0; i < times; i++) {
    action();
  }
}

repeatAction(3, () => {
  sprite.move(10);
  sprite.turnRight(90);
});
```

函数作为参数可以实现复杂的行为组合。

## 注意事项

1. 函数名应该使用小驼峰命名法
2. 复杂的递归函数在Scratch中可能难以转换
3. 函数内部不应该有过于复杂的逻辑，尽量保持简单明了
4. 避免在函数内部修改全局状态