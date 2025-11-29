# API参考

本章节提供jvavscratch框架的API参考文档，包含所有主要模块的公共接口、参数说明和使用示例。

## 模块导航

- [CLI模块](modules/cli.md) - 命令行工具
- [Core模块](modules/core.md) - 核心转换引擎
- [Generator模块](modules/generator.md) - Scratch项目生成器
- [Decompiler模块](modules/decompiler.md) - Scratch项目反编译器
- [Types模块](modules/types.md) - 类型系统
- [Utils模块](modules/utils.md) - 工具函数
- [Registry模块](modules/registry.md) - 组件注册和管理
- [Runtime模块](modules/runtime.md) - 运行时执行环境

## 通用API

### 版本信息

```javascript
const { version } = require('jvavscratch');
console.log(`jvavscratch version: ${version}`);
```

### 配置管理

```javascript
const jvavscratch = require('jvavscratch');

// 获取配置
const config = jvavscratch.getConfig();

// 设置配置
jvavscratch.setConfig({
  debug: true,
  outputPath: './output'
});
```

### 错误处理

jvavscratch提供了统一的错误类型：

```javascript
const { JvavError } = require('jvavscratch/errors');

// 常见错误类型
// - SyntaxError: 语法错误
// - TypeError: 类型错误
// - RuntimeError: 运行时错误
// - ValidationError: 验证错误
// - NotFoundError: 资源未找到错误
```

## 快速开始示例

### 1. 基础转换

```javascript
const { transform } = require('jvavscratch/core');

async function convertCode() {
  try {
    // jvavscratch代码
    const code = `
      whenGreenFlag(() => {
        move(10);
        turnRight(15);
        say("Hello World!");
      });
    `;
    
    // 转换为Scratch项目数据
    const project = await transform(code);
    
    // 保存为.sb3文件
    await saveProject(project, './output/project.sb3');
    
    console.log('转换成功！');
  } catch (error) {
    console.error('转换失败:', error);
  }
}

convertCode();
```

### 2. 项目反编译

```javascript
const { decompileProject } = require('jvavscratch/decompiler');

async function decompileScratchProject() {
  try {
    // 反编译Scratch项目
    const result = await decompileProject('./input/project.sb3');
    
    // 输出jvavscratch代码
    console.log(result.code);
    
    // 保存到文件
    require('fs').writeFileSync('./output/project.js', result.code);
    
    console.log('反编译成功！');
  } catch (error) {
    console.error('反编译失败:', error);
  }
}

// 使用示例
const { generateProject } = require('jvavscratch/generator');

async function createScratchProject() {
  // 创建项目配置
  const projectConfig = {
    name: 'My Project',
    sprites: [
      {
        name: 'Cat',
        x: 0,
        y: 0,
        costumes: [{ name: 'costume1', assetId: 'cat1' }],
        scripts: [
          {
            blocks: [
              { opcode: 'event_whenflagclicked' },
              { opcode: 'motion_movesteps', inputs: { STEPS: [1, 10] } },
              { opcode: 'looks_say', inputs: { MESSAGE: [1, 'Hello!'] } }
            ]
          }
        ]
      }
    ]
  };
  
  // 生成项目
  const project = await generateProject(projectConfig);
  
  // 保存项目
  await saveProject(project, './my_project.sb3');
}

// 加载并执行代码
const { Runtime } = require('jvavscratch/runtime');

async function runCode() {
  const runtime = Runtime.create({ debug: true });
  await runtime.start();
  
  await runtime.execute(`
    whenGreenFlag(() => {
      forever(() => {
        move(5);
        if(onEdgeBounce(), () => {
          turnRight(90);
        });
      });
    });
  `);
}
```

## 类型定义

jvavscratch提供了完整的TypeScript类型定义：

```typescript
import { Project, Sprite, Block, Variable, List } from 'jvavscratch/types';

interface MyProject extends Project {
  // 自定义扩展
}

function processSprite(sprite: Sprite): void {
  // 处理精灵
}
```

## 插件API

jvavscratch支持插件系统，可以扩展功能：

```javascript
// 定义插件
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  // 插件初始化
  init(jvavscratch) {
    // 扩展功能
    jvavscratch.myPluginFunction = () => {
      // 功能实现
    };
    
    // 注册自定义转换规则
    jvavscratch.registerTransformer('my-transformer', (ast) => {
      // AST转换逻辑
      return ast;
    });
  }
};

// 加载插件
jvavscratch.use(myPlugin);
```

## 事件API

jvavscratch使用事件系统进行模块间通信：

```javascript
// 监听事件
jvavscratch.on('project:created', (project) => {
  console.log('项目已创建:', project.name);
});

// 触发事件
jvavscratch.emit('custom:event', data);

// 移除监听器
jvavscratch.off('project:created', listener);
```

## 全局设置

### 语言设置

```javascript
// 设置语言
jvavscratch.setLanguage('zh-CN');

// 获取当前语言
const currentLang = jvavscratch.getLanguage();
```

### 日志设置

```javascript
// 设置日志级别
jvavscratch.setLogLevel('debug'); // 'error', 'warn', 'info', 'debug', 'trace'

// 自定义日志处理器
jvavscratch.setLogger({
  info: (msg) => console.info(msg),
  error: (err) => console.error(err)
});
```

### 性能设置

```javascript
// 启用性能监控
jvavscratch.enablePerformanceMonitoring();

// 获取性能统计
const stats = jvavscratch.getPerformanceStats();
```

## 兼容性

### Scratch版本支持

| Scratch版本 | 支持状态 | 备注 |
|------------|---------|------|
| Scratch 2.0 | 部分支持 | 需转换为.sb格式 |
| Scratch 3.0 | 完全支持 | 原生.sb3格式 |
| Scratch 4.0 (预览版) | 实验性支持 | 可能有兼容性问题 |

### 浏览器兼容性

jvavscratch在Node.js环境完全支持，在浏览器环境中支持以下特性：

- 核心转换功能
- 运行时模拟
- 基本UI组件

### Node.js版本要求

- 最低版本: Node.js 14.x
- 推荐版本: Node.js 16.x 或更高

## 废弃API

以下API已被标记为废弃，将在未来版本中移除：

```javascript
// 废弃的API示例
// 请使用新的API
// jvavscratch.oldMethod() // 废弃
// jvavscratch.newMethod() // 推荐
```

## 贡献指南

如果您发现API文档中的错误或需要补充信息，请参考[贡献指南](../contributing.md)提交修复或建议。

## 下一步

- [深入了解各模块的详细API](modules/index.md)
- [查看使用指南](../guide/getting-started.md)
- [探索示例项目](../examples/index.md)