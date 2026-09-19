---
title: Grammar Overview
---

# Grammar Overview

jvavscratch compiles a **dialect of JavaScript**, not JavaScript. The dialect is the subset of the language that maps onto Scratch blocks, plus a handful of extensions that exist because Scratch has features JavaScript spells differently.

This page explains the rules that apply everywhere: how the compiler reads your code, which constructs are supported, which are rejected, and how it fails. The topic pages go into detail.

| Page | Covers |
|---|---|
| [Variables and Assignment](/grammar/variables) | `let` / `const` / `var`, the `_l_` `_g_` `_c_` prefixes, lists, list indexing |
| [Functions](/grammar/functions) | Custom blocks, parameters, `turbo_`, `async`/`await`, return values |
| [Classes and Inheritance](/grammar/classes) | Class properties, methods, instances, `method.get` / `method.set`, `extends` |
| [Control Flow](/grammar/control-flow) | `if`, `while`, `for`, `switch`, boolean expressions, operators |
| [Event Blocks](/grammar/events) | Hat directives, keyboard, clicks, clones, broadcasts |
| [Language Reference](/reference/language-reference) | Every built-in library function and constant |

## Ahead-of-time compilation

The compiler parses your source once, at build time, and emits a Scratch `project.json`. Nothing of your source survives into the output: there is no interpreter, no parser, no expression evaluator.

Two consequences follow, and they explain nearly every rule on the following pages:

- **A construct that cannot be expressed as blocks cannot be compiled.** There is no "fall back to slow JavaScript" mode. Arrow functions, array literals, object literals and template literals are hard errors, not degraded features.
- **Control flow is structural, not dynamic.** Loop and branch structure is frozen when the blocks are emitted. You cannot build a program that chooses its own control flow at runtime.

## Statements and values

The compiler dispatches on syntax node type, and it uses two different tables for the two halves of the language.

A **statement** is executed for its effect: a variable declaration, an assignment, an `if`, a loop, a call used as a command, a class declaration. Statements are chained together with `next`/`parent` pointers in the order the generator returned them.

A **value** is an expression that is read: a literal, an identifier, an arithmetic expression, a value-returning library call. A value generator returns a block reference (or marks the value as a compile-time constant) that some statement will use as an input.

The distinction has a visible consequence in the library API. Most Scratch blocks have both forms, and jvavscratch splits them by *position* — `looks.say("hi")` is a statement, `operation.join("a", "b")` is a value:

```js
let greeting = operation.join("Hello, ", "World!");   // fine: used as a value
operation.join("Hello, ", "World!");                  // warns: a reporter cannot stand alone
```

A reporter block with no consumer is not a Scratch statement, so the compiler warns `Cannot get the value of a function! Use util.getReturnAddress instead.` and drops it.

## How failures are reported

The compiler is strict about values and lenient about statements, and it is worth knowing which you are looking at.

| What went wrong | Behaviour |
|---|---|
| Unknown expression node type (e.g. a template literal) | **Hard error**, build aborts with a source-located message. |
| Unsupported syntax the parser rejects outright (single-line `if`) | Build aborts with an internal error message. |
| Statement with no implementation (e.g. `try`) | **Warning**, statement skipped, build continues. |
| Unknown library name, or unknown function in a known library | **Warning**, call skipped, build continues. |
| Use of a custom function before it is defined | Build aborts with an internal error message. |
| Wrong number of arguments to a custom block | Compiles; the block misbehaves at runtime. |

