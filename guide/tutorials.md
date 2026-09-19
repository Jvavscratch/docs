---
title: Tutorials
---

# Tutorials

A hands-on walkthrough. By the end you will have built a small project with movement, a loop, variables, a custom block, a keyboard event, a broadcast, and a function that returns a value — and you will have looked at the blocks each of those produced.

Everything here is a complete file you can paste in and build. The three parts are cumulative: part 2 edits the file from part 1, part 3 turns it into a multi-file sprite.

Prerequisites: jvavscratch installed ([Installation](/guide/installation)), and the [Getting Started](/guide/getting-started) page read once.

## Part 1 — A script that draws a square

Create the project:

```bash
jvavscratch new walking-cat
cd walking-cat
```

The scaffold already has `src/Sprite1.js` containing `looks.say("Hello, World!");`. Open it and replace the whole file with:

```js
//#whenflagclicked()

motion.gotoXY(0, 0);
looks.sayForSeconds("Let's draw a square!", 1);

for (let i = 0; i < 4; i++) {
    motion.move(100);
    control.wait(0.3);
    motion.turnRight(90);
}

looks.say("Done!");
```

Build it:

```bash
jvavscratch build
```

```
Building walking-cat
Finished walking-cat [unoptimized] in 0.20s
```

and open `target/walking-cat.sb3` in TurboWarp. Press the green flag.

### What each line became

`//#whenflagclicked()` on the first line is a **hat directive**: it selects the hat block this file's script hangs from. It is a comment as far as JavaScript is concerned, so it costs nothing at runtime, and it has to be the first comment in the file. The full set is on the [Event Blocks](/grammar/events) page.

`motion.gotoXY(0, 0)` compiles to `motion_gotoxy` with both inputs filled in. Every built-in library call is a one-to-one mapping onto a Scratch block; `motion`, `looks`, `sound`, `control`, `sensing`, `list`, `variable`, `broadcast`, `pen` and `method` are the libraries that exist.

The `for` loop is the interesting one. Scratch has no `for` block, so the compiler emits a **repeat-until** loop whose condition is the negation of yours, and moves the `i++` into the top of the loop body:

```
repeat until (not (i < 4))
    i = i + 1
    … body …
```

