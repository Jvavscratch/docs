---
title: Looks
---

# Looks

The `looks` library covers everything in Scratch's Looks category: speech and thought bubbles,
costumes, backdrops, size, graphic effects, layer order and visibility. It is available in both
call forms — the commands are **statements** and the five readers are **values**.

Costume and backdrop arguments are ordinary values, so both a name and a number work:
`looks.switchCostumeTo("Costume2")` and `looks.switchCostumeTo(2)` do the same thing.

## Statement functions

| Call | Arguments | Becomes |
|---|---|---|
| `looks.say(message)` | text to display | `looks_say` |
| `looks.sayForSeconds(message, seconds)` | text, duration | `looks_sayforsecs` |
| `looks.think(message)` | text to display | `looks_think` |
| `looks.thinkForSecs(message, seconds)` | text, duration | `looks_thinkforsecs` |
| `looks.switchCostumeTo(costume)` | costume name or number | `looks_switchcostumeto` |
| `looks.nextCostume()` | — | `looks_nextcostume` |
| `looks.previousCostume()` | — | `looks_switchcostumeto` + `looks_costumenumbername` |
| `looks.switchBackdropTo(backdrop)` | backdrop name or number | `looks_switchbackdropto` |
| `looks.switchBackdropToAndWait(backdrop)` | backdrop **name literal** | `looks_switchbackdroptoandwait` |
| `looks.nextBackdrop()` | — | `looks_nextbackdrop` |
| `looks.previousBackdrop()` | — | `looks_switchbackdropto` + `looks_backdropnumbername` |
| `looks.changeSizeBy(change)` | percentage points to add | `looks_changesizeby` |
| `looks.setSizeTo(size)` | new size as a percentage | `looks_setsizeto` |
| `looks.changeGraphicEffect(effect, change)` | effect name, amount | `looks_changeeffectby` |
| `looks.setGraphicEffect(effect, value)` | effect name, new value | `looks_seteffectto` |
| `looks.clearGraphicEffects()` | — | `looks_cleargraphiceffects` |
| `looks.setLayer(layer)` | `"front"` or `"back"` | `looks_gotofrontback` |
| `looks.changeLayer(direction, amount)` | direction, number of layers | `looks_goforwardbackwardlayers` |
| `looks.show()` | — | `looks_show` |
| `looks.hide()` | — | `looks_hide` |

## Value functions

| Call | Returns |
|---|---|
| `looks.size()` | the sprite's size as a percentage (`looks_size`) |
| `looks.costumeIndex()` | the number of the current costume (`looks_costumenumbername`, `number`) |
| `looks.costumeName()` | the name of the current costume (`looks_costumenumbername`, `name`) |
| `looks.backdropIndex()` | the number of the current backdrop (`looks_backdropnumbername`, `number`) |
| `looks.backdropName()` | the name of the current backdrop (`looks_backdropnumbername`, `name`) |

## Speech and thought bubbles

### `looks.say(message)` / `looks.sayForSeconds(message, seconds)`

Shows a speech bubble above the sprite. `say` leaves it on screen until something replaces it;
`sayForSeconds` waits for the given number of seconds and then removes it.

```js
looks.say("Hello, World!");          // stays until the next say/think
looks.sayForSeconds("Ready...", 2);  // visible for two seconds
```

`message` is a value, so it can be built with `operation.join` or from variables:

```js
let score = 0;
looks.say(operation.join("Score: ", score));
```

### `looks.think(message)` / `looks.thinkForSecs(message, seconds)`

The same two blocks with a thought bubble instead of a speech bubble.

```js
looks.think("Hmm...");
looks.thinkForSecs("Let me think about that.", 3);
```

## Costumes and backdrops

### `looks.switchCostumeTo(costume)` / `looks.nextCostume()` / `looks.previousCostume()`

`switchCostumeTo` accepts a costume name or its 1-based number. `nextCostume` advances one costume,
wrapping around at the end. `previousCostume` is not a Scratch block: it compiles to
*switch costume to (costume number − 1)*, using a subtraction and the costume-number reporter.

```js
looks.switchCostumeTo("Costume1");
looks.switchCostumeTo(2);   // the same thing, by index
looks.nextCostume();
looks.previousCostume();
```

### `looks.switchBackdropTo(backdrop)` / `looks.switchBackdropToAndWait(backdrop)`

Switches the stage backdrop. The `AndWait` variant does not finish until the backdrop has
finished loading, and it additionally waits for any scripts the new backdrop starts.

