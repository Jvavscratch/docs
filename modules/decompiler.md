# Decompiler 模块

Decompiler模块是jvavscratch的反编译工具，能够将Scratch项目文件(.sb3)反编译为jvavscratch JavaScript代码。这个模块使得用户可以将现有的Scratch项目转换为JavaScript代码进行编辑，然后再重新编译回Scratch项目。

## 模块功能

Decompiler模块主要提供以下功能：

1. 解析Scratch项目文件(.sb3)
2. 提取精灵、背景、变量、列表和广播消息
3. 将Scratch块转换为JavaScript代码
4. 生成符合jvavscratch语法的代码文件
5. 支持自定义反编译选项

## API概述

### 核心API

#### `decompileProject(filePath, options)`

反编译Scratch项目文件。

**参数：**
- `filePath`: Scratch项目文件(.sb3)的路径
- `options`: 反编译选项
  - `output`: 输出目录路径（默认：当前目录下的`decompiled`目录）
  - `format`: 输出格式（"js" 或 "ts"，默认："js"）
  - `includeComments`: 是否包含注释（默认：true）
  - `optimizeNames`: 是否优化变量和函数名称（默认：true）
  - `preserveStructure`: 是否保留原始结构（默认：true）

**返回值：**
- Promise，解析为反编译后的项目信息对象

**示例：**
```javascript
const { decompileProject } = require('jvavscratch/decompiler');
const result = await decompileProject('./project.sb3', {
  output: './my-project',
  format: 'js',
  includeComments: true
});
```

#### `parseSb3File(filePath)`

解析Scratch项目文件，但不生成JavaScript代码。

**参数：**
- `filePath`: Scratch项目文件(.sb3)的路径

**返回值：**
- Promise，解析为项目数据对象

**示例：**
```javascript
const { parseSb3File } = require('jvavscratch/decompiler');
const projectData = await parseSb3File('./project.sb3');
```

#### `blocksToCode(blocks, options)`

将Scratch块转换为JavaScript代码。

**参数：**
- `blocks`: Scratch块对象
- `options`: 转换选项
  - `includeComments`: 是否包含注释（默认：true）
  - `optimizeNames`: 是否优化变量名称（默认：true）

**返回值：**
- JavaScript代码字符串

**示例：**
```javascript
const { blocksToCode } = require('jvavscratch/decompiler');
const code = blocksToCode(spriteBlocks, {
  includeComments: true
});
```

### 工具API

#### `extractAssets(projectData, outputDir)`

提取Scratch项目中的资源（图像、音频等）。

**参数：**
- `projectData`: 项目数据对象，从`parseSb3File`获取
- `outputDir`: 资源输出目录

**返回值：**
- Promise，解析为提取的资源列表

**示例：**
```javascript
const { parseSb3File, extractAssets } = require('jvavscratch/decompiler');
const projectData = await parseSb3File('./project.sb3');
const assets = await extractAssets(projectData, './assets');
```

#### `generateProjectStructure(projectData, options)`

生成项目结构对象。

**参数：**
- `projectData`: 项目数据对象
- `options`: 生成选项
  - `format`: 输出格式（"js" 或 "ts"）

**返回值：**
- 项目结构对象，包含文件和目录信息

**示例：**
```javascript
const { parseSb3File, generateProjectStructure } = require('jvavscratch/decompiler');
const projectData = await parseSb3File('./project.sb3');
const structure = generateProjectStructure(projectData, { format: 'js' });
```

## 反编译流程

反编译过程包含以下主要步骤：

1. **解压项目文件**：.sb3文件实际上是一个ZIP压缩文件，需要先解压
2. **解析项目配置**：读取`project.json`文件，获取项目结构
3. **提取精灵和背景**：获取所有精灵和背景信息
4. **分析变量和列表**：提取所有变量和列表定义
5. **转换代码块**：将每个精灵和背景的代码块转换为JavaScript代码
6. **生成文件结构**：创建适当的文件和目录结构
7. **写入输出文件**：将生成的代码写入输出目录

## 反编译示例

### 命令行反编译

最简单的方法是使用CLI工具进行反编译：

```bash
jvavscratch decompile ./project.sb3 --output ./my-project
```

### 编程方式反编译

也可以通过API以编程方式进行反编译：

```javascript
const { decompileProject } = require('jvavscratch/decompiler');

async function decompileMyProject() {
  try {
    const result = await decompileProject('./project.sb3', {
      output: './my-project',
      format: 'js',
      includeComments: true,
      optimizeNames: true
    });
    
    console.log('反编译成功！');
    console.log(`生成了 ${result.files.length} 个文件`);
    console.log(`输出目录: ${result.outputDir}`);
  } catch (error) {
    console.error('反编译失败:', error);
  }
}

decompileMyProject();
```

## 生成的文件结构

反编译后，会生成以下文件结构：

```
my-project/
├── jvavscratch.config.js  # 项目配置文件
├── src/
│   ├── main.js           # 主入口文件
│   ├── sprites/          # 精灵代码目录
│   │   ├── Sprite1.js    # 第一个精灵的代码
│   │   ├── Sprite2.js    # 第二个精灵的代码
│   │   └── ...
│   └── stage.js          # 舞台（背景）代码
└── assets/               # 资源目录（如果提取了资源）
    ├── costumes/         # 造型文件
    └── sounds/           # 音效文件
```

## 反编译限制

尽管Decompiler模块功能强大，但由于Scratch和JavaScript之间的差异，仍存在一些限制：

1. **代码结构转换**：Scratch的块编程结构与JavaScript的文本编程结构存在根本差异，某些复杂的块结构可能无法完美转换
2. **变量类型**：Scratch变量在反编译时会根据使用情况推断类型，但可能不够准确
3. **自定义块**：自定义块的反编译可能不够理想，特别是复杂的自定义块
4. **特殊效果**：某些Scratch特有的效果可能需要特殊处理
5. **注释**：Scratch中的注释会尽可能保留，但可能不够完善

## 最佳实践

1. **验证反编译结果**：反编译后，应检查生成的代码是否符合预期
2. **适度编辑**：对反编译的代码进行编辑时，应保持在jvavscratch支持的语法范围内
3. **重新编译测试**：编辑后，应重新编译为Scratch项目并测试功能
4. **保留原始项目**：在反编译和编辑过程中，始终保留原始的Scratch项目作为备份

## 疑难解答

### 反编译失败

如果反编译失败，可能的原因包括：

1. Scratch项目文件损坏
2. 项目使用了不支持的Scratch扩展或功能
3. 文件路径问题

### 生成的代码有问题

如果生成的代码有问题，可以尝试：

1. 调整反编译选项，特别是`optimizeNames`和`preserveStructure`选项
2. 手动修复生成的代码中的问题
3. 对于复杂项目，考虑部分手动转换