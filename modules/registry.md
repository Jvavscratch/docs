# Registry 模块

Registry模块负责jvavscratch中的组件注册和管理，提供了一个集中的注册中心，用于管理变量、函数、精灵、背景等各种组件。这个模块使得jvavscratch可以灵活地管理项目中的各种元素。

## 模块功能

Registry模块主要提供以下功能：

1. 注册和管理变量（全局变量、局部变量、云变量）
2. 注册和管理函数（用户定义函数、内置函数）
3. 注册和管理精灵和背景
4. 注册和管理广播消息
5. 注册和管理列表（数组）
6. 提供统一的查询和访问接口

## API概述

### 核心API

#### `Registry.getInstance()`

获取Registry的单例实例。

**返回值：**
- Registry实例

**示例：**
```javascript
const { Registry } = require('jvavscratch/registry');
const registry = Registry.getInstance();
```

#### `registerVariable(name, options)`

注册变量。

**参数：**
- `name`: 变量名称
- `options`: 变量选项
  - `type`: 变量类型（"number", "string", "boolean", "array"）
  - `isGlobal`: 是否为全局变量（默认：false）
  - `isCloud`: 是否为云变量（默认：false）
  - `initialValue`: 初始值
  - `owner`: 变量所有者（精灵或背景的ID）

**返回值：**
- 注册的变量对象

**示例：**
```javascript
registry.registerVariable('score', {
  type: 'number',
  isGlobal: true,
  initialValue: 0
});
```

#### `registerFunction(name, options)`

注册函数。

**参数：**
- `name`: 函数名称
- `options`: 函数选项
  - `params`: 参数列表
  - `returnType`: 返回类型
  - `implementation`: 函数实现
  - `isBuiltIn`: 是否为内置函数（默认：false）
  - `owner`: 函数所有者

**返回值：**
- 注册的函数对象

**示例：**
```javascript
registry.registerFunction('movePlayer', {
  params: ['direction', 'distance'],
  implementation: (direction, distance) => {
    // 实现逻辑
  }
});
```

#### `registerSprite(name, options)`

注册精灵。

**参数：**
- `name`: 精灵名称
- `options`: 精灵选项
  - `id`: 精灵ID（可选，自动生成）
  - `x`: x坐标
  - `y`: y坐标
  - `size`: 大小
  - `direction`: 方向

**返回值：**
- 注册的精灵对象

**示例：**
```javascript
registry.registerSprite('Cat', {
  x: 0,
  y: 0,
  size: 100
});
```

#### `registerBackground(name, options)`

注册背景。

**参数：**
- `name`: 背景名称
- `options`: 背景选项
  - `id`: 背景ID（可选，自动生成）
  - `costumes`: 造型列表

**返回值：**
- 注册的背景对象

**示例：**
```javascript
registry.registerBackground('Stage', {
  costumes: [{ name: 'Backdrop1' }]
});
```

#### `registerBroadcast(name)`

注册广播消息。

**参数：**
- `name`: 广播名称

**返回值：**
- 注册的广播对象

**示例：**
```javascript
registry.registerBroadcast('game over');
```

#### `registerList(name, options)`

注册列表（数组）。

**参数：**
- `name`: 列表名称
- `options`: 列表选项
  - `isGlobal`: 是否为全局列表（默认：false）
  - `initialItems`: 初始项目数组
  - `owner`: 列表所有者

**返回值：**
- 注册的列表对象

**示例：**
```javascript
registry.registerList('items', {
  isGlobal: true,
  initialItems: ['apple', 'banana']
});
```

### 查询API

#### `getVariable(name, owner)`

获取变量。

**参数：**
- `name`: 变量名称
- `owner`: 所有者（可选）

**返回值：**
- 变量对象或undefined

**示例：**
```javascript
const scoreVar = registry.getVariable('score');
```

#### `getFunction(name)`

获取函数。

**参数：**
- `name`: 函数名称

**返回值：**
- 函数对象或undefined

**示例：**
```javascript
const moveFunction = registry.getFunction('movePlayer');
```

#### `getSprite(idOrName)`

获取精灵。

**参数：**
- `idOrName`: 精灵ID或名称

**返回值：**
- 精灵对象或undefined

**示例：**
```javascript
const catSprite = registry.getSprite('Cat');
```

#### `getBackground(idOrName)`

获取背景。

**参数：**
- `idOrName`: 背景ID或名称

**返回值：**
- 背景对象或undefined

**示例：**
```javascript
const stageBg = registry.getBackground('Stage');
```

#### `getBroadcast(name)`

获取广播。

**参数：**
- `name`: 广播名称

**返回值：**
- 广播对象或undefined

**示例：**
```javascript
const gameOverBroadcast = registry.getBroadcast('game over');
```

#### `getList(name, owner)`

获取列表。

**参数：**
- `name`: 列表名称
- `owner`: 所有者（可选）

**返回值：**
- 列表对象或undefined

**示例：**
```javascript
const itemsList = registry.getList('items');
```

### 管理API

#### `updateVariable(name, updates, owner)`

更新变量。

**参数：**
- `name`: 变量名称
- `updates`: 更新内容
- `owner`: 所有者（可选）

