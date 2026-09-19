---
title: 进阶主题
---

# 进阶主题

本章讲的是 jvavscratch 里可选、或者只有在工程变大之后才会碰到的东西:**alpha 优化器**、
`jvavscratch.toml` 里的两个工程开关,以及一些让编译结果更容易检查、构建问题更容易定位的
技巧。

日常内容在别处:[语法](/zh/grammar/)讲语言,[API 参考](/zh/api/)讲积木库,
[模块](/zh/modules/)讲编译器是怎么搭起来的。

## alpha 优化器

jvavscratch 会忠实地编译你写下的东西。优化器是允许改动它的第二遍处理。

```bash
jvavscratch build ./my-project -o
# 或:jvavscratch build ./my-project --optimize
```

::: danger ALPHA
优化器是明确的 alpha 功能。启用时构建会打印这样一条告警:

> Optimization is still in its ALPHA form and may corrupt your project.

它会重写已经完成的积木字典 —— 折叠表达式、调整链条结构、删除积木 —— 所以务必把产物打开
确认工程行为仍然正确,不要以为构建通过就代表结果正确。
:::

### 这一遍是怎么跑的

`optimiseTree()`(`generator/src/optimise/index.ts`)是对已完成的扁平 `{uuid: Block}` 字典
做的一次后处理。它跑在每个精灵、每个文件都生成完毕之后,由构建时的 `-o` 开关启用 —— 它产出的
积木字典就是最终写进 `project.json` 的内容。

1. **找出链条。** 这一遍会找顶层积木中 opcode 属于事件入口的那些 ——
   `event_whenflagclicked`、`event_whenkeypressed`、`event_whenthisspriteclicked`、
   `event_whenstageclicked`、`event_whenbackdropswitchesto`、`event_whengreaterthan`、
   `event_whenbroadcastreceived` —— 外加上 `procedures_definition`。从每个入口出发顺着
   `next` 走到脚本末尾,得到一串有序积木。**首块不是这些入口之一的脚本永远不会被访问。**
2. **重写堆叠积木。** 对链上每块积木,把 opcode 按 `_` 拆分后当作文件路径去查 ——
   `looks_sayforsecs` 变成 `blocks/looks/sayforsecs.ts`。找不到文件就意味着「这块保持原样」,
   而绝大多数 opcode 都是这种情况。
3. **重写被引用的值。** 接着递归遍历每块积木的每个输入与字段,每个嵌套的报告器同样按这个
   方式在 `types/` 下查表 —— `operator_add` 变成 `types/operator/add.ts`。
4. **应用结果。** 覆盖实现可以返回 `{ block }`(替换触发它的那块积木),或
   `{ block, program }` —— 后者中的 `program` 会替换**整个**字典,供那些必须越出当前脚本
   范围的改写使用。
5. **清理。** 最终字典里任何 opcode 为 `jvavscratch_Unknown` 的积木都会被删除。这个标记就是
   覆盖实现表达「这块没了」的方式 —— 包括在链条中间的情况 —— 所以它并不只是把一个键删掉
   那么简单。

### 目前随代码提供的实现

代码树里现在有四个覆盖实现,都是算术的:

| 覆盖实现 | 作用 |
|---|---|
| `types/operator/add.ts` | 折叠常量加法、把嵌套的 `+` 链摊平、去掉 `+ 0` 项,并把无法完全折叠的部分重新发出来。 |
| `types/operator/subtract.ts` | 对 `-` 做同样的处理。 |
| `types/operator/multiply.ts` | 对 `*` 做同样的处理。 |
| `types/operator/divide.ts` | 对 `/` 做同样的处理。 |

所以目前可见的效果体现在生成的算术上:积木更少,而且编译器原本发出一条报告器链的地方会
变成字面量。

### 写一个覆盖实现

约定完全基于文件名,所以加一个实现就是在对的位置建一个文件:

```
generator/src/optimise/
  blocks/<类别>/<名字>.ts     堆叠积木   (looks_sayforsecs -> blocks/looks/sayforsecs.ts)
  types/<类别>/<名字>.ts      报告器/输入积木   (operator_add -> types/operator/add.ts)
```

