# 控制流

控制流语句允许您控制程序的执行流程，根据条件执行不同的代码块或重复执行代码。jvavscratch 支持多种控制流语句，但有一些特殊限制。

## If 语句

`if 语句` 用于根据条件执行代码块。在 jvavscratch 中，`if 语句` 的基本语法与 JavaScript 相同，但有一个重要限制：不能使用单行 `if 语句`。

### 基本语法

```js
if (条件) {
    // 当条件为真时执行的代码
}
```

### 示例

```js
let score = 85;

if (score >= 90) {
    looks.say("优秀!");
}
```

### 多行 If 语句

```js
if (score >= 60) {
    looks.say("及格了!");
} else {
    looks.say("需要加油!");
}
```

### Else If 语句

```js
if (score >= 90) {
    looks.say("优秀!");
} else if (score >= 80) {
    looks.say("良好!");
} else if (score >= 60) {
    looks.say("及格了!");
} else {
    looks.say("需要加油!");
}
```

### 注意事项

- 不支持单行 if 语句：

  ```js
  // 无效的语法
  if (condition) doSomething();
  
  // 必须使用大括号
  if (condition) {
      doSomething();
  }
  ```

## While 语句

`while 语句` 用于在条件为真时重复执行代码块。

### 基本语法

```js
while (条件) {
    // 当条件为真时重复执行的代码
}
```

### 示例

```js
let count = 0;

while (count < 5) {
    looks.say(count);
    count = count + 1;
    control.wait(1);
}
```

### 无限循环

当条件永远为真时，while 循环将无限执行。在 jvavscratch 中，如果传递 `true` 作为条件，它将被转换为 Scratch 中的 "forever" 块：

```js
while (true) {
    motion.move(10);
    motion.turnRight(15);
    control.wait(0.1);
}

// 注意：在 "forever" 块之后的代码将永远不会执行
```

## For 语句

`for 语句` 提供了一种更简洁的方式来编写循环。在 jvavscratch 中，for 语句的第一个参数必须是标识符。

### 基本语法

```js
let i = 0;
for (i; i < 10) {  // 默认为 "i++"
    // 循环体
}
```

### 示例

```js
let i = 0;
for (i; i < 10)  // 默认为 "i++"
{
    looks.say(i); 
    control.wait(0.5);
}
```

## Switch 语句

`switch 语句` 用于根据表达式的值选择执行不同的代码块。在 jvavscratch 中，switch 语句被编译为 if 语句，因此建议使用 if 语句代替。

### 基本语法

```js
switch(表达式) {
    case 值1: 
        // 当表达式等于值1时执行的代码
        break; // 可选，将被忽略
    case 值2:
        // 当表达式等于值2时执行的代码
        break; // 可选，将被忽略
    default: // 可选
        // 当表达式不等于任何case值时执行的代码
}
```

### 示例

```js
let day = 3;

switch(day) {
    case 1: 
        looks.say("星期一");
        break; // 可选，将被忽略
    case 2: 
        looks.say("星期二");
        break; // 可选，将被忽略
    case 3:
        looks.say("星期三");
        break; // 可选，将被忽略
    default: 
        looks.say("不是工作日");
}
```

### 注意事项

- `break` 语句是可选的，在 jvavscratch 中会被忽略
- 多个 case 可以共享相同的代码块
- switch 语句在内部被转换为 if 语句，因此使用 if 语句可能更高效

## 控制流最佳实践

1. 始终使用大括号 `{}` 包围 if、while 和 for 语句的代码块
2. 对于简单的条件检查，使用 if 语句
3. 对于需要重复执行的代码，使用 while 或 for 语句
4. 避免创建无限循环，除非您确实需要程序持续运行
5. 确保循环条件最终会变为假，以避免意外的无限循环