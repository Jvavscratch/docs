---
title: Motion
---

# Motion

The `motion` library drives the sprite's position, heading and rotation style. It is available in
both call forms: the movement functions are **statements** (`motion.move(10);`) and the position
readers are **values** (`motion.x()`).

All fifteen statement functions and all three value functions are listed below. Coordinates are
stage coordinates: `x` runs from `-240` (left) to `240` (right), `y` from `-180` (bottom) to
`180` (top). Directions are degrees *clockwise* from up: `0` is up, `90` is right, `180` is down,
`-90` (or `270`) is left.

## Statement functions

| Call | Arguments | Becomes |
|---|---|---|
| `motion.move(steps)` | steps to move, along the current heading | `motion_movesteps` |
| `motion.turnRight(degrees)` | degrees clockwise | `motion_turnright` |
| `motion.turnLeft(degrees)` | degrees counter-clockwise | `motion_turnleft` |
| `motion.gotoXY(x, y)` | target coordinates | `motion_gotoxy` |
| `motion.goto(target)` | `"random"`, `"mouse"`, or a sprite name | `motion_goto` |
| `motion.glide(seconds, x, y)` | duration, then target coordinates | `motion_glidesecstoxy` |
| `motion.glideTo(seconds, target)` | duration, then a target (see note) | `motion_glideto` |
| `motion.point(direction)` | absolute direction in degrees | `motion_pointindirection` |
| `motion.pointTowards(target)` | `"mouse"` or a sprite name | `motion_pointtowards` |
| `motion.changeX(dx)` | offset to add to the x coordinate | `motion_changexby` |
| `motion.setX(x)` | new x coordinate | `motion_setx` |
| `motion.changeY(dy)` | offset to add to the y coordinate | `motion_changeyby` |
| `motion.setY(y)` | new y coordinate | `motion_sety` |
| `motion.bounceOnEdge()` | — | `motion_ifonedgebounce` |
| `motion.setRotationStyle(style)` | `"all around"`, `"left-right"`, `"don't rotate"` | `motion_setrotationstyle` |

## Value functions

| Call | Returns |
|---|---|
| `motion.x()` | the current x coordinate (`motion_xposition`) |
| `motion.y()` | the current y coordinate (`motion_yposition`) |
| `motion.direction()` | the current heading in degrees (`motion_direction`) |

## Moving

### `motion.move(steps)`

Moves the sprite `steps` pixels along its current heading. A negative value moves backwards.

```js
motion.move(10);
motion.turnRight(90);
motion.move(-10); // back to where we started, facing right
```

### `motion.turnRight(degrees)` / `motion.turnLeft(degrees)`

Turns the sprite in place. Turning is relative to the current heading, so
`motion.turnRight(45); motion.turnRight(45);` is the same as one 90° turn.

```js
motion.turnLeft(45);
```

## Position

### `motion.gotoXY(x, y)`

Jumps the sprite to an absolute position, without animating the move.

```js
motion.gotoXY(0, 0);      // centre of the stage
motion.gotoXY(-200, 150); // top-left area
```

### `motion.goto(target)`

Jumps to a moving target. The argument is read as a **string literal**:

- `"random"` — a random position (becomes `_random_`)
- `"mouse"` — the mouse pointer (becomes `_mouse_`)
- anything else — the name of a sprite in the project

```js
motion.goto("random");
motion.goto("mouse");
motion.goto("Sprite2");
```

If the argument is not a string literal the compiler cannot know the target at build time and
falls back to `"random"`. Scratch's goto menu only accepts a built-in target or a sprite name, so
a *computed* target is not expressible — use `motion.gotoXY()` with `motion.x()` /
`sensing.mouseX()` instead.

### `motion.glide(seconds, x, y)`

Glides to the given position over the given duration. The sprite is still draggable and can be
interrupted while gliding.

```js
motion.glide(2, 100, -50); // two seconds to reach (100, -50)
```

### `motion.glideTo(seconds, target)`

Glides to a moving target over the given duration. The target is matched the same way as
`motion.goto()`.

::: warning Known limitation
In the current implementation the target menu is read from the **first** argument, not the second,
and the duration is read from the first argument too. So `motion.glideTo(2, "Sprite2")` uses `2`
as the duration but falls back to a *random* target, because `2` is not a string literal. A real
target only comes out when the target name is the first argument —
`motion.glideTo("Sprite2", 2)` glides to `Sprite2`, though its duration is then the string
`"Sprite2"` (i.e. 0 seconds). Prefer `motion.glide(seconds, x, y)` with `motion.x()` /
`motion.y()` when you need a reliable animated move.
:::

### `motion.changeX(dx)` / `motion.changeY(dy)`

Adds an offset to one coordinate, leaving the other alone.

```js
motion.changeX(10);  // 10 to the right
motion.changeY(-5);  // 5 down
```

### `motion.setX(x)` / `motion.setY(y)`

Sets one coordinate to an absolute value.

```js
motion.setX(-240); // against the left edge
motion.setY(0);    // vertical centre
```

## Direction

### `motion.point(direction)`

Sets the heading to an absolute direction in degrees.

```js
motion.point(90);  // face right
motion.point(0);   // face up
motion.point(180); // face down
```

### `motion.pointTowards(target)`

Points the sprite at another sprite, or at `"mouse"`. The argument is read as a string literal and
falls back to `"random"` when it is not one.

```js
motion.pointTowards("mouse");
```

### `motion.setRotationStyle(style)`

Controls how the sprite's costume reacts to its heading. The argument is a string literal;
`"left-right"`, `"don't rotate"` and `"all around"` are accepted, and anything else (including a
computed value) becomes `"left-right"`.

```js
motion.setRotationStyle("all around");  // the costume rotates
motion.setRotationStyle("left-right");  // flips horizontally only
motion.setRotationStyle("don't rotate");// the costume never turns
```

## Bouncing

### `motion.bounceOnEdge()`

If the sprite is touching the edge of the stage, reverses its heading so it stays on screen. On
its own it does nothing when the sprite is not touching an edge, which makes it the usual partner
of an edge test:

```js
if (sensing.touching("edge")) {
    motion.bounceOnEdge();
}
```

## Reading the current state

The three readers return numbers and can be used anywhere a value is expected — as a function
argument, in arithmetic, or on the right-hand side of an assignment.

```js
let x = motion.x();
let y = motion.y();
let heading = motion.direction();

looks.say(operation.join("x=", x));
```

::: tip Headings are reported in the -180..180 range
`motion.direction()` returns the Scratch value, so a sprite facing left reports `-90`, not `270`.
:::

## Implementation notes

- `motion.goto`, `motion.glideTo` and `motion.pointTowards` build an extra menu block
  (`motion_goto_menu`, `motion_glideto_menu`, `motion_pointtowards_menu`) alongside the block you
  called. That is normal — it is how Scratch carries the target.
- `motion.glideTo` has the argument-order defect described above.
- `motion.setRotationStyle` compares the string literally, so `"left right"` (space instead of
  hyphen) silently becomes `"left-right"`.

## See also

- [Looks](/api/looks) — costume and size changes that usually accompany movement.
- [Built-in Functions](/api/builtins) — `sensing.distanceTo`, `sensing.touching` and the other
  sensing reporters used with motion.
- [API Examples](/api/examples) — a mouse follower and a bouncing sprite.
