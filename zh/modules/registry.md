---
title: Registry 模块
---

# Registry 模块

::: warning 先读这一段
本页讲的是**两件同名但毫无关系的东西**。

1. [**包管理后端**](#包管理后端) —— 一个用 Express + SQLite 写的服务,负责存放与分发编译器
   扩展包。这是**真实存在的已实现代码**:在 `registry/` 目录里,`jvavscratch add` 就是和它
   打交道。
2. [**组件注册表**](#设计草案组件注册表尚未实现) —— 一个设想中的「编译器内部组件登记处」,
   用来登记变量、函数、精灵、广播和列表,入口是 `Registry.getInstance()`。**它并不存在**,
   任何 jvavscratch 仓库里都没有它的实现。这部分只作为设计草案保留。

这两者也都不是 `core/src/util/registry.ts` —— 那是**生成器派发表**,同样真实存在,文档在
[模块 · Core](/zh/modules/core)。
:::

## 三件都叫 registry 的东西

| 名字 | 是什么 | 状态 |
|---|---|---|
| `core/src/util/registry.ts` | 编译器的**派发注册表**:语句生成器、值生成器、库函数表,按名字查表。 | 已实现 |
| `registry/`(独立本地仓库) | **包管理后端**:一个存放已发布包、供 `jvavscratch add` 下载的 HTTP 服务。 | 已实现,仅本地 |
| `Registry.getInstance()` | 设想中的**组件注册表**,管理 Scratch 工程里的各种元素(变量、精灵、广播……)。 | 设计草案 —— 未实现 |

会把它们混淆很自然:三者都在「注册」点什么。但除此之外它们没有共同点,本页余下部分把它们
分开讲述。

## 包管理后端

jvavscratch 的包是扩展编译器的 `.tar.gz` 归档(见
[模块 · Utils](/zh/modules/utils#包作者-api))。分发它们的是一个 registry
服务 —— 也就是 crates.io 的那个思路,代码里的自我描述正是这么类比的。

### 它是什么

一个规模不大的 Express 5 + SQLite 服务。它是**一个独立的仓库,只保留在本地、没有发布到
GitHub**,所以并不存在 `github:Jvavscratch/registry` 这样的依赖可装 —— 你要从一份 checkout
里直接跑它。

```
registry/
  server.js              Express 应用:中间件、静态前端、/api/v1 路由
  db.js                  SQLite 访问(sqlite3)与建表
  routes/
    crates.js            包的增删查、搜索、下载、yank、owner
    account.js           注册、登录、签发 token、资料、改密码
  middleware/
    auth.js              JWT 与 API token 校验;JWT_SECRET 守门
    rateLimit.js         凭据类接口 20 次 / 15 分钟
  public/                静态前端(纯 HTML + 内联处理函数)
  storage/
    registry.db          SQLite 数据库 —— 用户、包、版本、下载统计
    packages/            上传上来的 .tar.gz 文件
```

### 怎么跑起来

```bash
cd registry
npm install

# JWT_SECRET 是必需的 —— 未设置时服务会直接退出
JWT_SECRET=$(openssl rand -hex 32) npm start
```

`npm start` 执行的是 `node --env-file-if-exists=.env server.js`,所以更整洁的做法是把
`.env.example` 复制成 `.env` 并在里面填好密钥。`npm run dev` 是同一条命令加上 `--watch`。

| 环境变量 | 含义 |
|---|---|
| `JWT_SECRET` | **必需。** 用于签发与校验登录 JWT。缺失或为空时进程打印致命错误并 `process.exit(1)` —— 这里刻意不留内置回退值:随源码一起发布的默认密钥,等于把签名密钥公之于众。 |
| `PORT` | 监听端口,默认 `3000`。 |
| `HOST` | 监听地址,默认 `0.0.0.0`。 |
| `CORS_ORIGIN` | 逗号分隔的前端来源白名单。不设置即完全不发 CORS 头(同源请求与非浏览器客户端如 CLI 不受影响)。**绝不要设成 `*`。** |

CLI 的默认 registry 地址就是 `http://localhost:3000`(`cli/src/cli/config.ts`),所以本地
跑起这个服务之后,`jvavscratch add`、`search`、`login`、`publish` 开箱即可用。

### HTTP API

所有路由都在 `/api/v1` 下。标了 **auth** 的接口需要 `Authorization: Bearer <token>` 头。

| 方法 | 路径 | 用途 |
|---|---|---|
| `GET` | `/health` | 存活探测:`{"status":"ok","service":"jvavscratch-registry"}`。 |
| `GET` | `/stats` | 全局计数:包数、总下载量、用户数,以及最近 30 天的 `download_stats`。 |
| `GET` | `/crates` | 搜索/列表。查询参数:`q`、`page`、`per_page`(上限 100)。返回 `{ crates, meta: { total, page, per_page, total_pages } }`。 |
| `GET` | `/crates/:name` | 包的元数据,含全部版本及其 yank 状态。 |
| `GET` | `/crates/:name/downloads` | 单个包按天的下载历史。 |
| `GET` | `/crates/:name/:version` | 单个版本的元数据。 |
| `GET` | `/crates/:name/:version/files` | 已发布归档内的文件列表。 |
| `GET` | `/crates/:name/:version/file` | 归档中的单个文件,供网页端文件浏览器使用。 |
| `GET` | `/crates/:name/:version/download` | 归档本体。`jvavscratch add` 取的就是它。 |
| `PUT` | `/crates/new` | **auth.** 发布。`multipart/form-data`,归档放在 `crate` 字段(上限 50 MB),另带 `name`、`vers` 以及可选的 `description`、`readme`、`license`、`homepage`、`repository`、`keywords`。 |
| `DELETE` | `/crates/:name/:version/yank` | **auth.** 标记某个版本为 yanked:它不再被解析为目标,但不会被删除。 |
| `PUT` | `/crates/:name/:version/unyank` | **auth.** 撤销 yank。 |
| `GET` | `/crates/:name/owners` | 列出包的 owner。 |
| `PUT` | `/crates/:name/owners` | **auth.** 按用户名添加 owner。 |
| `POST` | `/account/register` | 注册账号。限流。 |
| `POST` | `/account/login` | 用用户名 + 密码换 JWT 与 API token。限流。 |
| `POST` | `/account/token` | **auth**,限流。重新生成 API token。 |
| `GET` | `/account/me` | **auth.** 当前认证的账号。 |
| `GET` | `/account/:username` | 公开资料。 |
| `POST` | `/account/change-password` | **auth.** 修改密码。 |

### 认证

同一个请求头里可以承载两种凭据,中间件按顺序尝试(`middleware/auth.js`):

- **JWT** —— 用 `JWT_SECRET` 签名,有效期 30 天,载荷为 `{ id, username }`。网页前端用它;
  `/account/login` 以 `token` 字段返回。
- **API token** —— 以 `jvs_` 为前缀,存在用户行上,`/account/login` 以 `api_token` 字段返回。
  值来自 `crypto.randomBytes(32)` 的 base64url 编码,是真正的 CSPRNG,而不是 `Math.random()`。
  CLI 用它。

中间件先验 JWT;失败则退回去用原始 token 查用户表。CLI 会把拿到的 token 存进
`~/.jvavscratch/config.json`,并以 `Bearer` 形式发送。

`POST /account/login`、`POST /account/register` 与 `POST /account/token` 位于
`middleware/rateLimit.js` 之后:按 IP 计 20 次 / 15 分钟,且统计的是**全部**请求而非只计失败
(只计失败的话,攻击者可以用「错一次、对一次」的节奏把计数器压住),也不按用户名分桶
(那会让限流器变成「这个用户名是否存在」的侧信道)。

::: warning `storage/registry.db` 里是真实的凭据
数据库里有用户的 bcrypt 密码哈希,以及**明文存储**的 API token —— 后者是有意为之,这样登录
时可以返回既有 token 而不是把它作废。该文件已被 gitignore。**不要删除它,也不要提交它。**
:::

### CLI 这一侧

所有和包有关的命令都走这个服务,而不是 GitHub:

```bash
jvavscratch search noise            # GET  /api/v1/crates?q=noise
jvavscratch add my-lib@1.2.0        # GET  .../download,再解包进 lib/
jvavscratch add my-lib              # 版本写 "*" 时,取最新的未 yank 版本
jvavscratch remove my-lib           # 删掉 lib/my-lib 与 jvavscratch.toml 里对应条目
jvavscratch update                  # 按 registry 重新解析全部依赖
jvavscratch publish                 # PUT  /api/v1/crates/new
```

账号与端点管理:

```bash
jvavscratch register                # POST /api/v1/account/register
jvavscratch login                   # POST /api/v1/account/login
jvavscratch registry get-url
jvavscratch registry set-url http://localhost:3000
jvavscratch registry set-token jvs_...
jvavscratch registry logout
```

`add` 的具体过程:按名字查包,把 `*` 解析成最新的未 yank 版本(写死版本时,该版本必须存在且
未被 yank),下载归档,剥离一层路径前缀后解包进 `lib/<名字>/`,并把解析出的版本记进
`jvavscratch.toml`。`update` 则遍历清单里的依赖,逐个问 registry 要最新的未 yank 版本,把
不一致的重装一遍。

配置存放在 `~/.jvavscratch/config.json`:

```json
{
  "registry": "http://localhost:3000",
  "api_token": "jvs_...",
  "username": "you"
}
```

::: tip 包来自 registry,不来自 GitHub
安装依赖走的是所配置 registry 服务上的 `/api/v1/crates/.../download`。CLI 里没有任何一处
从 GitHub API 取包。(你在**编译器各包自己的** `package.json` 里看到的
`github:Jvavscratch/...` 条目,是 jvavscratch 自有仓库之间的 npm 依赖,在安装时解析 —— 那是
另一套机制,和 `jvavscratch add` 无关。)
:::

## 设计草案:组件注册表(尚未实现)

::: warning 设计草案 · 尚未实现
**本节没有任何代码。** 任何 jvavscratch 仓库里都不存在 `Registry` 类、`getInstance()`
单例,或下面描述的任何方法 —— 全仓 grep 找不到实现。它被保留下来,是因为这个设计仍然是
项目一个说得通的方向,删掉会丢失当初的推理。请把它当作提案来读,**绝不要当成可以调用的
API**。

本项目里真正实现了的 registry 是上面的
[包管理后端](#包管理后端)。
:::

设想是这样:让构建过程有一个统一的、中心化的地方,记录一个工程由哪些组件构成 ——
变量(全局、局部、云)、函数、精灵、背景、广播和列表 —— 并在它前面放一套统一的查询接口,
而不是让每个生成器各自往暂存文件里记账。

### 设想的模块职责

1. 注册和管理变量(全局变量、局部变量、云变量)
2. 注册和管理函数(用户定义函数、内置函数)
3. 注册和管理精灵和背景
4. 注册和管理广播消息
5. 注册和管理列表(数组)
6. 提供统一的查询和访问接口

它也会是两个「目前靠约定而非结构来保证」的事情的天然归属:幂等规则(同名重复注册应当是更新,
而不是产生重复项),以及变量/列表/广播导出进 `project.json` 时的顺序。

### 设想的核心 API

#### `Registry.getInstance()`

获取 Registry 的单例实例。

```javascript
const { Registry } = require('jvavscratch/registry');
const registry = Registry.getInstance();
```

#### `registerVariable(name, options)`

注册变量。

- `name`:变量名称
- `options.type`:变量类型(`"number"`、`"string"`、`"boolean"`、`"array"`)
- `options.isGlobal`:是否为全局变量(默认 `false`)
- `options.isCloud`:是否为云变量(默认 `false`)
- `options.initialValue`:初始值
- `options.owner`:变量所有者(精灵或背景的 ID)

```javascript
registry.registerVariable('score', {
  type: 'number',
  isGlobal: true,
  initialValue: 0
});
```

#### `registerFunction(name, options)`

注册函数。选项:`params`、`returnType`、`implementation`、`isBuiltIn`(默认 `false`)、
`owner`。

```javascript
registry.registerFunction('movePlayer', {
  params: ['direction', 'distance'],
  implementation: (direction, distance) => {
    // 实现逻辑
  }
});
```

#### `registerSprite(name, options)`

注册精灵。选项:`id`(可选,省略时自动生成)、`x`、`y`、`size`、`direction`。

```javascript
registry.registerSprite('Cat', { x: 0, y: 0, size: 100 });
```

#### `registerBackground(name, options)`

注册背景。选项:`id`(可选)、`costumes`。

```javascript
registry.registerBackground('Stage', {
  costumes: [{ name: 'Backdrop1' }]
});
```

#### `registerBroadcast(name)`

注册广播消息。

```javascript
registry.registerBroadcast('game over');
```

#### `registerList(name, options)`

注册列表。选项:`isGlobal`(默认 `false`)、`initialItems`、`owner`。

```javascript
registry.registerList('items', {
  isGlobal: true,
  initialItems: ['apple', 'banana']
});
```

### 设想的查询 API

| 调用 | 返回 |
|---|---|
| `getVariable(name, owner?)` | 变量对象,或 `undefined`。 |
| `getFunction(name)` | 函数对象,或 `undefined`。 |
| `getSprite(idOrName)` | 精灵对象,或 `undefined`。 |
| `getBackground(idOrName)` | 背景对象,或 `undefined`。 |
| `getBroadcast(name)` | 广播对象,或 `undefined`。 |
| `getList(name, owner?)` | 列表对象,或 `undefined`。 |

```javascript
const scoreVar = registry.getVariable('score');
const catSprite = registry.getSprite('Cat');
const itemsList = registry.getList('items');
```

### 设想的管理 API

| 调用 | 效果 |
|---|---|
| `updateVariable(name, updates, owner?)` | 把 `updates` 应用到变量上;返回更新后的变量或 `undefined`。 |
| `updateSprite(idOrName, updates)` | 把 `updates` 应用到精灵上;返回更新后的精灵或 `undefined`。 |
| `removeVariable(name, owner?)` | 移除变量;返回是否移除成功。 |
| `clear()` | 清除所有已注册的组件。 |

```javascript
registry.updateVariable('score', { value: 100, type: 'number' });
registry.updateSprite('Cat', { x: 100, y: 50 });
registry.removeVariable('tempVar');
registry.clear();
```

### 设想的组件对象结构

```javascript
const variable = {
  id: 'var_1234',
  name: 'score',
  type: 'number',
  isGlobal: true,
  isCloud: false,
  value: 0,
  initialValue: 0,
  owner: null               // null 表示全局
};

const functionObj = {
  id: 'func_1234',
  name: 'movePlayer',
  params: ['direction', 'distance'],
  returnType: null,
  implementation: Function,
  isBuiltIn: false,
  owner: null
};

const sprite = {
  id: 'sprite_1234',
  name: 'Cat',
  x: 0, y: 0,
  size: 100,
  direction: 90,
  visible: true,
  rotationStyle: 'all around',
  variables: [],
  lists: [],
  scripts: []
};

const background = {
  id: 'bg_1234',
  name: 'Stage',
  currentCostumeIndex: 0,
  costumes: [],
  scripts: []
};

const broadcast = {
  id: 'broadcast_1234',
  name: 'game over'
};

const list = {
  id: 'list_1234',
  name: 'items',
  isGlobal: true,
  items: ['apple', 'banana'],
  owner: null
};
```

### 设想的事件系统

草案里还包含注册、更新、移除事件的监听,便于调用方对组件的出现作出反应:

```javascript
registry.on('variable:registered', (variable) => {
  console.log('Variable registered:', variable.name);
});

registry.on('function:updated', (func, updates) => {
  console.log('Function updated:', func.name);
});

registry.on('sprite:removed', (sprite) => {
  console.log('Sprite removed:', sprite.name);
});
```

| 事件名称 | 触发条件 | 回调参数 |
|---|---|---|
| `variable:registered` | 注册变量时 | `variable` |
| `variable:updated` | 更新变量时 | `variable`, `updates` |
| `variable:removed` | 移除变量时 | `variable` |
| `function:registered` | 注册函数时 | `function` |
| `function:updated` | 更新函数时 | `function`, `updates` |
| `function:removed` | 移除函数时 | `function` |
| `sprite:registered` | 注册精灵时 | `sprite` |
| `sprite:updated` | 更新精灵时 | `sprite`, `updates` |
| `sprite:removed` | 移除精灵时 | `sprite` |
| `background:registered` | 注册背景时 | `background` |
| `background:updated` | 更新背景时 | `background`, `updates` |
| `background:removed` | 移除背景时 | `background` |
| `broadcast:registered` | 注册广播时 | `broadcast` |
| `broadcast:removed` | 移除广播时 | `broadcast` |
| `list:registered` | 注册列表时 | `list` |
| `list:updated` | 更新列表时 | `list`, `updates` |
| `list:removed` | 移除列表时 | `list` |
| `registry:cleared` | 清除注册表时 | 无 |

### 设想的序列化

草案还勾勒了把注册表状态落盘、再读回来的做法:

```javascript
const data = registry.serialize();
await writeFile('./registry.json', JSON.stringify(data));

const loaded = JSON.parse(await readFile('./registry.json'));
registry.deserialize(loaded);
```

::: tip 构建流程目前用的是另一套办法
今天,跨生成器的状态被收集在每次构建的临时目录里的 JSON 暂存文件里(`fn.json`、
`classData.json`、`variables.json`、`lists.json`、`broadcasts.json`),构建开始时清空,
结束时合并进工程。它能用,但那是条旁路通道而不是一套接口 —— 这个设计草案想填的正是这个
缺口。
:::

### 设想的用法约定

1. **使用单例**:始终通过 `Registry.getInstance()` 获取 Registry 实例。
2. **命名规范**:为变量、函数、精灵等使用清晰、有意义的名称。
3. **适当作用域**:全局还是局部应当是一个决定,而不是默认值。
4. **用事件而不是轮询**:对注册与更新事件作出反应。
5. **有意识地序列化**:把注册表状态持久化,用于备份。

## 另见

- [模块 · Core](/zh/modules/core) —— 派发注册表,以及上面提到的暂存文件状态模型。
- [模块 · Utils](/zh/modules/utils) —— 编译器扩展包是什么、如何被装载。
- [模块 · CLI](/zh/modules/cli) —— 包相关命令全貌。
- [模块 · Runtime](/zh/modules/runtime) —— 本部分文档里的另一个设计草案。