覆盖实现是一个导出单个函数的 CommonJS 模块:

```ts
// generator/src/optimise/types/operator/add.ts
module.exports = function (program, parent, type) {
    // ……检查并改写……
    return { block: parent.block, program };
};
```

- **堆叠覆盖**被调用为 `fn(program, blockData)`,对应链上的那块积木。
- **类型覆盖**被调用为 `fn(program, parent, typeData)`,对应嵌套的报告器。`typeData` 里带着
  报告器本身、它的 key,以及它来自父级 `inputs`/`fields` 的哪个键(`originalArea`、
  `originalKey`),这样覆盖实现就知道该把替换结果写到哪儿。
- 返回 `{ block }` 交换一块积木,返回 `{ block, program }` 则同时替换整个字典。把积木标成
  `jvavscratch_Unknown` 会删除它。

每个覆盖实现都能用上 `optimise/util/program.ts`(递归克隆输入)与 `optimise/util/type.ts`
(`isBlock`、`isBlockKey`、`isNumericValue`、`getValue`)。写新代码之前,先去那里翻翻现成的
辅助函数。

::: warning 覆盖实现是按 `.ts` 文件去找的
查表时拼出的路径以 `.ts` 结尾,并且相对于编译后的优化器目录。在编译产物里这个文件并不存在
—— `tsc` 产出的是 `.js` —— 于是查表落空,这一遍就退化成只剩 `jvavscratch_Unknown` 清理。
只有当 generator 是从 TypeScript 源码加载时覆盖实现才会生效,而 CLI 的开发运行器正是这么做的:

```bash
node cli/dev.js build ./examples/pi-spigot -o
```

如果你在改一个覆盖实现却发现毫无变化,原因就在这里。
:::

## 工程选项

`jvavscratch.toml` 里有两个键会改变工程的编译方式。两者都在每次构建时读取一次,并通过
`buildData` 贯穿所有生成器。

### `custom_block_return`

```toml
custom_block_return = true
```

控制过程里的 `return` 语句如何编译。

- **关闭(默认)。** 返回值被写入一个隐藏的临时变量,调用处再把它读回来。这是纯正
  Scratch:任何工程、任何 VM、不需要扩展。
- **开启。** 含有 `return` 的过程会编译成 `procedures_return` —— **TurboWarp** 返回值扩展
  里的那个 opcode —— 调用处直接消费该值。结果是更干净的积木,而且是真正的表达式,而不是
  绕一圈变量;但**工程从此需要 TurboWarp**,原版 Scratch 跑不了。

打开它并不会让每个过程都返回值:只有真正含 `return` 语句的函数才会被标记
(`FunctionDeclaration` 会把这样的函数以 `returnType` 记进构建的 `fn.json` 暂存文件,
`ReturnStatement` 据此分支)。没有 `return` 的过程在两种设置下编译结果相同。

### `list_index_base`

```toml
list_index_base = 0
```

决定**源码里**列表下标是从 0 还是从 1 开始。

- **`1`(默认)** —— 你写的数字就是 Scratch 的项目序号。`items[1]` 是第一项。
- **`0`** —— 你写的数字是从 0 开始的偏移,和 JavaScript 一致。编译器会在每次列表访问上多
  发一个 `+ 1`,让生成的积木仍然指向正确的项:`items[0]` 会变成「`items` 的第 1 项」。

```toml
# 从 0 开始,贴合 JavaScript 习惯
list_index_base = 0
```

**任何非 0 非 1 的值**都会被告警拒绝,并按 `1` 处理。该设置由 `buildData.listIndexBase`
携带,在生成列表访问的地方被读取(`CallExpressionSub/list.ts` 与 `MemberExpression`),所以
它对列表库函数和方括号语法一致生效。注意它改变的只是**你源码里**的下标 —— 编译出来的工程
里仍然是普通的一基 Scratch 列表积木。

## 构建与调试技巧

### 重新构建编译器

