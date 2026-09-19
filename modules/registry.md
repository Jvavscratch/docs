---
title: Registry module
---

# Registry module

::: warning Read this first
This page documents **two unrelated things that both happen to be called "registry"**.

1. The **[package registry backend](#the-package-registry-backend)** — an Express + SQLite
   service that stores and serves compiler-extension packages. This is **real, implemented
   code**: it lives in the `registry/` directory, and `jvavscratch add` talks to it.
2. The **[component registry](#design-draft-the-component-registry-not-implemented)** — a
   proposed in-compiler registry of variables, functions, sprites, broadcasts and lists,
   reached through `Registry.getInstance()`. **This does not exist.** No file in any
   jvavscratch repository implements it. It is kept here as a design draft only.

Neither of these is the same thing as `core/src/util/registry.ts`, the *generator dispatch
table* — that one is real too, and is documented under [Modules · Core](/modules/core).
:::

## Three things called "registry"

| Name | What it is | Status |
|---|---|---|
| `core/src/util/registry.ts` | The compiler's **dispatch registry**: statement generators, value generators and library tables, looked up by name. | Implemented |
| `registry/` (separate local repository) | The **package registry backend**: an HTTP service that stores published packages and serves them to `jvavscratch add`. | Implemented, local-only |
| `Registry.getInstance()` | A hypothetical **component registry** for Scratch project elements (variables, sprites, broadcasts, …). | Design draft — not implemented |

The confusion is understandable: all three "register" something. But they have nothing else
in common, and the rest of this page treats them separately.

## The package registry backend

jvavscratch packages are `.tar.gz` archives that extend the compiler (see
[Modules · Utils](/modules/utils#the-package-author-api)). They are
distributed by a registry service — the same idea as crates.io, which the code's own
description compares itself to.

### What it is

A small Express 5 + SQLite service. It is a **separate repository, kept local and not
published on GitHub**, so there is no `github:Jvavscratch/registry` dependency to install —
you run it from a checkout.

```
registry/
  server.js              Express app: middleware, static frontend, /api/v1 routes
  db.js                  SQLite access (sqlite3), schema creation
  routes/
    crates.js            package CRUD, search, download, yank, owners
    account.js           register, login, token, profile, change-password
  middleware/
    auth.js              JWT + API-token verification; JWT_SECRET guard
    rateLimit.js         20 attempts / 15 minutes on credential endpoints
  public/                static frontend (plain HTML + inline handlers)
  storage/
    registry.db          SQLite database — users, crates, versions, download stats
    packages/            the uploaded .tar.gz files
```

### Running it

```bash
cd registry
npm install

# JWT_SECRET is required — the service exits immediately without it
JWT_SECRET=$(openssl rand -hex 32) npm start
```

`npm start` runs `node --env-file-if-exists=.env server.js`, so the tidier route is to copy
`.env.example` to `.env` and fill in a secret there. `npm run dev` is the same command with
`--watch`.

| Environment variable | Meaning |
|---|---|
| `JWT_SECRET` | **Required.** Signs and verifies login JWTs. When it is missing or blank the process prints a fatal error and calls `process.exit(1)` — there is deliberately no built-in fallback, because a default shipped in the source is a published signing key. |
| `PORT` | Listen port. Default `3000`. |
| `HOST` | Listen address. Default `0.0.0.0`. |
| `CORS_ORIGIN` | Comma-separated allowlist of frontend origins. Unset means no CORS headers at all (same-origin requests and non-browser clients such as the CLI are unaffected). Never set it to `*`. |

The CLI's default registry URL is `http://localhost:3000`
(`cli/src/cli/config.ts`), so a locally running server is what `jvavscratch add`,
`search`, `login` and `publish` reach out of the box.

### The HTTP API

All routes are under `/api/v1`. Endpoints marked **auth** require an
`Authorization: Bearer <token>` header.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness probe: `{"status":"ok","service":"jvavscratch-registry"}`. |
| `GET` | `/stats` | Global counters: packages, total downloads, users, and the last 30 days of `download_stats`. |
| `GET` | `/crates` | Search/list. Query parameters: `q`, `page`, `per_page` (capped at 100). Returns `{ crates, meta: { total, page, per_page, total_pages } }`. |
| `GET` | `/crates/:name` | Package metadata, including every version and its yank state. |
| `GET` | `/crates/:name/downloads` | Per-day download history for a package. |
| `GET` | `/crates/:name/:version` | One version's metadata. |
| `GET` | `/crates/:name/:version/files` | File listing inside the published archive. |
| `GET` | `/crates/:name/:version/file` | A single file from the archive, for the web UI's file browser. |
| `GET` | `/crates/:name/:version/download` | The tarball itself. This is what `jvavscratch add` fetches. |
| `PUT` | `/crates/new` | **auth.** Publish. `multipart/form-data` with the tarball in the `crate` field (50 MB limit) plus `name`, `vers` and optional `description`, `readme`, `license`, `homepage`, `repository`, `keywords`. |
| `DELETE` | `/crates/:name/:version/yank` | **auth.** Mark a version yanked, so it stops being a resolution target without being deleted. |
| `PUT` | `/crates/:name/:version/unyank` | **auth.** Reverse a yank. |
| `GET` | `/crates/:name/owners` | List a package's owners. |
| `PUT` | `/crates/:name/owners` | **auth.** Add an owner by username. |
| `POST` | `/account/register` | Create an account. Rate limited. |
| `POST` | `/account/login` | Exchange username + password for a JWT and an API token. Rate limited. |
| `POST` | `/account/token` | **auth**, rate limited. Regenerate the API token. |
| `GET` | `/account/me` | **auth.** The authenticated account. |
| `GET` | `/account/:username` | Public profile. |
| `POST` | `/account/change-password` | **auth.** Change the password. |

### Authentication

Two credential shapes are accepted by the same header, and the middleware tries them in
order (`middleware/auth.js`):

- **JWTs** — signed with `JWT_SECRET`, valid for 30 days, carrying `{ id, username }`. Used by
  the web frontend; returned by `/account/login` as `token`.
- **API tokens** — prefixed `jvs_`, stored on the user row, returned by `/account/login` as
  `api_token`. The value is `crypto.randomBytes(32)` in base64url, i.e. a real CSPRNG rather
  than `Math.random()`. Used by the CLI.

The middleware verifies the JWT first; if that fails it falls back to a lookup of the raw
token against the users table. The CLI stores whichever token it received in
`~/.jvavscratch/config.json` and sends it as `Bearer`.

`POST /account/login`, `POST /account/register` and `POST /account/token` sit behind
`middleware/rateLimit.js`: 20 requests per 15 minutes per IP, counting *all* requests rather
than only failures, and not keyed by username (which would leak whether a username exists).

::: warning `storage/registry.db` holds real credentials
The database contains users' bcrypt password hashes and their API tokens in plaintext — the
latter on purpose, so that logging in can return an existing token instead of invalidating
it. The file is gitignored. Do not delete it, and do not commit it.
:::

### The CLI side

Every command that touches packages goes through this service, not through GitHub:

```bash
jvavscratch search noise            # GET  /api/v1/crates?q=noise
jvavscratch add my-lib@1.2.0        # GET  .../download, then untar into lib/
jvavscratch add my-lib              # ...and with "*" as the version, the newest unyanked one
jvavscratch remove my-lib           # delete lib/my-lib and its jvavscratch.toml entry
jvavscratch update                  # re-resolve every dependency against the registry
jvavscratch publish                 # PUT  /api/v1/crates/new
```

Account and endpoint management:

```bash
jvavscratch register                # POST /api/v1/account/register
jvavscratch login                   # POST /api/v1/account/login
jvavscratch registry get-url
jvavscratch registry set-url http://localhost:3000
jvavscratch registry set-token jvs_...
jvavscratch registry logout
```

What `add` does in detail: it looks up the crate by name, resolves `*` to the newest version
that is not yanked (an explicit version must exist and not be yanked), downloads the tarball,
extracts it into `lib/<name>/` with one path component stripped, and records the resolved
version in `jvavscratch.toml`. `update` walks the dependencies in the manifest, asks the
registry for each one's newest unyanked version, and reinstalls the ones that differ.

Configuration lives in `~/.jvavscratch/config.json`:

```json
{
  "registry": "http://localhost:3000",
  "api_token": "jvs_...",
  "username": "you"
}
```

::: tip Packages come from the registry, not from GitHub
Installing a dependency uses `/api/v1/crates/.../download` on the configured registry
server. Nothing in the CLI fetches packages from the GitHub API. (The `github:Jvavscratch/…`
entries you will see in the *compiler packages'* own `package.json` files are npm
dependencies between jvavscratch's own repositories, resolved at install time — a different
mechanism that has nothing to do with `jvavscratch add`.)
:::

## Design draft: the component registry (not implemented)

::: warning Design draft — not implemented
**Nothing in this section exists in code.** No jvavscratch repository contains a `Registry`
class, a `getInstance()` singleton, or any of the methods described below — a grep across
the whole project finds no implementation. It is preserved because the design is still a
plausible direction for the project, and because removing it would lose the reasoning. Read
it as a proposal, never as an API you can call.

The implemented registry in this project is the [package registry
backend](#the-package-registry-backend) above.
:::

The idea: a single, central place where a build records the components a project is made of —
variables (global, local and cloud), functions, sprites, backdrops, broadcasts and lists —
with one query interface in front of it, instead of every generator keeping its own
bookkeeping in a scratchpad file.

### Proposed module responsibilities

1. Register and manage variables (global, local, cloud).
2. Register and manage functions (user-defined and built-in).
3. Register and manage sprites and backdrops.
4. Register and manage broadcast messages.
5. Register and manage lists.
6. Provide a single query and access interface over all of the above.

It would also be the natural home for two things the current build does by convention rather
than by structure: the idempotence rules (registering the same name twice should be an
update, not a duplicate) and the export order of variables, lists and broadcasts into
`project.json`.

### Proposed core API

#### `Registry.getInstance()`

Returns the singleton registry instance.

```javascript
const { Registry } = require('jvavscratch/registry');
const registry = Registry.getInstance();
```

#### `registerVariable(name, options)`

Registers a variable.

- `name` — variable name.
- `options.type` — `"number"`, `"string"`, `"boolean"` or `"array"`.
- `options.isGlobal` — default `false`.
- `options.isCloud` — default `false`.
- `options.initialValue` — initial value.
- `options.owner` — the sprite or stage that owns it.

```javascript
registry.registerVariable('score', {
  type: 'number',
  isGlobal: true,
  initialValue: 0
});
```

#### `registerFunction(name, options)`

Registers a function. Options: `params`, `returnType`, `implementation`, `isBuiltIn`
(default `false`), `owner`.

```javascript
registry.registerFunction('movePlayer', {
  params: ['direction', 'distance'],
  implementation: (direction, distance) => {
    // implementation
  }
});
```

#### `registerSprite(name, options)`

Registers a sprite. Options: `id` (optional, generated when omitted), `x`, `y`, `size`,
`direction`.

```javascript
registry.registerSprite('Cat', { x: 0, y: 0, size: 100 });
```

#### `registerBackground(name, options)`

Registers a backdrop. Options: `id` (optional), `costumes`.

```javascript
registry.registerBackground('Stage', {
  costumes: [{ name: 'Backdrop1' }]
});
```

#### `registerBroadcast(name)`

Registers a broadcast message.

```javascript
registry.registerBroadcast('game over');
```

#### `registerList(name, options)`

Registers a list. Options: `isGlobal` (default `false`), `initialItems`, `owner`.

```javascript
registry.registerList('items', {
  isGlobal: true,
  initialItems: ['apple', 'banana']
});
```

### Proposed query API

| Call | Returns |
|---|---|
| `getVariable(name, owner?)` | The variable, or `undefined`. |
| `getFunction(name)` | The function, or `undefined`. |
| `getSprite(idOrName)` | The sprite, or `undefined`. |
| `getBackground(idOrName)` | The backdrop, or `undefined`. |
| `getBroadcast(name)` | The broadcast, or `undefined`. |
| `getList(name, owner?)` | The list, or `undefined`. |

```javascript
const scoreVar = registry.getVariable('score');
const catSprite = registry.getSprite('Cat');
const itemsList = registry.getList('items');
```

### Proposed management API

| Call | Effect |
|---|---|
| `updateVariable(name, updates, owner?)` | Apply `updates` to a variable; returns the updated variable or `undefined`. |
| `updateSprite(idOrName, updates)` | Apply `updates` to a sprite; returns the updated sprite or `undefined`. |
| `removeVariable(name, owner?)` | Remove a variable; returns whether it was removed. |
| `clear()` | Drop every registered component. |

```javascript
registry.updateVariable('score', { value: 100, type: 'number' });
registry.updateSprite('Cat', { x: 100, y: 50 });
registry.removeVariable('tempVar');
registry.clear();
```

### Proposed component shapes

```javascript
const variable = {
  id: 'var_1234',
  name: 'score',
  type: 'number',
  isGlobal: true,
  isCloud: false,
  value: 0,
  initialValue: 0,
  owner: null            // null means global
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

### Proposed event system

The draft includes listeners for registration, update and removal, so that a caller can react
to components appearing:

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

| Event | Fired when | Arguments |
|---|---|---|
| `variable:registered` | A variable is registered | `variable` |
| `variable:updated` | A variable is updated | `variable`, `updates` |
| `variable:removed` | A variable is removed | `variable` |
| `function:registered` | A function is registered | `function` |
| `function:updated` | A function is updated | `function`, `updates` |
| `function:removed` | A function is removed | `function` |
| `sprite:registered` | A sprite is registered | `sprite` |
| `sprite:updated` | A sprite is updated | `sprite`, `updates` |
| `sprite:removed` | A sprite is removed | `sprite` |
| `background:registered` | A backdrop is registered | `background` |
| `background:updated` | A backdrop is updated | `background`, `updates` |
| `background:removed` | A backdrop is removed | `background` |
| `broadcast:registered` | A broadcast is registered | `broadcast` |
| `broadcast:removed` | A broadcast is removed | `broadcast` |
| `list:registered` | A list is registered | `list` |
| `list:updated` | A list is updated | `list`, `updates` |
| `list:removed` | A list is removed | `list` |
| `registry:cleared` | The registry is cleared | none |

### Proposed serialisation

The draft also sketches persisting registry state to disk and reading it back:

```javascript
const data = registry.serialize();
await writeFile('./registry.json', JSON.stringify(data));

const loaded = JSON.parse(await readFile('./registry.json'));
registry.deserialize(loaded);
```

::: tip The build already solves this problem differently
Today, cross-generator state is collected in JSON scratchpads inside the per-build temp
directory (`fn.json`, `classData.json`, `variables.json`, `lists.json`,
`broadcasts.json`), emptied at the start of each build and merged into the project at the
end. It works, but it is a side channel rather than an interface — which is exactly the gap
this design draft was written to close.
:::

### Proposed best practices

1. **Use the singleton.** Always go through `Registry.getInstance()`.
2. **Name things clearly.** Variables, functions and sprites should have meaningful names.
3. **Pick the right scope.** Global versus local should be a decision, not a default.
4. **Prefer events to polling.** React to registration and update events.
5. **Serialise for backups.** Persist registry state deliberately.

## See also

- [Modules · Core](/modules/core) — the dispatch registry, and the scratchpad state model described above.
- [Modules · Utils](/modules/utils) — what a compiler-extension package is and how it is loaded.
- [Modules · CLI](/modules/cli) — the package commands in full.
- [Modules · Runtime](/modules/runtime) — the other design draft in this section of the docs.