Warnings are not noise. A successful build with warnings usually means blocks you expected are missing from the project, so read the build output. See [Checking your work](/guide/tutorials#checking-your-work).

## Boolean slots

Scratch is strict about what may go inside a hexagonal (boolean) input: only a boolean reporter, another logical operator, or a binary comparison. It will not accept a number or a text block there.

jvavscratch enforces this too. Whenever an `if` or `while` condition is not already one of those three shapes, the compiler synthesises a comparison against zero and wraps it:

```js
let flag = 1;

if (flag) {          // not a boolean expression
    looks.say("on");
}
```

becomes

```
if <not <(flag) = 0>>
```

This is why `if (flag)` behaves as "truthy" in the same way Scratch's own `if (variable)` does. Comparisons (`<`, `>`, `<=`, `>=`, `==`, `===`, `!=`, `!==`) and `&&` / `||` / `!` pass through unchanged.

The related restriction is on operands: an `and`, `or` or `not` may only be given booleans, other logical operators, or comparisons. Scratch will accept `5 + 1 && false` in some cases and reject `5 && 3`; the [Language Reference](/reference/language-reference#logical-expressions) documents the pairs that work.

## Syntax the compiler rewrites for you

Some JavaScript constructs have no direct Scratch equivalent but can be expressed as blocks, so they are rewritten before parsing rather than rejected.

**Exponentiation.** `a ** b` becomes `math.pow(a, b)`, because Scratch has no power block. Note that `math.pow` does not support negative exponents.

**Ternary expressions.** `x ? a : b` in value position is rewritten into a temporary variable plus an `if`/`else` that assigns it. You get a variable named `__jvavscratch_temp` per rewrite, and the rewrite is statement-level, so a ternary buried inside a larger expression is evaluated in a separate statement before the expression that uses it.

**Short-circuit `&&` / `||` outside a condition.** In a condition, `&&` and `||` map directly onto the `and`/`or` blocks. In value position there is no such block, so they are rewritten to the equivalent ternary — `a && b` to `a ? b : a`, `a || b` to `a ? a : b` — preserving short-circuit semantics at the cost of evaluating `a` twice.

**`Math.*` calls.** `Math.floor(x)`, `Math.ceil(x)`, `Math.sqrt(x)`, `Math.abs(x)`, `Math.sin/cos/tan/log(x)` become `math.operation("floor", x)` and friends; `Math.round` becomes `math.round`; `Math.pow` becomes `math.pow`; `Math.random()` becomes `math.random(0, 1)`; `Math.PI` becomes `math.pi()`.

**List sugar.** `myList[i]` becomes `list.getItem("myList", i)`, `myList[i] = v` becomes `list.replace("myList", i, v)`, and `myList.length` becomes `list.length("myList")`.

::: details A cosmetic wart on `myList.length`
The `.length` rewrite is attempted by the source transformer and then, because the replacement it builds is itself a `.length` member expression, the transformer recurses until it overflows the stack. It catches that, logs `Syntax transformation error: RangeError: … Maximum call stack size exceeded`, and leaves your code as it was — at which point the ordinary expression compiler handles `.length` correctly. The build succeeds and the block is right; the message is noise. Findings like this are why `list.length("myList")` is the form worth writing.
:::

Because these rewrites happen on the source text before the AST is built, they are invisible in your code and cannot be opted out of.

## What is not supported

These are hard errors or silent omissions. Plan around them rather than trying to work around them inside the source.

| Construct | Result |
|---|---|
| Arrow functions `x => …` | Error: `No implementation for expression type 'ArrowFunctionExpression'`. |
| Template literals `` `a ${b}` `` | Error: `No implementation for expression type 'TemplateLiteral'`. Use `operation.join`. |
| Array literals `[1, 2]`, object literals `{a: 1}` | Error: no implementation for `ArrayExpression` / `ObjectExpression`. |
| Single-line `if (x) doThing();` | Build aborts. Always use braces. |
| `switch` with a `default:` branch | Build aborts. Omit the `default`. |
| `this` inside a class method | Compiles to a dropped value. Pass the property as a parameter instead. |
| `static` members, getters and setters, `super` | Not implemented — no effect, or a runtime mismatch. |
| `try` / `catch` | Warning; the whole statement is skipped. |
| Promises, callbacks, first-class functions | Not representable. There is no runtime to schedule them. |
| Passing a function as an argument | Not representable; `function` declarations are compile-time only. |
| Runtime `eval`, `new Function` | Not representable. |

`async`/`await` is the one asynchronous feature that does exist, and it works by compiling a call into a broadcast-and-wait handshake rather than by suspending a real coroutine. See [Functions](/grammar/functions#asynchronous-functions).

## Library calls

Every Scratch block is reached through a namespace:

```js
motion.move(10);
looks.say("hi");
control.wait(1);
sound.playSound("meow");
sensing.ask("Your name?");
list.push("items", 5);
variable.show("score");
broadcast.fire("start");
pen.stamp();
method.instancesOf("Apple");
```

The ten block libraries are `motion`, `looks`, `sound`, `control`, `sensing`, `list`, `variable`, `broadcast`, `pen` and `method`. The value libraries — the ones whose calls can be read as expressions — are `motion`, `looks`, `sound`, `sensing`, `list`, `math`, `operation`, `method` and `util`. `operation` and `math` produce values only; `control`, `variable`, `broadcast` and `pen` produce effects only.

Functions map onto blocks nearly one-to-one but not perfectly; the [Language Reference](/reference/language-reference) is the authoritative list of names and parameters.

Two failure modes are worth internalising:

- An unknown **library** or an unknown **function** in a known library is a warning, and the entire call is skipped. `looks.sayForSecond(...)` (missing `s`) compiles to nothing at all. The build still succeeds.
- Passing fewer arguments than the block needs is a hard error (`Not enough arguments`), while passing more than the block uses is silently ignored.

## Packages extend the compiler

A third-party package's `src/index.ts` is `require()`d by the compiler during the build. It can register new block libraries, new value libraries, new globals, and even replacement implementations for whole syntax node types — `statement_implements` and `type_implements` are consulted **before** the built-ins, so a package can redefine how, say, `IfStatement` compiles.

That means a package can change the meaning of code you already have. Since packages are per-project (they live in `lib/`), the same source file can compile differently in two projects. See [Basic Usage](/guide/basic-usage#dependencies) for how packages are installed.
