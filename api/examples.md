# API使用示例

本章节提供jvavscratch框架API的完整使用示例，帮助您快速上手和理解如何使用各个功能模块。

## 基本转换示例

### 从JavaScript到Scratch

```javascript
const { transform, saveProject } = require('jvavscratch');

async function basicConversion() {
  try {
    // JavaScript代码
    const code = `
      // 当绿旗被点击时执行
      whenGreenFlag(() => {
        // 移动10步
        move(10);
        
        // 右转15度
        turnRight(15);
        
        // 说"Hello World!"，持续2秒
        say("Hello World!", 2);
        
        // 重复10次
        repeat(10, () => {
          // 移动5步
          move(5);
          
          // 如果碰到边缘就反弹
          if(onEdgeBounce(), () => {
            // 改变颜色特效
            changeEffectBy("color", 25);
          });
        });
      });
    `;
    
    // 转换代码
    const project = await transform(code);
    
    // 保存为Scratch项目文件
    await saveProject(project, './output/basic_project.sb3');
    
    console.log('项目转换成功！');
  } catch (error) {
    console.error('转换失败:', error);
  }
}

basicConversion();
```

### 从Scratch到JavaScript

```javascript
const { decompileProject } = require('jvavscratch/decompiler');
const fs = require('fs').promises;

async function basicDecompilation() {
  try {
    // 反编译Scratch项目
    const result = await decompileProject('./input/project.sb3');
    
    // 输出反编译后的JavaScript代码
    console.log(result.code);
    
    // 保存代码到文件
    await fs.writeFile('./output/project.js', result.code);
    
    // 保存项目元数据
    await fs.writeFile('./output/project_meta.json', JSON.stringify(result.meta, null, 2));
    
    console.log('项目反编译成功！');
  } catch (error) {
    console.error('反编译失败:', error);
  }
}

basicDecompilation();
```

## 高级转换示例

### 使用自定义组件

```javascript
const { transform, registerComponent } = require('jvavscratch');

// 注册自定义组件
registerComponent('MySprite', {
  name: 'CustomSprite',
  x: 100,
  y: 50,
  scripts: [
    {
      name: 'init',
      code: `
        whenGreenFlag(() => {
          show();
          say("I'm a custom sprite!");
        });
      `
    }
  ]
});

async function useCustomComponent() {
  const code = `
    // 使用自定义组件
    createComponent('MySprite');
    
    whenGreenFlag(() => {
      // 移动自定义精灵
      withSprite('CustomSprite', () => {
        move(10);
        turnRight(90);
      });
    });
  `;
  
  const project = await transform(code);
  await saveProject(project, './output/custom_component.sb3');
}

useCustomComponent();
```

### 使用变量和列表

```javascript
const code = `
  // 定义变量
  const score = 0;
  let lives = 3;
  
  // 定义列表
  const items = ['apple', 'banana', 'orange'];
  
  whenGreenFlag(() => {
    // 更新变量
    score = score + 10;
    lives = lives - 1;
    
    // 使用列表
    if(contains(items, 'apple'), () => {
      say('Found an apple!');
    });
    
    // 添加项目到列表
    addItem('grape', items);
    
    // 获取列表长度
    const itemCount = lengthOfList(items);
    say('We have ' + itemCount + ' items!');
  });
`;

const project = await transform(code);
```

### 使用广播和事件

```javascript
const code = `
  whenGreenFlag(() => {
    // 等待1秒后广播
    wait(1);
    broadcast('start_game');
  });
  
  // 接收广播
  whenIReceive('start_game', () => {
    say('Game started!');
    
    // 等待2秒后广播游戏结束
    wait(2);
    broadcast('game_over');
  });
  
  // 接收游戏结束广播
  whenIReceive('game_over', () => {
    say('Game Over!');
    stopAll();
  });
`;

const project = await transform(code);
```

## 运行时示例

### 在Node.js中模拟运行

```javascript
const { Runtime } = require('jvavscratch/runtime');

async function simulateRuntime() {
  // 创建运行时实例
  const runtime = Runtime.create({
    fps: 60,
    debug: true,
    width: 480,
    height: 360
  });
  
  // 启动运行时
  await runtime.start();
  
  // 监听帧更新
  runtime.on('frame', (frame) => {
    console.log(`Frame: ${frame}, Score: ${runtime.getVariable('score')}`);
  });
  
  // 执行代码
  await runtime.execute(`
    const score = 0;
    
    whenGreenFlag(() => {
      forever(() => {
        // 每秒增加分数
        wait(1);
        score = score + 1;
        
        // 每10分改变方向
        if(score % 10 === 0, () => {
          turnRight(90);
        });
        
        // 移动
        move(5);
        
        // 检测碰撞
        if(onEdgeBounce(), () => {
          changeSizeBy(-5);
        });
      });
    });
  `);
  
  // 5秒后停止
  setTimeout(async () => {
    console.log('Stopping runtime...');
    await runtime.stop();
    console.log('Final score:', runtime.getVariable('score'));
  }, 5000);
}

simulateRuntime();
```

