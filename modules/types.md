---
title: Types
description: The Scratch data model, the opcode enum, the input-tuple builders, and random block IDs.
---

# Types module

`types` is the bottom of the dependency chain and the smallest kind of package
there is: type declarations, three enums, and two pure functions. It has **no
dependencies at all** — `npm ls` on it shows nothing but devDependencies — which
is what lets every other package import it without any risk of a cycle.

The rule for this package is that everything in it is either a declaration or a
pure helper. Nothing here knows about Babel, the file system, or the build.

## What is in the package

| File | Contents |
| --- | --- |
| `types/src/types/types.ts` | `BlockOpCode`, and the interfaces `Project`, `Sprite`, `Costume`, `Sound`, `Variable`, `Block`, `Mutation`, `typeData`, `buildData`, `generatedData`. |
| `types/src/types/scratch-type.ts` | `ScratchType`, `ScratchInput`, and the eight tuple builders. |
| `types/src/types/scratch-uuid.ts` | `uuid()` and the `includes` character-set table. |
| `types/src/types/index.ts` | Re-exports all three. |
| `types/src/index.ts` | Re-exports `./types`, and additionally exposes the three modules as namespaces. |

The package also publishes a subpath export, `@jvavscratch/types/types`. Use the
main entry unless you specifically want one file's worth of API.

## `BlockOpCode`

The opcode enum is the single largest thing in the repository: **207 string
members** in `types/src/types/types.ts`, and the canonical list of what the
compiler can emit.

```ts
export enum BlockOpCode {
    jvavscratch_Unknown = "jvavscratch_Unknown",
    EventWhenFlagClicked = "event_whenflagclicked",
    MotionMoveSteps = "motion_movesteps",
    // ... 204 more
}
```

Two things about it matter beyond "it's a big list".

- **The member values are the real Scratch opcode strings**, and the member
  *names* are a CamelCase transcription of them. The optimiser relies on the
  value being `<category>_<name>` and splits on the underscore; the generators
  pass the value straight through into `createBlock({ opcode })`.
- **The first member is not a Scratch opcode.** `jvavscratch_Unknown` is the
  compiler's own sentinel. The optimiser rewrites a block to it to mark the block
  as deleted, and `treeOptimise` filters anything left with that opcode out of
  the programme. Search the codebase for it and you will only find those two
  places.

Coverage is broad but not complete: the enum covers the core motion, looks,
sound, events, control, sensing, operators, variables, lists, procedures and pen
blocks, plus some extension and menu opcodes, but there is no representative for
every block in every Scratch extension.

## The project data model

`Project` and `Sprite` mirror the `project.json` shape one for one:

```ts
interface Project {
    targets: Sprite[],
    monitors: [],
    extensions: [],
    meta: { semver: "3.0.0", vm: "0.2.0", agent: string,
            platform: { name: string, url: string } },
}
```

`meta.semver` and `meta.vm` are **literal types**, not `string` — they can only
ever be `"3.0.0"` and `"0.2.0"`. `monitors` and `extensions` are typed as the
empty tuple `[]`, so the type system will reject any attempt to put something in
them; both are listed as TODO in the source. In practice the CLI writes `[]` for
both and nothing in the compiler produces monitors.

Several fields are deliberately loose, and the comments say so:

| Interface | Field | Type | Reality |
| --- | --- | --- | --- |
| `Sprite` | `blocks`, `comments`, `lists`, `broadcasts` | `{}` | These are dictionaries keyed by ID. The declared type carries no information, so `block.fields.MESSAGE` and similar mistakes are not caught by the compiler. |
| `Sprite` | `rotationStyle` | `"all around"` | A single-literal type. |
| `Sprite` | `variables` | `Variable` | `{ [key: string]: string \| number }` — an index signature, not the real two-or-three element tuple arrays. |
| `Block` | `inputs`, `fields` | `{ [key: string]: any }` | Unavoidable: Scratch's input encoding is genuinely heterogeneous. |

`Mutation extends Block` and adds the `mutation` object that Scratch requires on
procedure definitions, procedure calls and list/broadcast blocks — `tagName`,
`children`, `hasnext`, `proccode`, `argumentids`, `argumentnames`,
`argumentdefaults` and `warp`, all optional strings.

The remaining interfaces are the compiler's own contracts, and they are the ones
worth reading closely:

```ts
interface typeData {
    isStaticValue: boolean,
    blockId: string | null,
    block: any | null,
}

interface buildData {
    instruction: number,
    originalSource: string,
    packages: { [key: string]: any },
    isAsync?: boolean,
    isFunction?: boolean,
    functionName?: string,
    listIndexBase?: number,
    customBlockReturn?: boolean,
}

interface generatedData {
    keysGenerated: string[],
    terminate?: boolean,
    err?: boolean,
}
```

::: warning `generatedData` is missing a field that is read
`parseProgram` honours a fourth flag, `doNotParent`, which makes it emit a
generator's blocks without linking them into the chain. `doNotParent` is **not
declared** on `generatedData`, so a generator that returns it is relying on
excess-property tolerance rather than on the type. If you add the field to the
interface, note that the behaviour is implemented in
`core/src/env/parseProgram.ts`, not here.
:::

## `ScratchInput`: the four-tuple

Every value in a Scratch `inputs` or `fields` dictionary is an array — this is
the encoding that causes the most confusion and the most bugs, which is exactly
why the builders below exist.

```ts
type ScratchInput = [
    number,
    ([ScratchType, any, string?, string?] | string)?,
    [ScratchType, any]?
];
```

