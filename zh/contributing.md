---
title: 贡献指南
---

# 贡献指南

jvavscratch 是一个把 JavaScript 源码提前编译成 Scratch 3.0 工程的编译器。项目以
**MPL-2.0** 许可证公开开发,欢迎各种形式的贡献 —— bug 报告、修复、新的生成器、文档。

本页讲的是让一次改动能被构建、被测试、被评审所需要知道的东西。这里没有需要签署的贡献者
许可协议(CLA),没有行为准则文件,也没有 issue / PR 模板:PR 由维护者像看任何其他改动一样
阅读。

## 代码在哪里

jvavscratch 已经从单体仓库拆成「一个包一个仓库」,都在 GitHub 的 `Jvavscratch` 组织下:

| 仓库 | 职责 | 关键文件 |
|---|---|---|
| `types` | 纯类型与零依赖工具 | `src/types/types.ts`(`BlockOpCode` 枚举、`Block`、`Mutation`、`Sprite`、`Project`、`buildData`、`generatedData`)、`src/types/scratch-type.ts`、`src/types/scratch-uuid.ts` |
| `core` | AST 派发与核心编译环境 | `src/util/blocks.ts`(`BlockCluster`)、`src/util/registry.ts`(派发表)、`src/util/evaluate.ts`、`src/util/err.ts`、`src/util/buildContext.ts`、`src/env/parseProgram.ts`、`src/env/transformSyntax.ts` |
| `utils` | 打包与包作者 API | `src/util/build-util.ts`、`src/util/fs.ts`、`src/util/lib-convert.ts` |
| `generator` | 全部代码生成器,外加优化器 | `src/generator/<NodeType>.ts`(语句)、`src/generator/types/<NodeType>.ts`(值)、`src/generator/CallExpressionSub/<lib>.ts`(库函数)、`src/optimise/**` |
| `decompiler` | `.sb3` 回到 jvavscratch 工程 | `src/decompiler/decompile-util.ts` |
| `cli` | 命令行 | `src/boot.ts`(yargs 接线)、`src/cli/projectManager.ts`(**所有命令实现都在这里**)、`src/cli/treeScan.ts`、`src/cli/config.ts`、`src/cli/registry.ts` |
| `docs` | 本站(VitePress) | — |
| `registry` | 包管理后端 | `server.js`、`routes/`、`middleware/` —— **仅本地,未在 GitHub 公开** |

### 依赖方向不可违背

```
types  ←  core  ←  utils  ←  generator  ←  cli
                     ↑            ↑
                     └── decompiler
```

箭头指向依赖的方向,**任何东西都不能反向指**。`core` 不能 import `generator`,`utils` 不能
import `cli`,以此类推。这一点靠约定而非工具保障,所以它也是评审者最先看的地方。

由此带来的、最容易让人意外的一条:因为 `core` 不能依赖 `generator`,内置生成器会在
`@jvavscratch/generator` 被导入时**自行注册**进 `core` 的派发表。任何 import generator 的
地方都必须 import 包主入口(`@jvavscratch/generator`),绝不能是子路径 —— 子路径不会执行
注册,构建随后会产出近乎空白的 `project.json`,而唯一的线索只是一条告警。

## 本地构建

每个包相互独立,各自用 `tsc` 编译:

```bash
npm run build     # tsc
npm run dev       # tsc -w
```

由于一个包的 `dist/*.d.ts` 必须先存在,依赖它的包才能通过类型检查,所以要按依赖顺序构建:

```bash
for p in types core utils generator decompiler cli; do (cd $p && npx tsc -p tsconfig.json); done
```

::: warning 开发时不要在包目录里跑 `npm install`
跨包依赖声明为 `github:Jvavscratch/<包>`,npm 会通过克隆仓库并运行其 `prepare` 脚本来解析。
而在本地开发时,每个包的 `node_modules/@jvavscratch/*` 是指向同级 checkout 的**软链接**,
第三方依赖则向上解析到容器的 `node_modules`。在包目录里跑 `npm install` 会用新克隆下来的
已发布仓库替换掉那些软链接,你在本地的改动就不再被使用。
:::

改编译器时,直接从源码跑 CLI:

```bash
node cli/dev.js build ./examples/pi-spigot
```

