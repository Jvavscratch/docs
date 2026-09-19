---
title: Runtime module
---

# Runtime module

::: warning Design draft — not implemented
**There is no `Runtime` module in jvavscratch.** No repository in the organisation contains
an execution engine, a `Runtime` class, `Runtime.create()`, or any of the methods on this
page — a grep across the whole project finds nothing. Everything below is a **proposal**,
kept because it records a direction the project considered, not because it can be used.

Read [What actually happens today](#what-actually-happens-today) first. If you are looking
for the functions you can call from jvavscratch source, you want the
[API reference](/api/), not this page.
:::

The proposal: a JavaScript-side execution environment that would *host* a compiled project —
starting and stopping it, stepping it frame by frame, exposing its variables and sprites to
the surrounding program, and giving a debugger something to attach to. It would be the
counterpart that jvavscratch does not have: the compiler turns source into blocks, and this
would run the blocks.

## What actually happens today

jvavscratch is an **ahead-of-time compiler**. There is no interpretation step at any point:

- Source files are parsed to a Babel AST, each node is mapped to Scratch block opcodes, and
  the result is written out as an ordinary `project.json` and zipped into a `.sb3`
  ([Modules · Core](/modules/core), [Modules · Generator](/modules/generator)).
- **The runtime of a jvavscratch project is the Scratch VM** — Scratch itself, or TurboWarp.
  Starting a project, executing its scripts, holding variable state, moving sprites, drawing
  with the pen: all of that is the VM's job, and it does it from the blocks, not from
  JavaScript.
- `jvavscratch run [path]` builds the project and opens the `.sb3` in TurboWarp. That command
  is pre-configured for Windows only. Elsewhere it reports the platform mismatch and suggests
  either building and opening the file yourself, or passing `--bypass` to skip the check —
  but the TurboWarp binary is still looked for at the default Windows per-user install path
  (`C:/Users/<you>/AppData/Local/Programs/TurboWarp/TurboWarp.exe`), so bypassing the check on
  another platform ends with `cannot find turbowarp app` rather than a running project.

So the *shape* of an execution engine in this list — a project being loaded, sprites moving,
broadcasts being delivered, variables changing — is a real thing that happens. It just
happens inside the VM, driven by generated blocks, with no JavaScript API in front of it.

### Which parts of this draft describe something real

| In the draft | What it corresponds to in the code |
|---|---|
| The built-in block catalogue (`move`, `turnRight`, `setX`, `show`, `playSound`, …) | The compiler's built-in block libraries, in `generator/src/generator/CallExpressionSub/{motion,looks,control,sensing,sound,pen,list,variable,broadcast,method}.ts`. These are **compile-time** mappings to opcodes, not host functions. The names are close to the draft's, and the authoritative list is the [API reference](/api/). |
| Runtime state: variables, lists, sprite position, costume | Scratch VM state, produced by the `data_*`, `motion_*` and `looks_*` blocks the compiler emits. |
| Broadcasts, pen, sound | The `event_broadcast*`, `pen_*` and `sound_*` opcodes. Broadcasting works; there is no receiver-registration API — `when I receive` is compiled from the `whenIReceive` construct in the dialect. |
| "Executing jvavscratch code" | Compiling it and letting the VM run the output. There is no `execute(code)` entry point. |
| Everything else — `Runtime.create`, `loadProject`, plugins, workers, `runInWorker`, profiling, object pooling, `batchUpdate`, `registry`-style event emitters, `setRenderPriority` | **No counterpart.** Nothing in this table below is implemented anywhere. |

::: tip File an issue, not a pull request
If you want one of these to become real, the useful first step is an issue describing the
use case (a headless test runner? a debugger? a CI check that a project still runs?) — that
is a large design decision, not a gap to be filled in quietly.
:::

## Proposed API (design draft)

The remainder of this page is the draft as it was written. All of it is unimplemented.

### Core

#### `Runtime.create(options)`

Creates a runtime instance.

- `options.fps` — frame rate (default `30`).
- `options.width` — stage width (default `480`).
- `options.height` — stage height (default `360`).
- `options.headless` — run without a window (default `false`).
- `options.debug` — enable debug output (default `false`).

```javascript
const { Runtime } = require('jvavscratch/runtime');
const runtime = Runtime.create({
  fps: 60,
  debug: true
});
```

#### `start()`

Starts the runtime. Returns a promise resolving to the instance.

```javascript
await runtime.start();
```

#### `stop()`

Stops the runtime.

```javascript
await runtime.stop();
```

#### `loadProject(project)`

Loads a Scratch project, either as an object or as a path to a project file.

```javascript
await runtime.loadProject(projectData);
await runtime.loadProject('./project.sb3');
```

#### `execute(code)`

Executes jvavscratch source and resolves with the result.

```javascript
const result = await runtime.execute(`
  move(10);
  turnRight(15);
`);
```

### State

#### `getState()`

Returns the current runtime state.

```javascript
const state = runtime.getState();
console.log(state.sprites.length);
```

#### `setState(updates)`

Applies a state update.

```javascript
await runtime.setState({
  variables: {
    score: 100
  }
});
```

#### `getVariable(name, owner)`

Reads a variable, optionally scoped to a sprite.

```javascript
const score = runtime.getVariable('score');
const playerHealth = runtime.getVariable('health', 'Player');
```

#### `setVariable(name, value, owner)`

Writes a variable, optionally scoped to a sprite.

```javascript
await runtime.setVariable('score', 150);
await runtime.setVariable('health', 80, 'Player');
```

### Sprites

#### `getSprites()`

Returns every sprite.

```javascript
const sprites = runtime.getSprites();
```

#### `getSprite(idOrName)`

Returns one sprite by ID or name.

```javascript
const cat = runtime.getSprite('Cat');
```

#### `createSprite(options)`

Creates a sprite. Options: `name`, `x`, `y`, `size`, `direction`, `costume`.

```javascript
const newSprite = await runtime.createSprite({
  name: 'Dog',
  x: 0,
  y: 0,
  size: 100
});
```

#### `deleteSprite(idOrName)`

Deletes a sprite.

```javascript
await runtime.deleteSprite('Dog');
```

### Broadcasts

#### `broadcast(message)`

Sends a broadcast.

```javascript
await runtime.broadcast('game over');
```

#### `whenIReceive(message, callback)`

Registers a broadcast receiver and returns an ID for later removal.

```javascript
const receiverId = runtime.whenIReceive('game over', () => {
  console.log('Game over received!');
});
```

#### `cancelWhenIReceive(receiverId)`

Removes a broadcast receiver.

```javascript
runtime.cancelWhenIReceive(receiverId);
```

### Pen

#### `penDown()`

Puts the pen down.

```javascript
runtime.penDown();
```

#### `penUp()`

Lifts the pen.

```javascript
runtime.penUp();
```

#### `setPenColor(color)`

Sets the pen colour from a hex value or RGB triple.

```javascript
runtime.setPenColor('#FF0000');
```

#### `clearPen()`

Clears everything the pen has drawn.

```javascript
runtime.clearPen();
```

### Sound

#### `playSound(soundName, sprite)`

Plays a sound, optionally from a named sprite.

```javascript
await runtime.playSound('meow', 'Cat');
```

#### `stopAllSounds()`

Stops every playing sound.

```javascript
runtime.stopAllSounds();
```

### Debugging

#### `log(message)`

Writes a log line.

```javascript
runtime.log('Debug info: ' + variableValue);
```

#### `assert(condition, message)`

Asserts a condition, throwing when it does not hold.

```javascript
runtime.assert(score > 0, 'Score must be positive');
```

### Built-in block catalogue

::: warning These are not runtime calls
The catalogue below is how the draft imagined built-in functionality being invoked from a
host program. In the real compiler, these identifiers are the **built-in block libraries**
available in jvavscratch source: `move(10)` in a `.js` file compiles to a
`motion_movesteps` block. See the [API reference](/api/) for the list that actually exists,
and [Grammar](/grammar/) for how the constructs are written in the dialect.
:::

Movement:

```javascript
move(10);

turnRight(15);
turnLeft(15);
pointInDirection(90);
pointTowards('Sprite1');

setX(100);
setY(50);
glideTo(100, 50, 1); // glide to the position over 1 second

changeXBy(10);
changeYBy(10);
```

Looks:

```javascript
show();
hide();

changeSizeBy(10);
setSizeTo(100);

nextCostume();
switchCostumeTo('costume2');

changeEffectBy('color', 25);
setEffectTo('color', 0);
clearEffects();
```

Sound:

```javascript
playSound('pop');
playSoundUntilDone('pop');

changeVolumeBy(-10);
setVolumeTo(100);

changePitchBy(10);
setPitchTo(100);
```

Events:

```javascript
whenGreenFlag(() => {
  // code
});

whenIReceive('message', () => {
  // code
});

broadcast('message');
broadcastAndWait('message');
```

Control:

```javascript
wait(1); // wait 1 second

repeat(10, () => {
  // code
});

forever(() => {
  // code
});

if (condition, () => {
  // code
});

ifElse(condition, () => {
  // when true
}, () => {
  // when false
});
```

Sensing:

```javascript
touching('Sprite1');
touchingColor('#FF0000');
colorTouching('#FF0000', 'edge');

distanceTo('Sprite1');

keyPressed('space');
mouseDown();
mouseX();
mouseY();

timer();
resetTimer();
```

Operators:

```javascript
add(1, 2);
subtract(5, 3);
multiply(2, 3);
divide(6, 2);

lessThan(1, 2);
greaterThan(3, 2);
equals(5, 5);

and(true, false);
or(true, false);
not(false);

pickRandom(1, 10);

join('Hello', 'World');
letter(1, 'Hello');
lengthOf('Hello');
contains('Hello', 'ell');
```

Variables:

```javascript
setVariable('score', 100);

changeVariable('score', 10);

showVariable('score');
hideVariable('score');
```

Lists:

```javascript
addItem('apple', 'fruits');

insertItemAt(1, 'orange', 'fruits');

deleteItemAt(1, 'fruits');
deleteAllOf('fruits');

replaceItemAt(1, 'grape', 'fruits');

itemAt(1, 'fruits');
itemNumber('apple', 'fruits');
lengthOfList('fruits');
listContains('fruits', 'apple');
```

### Events

The draft's host-side event emitters, for observing a running project:

```javascript
runtime.on('start', () => {
  console.log('Runtime started');
});

runtime.on('stop', () => {
  console.log('Runtime stopped');
});

runtime.on('frame', (frame) => {
  console.log('Frame:', frame);
});

runtime.on('sprite:created', (sprite) => {
  console.log('Sprite created:', sprite.name);
});

runtime.on('variable:changed', (name, value, owner) => {
  console.log(`Variable ${name} changed to ${value}`);
});
```

| Event | Fired when | Arguments |
|---|---|---|
| `start` | The runtime starts | none |
| `stop` | The runtime stops | none |
| `frame` | Every frame | `frameNumber` |
| `project:loaded` | A project finishes loading | `projectData` |
| `sprite:created` | A sprite is created | `sprite` |
| `sprite:deleted` | A sprite is deleted | `spriteId` |
| `variable:changed` | A variable changes | `name`, `value`, `owner` |
| `list:changed` | A list changes | `name`, `items`, `owner` |
| `broadcast` | A broadcast is sent | `message` |
| `key:down` | A key is pressed | `key` |
| `key:up` | A key is released | `key` |
| `mouse:down` | The mouse is pressed | `x`, `y` |
| `mouse:up` | The mouse is released | `x`, `y` |
| `mouse:move` | The mouse moves | `x`, `y` |
| `error` | An error occurs | `error` |

### Performance

Batched updates, for callers that would otherwise pay for one round trip per property:

```javascript
runtime.batchUpdate(() => {
  setVariable('score', 100);
  setVariable('level', 2);
  changeSizeBy(10);
});
```

Object pooling of sprites and resources:

```javascript
runtime.setOption('useObjectPool', true);
runtime.setOption('objectPoolSize', 100);
```

Render priority:

```javascript
runtime.setRenderPriority('sprite1', 10);

sprite.disableRender = true;
```

### Extension and plugins

```javascript
runtime.registerFunction('customFunction', (a, b) => {
  return a * b;
});

await runtime.loadPlugin('./plugins/myPlugin.js');

runtime.usePlugin({
  name: 'myPlugin',
  init(runtime) {
    // initialise the plugin
  }
});
```

### Workers

```javascript
const result = await runtime.runInWorker(() => {
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += i;
  }
  return sum;
});
```

### Debugging and profiling

```javascript
const runtime = Runtime.create({ debug: true });

runtime.enableDebug();
runtime.getDebugInfo();

runtime.startProfiling();
await runtime.execute(someCode);
const profile = runtime.stopProfiling();
console.log(profile);
```

The draft's troubleshooting list:

1. **Code does nothing**
   - Check that `start()` was called.
   - Check the source for syntax errors.
   - Check the error log.

2. **Performance problems**
   - Reduce the number of sprites and effects.
   - Batch updates.
   - Simplify loop bodies.

3. **Rendering problems**
   - Check sprite positions and sizes.
   - Check that costumes and backdrops load.
   - Check the stage dimensions.

### Best practices from the draft

1. **Manage resources.** Release what you no longer use.
2. **Organise code.** Split complex logic into functions.
3. **Handle errors.** Wrap work in `try`/`catch`.
4. **Watch the cost.** Avoid expensive work every frame.
5. **Debug deliberately.** Use logs and profiling rather than guesswork.

## See also

- [Modules · Registry](/modules/registry) — the other design draft, and the registry backend that *is* implemented.
- [API reference](/api/) — the functions you can actually call from jvavscratch source.
- [Grammar · Events](/grammar/events) — how event handlers are written in the dialect.
- [Guide · Basic usage](/guide/basic-usage) — building and running a project.