Read positionally:

- **`[0]` — the kind of slot.** `1` means a literal shadow (the value is inline),
  `2` means a substack (a C-block's mouth, whose payload is the first block ID
  inside it), `3` means a block that fills the slot.
- **`[1]` — the payload.** For a literal, `[ScratchType, value]` (or
  `[ScratchType, value, hex]` for a colour). For a substack, the ID of the first
  block. For a block, the block's ID. Two cases pass a bare string instead: the
  name of a variable whose *type* is implied, and a menu's selected option.
- **`[2]` — the obscured shadow.** What Scratch would show in the slot if the
  block were dragged out. A variable dropped into a numeric slot records
  `[4, ""]` here, so it falls back to the number `0`.

`ScratchType` is Scratch's own primitive-ID table, and the numbers are not
arbitrary:

| Member | Value | Member | Value |
| --- | --- | --- | --- |
| `number` | 4 | `color` | 9 |
| `positive_number` | 5 | `string` | 10 |
| `positive_int` | 6 | `broadcast` | 11 |
| `int` | 7 | `variable` | 12 |
| `angle` | 8 | `list` | 13 |

### The builders

`types/src/types/scratch-type.ts` exports eight functions, and they are the only
sanctioned way to construct a tuple. Writing the arrays by hand is how you end up
with a subtly wrong slot kind and a project that opens but misbehaves.

| Builder | Produces | Used for |
| --- | --- | --- |
| `getScratchType(type, value)` | `[1, [type, value]]` | A literal in an input slot. |
| `getColor(type, value, hex)` | `[1, [type, value, hex]]` | A colour literal, which carries an extra hex component. |
| `getSubstack(startIndex)` | `[2, startIndex]` | A C-block's mouth: the body of `if`, `repeat`, `forever`. |
| `getBlockNumber(blockId)` | `[3, blockId, [4, ""]]` | A reporter block filling a numeric-ish slot. |
| `getVariable(name)` | `[3, [12, name, name], [4, ""]]` | A variable dropped into a slot. Note the slot kind is `3` even though the payload is inline. |
| `getList(name)` | `[3, [13, name, name], [4, ""]]` | The same, for a list. |
| `getBroadcast(name)` | `[1, [11, name, name]]` | A broadcast message name inside a broadcast block's input. |
| `getMenu(menu)` | `[1, menu]` | A dropdown selection. |

`getMenu` is the odd one out: its payload is a bare string rather than a
`[type, value]` pair, because a menu's option is identified by name rather than
by a typed value. That is the `| string` branch of the `ScratchInput` union.

`getVariable` and `getList` are also worth reading twice, because they look
inconsistent with `getScratchType` — the payload sits at index 1 directly rather
than nested, and the type ID (`12` or `13`) is the first element of the payload
array. That is simply how Scratch encodes a variable reference, and it is the
reason the helpers exist rather than being inlined.

And a worked example, from `looks.say("hello")`:

```ts
createBlock({
    opcode: BlockOpCode.LooksSay,
    inputs: { MESSAGE: getScratchType(ScratchType.string, "hello") },
});
// -> { opcode: "looks_say", inputs: { MESSAGE: [1, [10, "hello"]] }, ... }
```

## Random IDs

Block IDs, asset IDs, variable names and broadcast codes all come from
`uuid()`:

```ts
export function uuid(Include: String, Length = 32) {
    let result = '';
    for (let i = 0; i < Length; i++) {
        result += Include.charAt(randomInt(Include.length));
    }
    return result;
}
```

Three things to note.

- **It uses `crypto.randomInt`, not `Math.random()`.** The comment in the source
  explains why: IDs go straight into the `.sb3` the user produces, and a
  collision means two blocks share an ID and the project is corrupt. V8's
  `Math.random()` is recoverable from a few outputs and can collide across
  concurrent builds or a long-lived process. `randomInt(n)` is uniform over
  `[0, n)` and free of modulo bias.
- **Callers choose the length.** Block IDs are 32 characters, the shorter IDs
  handed to `createMutation` are 16, and generated Scratch variable names are 5 —
  which is why the diffing recipe in [Modules](/modules/#tests) normalises
  `\b[0-9a-f]{16}\b`, `\b[0-9a-f]{32}\b` and five-character adjacent pairs.
- **`Include` is always one of the three character sets**, rather than a mode
  flag:

  | Set | Contents |
  | --- | --- |
  | `scratch_alphanumeric` | `0-9a-f` |
  | `alphanumeric` | `0-9a-z` |
  | `alphanumeric_with_symbols` | `0-9a-z` plus punctuation |

The third set carries a caveat that is worth repeating, because it looks like a
typo and is not one: its 37th character is **U+62E2 (拢)**, not the ASCII symbol
that presumably stood there originally. The comment states that what it was
meant to be cannot be determined, and that it is left alone because
`motion.ts` and `sensing.ts` already generate Scratch variable names from this
set — changing it would silently rename variables in existing projects. U+62E2 is
a legal character in a Scratch variable name, so the only consequence is an
unusual-looking name.

## Using it

```ts
import {
    BlockOpCode, createBlock,        // re-exported by core
    getScratchType, getVariable, getSubstack, ScratchType,
    uuid, includes,
} from "@jvavscratch/types";
```

`createBlock` and `createMutation` are *not* here — they live in `core`, which
is why `core` depends on `types` and never the reverse. `types` supplies the
shape; `core` supplies the constructors.
