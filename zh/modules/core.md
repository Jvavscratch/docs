# Core 模块

Core模块是jvavscratch的核心转换引擎，负责语法分析、代码转换和中间表示处理。它是连接JavaScript代码和Scratch项目的桥梁，处理了从高级语言到底层Scratch块的复杂转换过程。

## 模块架构

Core模块由以下几个主要组件组成：

1. **解析器（Parser）**：将JavaScript代码解析为抽象语法树（AST）
2. **转换器（Transformer）**：将AST转换为中间表示（IR）
3. **代码生成器（Code Generator）**：将IR转换为Scratch块表示
4. **类型检查器（Type Checker）**：验证代码的类型正确性
5. **语义分析器（Semantic Analyzer）**：执行语义检查和优化

## API概述

### Parser API

#### `parse(code)`

将JavaScript代码解析为抽象语法树。

**参数：**
- `code`: 要解析的JavaScript代码字符串

**返回值：**
- 解析后的抽象语法树对象

**示例：**
```javascript
const { parse } = require('jvavscratch/core/parser');
const ast = parse('let x = 10;');
```

#### `parseFile(filePath)`

从文件中读取代码并解析为抽象语法树。

**参数：**
- `filePath`: 文件路径

**返回值：**
- 解析后的抽象语法树对象

**示例：**
```javascript
const { parseFile } = require('jvavscratch/core/parser');
const ast = parseFile('./src/main.js');
```

### Transformer API

#### `transform(ast, options)`

将抽象语法树转换为中间表示。

**参数：**
- `ast`: 抽象语法树
- `options`: 转换选项
  - `strictMode`: 是否启用严格模式（默认：false）
  - `optimize`: 是否优化（默认：true）

**返回值：**
- 中间表示对象

**示例：**
```javascript
const { transform } = require('jvavscratch/core/transformer');
const ir = transform(ast, { strictMode: true });
```

### Code Generator API

#### `generateScratchBlocks(ir, options)`

将中间表示转换为Scratch块表示。

**参数：**
- `ir`: 中间表示对象
- `options`: 生成选项
  - `optimizeBlocks`: 是否优化块结构（默认：true）
  - `comments`: 是否保留注释（默认：true）

**返回值：**
- Scratch块表示对象

**示例：**
```javascript
const { generateScratchBlocks } = require('jvavscratch/core/generator');
const blocks = generateScratchBlocks(ir);
```

### Type Checker API

#### `checkTypes(ast)`

验证代码的类型正确性。

**参数：**
- `ast`: 抽象语法树

**返回值：**
- 类型检查结果对象，包含错误列表和警告列表

**示例：**
```javascript
const { checkTypes } = require('jvavscratch/core/type-checker');
const result = checkTypes(ast);
console.log(result.errors);
console.log(result.warnings);
```

### Semantic Analyzer API

#### `analyze(ast, options)`

执行语义分析和优化。

**参数：**
- `ast`: 抽象语法树
- `options`: 分析选项
  - `optimize`: 是否执行优化（默认：true）
  - `deadCodeElimination`: 是否消除死代码（默认：true）

**返回值：**
- 分析后的抽象语法树

**示例：**
```javascript
const { analyze } = require('jvavscratch/core/semantic-analyzer');
const optimizedAst = analyze(ast);
```

## 中间表示（IR）

中间表示是Core模块中最重要的概念之一，它是一种介于JavaScript AST和Scratch块之间的表示形式，专为Scratch转换设计。中间表示包含以下主要部分：

1. **变量表**：记录所有变量的定义和使用
2. **函数表**：记录所有函数的定义和调用
3. **控制流图**：表示代码的执行流程
4. **块映射**：将AST节点映射到Scratch块

### 中间表示示例

```javascript
const ir = {
  variables: [
    { name: 'x', type: 'number', isGlobal: true },
    { name: 'y', type: 'string', isGlobal: false }
  ],
  functions: [
    { name: 'myFunction', params: ['a', 'b'], body: [...] }
  ],
  blocks: [
    { type: 'setVariable', variable: 'x', value: 10 },
    { type: 'if', condition: { type: 'equals', left: { type: 'variable', name: 'x' }, right: 10 }, then: [...], else: [...] }
  ]
};
```

## 类型系统

Core模块实现了一个简单的类型系统，支持以下基本类型：

- `number`: 数字
- `string`: 字符串
- `boolean`: 布尔值
- `array`: 数组（对应Scratch中的列表）
- `undefined`: 未定义
- `object`: 对象（有限支持）

类型系统用于确保代码在转换为Scratch时的正确性，并提供类型检查错误提示。

## 错误处理

Core模块提供了详细的错误报告机制，包括：

1. **语法错误**：代码不符合JavaScript语法
2. **语义错误**：代码在语义上有问题
3. **类型错误**：类型不匹配或类型不支持
4. **转换错误**：无法转换为Scratch的代码结构

错误报告包含错误类型、位置和详细描述，帮助用户快速定位和修复问题。

## 性能优化

Core模块实现了多种优化策略，以提高生成的Scratch项目的性能：

1. **常量折叠**：预计算常量表达式
2. **死代码消除**：移除永远不会执行的代码
3. **公共子表达式消除**：避免重复计算
4. **块结构优化**：生成更高效的Scratch块结构

## 扩展性

Core模块设计为可扩展的，允许通过插件机制添加新功能：

1. **解析器插件**：扩展语法支持
2. **转换器插件**：自定义转换规则
3. **生成器插件**：自定义块生成

详细的插件开发指南请参考[插件开发](/plugins)文档。