That is why `for` requires an explicit initialiser, test and update in the form the compiler can translate — see [Control Flow](/grammar/control-flow#for-statements).

`control.wait(0.3)` is `control_wait`. Without it the four sides would be drawn in a single frame and you would see nothing move; Scratch only redraws between yields.

### Try it

- Change `motion.turnRight(90)` to `motion.turnRight(120)` and re-run the loop — the sprite draws a triangle instead. Nothing about the program shape changes.
- Add `looks.switchCostumeTo("Costume1")` before the loop if your sprite has more than one costume; the call is a no-op warning-free if the costume name does not exist, the block just does nothing at runtime.

## Part 2 — Variables and custom blocks

Now make the sprite score points and draw its square "without screen refresh".

Replace `src/Sprite1.js` with:

```js
//#whenflagclicked()

let score = 0;
let stepSize = 25;

function turbo_square(side) {
    for (let i = 0; i < 4; i++) {
        motion.move(side);
        motion.turnRight(90);
    }
}

function addScore(points) {
    score = score + points;
    looks.say(operation.join("Score: ", score));
}

motion.gotoXY(0, 0);
turbo_square(80);
addScore(10);
```

Build and run it. The sprite snaps out a square with no visible pauses, then says `Score: 10`.

### Variables

`let score = 0;` creates a Scratch variable named `score`, and because there is no prefix it is **global**. Reading `score` anywhere else in the project works, and its block field is simply the name.

Declaring a variable does not put it in the Scratch palette by itself. Globals are registered from the stage's asset data, so add the names to `assets/stage/stage.json`:

```json
{
  "volume": 100,
  "currentCostume": 0,
  "globalVariables": ["score"],
  "globalLists": {}
}
```

Do this for every global you want to be a real project variable. Without it the blocks still compile and still run, but the variable is not declared in the project, which shows up as a missing entry in the editor's variable palette. See [Declaring global variables and lists](/guide/basic-usage#declaring-global-variables-and-lists).

If a variable should belong to one sprite instead of the whole project, prefix it with `_l_` — `let _l_speed = 5;` declares `speed` as a sprite-private variable. There is no block scoping: a `let` inside a loop or a function body is not confined to it. Full details on [Variables and Assignment](/grammar/variables).

### Custom blocks

`function addScore(points) { … }` compiles into a `procedures_definition` — a "define" hat — plus a call block wherever `addScore(10)` appears. Parameters become procedure arguments, and the `points` identifier inside the body is an argument reporter.

Two rules matter, and both produce confusing failures when broken:

1. **A function must be defined before the code that calls it is compiled.** There is no hoisting. Move `addScore` below `addScore(10)` and the build fails with `Cannot read properties of undefined (reading 'async')` — an internal error leaking through, not a friendly one. The same applies across files: files are compiled in order, so a shared helper has to live in a file that is compiled before its callers.
2. **The argument count must match exactly.** Passing too few or too many arguments produces a call block whose signature does not line up with its definition; Scratch then quietly refuses to run the procedure. Nothing warns you.

### Turbo blocks

`function turbo_square(side)` — the `turbo_` prefix means the generated custom block is created with **run without screen refresh** on. The prefix is stripped from the block's name: the block is called `square`, and it is called as `turbo_square(80)` in source. Use it for geometry, list scanning and anything else where you want the work done in one frame.

### Composing expressions

`operation.join("Score: ", score)` is the `operator_join` block. Note that the library call has to be *evaluated* — `operation.join(...)` on a line by itself compiles to nothing useful, because a value-producing block cannot stand alone as a statement. Put it inside `looks.say(...)`, an assignment, or a condition:

```js
let label = operation.join("Score: ", score);   // works
operation.join("Score: ", score);               // warns: cannot get the value of a function
```

## Part 3 — Events and multiple scripts

Scratch programs are event-driven: each script starts from a hat. In jvavscratch, one script is one file, so a sprite with three behaviours is a folder with three files.

Delete `src/Sprite1.js` and create the folder layout instead:

```
src/
  Sprite1/
    a_setup.js
    keys.js
    receive.js
```

::: warning Do not keep both
If `src/Sprite1.js` and `src/Sprite1/` both exist, the standalone file wins and the folder is ignored, silently. Delete the file when you switch to a folder — and if a script you edited seems to have no effect, check for a leftover file first.
:::

`src/Sprite1/a_setup.js` — the green-flag script and the shared helpers:

```js
//#whenflagclicked()

let score = 0;

function turbo_bounce(times) {
    for (let i = 0; i < times; i++) {
        motion.move(20);
        motion.bounceOnEdge();
    }
}

looks.say("Press space!");
```

`src/Sprite1/keys.js` — a keyboard hat that calls the helper and fires a broadcast:

```js
//#whenkeypressed("space")

score = score + 1;
turbo_bounce(3);
broadcast.fire("scored");
```

`src/Sprite1/receive.js` — a second script listening for that broadcast:

```js
//#whenbroadcastreceived("scored")

looks.sayForSeconds(operation.join("Score is now ", score), 1);
```

Build it, run it, press space a few times. Each press hops the sprite and updates the score, and the two scripts stay independent of each other — they communicate only through the broadcast.

### Why `a_setup.js` is named that way

`keys.js` calls `turbo_bounce`, which is defined in `a_setup.js`. Files are compiled in the order the build sees them, which in practice is name order, so `a_setup.js` is compiled before `keys.js` and the definition is known by the time the call is reached. Rename it to `z_setup.js` and the build fails.

If you would rather not depend on that, put the helper in the same file as its caller. The rule is only about *compile order*, not about scope: the custom block itself is global to the sprite once compiled.

### What the directives compiled to

`//#whenkeypressed("space")` becomes `event_whenkeypressed` with its key field set. The key strings Scratch knows are `space`, `up arrow`, `down arrow`, `left arrow`, `any`, and the single characters `a`–`z` and `0`–`9`; anything else falls back to `space`. `//#whenbroadcastreceived("scored")` becomes `event_whenbroadcastreceived` with the message name in its field — and the broadcast is also registered in the project, so it appears in the editor's broadcast menu. `broadcast.fire("scored")` sends it.

The messages you send and receive are plain strings that have to match exactly. There is no shared enum, and a typo is not a compile error — it is a script that never starts.

## Part 4 — Returning a value from a function

Scratch procedures do not return values natively. jvavscratch has two ways around that; the modern one is a manifest switch.

Add it to `jvavscratch.toml`:

```toml
name = "walking-cat"
description = ""
version = "0.0.1"
custom_block_return = true

[dependencies]
```

Then add this to `src/Sprite1/a_setup.js`, above the `looks.say("Press space!")` line:

```js
function turbo_double(n) {
    return n * 2;
}

let doubled = turbo_double(21);
looks.say(operation.join("21 doubled is ", doubled));
```

With `custom_block_return = true`, `let doubled = turbo_double(21);` compiles into a `procedures_call` block whose mutation carries a return type, embedded directly as the input of the `set variable` block. In TurboWarp the call evaluates to the value the function returned.

Order still matters: `turbo_double` is defined above the line that calls it, in the same file.

The older mechanism, which works with `custom_block_return` off, is to call the function and then read its result out of a compiler-generated variable:

```js
turbo_double(21);
let doubled = util.getReturnAddress("turbo_double");
```

That reads a hidden variable the procedure body wrote to. It works, but it is easy to get wrong: `util.getReturnAddress` wants the function's *source* name, so a `turbo_`-prefixed function has to be looked up with its prefix included, and a function that returns nothing gives you whatever the variable happened to hold. Prefer `custom_block_return`.

## Checking your work

A build that succeeds has not necessarily compiled what you meant. Unknown libraries, unknown functions and unimplemented statements are reported as warnings and then **skipped**, so a typo produces a warning and a missing block rather than an error:

```
[Warn]: Unknown function of library looks, got: 'sayForSecond'
[Warn]: No `impl` for 'BreakStatement'
```

Read the build output. If a block is missing when you run the project, grep the output for `Warn` before you go looking in the source.

The unpacked `target/walking-cat/project.json` is the ground truth for what was generated. It is the Scratch project format, so you can inspect any block dictionary directly:

```bash
node -e "const p=require('./target/walking-cat/project.json');
for (const t of p.targets) console.log(t.name, Object.keys(t.blocks).length, 'blocks', t.variables, t.lists);"
```

## Where to go next

- [Grammar](/grammar/) — the dialect topic by topic, including the constructs that are *not* supported and why.
- [Language Reference](/reference/language-reference) — the flat list of every built-in block function and constant.
- [FAQ](/faq/) — short answers to the problems people hit most.