**返回值：**
- 更新后的变量对象或undefined

**示例：**
```javascript
registry.updateVariable('score', {
  value: 100,
  type: 'number'
});
```

#### `updateSprite(idOrName, updates)`

更新精灵。

**参数：**
- `idOrName`: 精灵ID或名称
- `updates`: 更新内容

**返回值：**
- 更新后的精灵对象或undefined

**示例：**
```javascript
registry.updateSprite('Cat', {
  x: 100,
  y: 50
});
```

#### `removeVariable(name, owner)`

移除变量。

**参数：**
- `name`: 变量名称
- `owner`: 所有者（可选）

**返回值：**
- 布尔值，表示是否成功移除

**示例：**
```javascript
registry.removeVariable('tempVar');
```

#### `clear()`

清除所有注册的组件。

**返回值：**
- 无

**示例：**
```javascript
registry.clear();
```

## 组件对象结构

### 变量对象

```javascript
const variable = {
  id: 'var_1234',           // 变量ID
  name: 'score',            // 变量名称
  type: 'number',           // 变量类型
  isGlobal: true,           // 是否全局变量
  isCloud: false,           // 是否云变量
  value: 0,                 // 当前值
  initialValue: 0,          // 初始值
  owner: null               // 所有者（null表示全局）
};
```

### 函数对象

```javascript
const functionObj = {
  id: 'func_1234',          // 函数ID
  name: 'movePlayer',       // 函数名称
  params: ['direction', 'distance'],  // 参数列表
  returnType: null,         // 返回类型
  implementation: Function, // 函数实现
  isBuiltIn: false,         // 是否内置函数
  owner: null               // 所有者
};
```

### 精灵对象

```javascript
const sprite = {
  id: 'sprite_1234',        // 精灵ID
  name: 'Cat',              // 精灵名称
  x: 0,                     // x坐标
  y: 0,                     // y坐标
  size: 100,                // 大小
  direction: 90,            // 方向
  visible: true,            // 是否可见
  rotationStyle: 'all around', // 旋转方式
  variables: [],            // 精灵变量
  lists: [],                // 精灵列表
  scripts: []               // 精灵脚本
};
```

### 背景对象

```javascript
const background = {
  id: 'bg_1234',            // 背景ID
  name: 'Stage',            // 背景名称
  currentCostumeIndex: 0,   // 当前造型索引
  costumes: [],             // 造型列表
  scripts: []               // 背景脚本
};
```

### 广播对象

```javascript
const broadcast = {
  id: 'broadcast_1234',     // 广播ID
  name: 'game over'         // 广播名称
};
```

### 列表对象

```javascript
const list = {
  id: 'list_1234',          // 列表ID
  name: 'items',            // 列表名称
  isGlobal: true,           // 是否全局列表
  items: ['apple', 'banana'], // 列表项
  owner: null               // 所有者
};
```

## 事件系统

Registry模块内置了事件系统，可以监听和响应组件的注册、更新和移除事件：

### 监听事件

```javascript
// 监听变量注册事件
registry.on('variable:registered', (variable) => {
  console.log('Variable registered:', variable.name);
});

// 监听函数更新事件
registry.on('function:updated', (func, updates) => {
  console.log('Function updated:', func.name);
});

// 监听精灵移除事件
registry.on('sprite:removed', (sprite) => {
  console.log('Sprite removed:', sprite.name);
});
```

### 可用事件

| 事件名称 | 触发条件 | 回调参数 |
|---------|---------|--------|
| variable:registered | 注册变量时 | variable |
| variable:updated | 更新变量时 | variable, updates |
| variable:removed | 移除变量时 | variable |
| function:registered | 注册函数时 | function |
| function:updated | 更新函数时 | function, updates |
| function:removed | 移除函数时 | function |
| sprite:registered | 注册精灵时 | sprite |
| sprite:updated | 更新精灵时 | sprite, updates |
| sprite:removed | 移除精灵时 | sprite |
| background:registered | 注册背景时 | background |
| background:updated | 更新背景时 | background, updates |
| background:removed | 移除背景时 | background |
| broadcast:registered | 注册广播时 | broadcast |
| broadcast:removed | 移除广播时 | broadcast |
| list:registered | 注册列表时 | list |
| list:updated | 更新列表时 | list, updates |
| list:removed | 移除列表时 | list |
| registry:cleared | 清除注册表时 | 无 |

## 序列化和反序列化

Registry模块支持序列化和反序列化，可以将注册表状态保存到文件或从文件加载：

### 序列化

```javascript
const data = registry.serialize();
// 保存到文件
await writeFile('./registry.json', JSON.stringify(data));
```

### 反序列化

```javascript
// 从文件加载
const data = JSON.parse(await readFile('./registry.json'));
registry.deserialize(data);
```

## 最佳实践

1. **使用单例模式**：始终通过`Registry.getInstance()`获取Registry实例
2. **命名规范**：为变量、函数、精灵等使用清晰、有意义的名称
3. **适当作用域**：根据需要选择合适的变量作用域（全局或局部）
4. **事件监听**：利用事件系统响应组件变化
5. **序列化备份**：定期序列化注册表状态作为备份