```js
looks.switchBackdropTo("Backdrop2");
looks.switchBackdropToAndWait("Backdrop2");
```

::: warning `switchBackdropToAndWait` needs a literal name
Unlike `switchBackdropTo`, this function builds a backdrop *menu* block and reads the name
directly from the argument's source text. A name that is not a plain string literal — a variable,
a concatenation, or a number — is replaced with an empty name, which selects nothing. Pass the
literal:

```js
looks.switchBackdropToAndWait("Backdrop2"); // ✓
let name = "Backdrop2";
looks.switchBackdropToAndWait(name);        // ✗ the menu ends up empty
```
:::

### `looks.nextBackdrop()` / `looks.previousBackdrop()`

As with costumes, `nextBackdrop` is a Scratch block and `previousBackdrop` is compiled to
*switch backdrop to (backdrop number − 1)*.

## Size

### `looks.changeSizeBy(change)` / `looks.setSizeTo(size)`

`changeSizeBy` adds to the current size, `setSizeTo` replaces it. Size is a percentage of the
costume's natural size, so `100` is the original size, `50` is half, and `200` is double.
Scratch itself clamps the result between 5% and 535%.

```js
looks.setSizeTo(100);
looks.changeSizeBy(-10);
looks.changeSizeBy(10);
```

### `looks.size()`

Reads the current size back as a number.

```js
if (looks.size() < 100) {
    looks.setSizeTo(100);
}
```

## Graphic effects

### `looks.changeGraphicEffect(effect, change)` / `looks.setGraphicEffect(effect, value)`

Applies one of Scratch's seven graphic effects. The effect name is a string literal and is matched
case-insensitively; a name that is not one of these — or a computed value — falls back to `COLOR`.

| Effect | What it does |
|---|---|
| `"COLOR"` | rotates the hue |
| `"FISHEYE"` | bulges the middle |
| `"WHIRL"` | twists around the centre |
| `"PIXELATE"` | makes the costume blocky |
| `"MOSAIC"` | makes it blocky and blurry |
| `"BRIGHTNESS"` | lightens or darkens |
| `"GHOST"` | fades towards transparent |

```js
looks.setGraphicEffect("GHOST", 50);   // half transparent
looks.changeGraphicEffect("COLOR", 25); // shift the hue
looks.clearGraphicEffects();            // reset all seven
```

Use Scratch's uppercase spelling. The match is case-insensitive, but the string is written into
the project exactly as you typed it, and only the uppercase names are Scratch's own option values.

### `looks.clearGraphicEffects()`

Resets every graphic effect to 0.

## Layer order

### `looks.setLayer(layer)`

Moves the sprite to the front or the back of the draw order.

```js
looks.setLayer("front");
looks.setLayer("back");
```

Anything that is not `"back"` falls back to `"front"`.

### `looks.changeLayer(direction, amount)`

Moves the sprite a number of layers forwards or backwards.

```js
looks.changeLayer("forward", 1);
looks.changeLayer("backward", 2);
```

::: warning Known limitation
The direction field is populated with `"front"` / `"back"`, but Scratch's
*go to front / go backward layers* block expects `"forward"` / `"backward"`. As a result the
direction you ask for is not reliably what the compiled block says. Check the block in the
TurboWarp editor after building, or use `looks.setLayer("front")` / `looks.setLayer("back")` if you
only need to jump to one end of the draw order.
:::

## Visibility

### `looks.show()` / `looks.hide()`

Makes the sprite visible or invisible. A hidden sprite still runs its scripts, still moves and can
still be touched by other sprites — `hide` is not the same as deleting the sprite.

```js
looks.hide();
control.wait(1);
looks.show();
```

## Reading the current costume, backdrop and size

```js
let n = looks.costumeIndex();
let name = looks.costumeName();
let backdrop = looks.backdropName();

looks.say(operation.join("costume ", name));
```

## Implementation notes

- `looks.previousCostume()` and `looks.previousBackdrop()` are rewritten into a
  *switch … to (number − 1)* pair at compile time. They are the only two functions in this library
  that do not map one-to-one onto a single Scratch block.
- `looks.switchBackdropToAndWait` additionally emits a `looks_backdrops` shadow menu block.
- `looks.changeGraphicEffect` and `looks.setGraphicEffect` store the effect name as written; only
  the check is case-insensitive.

## See also

- [Motion](/api/motion) — position and heading, which pair with size and layer changes.
- [Sound](/api/sound) — the sound-effect blocks, which are separate from the graphic effects here.
- [API Examples](/api/examples) — a costume animation and a fade-out.
