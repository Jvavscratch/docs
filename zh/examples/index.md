---
title: 示例
---

# 示例

展示 jvavscratch 功能的示例项目和代码片段。

## 完整项目

### Pi spigot

一个使用 spigot 方法计算 π 的经典算法。位于仓库的 `examples/pi-spigot/` 目录中。

```
examples/pi-spigot/
  src/
    Sprite1.js        # 算法实现
  assets/
    stage/            # 空白舞台
  jvavscratch.toml
  project.d.json
```

构建方法：

```bash
jvavscratch build examples/pi-spigot
```

## 代码片段

参阅以下页面了解各 API 领域的分类示例：

- [API 示例](/zh/api/examples) — 标准库调用、运动、外观、声音
- [语法：控制流](/zh/grammar/control-flow) — if/else、循环、switch
- [语法：事件块](/zh/grammar/events) — 绿旗、按键、广播
- [语法：函数](/zh/grammar/functions) — 定义和调用函数
- [语法：类](/zh/grammar/classes) — 类定义和继承

## 添加你自己的示例

如果你用 jvavscratch 构建了有趣的项目，欢迎将其作为示例贡献。
将其放在 `examples/<project-name>/` 下，遵循标准项目布局，并添加简短描述。
