---
title: Built-in Functions
---

# Built-in Functions

[Motion](/api/motion), [Looks](/api/looks) and [Sound](/api/sound) have pages of their own. This
page covers everything else the compiler knows how to turn into blocks:

| Library | Statement form | Value form |
|---|---|---|
| `control` | 6 functions | — |
| `sensing` | 3 functions | 15 functions |
| `pen` | 9 functions | — |
| `list` | 10 functions | 4 functions |
| `variable` | 2 functions | — |
| `broadcast` | 2 functions | — |
| `method` | 3 functions | 2 functions |
| `math` | — | 6 functions |
| `operation` | — | 4 functions |
| `util` | — | 1 function |

`math`, `operation` and `util` are value-only: `math.pi()` is fine, `math.pi();` on its own line is
`Unknown library, got: 'math'`. `control`, `pen`, `variable` and `broadcast` are the other way
round: they only exist as statements.

Events are not a library at all — a script's hat block comes from a comment. See
[Events and hat blocks](#events-and-hat-blocks) below.

## Control

### `control.wait(seconds)`

Pauses the script. Scratch measures waits in frames, so a wait is rounded to a whole number of
frames (a 30th of a second each); `control.wait(1)` really waits about a second but never exactly.

```js
looks.say("Ready...");
control.wait(2);
looks.say("Go!");
```

Becomes `control_wait`.

### `control.waitUntil(expression)`

Blocks until the expression becomes true. **The argument is a string that the compiler parses as
code**, not a value:

```js
let score = 0;
control.waitUntil("score > 10");
looks.say("You win!");
```

The string must contain one of: a comparison (`>`, `<`, `==`, `>=`, `<=`, `!=`), a `&&` / `||`
expression, `true` / `false`, or a `!` negation. Anything else is a hard build error:

```
error: Cannot resolve logical expression
```

Because the expression is compiled at build time, every name in it has to be a variable the
project has, and it is *re-evaluated by Scratch* on every frame — so
`control.waitUntil("score > 10")` keeps watching `score`. A non-string argument (a variable, a
call) is replaced with the empty string and fails the same way.

Becomes `control_wait_until`.

### `control.stop(option)`

Stops scripts. `option` is a string literal:

| Option | Effect |
|---|---|
| `"all"` | stops every script in the project |
| `"this script"` | stops the current script (the rest of the script is dead code) |
| `"other scripts in sprite"` | stops the sprite's other scripts, but this one continues |

Anything that is not one of those three — including a computed value — becomes `"all"`.

```js
if (sensing.touching("edge")) {
    control.stop("this script");
}
looks.say("still here");
```

Becomes `control_stop`. For `"all"` and `"this script"` the compiler also ends the block chain
there: statements written after the call are silently dropped, as they can never run. Only
`"other scripts in sprite"` lets the script continue, because that stop block has a `next` slot.

### `control.clone(target)`

Starts a copy of a sprite. The argument is a string literal — `"myself"` for this sprite, or the
name of another sprite. A non-literal argument (a variable, a call) falls back to `"myself"`.

```js
control.clone("myself");
control.clone("Sprite2");
```

Becomes `control_create_clone_of` plus a `control_create_clone_of_menu` shadow holding the target.
The clone starts whatever script has the `start as clone` hat — see
[Events and hat blocks](#events-and-hat-blocks).

### `control.deleteClone()`

Deletes the clone that runs it. A clone that deletes itself stops immediately, and the compiler
ends the block chain there as well:

```js
control.deleteClone();
looks.say("never runs in a clone");
```

Becomes `control_delete_this_clone`. In the original sprite (not a clone) the block does nothing.

### `control.heartbeat(seconds)`

A low-level frame-yield helper. It writes `seconds / 86400` to a hidden `end_*` variable and then
waits until the real *days since 2000* reporter passes that value — which, for any ordinary
number of seconds, is already true, so the block returns immediately. Treat it as an internal
detail of the compiler and use `control.wait(seconds)` when you want to pause.

## Sensing

### `sensing.ask(question)`

Shows the question box and waits for the answer, which you read with `sensing.answer()`.

```js
sensing.ask("What is your name?");
looks.say(operation.join("Hello, ", sensing.answer()));
```

Becomes `sensing_askandwait`. The question text is a normal value, so it can be concatenated or
come from a variable.

### `sensing.resetTimer()`

Resets the timer to 0. Read it back with `sensing.timer()`. The timer starts when the project
starts, so this is how you measure an interval.

```js
sensing.resetTimer();
control.waitUntil("sensing.timer() > 3");
```

Becomes `sensing_resettimer`.

### `sensing.setDragMode(mode)`

Allows or forbids dragging the sprite with the mouse in the player. `mode` must be exactly
`"draggable"` or `"not draggable"` (case-sensitive); anything else, including a computed value,
becomes `"draggable"`.

```js
sensing.setDragMode("draggable");
sensing.setDragMode("not draggable");
```

Becomes `sensing_setdragmode`. This is a stack block but it is not available in Scratch's own
palette; TurboWarp has it.

### Value functions

These may be used anywhere a value is expected — in arithmetic, as an argument, on the right-hand
side of an assignment, or as a condition (they are already boolean).

| Call | Returns | Becomes |
|---|---|---|
| `sensing.touching(target)` | is the sprite touching `"edge"`, `"mouse"` or another sprite? | `sensing_touchingobject` |
| `sensing.touchingColor(color)` | is the sprite touching that colour? | `sensing_touchingcolor` |
| `sensing.colorIsTouchingColor(color, otherColor)` | is one colour touching another? | `sensing_touchingcolor` with both colour inputs |
| `sensing.distanceTo(target)` | distance in pixels to `"mouse"` or a sprite | `sensing_distanceto` |
| `sensing.mouseDown()` | is the mouse button held down? | `sensing_mousedown` |
| `sensing.keyDown(key)` | is that key held down? | `sensing_keypressed` |
| `sensing.itemOfObject(property, object)` | a property of a sprite or the stage | `sensing_of` |
| `sensing.current(unit)` | a unit of the current date/time | `sensing_current` |
| `sensing.answer()` | the last answer typed into `sensing.ask()` | `sensing_answer` |
| `sensing.mouseX()` / `sensing.mouseY()` | mouse position on the stage | `sensing_mousex` / `sensing_mousey` |
| `sensing.loudness()` | microphone volume, 0–100 | `sensing_loudness` |
| `sensing.timer()` | seconds since the timer was reset | `sensing_timer` |
| `sensing.daysSince2000()` | days since 2000-01-01, with a fractional part | `sensing_dayssince2000` |
| `sensing.username()` | the player's username, `"player"` when not signed in | `sensing_username` |

Every `target` argument is read from the **source text** of the argument:

- `sensing.touching("edge")` → `_edge_`, `sensing.touching("mouse")` → `_mouse_`, any other string
  is taken as a sprite name; a non-literal argument becomes `"edge"`.
- `sensing.distanceTo("mouse")` → `_mouse_`; a non-literal argument becomes `"mouse"`.
- `sensing.keyDown(key)` accepts `"space"`, `"up arrow"`, `"down arrow"`, `"left arrow"`,
  `"right arrow"`, `"any"`, `a`–`z` and `0`–`9`. Anything else becomes `"space"`.
- `sensing.itemOfObject(property, object)` takes ones of Scratch's property names — `"x position"`,
  `"y position"`, `"direction"`, `"costume #"`, `"costume name"`, `"size"`, `"volume"`,
  `"backdrop #"`, `"backdrop name"` — and the object name, where `"stage"` (the default) becomes
  `_stage_`. Both are written into the block verbatim, so a typo produces an empty result rather
  than an error.
- `sensing.current(unit)` accepts `"year"`, `"month"`, `"date"`, `"day of week"`, `"hour"`,
  `"minute"` and `"second"`; anything else becomes `"year"`.

```js
if (sensing.keyDown("space") && sensing.mouseDown()) {
    motion.goto("mouse");
}

looks.say(operation.join("now: ", sensing.current("hour")));
looks.say(operation.join("you: ", sensing.username()));
```

`sensing.touchingColor` / `sensing.colorIsTouchingColor` take a colour string such as `"#ff0000"`.

## Pen

The pen library draws on the stage. Pen blocks only work on a sprite that has them; there is no
setup call.

| Call | Arguments | Becomes |
|---|---|---|
| `pen.clear()` | — | `pen_clear` |
| `pen.stamp()` | — | `pen_stamp` |
| `pen.down()` | — | `pen_penDown` |
| `pen.up()` | — | `pen_penUp` |
| `pen.changeSize(change)` | pixels to add | `pen_changePenSizeBy` |
| `pen.setSize(size)` | new pen width in pixels | `pen_setPenSizeTo` |
| `pen.setColor(color)` | colour string | `pen_setPenColorToColor` |
| `pen.changeEffect(param, change)` | parameter name, amount | `pen_changePenColorParamBy` |
| `pen.setEffect(param, value)` | parameter name, new value | `pen_setPenColorParamTo` |

The four colour parameters are `"color"`, `"saturation"`, `"brightness"` and `"transparency"`.
Write them in the lowercase spelling Scratch itself uses: the compiler's check is
case-insensitive, but the string you type is the field value that ends up in the project, and
only the lowercase names are Scratch's own options.

```js
pen.clear();
pen.setSize(4);
pen.setColor("#ff0000");
pen.down();
for (let i = 0; i < 4; i++) {
    motion.move(100);
    motion.turnRight(90);
}
pen.up();
```

A `changeEffect` / `setEffect` call also emits a `pen_menu_colorParam` shadow block to carry the
parameter name, and an unrecognised name falls back to `"COLOR"`.

Pen colour effects are *not* the same thing as the graphic effects in
[Looks](/api/looks#graphic-effects); they change the colour of the pen strokes, not the sprite.

## Lists

A list is a Scratch list. Its name is always a **string literal** — `list.push("items", 5)`, not
`list.push(someVariable, 5)`; the name is how the compiler finds the list in the project, and it
is also what declares the list (see [Declaring names](#declaring-names)).

Indices are **1-based**, like Scratch's own list blocks. With `list_index_base` at its default,
`list.getItem("items", 1)` is the first item.

### Statement functions

| Call | What it does | Becomes |
|---|---|---|
| `list.newList(name, [items], isPrivate)` | clears the list, then adds the given items | `control_repeat` + `data_deletealloflist` + one `data_addtolist` per item |
| `list.push(name, item)` | appends | `data_addtolist` |
| `list.pop(name)` | removes the **last** item | `data_deleteoflist` at `data_lengthoflist` |
| `list.shift(name)` | removes the **first** item | `data_deleteoflist` at 1 |
| `list.clear(name)` | deletes every item | `data_deletealloflist` |
| `list.insert(name, at, value)` | inserts before position `at` | `data_insertatlist` |
| `list.deleteIndex(name, at)` | deletes position `at` | `data_deleteoflist` |
| `list.replace(name, at, value)` | overwrites position `at` | `data_replaceitemoflist` |
| `list.show(name)` / `list.hide(name)` | shows/hides the list monitor on the stage | `data_showlist` / `data_hidelist` |

`list.newList` is the odd one out: all three arguments are required and all three have a required
node type — a string literal name, an **array literal** of initial items, and a boolean literal.
`list.newList("scores", [], false)` is the empty list; `[1, 2, 3]` and `[[1, 2], [3, 4]]` are both
array literals, but `items` (a variable) is a hard error.

The third argument marks the list private. `true` registers the list in the output project's list
table for that sprite, so it exists even before any block runs; `false` means "this list is
declared elsewhere" (in `stage.json`), which is the usual choice for a list shared by every
sprite.

```js
list.newList("scores", [], true);
list.push("scores", 10);
list.push("scores", 20);
list.insert("scores", 1, 5);   // 5, 10, 20
list.replace("scores", 2, 15); // 5, 15, 20
list.deleteIndex("scores", 1); // 15, 20
looks.say(list.getItem("scores", 1)); // 15
```

### Value functions

| Call | Returns | Becomes |
|---|---|---|
| `list.getItem(name, at)` | the item at position `at` | `data_itemoflist` |
| `list.getItemIndex(name, item)` | the position of `item`, or 0 if absent | `data_itemnumoflist` |
| `list.length(name)` | how many items there are | `data_lengthoflist` |
| `list.contains(name, item)` | whether the list has that item | `data_listcontainsitem` |

```js
if (list.contains("scores", 15)) {
    looks.say(operation.join("position: ", list.getItemIndex("scores", 15)));
}
```

The list-indexing sugar `scores[1]`, `scores.length` and `scores[1] = 15` is rewritten into these
calls for you — see [Syntax sugar](#syntax-sugar).

::: warning `list.length` disables the syntax rewrites for the file
`list.length("scores")`, and the `scores.length` form it is rewritten from, both trip a compiler
bug: the rewrite rule matches its own output and recurses until Babel gives up. The compiler
catches the error, prints

```
Syntax transformation error: RangeError: unknown file: Maximum call stack size exceeded
```

and then compiles the file with **none** of the syntax rewrites applied. Inside that file,
`Math.floor(...)`, `**`, ternaries and `scores[1] = value` no longer work: an index assignment
compiles to a nameless `set variable` block instead of `replace item`. If you need a list length,
put it in a file of its own, or use `sensing.itemOfObject("costume #", ...)`-style workarounds —
and always read the build output for that `Syntax transformation error` line.
:::

::: tip `list_index_base` has no effect today
`jvavscratch.toml` accepts `list_index_base = 0` and the CLI validates it (0 or 1, anything else
warns and becomes 1), but the value is read with `projectData.list_index_base || 1`, so `0` is
turned into `1` before it reaches the generators. In practice every list function is 1-based, and
`list.getItem("items", 0)` reads nothing. Do not build on 0-based indexing.
:::

## Variables

| Call | What it does | Becomes |
|---|---|---|
| `variable.show(name)` | shows the variable monitor on the stage | `data_showvariable` |
| `variable.hide(name)` | hides it | `data_hidevariable` |

Both take a string literal, and both only reference the name — they do not create the variable.
`let score = 0;` is what creates and assigns a variable, and `score` on its own reads it.

```js
let score = 0;
variable.show("score");
score = score + 1;
looks.say(score);
```

There is no `variable.get` / `variable.set` pair and no `variable.change`: assignment and reading
are part of the language, not the library.

## Broadcasts

| Call | What it does | Becomes |
|---|---|---|
| `broadcast.fire(message)` | sends the message and continues immediately | `event_broadcast` |
| `broadcast.fireYield(message)` | sends it and waits for every receiver | `event_broadcast_and_wait` |

The message name is a string literal; a non-literal argument becomes `"message1"`. Sending a
message registers it in the project's message table, so `broadcast.fire("go")` is enough to
create `go` — no separate declaration is needed.

```js
// sender
control.wait(2);
broadcast.fire("go");

// receiver, in another file or sprite
//#whenbroadcastreceived("go")
looks.say("Go!");
```

Note the difference from a broadcasting *hat* (`//#whenbroadcastreceived("go")`, which runs a
script); `broadcast.fire` is the stack block that sends the message.

## Objects and classes

`method` is how the compiler's class support is driven. A `class` declaration in a source file
compiles its fields into a generated `<ClassName>.instances` list on the sprite: one slot for the
instance name, then one slot per field. `new ClassName()` registers the instance there and runs
the constructor.

The `method` library reaches into that storage from outside the class:

| Call | What it does |
|---|---|
| `method.get(className, instance, field)` | reads one field of one instance |
| `method.set(className, instance, field, value)` | writes one field of one instance |
| `method.instancesOf(className)` | how many instances exist |
| `method.cleanup(className)` | deletes every instance |
| `method.destroy(className, instance)` | deletes one instance |

All the names are string literals (`method.set` takes three strings and then the value).
Referencing a class that does not exist in the project is a hard error — `Reference found to
non-existant class`.

```js
class Apple {
    tastiness = 0;

    constructor() {
        looks.sayForSeconds("A new apple!", 2);
    }

    eat() {
        looks.say(operation.join("Tastiness: ", tastiness));
    }
}

let myApple = new Apple();
method.set("Apple", "myApple", "tastiness", 15);
myApple.eat();
looks.say(method.instancesOf("Apple"));
```

Inside a method body a field name is just a name (`tastiness`); `method.get` and `method.set` are
for code *outside* the class, and `method.instancesOf` / `cleanup` / `destroy` are the lifecycle
helpers. `method.instancesOf` divides the storage list's length by the instance stride and rounds,
so it counts instances, not slots.

## Maths

`math` is value-only and is what the `Math.*` and `**` rewrites compile to.

| Call | Returns | Becomes |
|---|---|---|
| `math.random(from, to)` | a random integer between the two, inclusive | `operator_random` |
| `math.mod(a, b)` | `a` modulo `b` | `operator_mod` |
| `math.round(n)` | `n` rounded to the nearest whole number | `operator_round` |
| `math.operation(name, n)` | the named single-argument operation | `operator_mathop` |
| `math.pi()` | π, as a literal in the project | no block |
| `math.pow(base, exponent)` | `base` to the power `exponent` | `operator_mathop` / `operator_multiply` |

`math.operation` takes a string literal name, one of `"abs"`, `"floor"`, `"ceiling"`, `"sqrt"`,
`"sin"`, `"cos"`, `"tan"`, `"asin"`, `"acos"`, `"atan"`, `"ln"`, `"log"`, `"e ^"` or `"10 ^"`; an
unknown name becomes `"abs"`. This is exactly what `Math.floor(x)` and friends become:

```js
let a = Math.floor(3.7);        // math.operation("floor", 3.7)
let b = Math.round(2.5);        // math.round(2.5)
let c = Math.sqrt(16);          // math.operation("sqrt", 16)
let d = math.random(1, 10);
let e = 2 ** 10;                // math.pow(2, 10)
let f = Math.PI;                // math.pi()
```

`math.pow` is not a single Scratch block: it compiles to `10 ^ (exponent × log(abs(base)))`,
because Scratch has no general power operator. That is correct for positive bases and **loses the
sign** of a negative base, and `2 ** 0.5` works while `(-2) ** 2` does not give 4. Use
`math.operation("sqrt", n)` for square roots.

## Text and strings

`operation` is value-only and holds the string blocks.

| Call | Returns | Becomes |
|---|---|---|
| `operation.join(a, b, …)` | all arguments joined into one string | `operator_join` |
| `operation.getLetterOfString(index, text)` | one character, 1-based | `operator_letter_of` |
| `operation.getLengthOfString(text)` | the number of characters | `operator_length` |
| `operation.stringContains(text, piece)` | whether `text` contains `piece` | `operator_contains` |

```js
let name = "world";
looks.say(operation.join("Hello, ", name, "!"));
looks.say(operation.getLetterOfString(1, name)); // w
looks.say(operation.getLengthOfString(name));    // 5
```

`operation.join` accepts two or more arguments and nests the Scratch `join` blocks for you.

::: warning `operation.join` leaves an extra block behind
Each `operation.join` call also emits one orphaned `operator_join` block that no script reaches,
whose first input points at a block id that does not exist (Scratch reads that as the empty
string). The joined value is still correct — the visible extra block is a compiler artefact, not a
bug in your program. It costs one block per call in the generated project.
:::

## Return addresses

| Call | Returns |
|---|---|
| `util.getReturnAddress(functionName)` | the value the named function last returned |

A function's `return` writes to a hidden variable generated for that function.
`util.getReturnAddress("double")` reads it, and is the reliable way to get a value back out of a
user-defined function:

```js
function double(n) {
    return n * 2;
}

double(21);
let x = util.getReturnAddress("double");
looks.say(x); // 42
```

The name must be the function's name as a string literal; a name that no function in the project
declares is a hard error — `Reference found to non-existant function`. The functions themselves
are documented in the [language reference](/reference/language-reference).

::: warning `custom_block_return` and function values
`jvavscratch.toml` accepts `custom_block_return = true`, which marks calls as TurboWarp
value-returning calls (`"return": "1"` in the call block's mutation) and makes
`let x = fn()` read the call block's own value. The definition of the function, however, still
compiles `return` into an assignment to the hidden variable and contains no
`procedures_return` block. A call site that reads the call block's value therefore has nothing to
read. **Read the value with `util.getReturnAddress("fn")` after calling the function as a
statement** — that path works with the flag both on and off.
:::

## Events and hat blocks

A script's hat block is chosen by the **first comment in the file**, written as a call:

```js
//#whenkeypressed("space")
motion.move(10);
```

The recognisable directives are:

| Comment | Hat block | Notes |
|---|---|---|
| *(none)* | `event_whenflagclicked` | the default |
| `//#whenkeypressed("space")` | `event_whenkeypressed` | same key names as `sensing.keyDown`; anything else is `space` |
| `//#whenthisspriteclicked()` | `event_whenthisspriteclicked` | |
| `//#whenbroadcastreceived("go")` | `event_whenbroadcastreceived` | a non-string argument uses `message1` |
| `//#whenbackdropswitchesto("backdrop1")` | `event_whenbackdropswitchesto` | defaults to `backdrop1` |
| `//#whengreaterthan("loudness", 10)` | `event_whengreaterthan` | first argument `"loudness"` or `"timer"`, anything else becomes `LOUDNESS` |
| `//#start_as_clone()` | `control_start_as_clone` | the hat a clone gets |

The comment has to be the first thing in the file, and each file gets exactly one hat, so a file
holds exactly one script. A comment that is not a recognisable directive (`//# hello`) leaves the
default green-flag hat in place.

## Syntax sugar

Several constructs cannot be expressed with blocks directly, so the compiler rewrites them before
generation. You can write either form:

| You write | It becomes |
|---|---|
| `items[2]` | `list.getItem("items", 2)` |
| `items[2] = 5` | `list.replace("items", 2, 5)` |
| `items.length` | `list.length("items")` — see the warning under [Lists](#lists) |
| `Math.floor(x)` and the other `Math.*` functions | `math.operation("floor", x)`, `math.round(x)`, `math.random(a, b)`, … |
| `Math.PI` | `math.pi()` |
| `a ** b` | `math.pow(a, b)` |
| `cond ? a : b` | a temporary variable, `if`/`else` and two assignments |
| `for (let i = 0; i < n; i++)` | the `let` is hoisted to a variable, the loop becomes `control_repeat_until` |

The rewrite runs per file, and only for a file that parses. Note that it is a source-to-source
pass: the temporary variable a ternary creates (`__jvavscratch_temp`) is a real variable in the
project, and the hoisted `let` of a `for` header leaves a plain `set variable` block before the
loop.

## Declaring names

Scratch projects list their variables, lists and messages explicitly, and the compiler only adds a
name to those tables when you declare it:

- **Variables** — `let score = 0;` compiles the blocks but does **not** add `score` to the
  project's variable table. Three ways to declare one:
  - name it `_l_score` in a `let`; the `_l_` prefix is stripped and the variable is registered as
    a sprite-local variable automatically;
  - list it in `assets/<Sprite>/sprite.json` under `privateVariables`;
  - list it in `assets/stage/stage.json` under `globalVariables` (project-wide).
- **Lists** — `list.newList("items", [], true)` registers the list for that sprite; `false` does
  not, which is the right choice for a list you declared in `stage.json`'s `globalLists`.
- **Messages** — `broadcast.fire("go")` and `//#whenbroadcastreceived("go")` register `go`
  themselves; no declaration needed.

Stage declarations are objects in `stage.json`:

```json
{
  "globalVariables": ["score"],
  "globalLists": { "items": [1, 2, 3] }
}
```

`globalLists` values are the list's initial contents. A name that is never declared still appears
in the compiled blocks, but the project has no entry for it, so the Scratch editor will not show
it in the variable palette.

## See also

- [Motion](/api/motion), [Looks](/api/looks), [Sound](/api/sound) — the three libraries with their
  own pages.
- [API Examples](/api/examples) — complete programs using these functions.
- [Language reference](/reference/language-reference) — statements, expressions, classes and the
  package mechanism.