### 在浏览器中运行

```html
<!DOCTYPE html>
<html>
<head>
  <title>jvavscratch 浏览器示例</title>
  <script src="https://cdn.jsdelivr.net/npm/jvavscratch@latest/dist/jvavscratch.min.js"></script>
</head>
<body>
  <div id="stage"></div>
  
  <script>
    async function runInBrowser() {
      // 创建运行时，绑定到DOM元素
      const runtime = jvavscratch.Runtime.create({
        container: '#stage',
        width: 480,
        height: 360,
        fps: 30
      });
      
      // 启动运行时
      await runtime.start();
      
      // 执行代码
      await runtime.execute(`
        whenGreenFlag(() => {
          say("Hello from browser!");
          
          // 响应用户交互
          whenKeyPressed('space', () => {
            say("Space key pressed!");
            move(10);
          });
          
          forever(() => {
            // 跟随鼠标
            pointTowards(mouseX(), mouseY());
          });
        });
      `);
    }
    
    // 页面加载后运行
    window.onload = runInBrowser;
  </script>
</body>
</html>
```

## 生成器示例

### 创建自定义Scratch项目

```javascript
const { generateProject, saveProject } = require('jvavscratch/generator');

async function createCustomProject() {
  // 定义项目结构
  const projectConfig = {
    name: '我的自定义项目',
    description: '使用jvavscratch生成的项目',
    author: '开发者',
    
    // 背景设置
    background: {
      name: 'Stage',
      costumes: [
        {
          name: 'background1',
          assetId: 'builtin_background1',
          md5ext: 'background1.svg',
          dataFormat: 'svg'
        }
      ],
      scripts: [
        {
          blocks: [
            { opcode: 'event_whenflagclicked' },
            { opcode: 'looks_switchbackdropto', inputs: { BACKDROP: [1, 'background1'] } }
          ]
        }
      ]
    },
    
    // 精灵列表
    sprites: [
      {
        name: '小猫',
        x: 0,
        y: 0,
        size: 100,
        direction: 90,
        rotationStyle: 'all around',
        
        // 造型
        costumes: [
          {
            name: 'costume1',
            assetId: 'builtin_cat1',
            md5ext: 'cat1.svg',
            dataFormat: 'svg'
          }
        ],
        
        // 声音
        sounds: [
          {
            name: 'meow',
            assetId: 'builtin_meow',
            md5ext: 'meow.wav',
            dataFormat: 'wav'
          }
        ],
        
        // 变量
        variables: [
          { name: 'score', value: 0, isGlobal: false }
        ],
        
        // 脚本
        scripts: [
          {
            blocks: [
              { opcode: 'event_whenflagclicked' },
              { opcode: 'motion_gotoxy', inputs: { X: [1, 0], Y: [1, 0] } },
              { opcode: 'looks_sayforsecs', inputs: { MESSAGE: [1, '大家好！'], SECS: [1, 2] } },
              { opcode: 'control_repeat', inputs: { TIMES: [1, 10] }, next: 4 },
              { opcode: 'motion_movesteps', inputs: { STEPS: [1, 10] } },
              { opcode: 'motion_turnright', inputs: { DEGREES: [1, 15] } }
            ]
          },
          {
            blocks: [
              { opcode: 'event_whenkeypressed', inputs: { KEY_OPTION: [1, 'space'] } },
              { opcode: 'sound_playuntildone', inputs: { SOUND: [1, 'meow'] } },
              { opcode: 'data_changevariableby', inputs: { VARIABLE: [1, 'score'], VALUE: [1, 1] } }
            ]
          }
        ]
      },
      {
        name: '苹果',
        x: 150,
        y: 100,
        size: 50,
        
        costumes: [
          {
            name: 'apple',
            assetId: 'builtin_apple',
            md5ext: 'apple.svg',
            dataFormat: 'svg'
          }
        ],
        
        scripts: [
          {
            blocks: [
              { opcode: 'event_whenflagclicked' },
              { opcode: 'control_forever', next: 1 },
              { opcode: 'motion_goto', inputs: { TO: [1, 'random position'] } },
              { opcode: 'control_wait', inputs: { DURATION: [1, 2] } }
            ]
          }
        ]
      }
    ]
  };
  
  // 生成项目
  const project = await generateProject(projectConfig);
  
  // 保存项目
  await saveProject(project, './output/custom_project.sb3');
  
  console.log('自定义项目创建成功！');
}

createCustomProject();
```

