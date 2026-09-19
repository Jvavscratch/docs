# Types 模块

Types模块提供了jvavscratch的类型系统和TypeScript类型定义，确保代码的类型安全性，并为使用TypeScript的开发者提供更好的开发体验和IDE支持。

## 类型系统概述

jvavscratch的类型系统基于JavaScript，但添加了一些Scratch特定的限制和扩展，以确保代码可以正确转换为Scratch项目。主要支持以下类型：

## 基本类型

### Number

表示数字值，对应Scratch中的数字类型。

```typescript
let x: number = 10;
let y: number = 3.14;
```

在Scratch中，所有数字都是浮点数，所以jvavscratch中的整数和浮点数在转换时没有区别。

### String

表示文本值，对应Scratch中的字符串类型。

```typescript
let message: string = "Hello, world!";
let name: string = 'jvavscratch';
```

### Boolean

表示布尔值，对应Scratch中的布尔类型，只能是`true`或`false`。

```typescript
let isRunning: boolean = true;
let isPaused: boolean = false;
```

### Array

表示列表，对应Scratch中的列表类型。在jvavscratch中，使用数组语法表示Scratch列表。

```typescript
let items: string[] = ["apple", "banana", "orange"];
let numbers: number[] = [1, 2, 3, 4, 5];
```

## Scratch特定类型

### Sprite

表示Scratch中的精灵对象。

```typescript
import { Sprite } from 'jvavscratch/types';

let cat: Sprite = new Sprite("Cat");
```

### Stage

表示Scratch中的舞台对象。

```typescript
import { Stage } from 'jvavscratch/types';

let stage: Stage = new Stage();
```

### BroadcastMessage

表示广播消息。

```typescript
import { BroadcastMessage } from 'jvavscratch/types';

let gameOverMessage: BroadcastMessage = new BroadcastMessage("game over");
```

## 类型定义文件

jvavscratch提供了完整的TypeScript类型定义文件，位于`jvavscratch/types/`目录下：

1. **index.d.ts**: 主类型定义文件，导出所有公开类型
2. **core.d.ts**: 核心类型定义
3. **generator.d.ts**: 生成器相关类型
4. **decompiler.d.ts**: 反编译器相关类型
5. **cli.d.ts**: CLI相关类型
6. **utils.d.ts**: 工具函数类型

## API类型定义

### Core模块类型

```typescript
// 抽象语法树节点类型
export interface AstNode {
  type: string;
  loc?: SourceLocation;
  [key: string]: any;
}

// 中间表示类型
export interface IntermediateRepresentation {
  variables: Variable[];
  functions: Function[];
  blocks: Block[];
  // 其他中间表示属性
}

// 变量类型
export interface Variable {
  name: string;
  type: string;
  isGlobal: boolean;
  initialValue?: any;
}

// 函数类型
export interface Function {
  name: string;
  params: string[];
  returnType?: string;
  body: AstNode;
}
```

### Generator模块类型

```typescript
// 项目配置类型
export interface ProjectConfig {
  name: string;
  author?: string;
  description?: string;
  version?: string;
  sprites?: SpriteConfig[];
  backgrounds?: BackgroundConfig[];
}

// 精灵配置类型
export interface SpriteConfig {
  name: string;
  x?: number;
  y?: number;
  size?: number;
  direction?: number;
  visible?: boolean;
  rotationStyle?: 'all around' | 'left-right' | 'don\'t rotate';
  draggable?: boolean;
  costumes?: Costume[];
  sounds?: Sound[];
  variables?: Record<string, any>;
  lists?: Record<string, any>;
  broadcasts?: Record<string, any>;
  blocks?: Record<string, any>;
  comments?: Record<string, any>;
}

// 背景配置类型
export interface BackgroundConfig {
  name: string;
  costumes?: Costume[];
  sounds?: Sound[];
  variables?: Record<string, any>;
  lists?: Record<string, any>;
  broadcasts?: Record<string, any>;
  blocks?: Record<string, any>;
  comments?: Record<string, any>;
  videoState?: 'on' | 'off' | 'on-flipped';
  textToSpeechLanguage?: string | null;
}

// 造型类型
export interface Costume {
  name: string;
  data: string;
  md5: string;
  dataFormat: string;
  rotationCenterX: number;
  rotationCenterY: number;
}

// 音效类型
export interface Sound {
  name: string;
  data: string;
  md5: string;
  format: string;
  rate: number;
  sampleCount: number;
}
```

### Decompiler模块类型

```typescript
// 反编译选项类型
export interface DecompileOptions {
  output?: string;
  format?: 'js' | 'ts';
  includeComments?: boolean;
  optimizeNames?: boolean;
  preserveStructure?: boolean;
}

// 反编译结果类型
export interface DecompileResult {
  outputDir: string;
  files: string[];
  projectInfo: ProjectInfo;
}

// 项目信息类型
export interface ProjectInfo {
  name: string;
  author?: string;
  description?: string;
  sprites: SpriteInfo[];
  stage: StageInfo;
}
```

## 使用TypeScript开发

如果您使用TypeScript开发jvavscratch项目，可以通过以下方式引入类型定义：

### 安装类型定义

类型定义已经包含在jvavscratch包中，无需单独安装。

### 在项目中使用类型

```typescript
import { Sprite, Stage, Variable } from 'jvavscratch/types';

// 使用类型注解
function createPlayer(name: string, x: number, y: number): Sprite {
  const player: Sprite = new Sprite(name);
  player.x = x;
  player.y = y;
  return player;
}

// 创建舞台
const stage: Stage = new Stage();

// 定义变量
const score: Variable<number> = new Variable('score', 0);
```

## 类型检查和验证

jvavscratch的类型系统与TypeScript结合，提供了强大的类型检查和验证功能：

1. **静态类型检查**：在编译时捕获类型错误
2. **IDE支持**：提供代码补全、类型提示和错误检查
3. **运行时验证**：在转换为Scratch时进行额外的类型验证

## 自定义类型

如果需要定义自己的类型，可以扩展jvavscratch的类型系统：

```typescript
import { Sprite } from 'jvavscratch/types';

// 扩展Sprite类型
interface Player extends Sprite {
  health: number;
  score: number;
  move(direction: 'up' | 'down' | 'left' | 'right'): void;
  shoot(): void;
}

// 使用自定义类型
const player: Player = new Sprite('Player') as Player;
player.health = 100;
player.score = 0;
player.move = function(direction) {
  // 实现移动逻辑
};
player.shoot = function() {
  // 实现射击逻辑
};
```

## 类型系统限制

由于jvavscratch需要与Scratch兼容，类型系统有一些限制：

1. **不支持复杂对象类型**：Scratch不支持JavaScript中的复杂对象，因此jvavscratch的类型系统限制了对象的使用
2. **函数限制**：函数的参数和返回值类型有限制，某些高级函数特性不支持
3. **类型推断**：某些情况下，类型推断可能不够准确，需要显式类型注解

## 最佳实践

1. **使用明确的类型注解**：特别是对于变量和函数参数，使用明确的类型注解
2. **利用TypeScript的类型保护**：使用类型保护确保类型安全
3. **避免使用不支持的类型**：尽量使用jvavscratch支持的类型
4. **编写类型测试**：为复杂的类型逻辑编写测试