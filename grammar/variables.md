---
title: Variables and Assignment
---

# Variables and Assignment

Every variable in a jvavscratch program becomes a Scratch variable. There is no other kind of storage: no block-scoped locals, no closures, no heap. What a `let` produces is a data block with a name in it.

## Declaring

`let`, `const` and `var` all compile the same way — the compiler dispatches on the syntax node, and all three produce a variable declaration. The keyword is stylistic; `const` is not enforced as a constant and does not prevent reassignment.

```js
let x = 3;         // valid
const tau = 6.283; // valid, but not actually constant
var y = 2;         // valid
```

Several declarators in one statement work too:

```js
let a = 1, b = 2, c;
```

A declaration with no initialiser assigns **zero**, not `undefined`:

```js
let uninitialised;      // compiles to: set uninitialised to 0
```

Every declaration compiles to a `data_setvariableto` block. That means declaring a variable inside a loop re-assigns it on every iteration, and — because Scratch has no block scope — a variable declared inside a `for` body is visible for the rest of the script, and for the rest of the project if it is global.

::: warning No hoisting, no scoping
There is no block scope and no temporal dead zone, but there is also no hoisting: a variable must be *assigned* before it is read if you want a sensible value, because a read of an unknown identifier compiles into a variable reporter that Scratch resolves at runtime to an empty value.
:::

## Scope: the name prefixes

By default a variable is **global**: it belongs to the project, and any sprite can read or write it.

Three prefixes change that. They are part of the identifier, and they are stripped before the variable is created — so `_l_speed` creates a variable called `speed`:

| Prefix | Meaning | Example | Resulting variable |
|---|---|---|---|
| *(none)* | global | `let score = 0;` | `score`, project-wide |
| `_l_` | local to the sprite | `let _l_speed = 5;` | `speed`, sprite-private |
| `_g_` | explicitly global | `let _g_health = 3;` | `health` — **see the caveat below** |
| `_c_` | cloud variable | `let _c_highscore = 0;` | `highscore`, but not a cloud variable |

**`_l_` is the one you will actually use.** A `_l_` variable is registered in the owning sprite's private variables, so it shows up in that sprite's palette and is invisible to every other sprite. This is how you keep two sprites from fighting over the name `speed`.

**Cloud variables are disabled.** `_c_` is accepted and stripped, but the variable is created as an ordinary global — nothing is stored on a server. The prefix exists so that source written against it keeps compiling.

::: warning `_g_` currently strips six characters, not three
The implementation slices the prefix twice, so `_g_` removes three characters *two times over*:

```js
let _g_test = 5;        // creates a variable named "t"
let _g__l_test = 6;     // creates a variable named "test"
let _g_abcdefgh = 7;    // creates a variable named "defgh"
```

This is a bug, not a feature, but it is what the compiler does today, so do not rely on `_g_`. It is almost never needed anyway: a bare `let` is already global, and the only case where the explicit form matters is a global whose name collides with a `_l_` prefix pattern. Until it is fixed, prefer plain declarations and read the built `project.json` if you need to be sure what name you got.
:::

## Referencing

Reference a variable by its **unprefixed** name. The prefix is a declaration-side annotation only:

```js
let _l_private = "private variable";

private = "test";            // assigns the sprite-local variable
looks.say(private);          // reads it
```

A reference to a name that was never declared still compiles — into a reporter/assignment block naming that variable. It is not an error, which is why a typo in a variable name produces a silently empty value rather than a build failure.

```
Naming a variable and a list the same thing will break the built project.
Naming a cloud, global and local variable the same thing likewise.
```

Keep names unique across all four kinds.

## Assignment and operators

Assignment is a statement, and every compound assignment operator is supported:

```js
score = 100;
score = score + 10;
score += 10;      // data_changevariableby
score -= 1;       // read, subtract, write back
score *= 2;
score /= 2;
score %= 3;
score++;          // data_changevariableby 1
score--;          // data_changevariableby -1
```

`=` and `+=` map onto single Scratch blocks (`set var to`, `change var by`). `-=`, `*=`, `/=`, `%=` have no dedicated Scratch block, so they compile into a temporary block plus a `set var to` — three blocks where JavaScript has one. That is a performance note rather than a correctness one.

`++` and `--` are statements, not expressions: they can be a line of their own, and they are what an omitted `for` update expands to, but `let y = x++;` will not give you the pre-increment value — there is no expression form.

## Lists

Scratch lists are objects, not JavaScript arrays. There are no array literals in the dialect (they are a hard error), so a list is either declared in the project's asset data or created by the `list` library.