`cli/dev.js` 会注册 `ts-node` 并加载 `cli/src/boot.ts`,所以它无需构建就能吃到你的改动。
它同时也是让优化器那些覆盖实现得以生效的运行器 —— 见[进阶主题](/zh/advanced/index)。

## 测试

测试集很小,而且全部在 `core` 里:

```bash
cd core
npm test                                  # jest,roots: ./tests
npx jest tests/blocks.test.ts             # 单个文件
npx jest -t 'should add blocks correctly' # 按名字跑单个用例
```

三个文件 —— `blocks`、`scratch-type`、`scratch-uuid` —— 合计 **26 个用例**。jest 配置把
`@jvavscratch/*` 直接映射到同级包的 `src/`,所以不必先构建 `types` 就能跑。

::: warning 没有集成测试
`core` 的 26 个单元测试覆盖的是积木累加器、scratch-type 构造器与 UUID 生成器。没有任何测试
覆盖端到端的编译,也没有任何测试覆盖 CLI。**验证一次编译改动的办法,是编译一个真实工程并
读产物:**

```bash
node cli/dist/index.js build ./examples/pi-spigot
# -> examples/pi-spigot/target/pi-spigot/project.json
# -> examples/pi-spigot/target/pi-spigot/pi-spigot.sb3
```

`project.json` 就是真正的 Scratch 积木字典。读它;如果你改的是生成逻辑,把 `.sb3` 在
TurboWarp 里打开,确认工程行为仍然正确。一次以 0 退出的构建证明不了什么。

