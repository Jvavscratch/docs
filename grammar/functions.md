---
title: Functions
---

# Functions

A `function` declaration in jvavscratch becomes a **Scratch custom block**: a "define" hat at the top level of the sprite, plus a call block everywhere the function is used. Parameters become the custom block's arguments.

```js
function greet(name) {
    looks.say(operation.join("Hello, ", name, "!"));
}

greet("World");
```

compiles into one `procedures_definition` (with a `procedures_prototype` mutation declaring the argument `name`), one `argument_reporter_string_number` inside the body, and one `procedures_call` at the call site. Calling the same function from ten places produces ten call blocks and still one definition.

## Rules that are enforced

**Declare before use.** There is no hoisting. The definition must appear earlier in the *compilation order* than any call:

```js
greet("World");          // ✗ build aborts

function greet(name) {
    looks.say("Hi!");
}
```

The failure is reported as `Cannot read properties of undefined (reading 'async')` — an internal error, not a diagnostic. The same rule applies across files: files inside a sprite are compiled in order, so a helper has to live in a file compiled before its callers (see [the tutorial's note on file order](/guide/tutorials#why-a_setup-js-is-named-that-way)).

**The argument count must match exactly.** Passing too few arguments to a built-in library function aborts the build with `Not enough arguments`. Passing too few or too many to a *custom* block does not: the call block's argument list simply will not line up with the definition's prototype, and Scratch will silently refuse to run the procedure. Nothing warns you. This is the single most confusing runtime failure in the dialect.

**Names must be declared at the top level of a file.** A `function` nested inside another function compiles, but it is emitted as a sibling custom block with no closure — and if the inner function references the outer function's parameter, the build aborts with `value.functions is not a function`. Keep every declaration at the top level of the file.

**One definition per name.** The compiler records each function's signature in a build-wide table keyed by name, so a second `function greet` in the same project overwrites the first. Two files defining `greet` is not an error; it is whichever compiled last.

## Parameters

Parameters become procedure arguments. Inside the body, the parameter name resolves to an argument reporter block:

```js
function clamp(value, low, high) {
    if (value < low) {
        return low;
    }
    if (value > high) {
        return high;
    }
    return value;
}
```

Arguments are passed by value in the Scratch sense — the call site evaluates each expression and feeds the resulting reporter into the call block.

## Turbo functions

Prefix a declaration with `turbo_` to create the custom block with **run without screen refresh** enabled:

```js
function turbo_walk(times) {
    for (let i = 0; i < times; i++) {
        motion.move(10);
    }
}

turbo_walk(50);
```

The prefix is stripped from the generated block name — the block is `walk` — but the *source* name, prefix included, is what the compiler keys everything on, including `util.getReturnAddress` lookups. Call it as `turbo_walk(50)`.

Use it for anything that should complete within one frame: geometry, searching a list, initialising state. Without it, a custom block yields between blocks, which is what makes animation visible but also what makes a 200-iteration loop take 200 frames.

## Returning values

A `return` statement is legal in any function. What it *does* depends on the project manifest.

### With `custom_block_return = true`

Set in `jvavscratch.toml`:

```toml
custom_block_return = true
```

Now `return` produces a real value, and both assignment forms compile into a `procedures_call` embedded where the value is needed:

```js
function double(n) {
    return n * 2;
}

let x = double(21);   // x = <procedures_call double(21)>
looks.say(x);
```

and

```js
let x = 0;
x = double(21);       // same, assignment form
```

This relies on TurboWarp's procedure-return support — the generated `procedures_call` mutation carries a return type, which vanilla Scratch's VM rejects. Build with this on and open the project in TurboWarp.

This is the form to prefer: the value flows through the block graph, the function can be used inside a larger expression's inputs, and there is no hidden state.

### Without it

The default is off. A `return` then compiles into an assignment to a compiler-generated variable, and the caller reads that variable back explicitly:

```js
function double(n) {
    return n * 2;
}

double(21);
let x = util.getReturnAddress("double");
```

`util.getReturnAddress` reads the hidden variable the procedure body last wrote to. It is worth knowing about because it also means an *async* function's result can be collected this way, but it has sharp edges:

- It takes the function's **source** name. A `turbo_double` is looked up as `"turbo_double"`, even though the block is named `double`.
- It reads whatever the variable holds *now*, so if the call did not happen, or the function returned nothing, you get stale or empty data with no error.
- The hidden variable's name is a random five-character string regenerated on every build, so nothing outside `util.getReturnAddress` can name it.

### Returning from an async function

`return` works inside `async function` bodies in both modes. In the `custom_block_return` mode the call site has to be awaited to see the value; in the default mode `util.getReturnAddress` reads it after the await resolves.

## Asynchronous functions

`async` and `await` exist, but not as a coroutine. There is no scheduler in the output, so an async call is compiled into a **broadcast-and-wait handshake**:

```js
async function myTest() {
    looks.sayForSeconds("yielding", 1);
}

async function doCode() {
    x = 5;
    await myTest();
    x = 10;
}

doCode();
looks.say("Hello!");
```

`doCode()` fires a broadcast and continues; the receiver runs the body as its own script. `await myTest()` fires a second broadcast, then waits on a flag variable until the called function has finished. The `looks.say("Hello!")` after the call runs immediately, because `doCode` is asynchronous — it does not block its caller.

Rules:

- `await` may only be applied to a direct call to an async **function** by name: `await myTest()`. Awaiting a library call, a value, or a member expression is a hard error (`Argument must be a function call`).
- The function being awaited must already be defined and must be `async` (`Argument must be an existing async function!`). Same declare-before-use rule as everything else.
- **Only await a function that actually yields.** If an async function completes without ever yielding — for example `async function pi() { return 3.141; }` — then by the time the caller reaches its "wait for the function to start" step, the function has already finished, and the wait never completes. The script hangs. An async function is only worth awaiting if its body contains a yielding block such as `looks.sayForSeconds`, `control.wait`, or another awaited async call.
- Async arrow functions are not valid — arrow functions are not supported at all.

Because async calls are implemented with broadcasts, an async function called from two places at once shares one flag variable. Do not expect reentrancy.

## What you cannot do with functions

- **No first-class functions.** `function` declarations exist only at compile time. You cannot assign one to a variable (`let f = greet;` compiles into a variable reporter named `greet`, which is not what you want), pass one as an argument, or return one.
- **No callbacks or higher-order functions.** `repeatAction(3, () => { … })` is not expressible; the arrow function is a hard error and the call site has nothing to pass.
- **No arrow functions in any position.**
- **No `this`.** There is no receiver binding.
- **No default parameters, rest parameters or destructuring** in parameter lists.

Recursion, on the other hand, works — a custom block may call itself, directly or through other blocks.

## See also

- [Classes](/grammar/classes) — methods are custom blocks too, with the class's properties threaded through as leading arguments.
- [Control Flow](/grammar/control-flow) — the loops and branches you will use inside a body.
- [Language Reference](/reference/language-reference) — the built-in library functions a body can call.
