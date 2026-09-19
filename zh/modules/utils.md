---
title: Utils 模块
---

# Utils 模块

`@jvavscratch/utils` 是编译器的公共工具箱。它里面装着三件彼此关系不大的东西:

1. **构建辅助**(`src/util/build-util.ts`)—— 组装造型、声音、精灵,最后打包出 `.sb3`。
2. **一层小巧的同步文件系统封装**(`src/util/fs.ts`)—— CLI 脚手架工程和包时用的
   `DirectoryBuffer` / `FileBuffer`。
3. **`src/util/lib-convert.ts`** —— **编译器扩展包**作者所面对的 API。想给 jvavscratch
   增加一个库函数、一个全局量,或者整体替换某个 Babel 节点类型的编译方式,你要 import
   的就是这个文件。

前两者属于内部设施:它们的存在只是为了让 CLI 与构建流水线有个共用的落脚点。第三者是
**公开且有文档的接口** —— 完整的端到端示例见语言参考里的
[包规范](/zh/reference/language-reference#package-specification)。

## 包结构

```
utils/
  src/
    index.ts                重新导出 util/build-util、util/fs 与 util/lib-convert
    util/
      build-util.ts         .sb3 打包、造型/声音/精灵组装
      fs.ts                 DirectoryBuffer / FileBuffer / readFile
      lib-convert.ts        包作者 API
      index.ts
  assets/
    background.svg          舞台的兜底背景
    default.svg             精灵的兜底造型
  dist/                     tsc 产物 —— 使用方 require 的就是这里
```

包对外暴露两个入口,根入口重新导出全部内容:

```json
"exports": {
  ".":     { "types": "./dist/index.d.ts",       "require": "./dist/index.js"       },
  "./util": { "types": "./dist/util/index.d.ts", "require": "./dist/util/index.js" }
}
```

::: tip 依赖方向是单向的
`utils` 位于依赖链的中间(`types ← core ← utils ← generator ← decompiler ← cli`)。
它可以 import `@jvavscratch/core` 与 `@jvavscratch/types`,但永远不能 import
`generator` 或 `cli`。所有包还都会用到 `adm-zip`(生成 `.sb3`)与 `@babel/types`
(`lib-convert` 签名里的 AST 类型)。
:::

### 这个包里**没有**的东西

这里没有 `string`、`path`、`data`、`logger`、`validator`、`hash` 之类的工具子模块 ——
`@jvavscratch/utils` 从来就没有过。需要这类功能的代码直接用 Node 的 `path`、`fs`、
`crypto`,编译器自身的字符串处理则由用得上它的生成器就地完成。你在别处看到的关于
`jvavscratch/utils/string`、`jvavscratch/utils/logger` 之类的描述,说的都是不存在的 API。

## `build-util.ts` —— 产出 `.sb3`

这个模块负责把编译器内存中的 `project.json` 与一堆资源文件,变成 Scratch 打得开的
东西。

### `createCostume(options?)`

```ts
function createCostume({
    name = "default",
    path = "",
    bitmapResolution = 2,
    rotationCenterX = 0,
    rotationCenterY = 0,
} = {}): Costume
```

把 `path` 处的文件复制进本次构建的临时目录,改名为一个全新的随机资源 ID(保留原扩展名),
然后返回一条 Scratch `Costume` 记录,其 `assetId` / `md5ext` / `dataFormat` 指向那份
副本。`dataFormat` 由文件扩展名推出,所以 `.png` 会变成 `png`,`.svg` 会变成 `svg`。

「先复制」这一步是构建可重复的关键:原始资源文件只会被读取,永远不会被就地改名。

### `createSound(options?)`

```ts
function createSound({ name = "default", path = "" } = {}): Sound
```

对音频文件做同样的处理 —— 复制进临时目录、改名为随机资源 ID、返回 `Sound` 记录。
这里没有 `bitmapResolution`,并且在解析出扩展名之前默认 `dataFormat` 为 `mp3`。

### `createSprite(options?)`

```ts
function createSprite({
    isStage = false,
    name = "default",
    variables = {}, lists = {}, broadcasts = {},
    blocks = {}, comments = {},
    currentCostume = 0, costumes = [], sounds = [],
    volume = 100, visible = true,
    x = 0, y = 0, size = 100, direction = 90,
    draggable = false, rotationStyle = "all around", layerOrder = 0,
}: Partial<Sprite> = {}): Sprite
```

用构建过程中收集到的东西,补全出一条完整的 Scratch 精灵记录。有两点行为值得知道:

- **没有造型的精灵会拿到兜底造型。** 舞台拿到 `assets/background.svg`,其余精灵拿到
  `assets/default.svg`。这两个文件随包发布在包自己的 `assets/` 目录里 —— 这是唯一一处
  「运行时数据合理地挨着代码、而不放进构建临时目录」的地方,也正是 `package.json` 的
  `files` 数组必须一直列出 `assets` 的原因。
- **舞台永远叫 `Stage`。** 传入 `isStage: true` 会覆盖你给的 `name`,因为 Scratch VM
  找的就是这个字面量字符串。

### `zipFolderToSb3(folderPath)`

```ts
function zipFolderToSb3(folderPath: string): void
```

递归地把 `folderPath` 下的每个文件加进一个新归档,并写成该目录的同级文件 ——
`<dir>/<目录名>.sb3`。Scratch 工程本来就是「顶层放 `project.json` 与资源的 ZIP」,所以
实现里没有任何 Scratch 特有的东西:用的是 `adm-zip`,也没有做什么压缩上的花样。

### 目录辅助函数

其余导出都是同步的目录工具,构建流水线和 CLI 的脚手架命令都在用:

| 函数 | 行为 |
|---|---|
| `cloneFolderSync(source, destination)` | 递归复制整个目录树。`source` 不是目录时抛错。 |
| `copyAllSync(pathA, pathB)` | 递归把 `pathA` 的**内容**复制进 `pathB`,必要时创建 `pathB`。 |
| `deleteAllContents(dirPath)` | 递归删除目录**内部**的一切,目录本身保留。 |
| `fillDefaults(a, b)` | 把 `b` 中 `a` 缺失(或为 `undefined`)的键补上;普通对象递归,数组不递归。返回 `a`。 |

`deleteAllContents` 是 `target/` 具备幂等性的原因:每次构建都先把它清空,所以上一次遗留、
这一次不再产出的 `.sb3` 不会活下来。

## `fs.ts` —— 缓冲区那一层

`fs.ts` 自称「一个更好的 `fs` 模块」,就它唯一的工作而言这话不假:它让脚手架代码可以把
一棵目录树声明成数据,再一次调用落地。

```ts
class FileBuffer {
    Name: string;
    Content: string;
    Type: "File";

    constructor(Name?: string, Content?: string);
    ChangeExtension(Ext: string): FileBuffer;
    Instantiate(At: string): string;
}

class DirectoryBuffer {
    Name: string;
    Content: (FileBuffer | DirectoryBuffer)[];
    Type: "Directory";

    constructor(Name?: string);
    Append(File: (FileBuffer | DirectoryBuffer)[]): DirectoryBuffer;
    Instantiate(At: string): string;
}

function readFile(path: string): string;
```

真正干活的是 `Instantiate(At)`。`FileBuffer` 把 `Content` 写到 `join(At, Name)` 并返回
写入路径;`DirectoryBuffer` 在目标目录已存在时先删除它,再创建,然后逐个实例化子节点,
最后返回目录路径。

对生成器而言,「存在就先删再建」是有意为之 —— 这让
`DirectoryBuffer(...).Instantiate(...)` 可以安全地覆盖已有的目录树;但它也意味着它会
毫不犹豫地清空你指向的目录。请只对输出目录用它,不要对源码树用它。

最好的例子就是包脚手架(`jvavscratch lib my-package`),它本质上只是:

```ts
new DirectoryBuffer("src").Append([
    new FileBuffer("index.ts", "module.exports = {};")
]).Instantiate(in_folder);

new DirectoryBuffer("utils").Append([
    new FileBuffer("internal.ts", readFileSync(/* assets/internal.txt */).toString()),
    new FileBuffer("library.ts",  readFileSync(/* assets/library.txt  */).toString()),
]).Instantiate(in_folder);
```

`readFile(path)` 则是全程在用的同步伴生函数:读一个文件,拿它的 UTF-8 文本。

## 包作者 API

本节全部面向**编译器扩展包**:一种被安装进工程 `lib/` 目录的 `.tar.gz`,其
`src/index.ts` 会在构建期**被编译器 `require()`**。也就是说,包扩展的是**编译器本身**,
它不会跑在被编译出来的 Scratch 工程里。

`src/util/lib-convert.ts` 重新导出了写签名需要的名字(`BlockOpCode`、`buildData`、
`typeData`、`Block`、`createBlock`,以及 `BlockClustering` 接口),并额外提供下面五个
构造函数 —— 外加从 core 重新导出的 `createBlock`。

### `createFunction(data)` —— 产出堆叠积木的库函数

```ts
function createFunction<t = void>(data: {
    parseArguments?: boolean,        // 默认 false
    minimumArguments?: number,       // 默认 0
    maximumArguments?: number,       // 默认 Number.MAX_SAFE_INTEGER
    argTypes?: string[],             // 默认 [] —— 填 Babel 节点类型,如 "NumericLiteral"
    body: (
        callExpression: CallExpression,
        blockCluster: BlockClustering,
        parentId: string,
        buildData: buildData,
        parsedArguments?: typeData[],
    ) => t,
}): any
```

`createFunction` 返回的就是编译器在源码里遇到 `library.fn(...)` 时会调用的那个函数。
在进入你的 `body` 之前,包装层会先做完这些琐事:

- **参数个数会被检查。** 少于 `minimumArguments` 报 `Not enough arguments`,多于
  `maximumArguments` 报 `Too many arguments`。两者都是 `JvavscratchError`,因此会带上
  调用处的源码位置并中断构建。
- **参数类型会被检查** —— 但比的是每个参数的 **Babel 节点类型**,不是运行期类型。
  `argTypes: ["NumericLiteral"]` 的意思是「第 1 个参数在源码里必须是数字字面量」,不匹配
  会报 `Expected 'NumericLiteral' for argument '1', got: 'Identifier'`。数组里没写的位置
  (即 `argTypes[i]` 为 undefined)不检查,超出数组的额外参数也不检查。
- **只有当 `parseArguments` 为 true 时才会求值参数。** 每个参数会过一遍 `evaluate()`,
  并按调用顺序作为 `parsedArguments` 交给 `body`。默认 `parseArguments` 为 false,此时
  `parsedArguments` 是空数组,body 需要自己处理 `callExpression.arguments`(通常是对想
  要的参数调用 `evaluate()`)。
- `parentId` 是你的积木应当挂到的积木 ID;`buildData` 携带本次构建的上下文
  (`listIndexBase`、`customBlockReturn`、`isFunction`、`functionName`、`packages` 等)。

### `createValueFunction(data)` —— 产出报告器的库函数

```ts
const createValueFunction = createFunction;
```

并不存在第二份实现:`createValueFunction` **就是** `createFunction`。两个名字的存在,
一是为了表达意图,二是为了承载不同的返回类型(值函数的 `body` 返回 `typeData` 而不是
`void`)—— 这一点 TypeScript 无法通过一个 `any` 类型的别名表达出来。想让函数出现在
表达式右侧就用 `createValueFunction`,想让它作为语句就用 `createFunction`。

### `createLibrary(name, functions)`

```ts
function createLibrary(name: string, functions: any): { name: string, functions: any }
```

把一张函数表包在一个命名空间之下。一个名为 `example`、成员为 `tau` 的库,就是让源码里
的 `example.tau()` 能被解析到的东西。块库导出到 `libraries.blockLibraries`,值库导出到
`libraries.valueLibraries` —— 调用被当作语句使用时编译器查块表,被当作值使用时查值表;
所以一个两种位置都要能用的函数,需要在两张表里都注册。

### `createGlobal(name, body)`

```ts
function createGlobal(name: string, body: any): { name: string, functions: any }
```

声明一个裸标识符,编译器会把它解析成一个不需要调用语法的值。`Identifier` 值生成器会
遍历 `buildData.packages.globals`,找到第一个 `name` 匹配的条目,然后把第二个参数当作
`body(blockCluster)` 调用 —— 所以尽管源码里这个形参叫 `functions`、返回对象里也是以
这个名字为键,你传进去的其实是一个返回 `typeData` 的函数。

```ts
module.exports = {
    globals: [
        createGlobal("tau", (() => {
            return {
                block: getScratchType(ScratchType.number, Math.PI * 2),
                blockId: null,
                isStaticValue: true,
            };
        }))
    ]
};
```

有了它,源码里就可以写不带括号的 `let foo = tau;`。编译器自己也用全局量把过程参数注入
作用域,所以每一个带参数的函数都会走这条路径。

### `createImplementation(name, body)`

```ts
function createImplementation(name: string, body: any): { name: string, body: any }
```

把一个 **Babel 节点类型字符串**和一个替换用的生成器配对。导出到 `statement_implements`
即可接管 `IfStatement` 之类的语句节点,导出到 `type_implements` 即可接管
`NumericLiteral` 之类的值节点。

第三方实现**先于**内置实现被查表,所以这是真正意义上的覆盖:一个针对 `NumericLiteral`
的实现,会替换掉整次构建里对数字字面量的内置处理。body 的签名随节点种类而定 ——
语句拿到 `(blockCluster, node, buildData)` 并需返回 `generatedData`;值拿到
`(blockCluster, node, parentId, buildData)` 并需返回 `typeData`。

### `createBlock` 与 scratch-type 辅助函数

`createBlock(...)` 是从 `@jvavscratch/core` 重新导出的(也可以直接从 core 取)。它按默认值
造一块 Scratch 积木:

```ts
blockCluster.addBlocks({
    [id]: createBlock({ opcode: BlockOpCode.LooksHide })
});
```

每块积木都需要一个由你指定的 ID;输出里没有任何东西以名字为键,顺序完全由 `next` /
`parent` 承载。至于输入槽,请使用 `@jvavscratch/types` 里的构造器
(`getScratchType`、`getSubstack`、`getMenu`、`getVariable`、`getBlockNumber`、`getColor`、
`getBroadcast`、`getList`),不要手写那个四元组。在包内部,它们从生成的
`../utils/internal` 垫片导入。

::: warning 积木必须按执行顺序返回
`parseProgram` 会把一个生成器返回的积木 ID 串成一条链:在最后一个 key 上写 `next`,在
第一个 key 上写 `parent`。请按它们应当执行的顺序返回;链条到头时返回 `terminate: true`。
:::

## 一个完整的包

把上面的东西拼起来,一个同时提供 `example.tau()` 与全局量 `tau` 的包长这样(含
`jvavscratch.toml` 与发布步骤的完整走查见
[包规范](/zh/reference/language-reference#package-specification)):

`src/index.ts`

```ts
import { CallExpression } from "@babel/types";
import { BlockClustering, buildData, createGlobal, createLibrary, createValueFunction } from "../utils/library";
import { getScratchType, ScratchType } from "../utils/internal";

module.exports = {
    libraries: {
        valueLibraries: [
            createLibrary("example", {
                tau: createValueFunction({
                    body: (callExpression: CallExpression, blockCluster: BlockClustering, parentId: string, buildData: buildData) => ({
                        block: getScratchType(ScratchType.number, Math.PI * 2),
                        blockId: null,
                        isStaticValue: true,
                    })
                })
            })
        ]
    },

    globals: [
        createGlobal("tau", (() => ({
            block: getScratchType(ScratchType.number, Math.PI * 2),
            blockId: null,
            isStaticValue: true,
        })))
    ]
};
```

注意 `tau` 是一个**静态**值:`isStaticValue: true` 配 `blockId: null` 告诉编译器这个值已经
是字面量,不需要积木引用。这是最廉价的一类扩展 —— 一块积木都不会生成。

## 构建期如何装载一个包

构建一个工程时,`lib/` 下的每个目录都会先被校验(必须含 `src/index.ts` 与 `utils/`
目录),然后被克隆进本次构建的临时目录,其 `utils/library.ts` 与 `utils/internal.ts` 会被
**覆盖**为指向 `lib-convert` 与 `scratch-type` 的 re-export 垫片。接着对复制过去的
`src/index.ts` 调用 `require()`,返回的对象合并进本次构建的配置:

```ts
{ libraries: { blockLibraries, valueLibraries }, globals, statement_implements, type_implements }
```

由此得到两个推论:

- **绝不要编辑包里的 `utils/` 文件。** 它们每次构建都会被重新生成,你在那里的任何改动都会
  被丢弃。请改 `src/`,并按脚手架那样从 `../utils/library` 导入 API。
- **包是编译器代码,不是程序代码。** 它在构建期以编译器的权限运行在 Node 里。如果你希望
  某件事发生在 *Scratch* 里,它就必须以积木的形式到达那里。

## 另见

- [语言参考 · 包规范](/zh/reference/language-reference#package-specification) —— 从头到尾的完整示例。
- [模块 · Core](/zh/modules/core) —— `BlockCluster`、`evaluate`,以及包所注册进的派发表。
- [模块 · CLI](/zh/modules/cli) —— `jvavscratch lib`、`publish` 等包相关命令。
- [模块 · Registry](/zh/modules/registry) —— `jvavscratch add` 从哪里取包。