每个包各自编译,且要按依赖顺序来:一个包的 `dist/*.d.ts` 必须先存在,依赖它的东西才能通过
类型检查:

```bash
for p in types core utils generator decompiler cli; do (cd $p && npx tsc -p tsconfig.json); done
```

完整说明(包括为什么在使用同级 checkout 时不要在包目录里跑 `npm install`)见
[贡献指南](/zh/contributing)。

### 检查一次构建

一次构建会同时产出解包目录与归档:

```bash
jvavscratch build ./examples/pi-spigot
# -> examples/pi-spigot/target/pi-spigot/project.json
# -> examples/pi-spigot/target/pi-spigot/pi-spigot.sb3
```

当构建「成功」但工程行为不对时,要看的就是 `project.json`。它就是真正的 Scratch 积木字典
—— 中间没有别的形态可以检查,产物里也完全没有 JavaScript。

### 对比两次构建

积木 ID 和资源 ID 每次构建都会随机,所以同样的源码构建两次,得到的 `project.json` 到处都
不一样。做 diff 之前先归一化:

- 32 位十六进制 ID(积木与资源 ID),
- 16 位十六进制 ID(变量/列表/广播 ID 以及生成的积木 ID),
- 五个字符的变量名,它们总是以两个相同的相邻项出现,例如 `["cf613","cf613"]`。

一个可用的写法:

```bash
norm() {
  sed -E 's/\b[0-9a-f]{32}\b/ID32/g; s/\b[0-9a-f]{16}\b/ID16/g; s/\["([0-9a-f]{5})","\1"\]/["VAR","VAR"]/g' "$1"
}
norm build-a/project.json > a.norm
norm build-b/project.json > b.norm
diff a.norm b.norm
```

归一化之后仍然不同的地方,才是生成积木真正发生的变化 —— 这正是归一化的意义所在。

### 构建临时目录

每次构建都会在系统临时目录下拿到自己的临时目录,结束后清理掉。这是有意为之:这样并发构建
不会互相覆盖状态,构建也永远不会写进包安装目录。如果你要加自己的运行时数据,请放进临时目录
(`@jvavscratch/core` 的 `getBuildScratchDir()` / `scratchFile()`),不要放在编译后的源码旁边。

临时目录里的暂存文件 —— `fn.json`、`classData.json`、`variables.json`、`lists.json`、
`broadcasts.json` —— 是**构建状态**而不是配置:每次构建开始时清空,随着生成器运行而累积。
在构建过程中读它们,是观察「编译器认为自己收集到了什么」的好办法。

### 近乎空白的 `project.json` 与那条孤零零的告警

如果一次构建产出的 `project.json` 几乎没有任何积木,只附一条告警,通常的原因是某处 import
generator 时绕过了注册。生成器会在 **import 包主入口**时作为副作用把自身注册进编译器的派发
表;而像 `@jvavscratch/generator/optimise` 这样的子路径 import 会加载文件却不执行那一步注册,
于是派发表是空的,每个节点类型都只留下一条告警然后被跳过。

如果你在写会 import generator 的代码,请 import `@jvavscratch/generator`,绝不要用子路径。
派发表本身见[模块 · Core](/zh/modules/core)。

### 几个一眼就能认出来的失败

有两类失败出现得足够频繁,值得立刻认出来:

- **`lib/` 必须存在。** 构建会先校验 `project.d.json` 以及 `assets/`、`src/`、`lib/` 三个
  目录。即使工程没有任何依赖,缺 `lib/` 也是硬错误 —— 空目录就够了。
- **`assets/stage/` 必须存在**,并且精灵不能叫 `stage`。舞台的资源目录不是可选项,而
  `stage` 是保留名。

## 另见

- [模块 · Generator](/zh/modules/generator) —— 优化器与各生成器所在之处。
- [模块 · Core](/zh/modules/core) —— 派发表、`buildData` 与暂存文件。
- [贡献指南](/zh/contributing) —— 构建顺序、测试,以及如何验证一次编译改动。
- [指南 · 基本使用](/zh/guide/basic-usage) —— 日常命令。
