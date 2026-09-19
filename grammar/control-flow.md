---
title: Control Flow
---

# Control Flow

Loops and branches are the part of the dialect that differs most from JavaScript. Scratch has no `for`, no `switch`, no `break`, and only a loose idea of what counts as a condition — so the compiler either rewrites your code into the blocks Scratch does have, or refuses to build.

The three statements that work are `if`, `while` and `for`. Each is compiled once, at build time, into a fixed block structure; nothing about the shape of a loop is decided while the project runs.

## Conditions

Scratch's hexagonal inputs only accept a boolean reporter: a comparison, `and`, `or`, `not`, or a sensing predicate such as `touching`. Anything else — a variable, a number, a `join` — is not a valid boolean slot.

jvavscratch papers over this for `if` and `while`: if the condition is not already one of the accepted shapes, it is wrapped in a comparison against zero.

```js
let flag = 1;

if (flag) {
    looks.say("on");
}
```

```
if <not <(flag) = 0>> then
```

So `if (flag)` means "if `flag` is not zero", which is exactly how Scratch's own `if (variable)` behaves. The wrap is applied when the test is anything other than:

- a `LogicalExpression` — `a && b`, `a || b`
- a `BinaryExpression` with a comparison operator — `<`, `>`, `<=`, `>=`, `==`, `===`, `!=`, `!==`

`!(a > 1)` also works: the unary `!` compiles to a `not` block and the whole expression is wrapped as usual. The result of `if (!flag)` is a double negation — `not <not <flag> = 0>` — which is harmless but worth recognising when you read the generated project.

::: warning `&&` and `||` operands are much stricter than the condition they appear in
Inside `and` and `or`, Scratch accepts only boolean-shaped blocks, and the compiler enforces this rather than wrapping. Each operand must be one of:

- a comparison — `n > 0`, `a == b`
- another logical expression — `(a && b) || c`
- a boolean literal — `true`, `false`
- a negation — `!flag`
- a **spiky** library call — one that returns a boolean, such as `sensing.keyDown("space")` or `sensing.touching("edge")`

A bare variable is **not** enough. This aborts the build:

```js
if (flag1 && flag2) {   // ✗ error: Cannot resolve logical expression
    looks.say("both");
}
```

```
error: Cannot resolve logical expression
 = help: This block requires the left-hand-side to be a spiky block.
```

Write the comparison out — `if (flag1 != 0 && flag2 != 0)` — or use two nested `if`s. The same restriction applies to a `for` loop's test, so `for (let i = 0; i < 10 && flag; i++)` does not compile.
:::

## `if` / `else` / `else if`

```js
if (sensing.keyDown("space")) {
    score = score + 1;
} else if (sensing.mouseDown()) {
    score = 0;
} else {
    score = -1;
}
```

This compiles to a `control_if_else` whose second substack holds the next `control_if_else`, and so on. An `if` with no `else` compiles to `control_if`. There is no limit on nesting depth beyond the project's block count.

**Braces are mandatory.** `if (x) doThing();` aborts the build with an internal error (`Cannot read properties of undefined (reading 'length')`), because the generator assumes the consequent is a block statement:

```js
if (a > 0)
    looks.say("yes");   // ✗ build fails — no braces


if (a > 0) {
    looks.say("yes");   // ✓
}
```

## `while`

```js
let i = 0;
while (i < 3) {
    motion.move(10);
    i++;
}
```

compiles to `control_while`, with the condition in the `CONDITION` input and the body in `SUBSTACK`. The condition follows the wrapping rule above, so `while (flag)` works even though `flag` is not a comparison.

`while (true)` is special-cased into `control_forever`, Scratch's "forever" block:

```js
while (true) {
    motion.move(1);
    motion.bounceOnEdge();
}
```

::: danger `while (true)` silently discards the rest of the script
Because it becomes a `forever` block, the compiler marks the chain as terminated. Any statement *after* a `while (true)` loop in the same file is dropped, with no warning:

```js
while (true) {
    motion.move(1);
}

looks.say("never compiled");   // ✗ dropped silently
```

Put the loop last in the file, or start the other code in its own file. Only the literal `true` triggers this; `while (1)` compiles to an ordinary `control_while` with the condition `not <1 = 0>`, which never exits either, but at least does not swallow the rest of the file.
:::

A loop that never yields would freeze Scratch — but it does not, because Scratch's own loop blocks yield once per iteration. `while` is therefore safe to write without a `control.wait`, though it runs at one iteration per frame (about 30 per second by default). If you need a loop to finish within a single frame, move it into a `turbo_` custom block, where screen refresh is disabled:

```js
function turbo_countTo(n) {
    let i = 0;
    while (i < n) {
        i++;
    }
    return i;   // requires custom_block_return = true
}
```

To leave a loop early, set a flag the condition checks — there is no `break` (see below):

```js
let running = 1;
let i = 0;
while (running != 0 && i < 100) {
    if (list.getItem("items", i) == "stop") {
        running = 0;
    }
    i++;
}
```

## `for`

Scratch has no counting loop, so a `for` becomes a **repeat-until** whose condition is the negation of yours, with the update moved into the top of the body:

```js
for (let i = 0; i < 4; i++) {
    motion.move(100);
    motion.turnRight(90);
}
```

```
let i
set i to 0
repeat until <not <(i) < (4)>>
    change i by 1
    move 100 steps
    turn right 90 degrees
```

Note the extra `let i` before the loop: the declaration is **hoisted out of the loop** by the source transformer, so `i` exists both before and after it. Unlike JavaScript's block-scoped `let`, the loop variable keeps its final value.

Because the test is negated, the comparison must be inverted exactly — which is why the compiler is strict about what a `for` header may contain:

| Part | Accepted | Rejected |
|---|---|---|
| init | `let i = 0`, `i = 0` | `let i = 0, j = 0` (two declarators), `var i = 0`, `for (;;)` |
| test | a comparison (`i < 4`), a logical expression of comparisons, a negation | a bare variable (`flag`) |
| update | `i++`, `i--`, `i += 2`, `i = i + 2` | anything else |

Each rejection is a hard error, not a warning:

```
error: The first argument of a For loop must be an identifier or assignment expression.
error: The second argument of a For loop must be a valid expression (Binary / logical expression).
error: The last argument of a For loop must be an update, or assignment expression.
```

Two consequences worth remembering:

- **The update is optional and defaults to `++`.** `for (let j = 0; j < 3;)` compiles into a loop that increments `j` — silently the opposite of what the JavaScript would do. Always write the update.
- **`var` does not work in a `for` header.** The hoisting pass only rewrites `let` and `const` declarations; a `var` init reaches the generator as a declaration node and fails the first check above.

The update is placed at the top of the body, before your own statements, which matters if your body reads the counter in an early `if` — it sees the value *after* the increment.

Nested loops compile as nested substacks and nest as deeply as you like:

```js
for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
        pen.stamp();
        motion.changeX(30);
    }
    motion.setX(0);
    motion.changeY(-30);
}
```

## `switch`

`switch` is not a Scratch construct either. It is rewritten, before generation, into an `if` / `else if` chain comparing the discriminant with each case using `==`:

```js
switch (x) {
    case 1:
        looks.say("one");
        break;
    case 2:
        looks.say("two");
        break;
}
```

becomes the equivalent of

```js
if (x == 1) {
    looks.say("one");
} else if (x == 2) {
    looks.say("two");
}
```

Limits:

- **`default:` aborts the build.** The transform has no test expression to compare against, so it produces a malformed node: `error: Property test of IfStatement expected node to be of a type ["Expression"] but instead got undefined`. Use a trailing `else` — that is, use `if` / `else if` / `else` directly instead of `switch`.
- **`break;` is not needed and warns.** Cases are separate block statements, so there is no fall-through to prevent; each `break` produces `[Warn]: No `impl` for 'BreakStatement'` and is skipped. The project is fine, but the noise in the build log hides real problems.
- **The discriminant is re-evaluated for every case.** Each case becomes `discriminant == caseValue`, and the discriminant expression is compiled once per comparison. A `switch` on a function call re-runs that call for each case. Assign it to a variable first.

Given all of that, `switch` is only worth using when you would otherwise write a long `else if` chain of equality tests on a plain variable, and when the case bodies contain no `break` — which, in JavaScript, they always do.

## Operators

Arithmetic and comparison are ordinary value expressions; they may appear anywhere a number or boolean is expected.

| Source | Blocks |
|---|---|
| `a + b`, `a - b`, `a * b`, `a / b`, `a % b` | `operator_add`, `_subtract`, `_multiply`, `_divide`, `_mod` |
| `a == b`, `a === b` | `operator_equals` |
| `a != b`, `a !== b` | `not <a = b>` |
| `a < b`, `a > b` | `operator_lt`, `operator_gt` |
| `a <= b` | `<a < b> or <a = b>` |
| `a >= b` | `<a > b> or <a = b>` |
| `-a`, `+a` | `operator_subtract` / `operator_add` against a literal `0` |
| `!a` | `operator_not` |
| `a ** b` | `math.pow(a, b)` |
| `a && b`, `a \|\| b` in a condition | `operator_and`, `operator_or` |
| `a && b`, `a \|\| b` in value position | rewritten to a ternary: `a ? b : a` / `a ? a : b` |

Three of these have behaviour you would not guess from the JavaScript:

**`===` is not identity.** Both `==` and `===` map to the same `operator_equals` block, and Scratch compares everything as text or as numbers. `"1" === 1` is true in jvavscratch and false in JavaScript.

**`<=` and `>=` duplicate their right-hand side.** They are expanded into an `or` of two comparisons, and the right operand is compiled twice:

```js
if (i <= Math.random()) {   // ✗ random is called twice — two different numbers
    …
}
```

The same applies to any function call, list read or side-effecting expression on the right of `<=` or `>=`. Compute it first:

```js
let n = Math.random();
if (i <= n) {
    …
}
```

**Boolean semantics are Scratch's.** Any non-zero value is true in a condition; comparisons coerce text to numbers where they can, and `"" = 0` is true in Scratch. Do not rely on JavaScript's `null`/`undefined` distinctions — neither exists in the output.

## Statements that are not supported

Unimplemented statements are **warnings, not errors**: the statement is skipped and the build continues. A loop written with one of these disappears from the project.

| Statement | Result |
|---|---|
| `break;` | `[Warn]: No `impl` for 'BreakStatement'`, skipped |
| `continue;` | `[Warn]: No `impl` for 'ContinueStatement'`, skipped |
| `do { … } while (…);` | `[Warn]: No `impl` for 'DoWhileStatement'`, the whole loop is skipped |
| `try { … } catch (e) { … }` | Skipped with a warning |
| A label (`outer: for (…)`) | The label is ignored |
| Single-line `if` without braces | Hard error — see above |

`do…while` is the sharp one: the body never runs at all, and the only clue is one line of warning output. Always read the build log — see [Checking your work](/guide/tutorials#checking-your-work).

`switch` with a `default:` branch deserves a mention here too, since it is the only control-flow construct that fails the build outright rather than warning.

## See also

- [Variables and Assignment](/grammar/variables) — the counters and flags these loops read and write.
- [Functions](/grammar/functions) — `turbo_` blocks, which is how you make a loop finish in one frame.
- [Event Blocks](/grammar/events) — `control.wait`, `control.waitUntil` and the hats that start a script.
- [Language Reference](/reference/language-reference) — the exact argument forms of every library call used above.