## 反编译器示例

### 提取项目资源

```javascript
const { decompileProject, extractAssets } = require('jvavscratch/decompiler');

async function extractProjectResources() {
  try {
    // 提取项目资源
    const assets = await extractAssets('./input/project.sb3', {
      outputDir: './output/assets',
      includeCostumes: true,
      includeSounds: true,
      includeScripts: false
    });
    
    console.log('资源提取成功！');
    console.log('提取的造型数量:', assets.costumes.length);
    console.log('提取的声音数量:', assets.sounds.length);
    
    // 输出资源信息
    assets.costumes.forEach(costume => {
      console.log(`造型: ${costume.name}, 格式: ${costume.dataFormat}`);
    });
    
    assets.sounds.forEach(sound => {
      console.log(`声音: ${sound.name}, 格式: ${sound.dataFormat}`);
    });
  } catch (error) {
    console.error('资源提取失败:', error);
  }
}

extractProjectResources();
```

### 分析项目结构

```javascript
const { analyzeProject } = require('jvavscratch/decompiler');

async function analyzeProjectStructure() {
  try {
    // 分析项目结构
    const analysis = await analyzeProject('./input/project.sb3');
    
    console.log('项目分析结果:');
    console.log('项目名称:', analysis.name);
    console.log('精灵数量:', analysis.sprites.length);
    console.log('变量数量:', analysis.variables.length);
    console.log('列表数量:', analysis.lists.length);
    console.log('广播消息数量:', analysis.broadcasts.length);
    
    // 输出精灵详情
    analysis.sprites.forEach(sprite => {
      console.log(`\n精灵: ${sprite.name}`);
      console.log(`  脚本数量: ${sprite.scripts.length}`);
      console.log(`  造型数量: ${sprite.costumes.length}`);
      console.log(`  声音数量: ${sprite.sounds.length}`);
      console.log(`  变量数量: ${sprite.variables.length}`);
    });
    
  } catch (error) {
    console.error('项目分析失败:', error);
  }
}

analyzeProjectStructure();
```

## 工具函数示例

### 文件操作

```javascript
const { utils } = require('jvavscratch');

async function fileOperations() {
  // 读取项目文件
  const projectData = await utils.files.readSb3File('./input/project.sb3');
  
  // 写入文件
  await utils.files.writeFile('./output/copy.sb3', projectData);
  
  // 解压.sb3文件（ZIP格式）
  const extracted = await utils.files.unzip('./input/project.sb3', './output/unzipped');
  console.log('解压的文件数量:', extracted.length);
  
  // 压缩文件（创建.sb3文件）
  await utils.files.zip('./output/unzipped', './output/repackaged.sb3');
}

fileOperations();
```

### 路径工具

```javascript
const { utils } = require('jvavscratch');

function pathOperations() {
  // 标准化路径
  const normalized = utils.path.normalize('./../folder/file.txt');
  
  // 连接路径
  const joined = utils.path.join('./folder', 'subfolder', 'file.txt');
  
  // 获取目录名
  const dirname = utils.path.dirname('./folder/file.txt');
  
  // 获取文件名
  const basename = utils.path.basename('./folder/file.txt');
  
  // 获取扩展名
  const extname = utils.path.extname('./folder/file.txt');
  
  console.log('标准化路径:', normalized);
  console.log('连接路径:', joined);
  console.log('目录名:', dirname);
  console.log('文件名:', basename);
  console.log('扩展名:', extname);
}

pathOperations();
```

### 代码工具

```javascript
const { utils } = require('jvavscratch');

function codeOperations() {
  const code = `
    whenGreenFlag(() => {
      move(10);
      say("Hello");
    });
  `;
  
  // 代码格式化
  const formatted = utils.code.format(code);
  console.log('格式化后的代码:', formatted);
  
  // 代码压缩
  const minified = utils.code.minify(code);
  console.log('压缩后的代码:', minified);
  
  // 代码验证
  const validation = utils.code.validate(code);
  if (validation.valid) {
    console.log('代码验证通过');
  } else {
    console.log('代码验证失败:', validation.errors);
  }
}

codeOperations();
```

## 类型系统示例

### 使用TypeScript