因为积木与资源 ID 每次构建都是随机的,对比两次构建要先归一化 —— 写法见
[对比两次构建](/zh/advanced/index#对比两次构建)。
:::

如果你要加单元测试,请放在 `core/tests/`。如果你修了一个 bug,最有价值的附带物是一个本可以
抓住它的测试。

## 改编译器

一次改动通常只涉及一个生成器。这些契约稳定且简短:

```ts
// 语句 —— generator/src/generator/<node.type>.ts
module.exports = (blockCluster: BlockCluster, node: T, buildData: buildData) => generatedData
// generatedData = { keysGenerated: string[], terminate?: boolean, err?: boolean, doNotParent?: boolean }

// 值 —— generator/src/generator/types/<node.type>.ts
module.exports = (blockCluster, node, parentId, buildData) => typeData
// typeData = { isStaticValue, blockId, block: ScratchInput | null }
```

- 生成器是 CommonJS 的 `module.exports = fn`。这也是入口文件必须用 `require()` 的原因,也是
  对生成器文件写 `import x from "…"` 会报 TS1192 的原因。
- `parseProgram` 会把返回的每组积木与上一组串起来:在最后一个 key 上写 `next`,在第一个 key
  上写 `parent`,所以 **key 必须按执行顺序返回**。
- 返回 `terminate: true` 结束链条,返回 `err: true` 静默丢弃该节点。没有注册实现的节点类型
  会告警并被跳过。
- `buildData` 携带 `listIndexBase`、`customBlockReturn`、`isAsync`、`isFunction`、
  `functionName`、`packages` 贯穿每个生成器。在发明新的传递方式之前,先看看它。

### 新增一个生成器

1. 在 `generator/src/generator/`(语句)或 `generator/src/generator/types/`(值)下加文件。
2. **重新运行 `generator/scripts/gen-index.js`。** `generator/src/index.ts` 是生成的:它
   `require()` 每一个生成器并全部注册。
3. 重新构建 `generator`;如果接口有变,再更新 `core` 与 `cli`。
4. 拿一个真实工程试它,然后如果改动对用户可见,更新[语言参考](/zh/reference/language-reference)。

### 核心数据模型简介

一切以 Scratch `project.json` 的形状为准:

- `BlockCluster` 是一个 `{[uuid]: Block}` 字典加上 `addBlocks()`。**没有任何东西以名字为键**
  —— 顺序完全由 `next`/`parent` 承载。
- `ScratchInput` 是 Scratch 表示输入槽的四元组。请用 `@jvavscratch/types` 里的
  `getScratchType`、`getSubstack`、`getMenu`、`getVariable`、`getBlockNumber`、`getColor`、
  `getBroadcast`、`getList` 构造它们,不要手写。
- `uuid()` 用的是 `crypto.randomInt`,不是 `Math.random()`。
- `isSpiky()` / `isSpikyType()` 判定哪些 opcode 与库函数返回布尔值,因为 Scratch 只允许布尔、
  其他逻辑运算或二元比较出现在布尔槽里。`core/src/env/transformSyntax.ts` 专门用来把
  Scratch 表达不了的构造改写掉(例如 `**` 改成 `math.pow`、三元改成 if/else)。

## 代码风格

- **照着你在改的那个文件写。** 这条对错误信息尤其适用:它们在 `cli/src/boot.ts`、
  `utils/src/util/build-util.ts`、`core/src/env/transformSyntax.ts`、
  `decompiler/src/decompiler/decompile-util.ts` 里是英文与中文混着的。不要去做统一,
  周围代码用哪种语言,你就用哪种。
- **`strict: false` 是有意为之**,与拆分前的根配置一致。类型错误在这个代码库里不是可靠信号,
  所以不要去「修」这个配置,也不要为了消掉报错而加断言 —— 要保证的是行为正确。
- **各包共用同一份 tsconfig 模板**:`target ES2020`,`module` 与 `moduleResolution` 为
  `Node16`,`rootDir: src`,`outDir: dist`,`declaration`、`declarationMap`、`sourceMap`,
  `strict: false`,以及**必须保留的 `"types": ["node"]`**。这里的 TypeScript 6 不会隐式拾取
  `@types/node`,并且拒绝 `moduleResolution: node10`(TS5107),还要求显式写出 `rootDir`
  (TS5011)。
- **运行时数据放进构建临时目录。** 构建期间写出的一切(暂存 JSON、克隆进来的 `lib/`、用于
  资源改名的临时工程)都走 `@jvavscratch/core` 的 `getBuildScratchDir()` / `scratchFile()`。
  唯一合理的例外是静态资源,它们用 `__dirname` 解析到包自己的 `assets/` 目录 —— 也因此必须
  一直留在 `package.json` 的 `files` 数组里。
- **绝不要编辑包里的 `utils/` 文件。** 构建期间它们会被覆盖为指向 `@jvavscratch/utils` 的
  re-export 垫片。请改 `src/`。

## 改 registry

`registry` 仓库是一个**仅本地**的 Express + SQLite 服务,用来存放编译器扩展包。它没有 GitHub
远端、也没有发布;不要推送它,也不要把它作为 `github:` 依赖加到任何地方。

```bash
cd registry
JWT_SECRET=$(openssl rand -hex 32) npm start   # 没有 JWT_SECRET 就拒绝启动
```

它的 `storage/registry.db` 里有真实用户的 bcrypt 哈希与明文 API token,这是有意 gitignore 的。
**不要删除它,也不要提交它。**

如果你改 HTTP 接口,请同步维护 CLI 客户端(`cli/src/cli/registry.ts`)与 API 路由,并让读接口
的校验和发布接口一样严格 —— 包名与版本号最后会变成文件系统路径的一部分。

## 文档

文档站是独立仓库(`docs`),用 VitePress 构建:

```bash
cd docs
npm install
npm run dev      # 本地预览
npm run build    # 静态构建到 dist/
```

部署是自动的:推送到 `main` 会触发 `.github/workflows/deploy.yml`,它构建站点并用
GitHub Actions 的 Pages 流程发布。没有 `deploy` 脚本,也不需要手动往 `gh-pages`
分支推任何东西。

站点是双语的:**英文页在站点根路径**,中文页在 `zh/` 下(例如 `/modules/utils` 与
`/zh/modules/utils`)。新增或修改一页时,请补上另一语言的对应页,并用绝对路径相互链接。

有两点需要留意:

- README 就是语言参考 —— 它是这门方言的权威来源,在文档站里位于
  `reference/language-reference.md`(以及 `zh/reference/language-reference.md`)。两者逐章
  对应是有意为之,不要丢章节。
- `.vitepress/config.mjs` 开着死链检查,`ignoreDeadLinks` 是空的。万一确实需要往里加条目,
  只加那一页,并在目标页面写好后立刻删掉该条目 —— 不要把它改成 `ignoreDeadLinks: true`,
  那会连将来所有的死链一起静默吞掉。

## 许可证

项目全部内容采用 **MPL-2.0**。许可证正文保持英文,只有它周围的说明段落有中英两份。
