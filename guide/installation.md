---
title: Installation
---

# Installation

jvavscratch is a compiler, not a service. It ships as a command line tool (`jvavscratch`) that you run inside a project directory, so "installing" it means getting that CLI onto your `PATH` together with the small family of packages it is built from.

## Requirements

- **Node.js 16 or newer.** The CLI, the compiler and the generated projects are all plain Node/CommonJS; nothing else is required.
- **npm** (bundled with Node) for fetching the packages the CLI depends on.
- **Git** if you are installing from source, which is currently the only supported way (see below).
- **TurboWarp** if you intend to run the projects you build. The compiler emits metadata and, optionally, blocks aimed at TurboWarp; `jvavscratch run` launches it directly on Windows.

Check your Node version before you start:

```bash
node -v
npm -v
```

Anything below `v16` will fail at install time or at runtime.

## The CLI is not published to npm

`npm install -g jvavscratch-cli` does **not** work — no such package exists on the public registry. jvavscratch is distributed as source on GitHub, and the organization publishes one repository per package:

```
Jvavscratch/types        leaf package: opcode enum, project types, random IDs
Jvavscratch/core         BlockCluster, dispatch registry, build context, parseProgram
Jvavscratch/utils        project/sprite/asset assembly, fs helpers, package-authoring API
Jvavscratch/generator    the block generators and the optimiser
Jvavscratch/decompiler   .sb3 → jvavscratch project
Jvavscratch/cli          the `jvavscratch` command
Jvavscratch/docs         this documentation site
```

Dependencies run in one direction only, `types ← core ← utils ← generator/decompiler ← cli`, and each package is consumed as `github:Jvavscratch/<pkg>`. That matters when installing: cloning `cli` and running `npm install` will pull `core`, `utils`, `generator`, `decompiler` and `types` from GitHub and build each of them through its `prepare` script.

## Installing the CLI from source

```bash
git clone https://github.com/Jvavscratch/cli
cd cli
npm install
npm run build
npm link
```

`npm link` puts a `jvavscratch` shim on your global `PATH` that points at the checkout, so later edits to the CLI are picked up without reinstalling. If you would rather install a copy, use `npm install -g .` from the same directory.

Verify:

```bash
jvavscratch --version
```

That prints the version and exits. `jvavscratch --help` lists every command.

## Building the whole toolchain by hand

If you want all six packages side by side — for example to work on the compiler itself — clone them as siblings and build **in dependency order**, because a package's `dist/*.d.ts` must exist before anything that depends on it can typecheck:

```bash
for p in types core utils generator decompiler cli; do (cd $p && npx tsc -p tsconfig.json); done
```

All packages share one `tsconfig` template: ES2020 target, `Node16` module resolution, `rootDir: src`, `outDir: dist`, and declaration maps. One detail is easy to trip over: the template pins `"types": ["node"]`. Without it, TypeScript 6 does not pick up `@types/node` implicitly in this layout, and every `fs`/`os`/`process` import starts failing to resolve.

While developing across sibling checkouts, `node_modules/@jvavscratch/*` inside each package is normally a symlink to the sibling directory, and third-party dependencies resolve up to the container `node_modules`. Do **not** run `npm install` inside a package directory in that arrangement: npm would try to fetch the `github:` dependencies and replace your symlinks with fresh clones.

## The package registry (optional)

`jvavscratch add`, `remove`, `update`, `search`, `publish`, `login` and `register` talk to a jvavscratch **package registry** over HTTP. The client is built in and configured in `~/.jvavscratch/config.json`:

```
registry    base URL of the registry API   (default: http://localhost:3000)
api_token   API token issued by the registry
username    the name you logged in as
```

You only need a registry if you are installing third-party compiler-extension packages or publishing your own. Point the CLI at one with:

```bash
jvavscratch registry set-url http://localhost:3000
jvavscratch registry get-url
```

The reference implementation of the registry is an Express + SQLite service that is **not published on GitHub**; it lives only in the local development container. It stores its database in `storage/registry.db`, package tarballs in `storage/packages/`, and it refuses to boot without a `JWT_SECRET` in the environment (or a `.env` file) — there is deliberately no fallback secret. If you want a registry of your own, run that service and point the CLI at it.

Commands that do not touch the registry — `new`, `init`, `build`, `run`, `decompile`, `lib` — work with no registry at all.

## Troubleshooting

### `Cannot find module '@jvavscratch/core'` (or `generator`, `types`, …)

The packages were never built. `dist/` is what gets imported at runtime, so a fresh checkout that has only had `npm install` run inside one package will import fine but a *sibling* package with an empty `dist/` will not. Build in dependency order:

```bash
for p in types core utils generator decompiler cli; do (cd $p && npx tsc -p tsconfig.json); done
```

### `EACCES` while installing globally

Do not reach for `sudo npm link` — it makes root the owner of your global prefix and causes stranger failures later. Use a Node version manager (nvm, fnm, Volta) so the global prefix lives in your home directory, or install into the project instead of globally.

### The build emits almost nothing, or `project.json` is nearly empty

Almost always the same cause: something imported the generator through a **subpath**, such as `@jvavscratch/generator/optimise`. Only the package main entry has the side effect that registers generators with `core`'s dispatch tables. A subpath import silently skips registration, the tables stay empty, and the build produces a near-empty project with a couple of warnings as the only clue. Always import `@jvavscratch/generator`.

### npm is slow or blocked

npm talks to a registry mirror directly. If you are behind a proxy that only handles GitHub traffic, pointing npm at that proxy will not help; configure the mirror instead:

```bash
npm config set registry https://registry.npmmirror.com
```

Note that Node's own HTTPS requests (those made when npm resolves `github:` dependencies, and by any tooling that fetches from GitHub) trust only the system CA store. If you route GitHub through a local TLS-intercepting proxy, Node needs that proxy's CA explicitly:

```bash
export NODE_EXTRA_CA_CERTS=/path/to/proxy-ca.crt
```

### Updating jvavscratch

There is no `npm update` path. Pull the checkout and rebuild:

```bash
cd cli && git pull && npm run build
```

Because `npm link` points at the working copy, that is enough; nothing else has to be reinstalled.

## Next steps

- [Getting Started](/guide/getting-started) — create a project and build it.
- [Basic Usage](/guide/basic-usage) — the project layout, the build pipeline, dependencies.
- [Tutorials](/guide/tutorials) — build a small animated project from scratch.