### Referencing a list

An identifier that names a list is written with a `_list_` prefix so the compiler knows it is a list rather than a variable:

```js
// reference the list named "example"  (the _list_ prefix is omitted from the name)
let z = _list_example;
```

A bare identifier compiles to a *variable* reporter; `_list_example` compiles to a *list* reporter. If a list is only ever reached through the `list.*` functions and the indexing sugar, the prefix never appears.

### Indexing and length

The compiler rewrites list member access into library calls:

```js
let first = items[0];        // list.getItem("items", 0)
items[2] = "new";            // list.replace("items", 2, "new")
let howMany = items.length;  // list.length("items")
```

Which position `items[0]` actually addresses is controlled by `list_index_base` in `jvavscratch.toml`:

- `list_index_base = 1` (**default**): your index is used as-is. `items[1]` is the first element, matching Scratch.
- `list_index_base = 0`: the compiler adds one to every index, so `items[0]` is the first element and your source reads like ordinary JavaScript.

The two are mutually exclusive per project. Pick one, and be aware that with `list_index_base = 0` the index expression you write is what gets inserted into the list-index *field* of index-of-item operations and into the `+ 1` on reads and writes alike.

There is no bounds checking: reading past the end yields an empty string in Scratch, and writing past the end appends. Note also that `list.getItemIndex` is **not** index-adjusted — it hands back Scratch's own one-based position, or `0` when the value is absent, even when `list_index_base = 0`. Mixing it with `myList[i]` in the same expression needs a manual `- 1`.

### The `list` library

| Function | Effect |
|---|---|
| `list.newList(name, contents, isPrivate)` | Declares a list, filling it with the array literal in `contents`. `isPrivate` marks it sprite-local. |
| `list.push(list, value)` | Append. |
| `list.pop(list)` | Delete the last item. |
| `list.shift(list)` | Delete the first item. |
| `list.clear(list)` | Delete every item. |
| `list.insert(list, index, value)` | Insert at `index`. |
| `list.deleteIndex(list, index)` | Delete at `index`. |
| `list.replace(list, index, value)` | Replace at `index`. |
| `list.show(list)` / `list.hide(list)` | Show or hide the list monitor on stage. |
| `list.getItem(list, index)` | Read at `index`. Value form. |
| `list.getItemIndex(list, value)` | Index of the first matching item (0 if absent). Value form. |
| `list.length(list)` | Number of items. Value form. |
| `list.contains(list, value)` | Whether the list holds `value`. Value form. |

The list name is always passed as a **string**, not as a `_list_` identifier: `list.push("items", 5)`, not `list.push(items, 5)`.

`list.newList` is the only way to write down a list's initial contents inside source. Its second argument must be an array literal, and its third must be a literal `true` or `false` — those argument types are checked at compile time, and a wrong type is a hard error.

```js
list.newList("highscores", [0, 0, 0], false);
list.push("highscores", 9001);
```

Declaring a list in `assets/stage/stage.json`'s `globalLists` is the declarative alternative and is better when the list should exist in the project from the start — see [Declaring global variables and lists](/guide/basic-usage#declaring-global-variables-and-lists).

### A list and a variable may not share a name

The generated project stores both in dictionaries keyed by name, and Scratch's loader does not tolerate the collision. Use distinct names.

## Naming rules that will bite

- Identifiers that start with `_l_`, `_g_` or `_c_` always have their prefix consumed, even when you meant it literally. `let _l_x = 1` declares `x`; there is no way to declare a variable whose name genuinely starts with `_l_`.
- Stick to ASCII letters, digits, `_` and `$`. Names are copied verbatim into the block dictionary and are compared as strings everywhere, so anything unusual is a latent encoding problem rather than a compile error.
- Avoid names the compiler generates for itself. Procedures for class methods are called `Class.method` in the generated project, and the return-value machinery allocates short random names; a variable called `f28c5` can collide with one of them.
- Anything reachable from `sensing.ask` is user input. Never trust `sensing.answer` to be a number.

## Best practices

1. Use plain `let` for project-wide state and `_l_` for anything that belongs to a single sprite. `_g_` and `_c_` buy you nothing today.
2. Declare globals in `stage.json` so they exist in the project, not just in the block dictionary.
3. Initialise explicitly. `let x;` is legal but silently means `x = 0`.
4. Do not reuse a name across variables, lists and broadcasts.
5. Prefer `+= 1` over `x = x + 1` — they generate different blocks, and the compound form is smaller.