```typescript
import {
  Project,
  Sprite,
  Block,
  Variable,
  TransformOptions,
  JvavError
} from 'jvavscratch';
import { transform } from 'jvavscratch/core';

async function typescriptExample(): Promise<Project> {
  try {
    // 定义转换选项
    const options: TransformOptions = {
      strict: true,
      targetVersion: '3.0',
      generateComments: true
    };
    
    // 转换代码
    const project: Project = await transform({
      code: `whenGreenFlag(() => { move(10); })`,
      options
    });
    
    // 使用类型安全的操作
    const catSprite: Sprite | undefined = project.sprites.find(s => s.name === 'Cat');
    
    if (catSprite) {
      console.log(`找到精灵: ${catSprite.name}`);
      console.log(`位置: (${catSprite.x}, ${catSprite.y})`);
    }
    
    return project;
  } catch (error: any) {
    if (error instanceof JvavError) {
      console.error(`jvavscratch错误: ${error.message}`);
      console.error(`错误代码: ${error.code}`);
    }
    throw error;
  }
}

typescriptExample().catch(console.error);
```

## 完整项目示例

### 游戏开发示例

```javascript
const { transform, saveProject } = require('jvavscratch');

async function createGame() {
  const gameCode = `
    // 游戏变量
    const score = 0;
    let lives = 3;
    const gameOver = false;
    
    // 角色位置
    let playerX = 0;
    let playerY = -150;
    
    // 敌人列表
    const enemies = [];
    
    // 初始化游戏
    function initGame() {
      // 创建敌人
      for(let i = 0; i < 5; i++) {
        addItem({
          x: -200 + i * 100,
          y: 150,
          speed: 2 + random(3)
        }, enemies);
      }
    }
    
    // 更新敌人
    function updateEnemies() {
      forEach(enemies, (enemy, index) => {
        // 移动敌人
        enemy.x = enemy.x + enemy.speed;
        
        // 如果敌人到达边缘，反向移动并向下移动
        if(enemy.x > 240 || enemy.x < -240) {
          enemy.speed = -enemy.speed;
          enemy.y = enemy.y - 20;
        }
        
        // 如果敌人到达底部，减少生命值
        if(enemy.y < -180) {
          lives = lives - 1;
          deleteItemAt(index, enemies);
          
          // 添加新敌人
          addItem({
            x: random(-200, 200),
            y: 150,
            speed: 2 + random(3)
          }, enemies);
        }
      });
    }
    
    // 检查碰撞
    function checkCollisions() {
      forEach(enemies, (enemy, index) => {
        if(distanceBetween(enemy.x, enemy.y, playerX, playerY) < 30) {
          // 增加分数
          score = score + 10;
          
          // 删除被击中的敌人
          deleteItemAt(index, enemies);
          
          // 添加新敌人
          addItem({
            x: random(-200, 200),
            y: 150,
            speed: 2 + random(3)
          }, enemies);
          
          // 播放音效
          playSound('pop');
        }
      });
    }
    
    // 检查游戏是否结束
    function checkGameOver() {
      if(lives <= 0) {
        gameOver = true;
        broadcast('game_over');
      }
    }
    
    // 玩家控制
    function playerControl() {
      // 左右移动
      if(keyPressed('right'), () => {
        playerX = min(playerX + 5, 240);
      });
      
      if(keyPressed('left'), () => {
        playerX = max(playerX - 5, -240);
      });
    }
    
    // 主游戏循环
    function gameLoop() {
      forever(() => {
        if(not(gameOver), () => {
          // 更新游戏状态
          playerControl();
          updateEnemies();
          checkCollisions();
          checkGameOver();
          
          // 更新显示
          withSprite('Player', () => {
            setX(playerX);
            setY(playerY);
          });
          
          // 更新敌人显示
          forEach(enemies, (enemy, index) => {
            withSprite('Enemy' + index, () => {
              setX(enemy.x);
              setY(enemy.y);
            });
          });
          
          // 更新分数显示
          say('分数: ' + score + ' 生命: ' + lives);
          
          // 控制游戏速度
          wait(0.016); // 约60FPS
        });
      });
    }
    
    // 游戏开始
    whenGreenFlag(() => {
      initGame();
      gameLoop();
    });
    
    // 游戏结束处理
    whenIReceive('game_over', () => {
      say('游戏结束！最终分数: ' + score);
      stopAll();
    });
  `;
  
  // 转换并保存游戏
  const project = await transform(gameCode);
  await saveProject(project, './output/shooter_game.sb3');
  
  console.log('游戏项目创建成功！');
}

createGame();
```

## 下一步

- [查看API参考文档](index.md)
- [探索更多教程](../guide/tutorials.md)
- [了解高级功能](../advanced/index.md)