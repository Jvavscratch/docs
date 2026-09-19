---
title: Sound
---

# Sound

The `sound` library plays the sounds stored in a sprite's `assets/<Sprite>/sound/` folder, and
controls volume and the two sound effects. It has eight statement functions and one value
function.

Sound names are ordinary values, so a name or a number both work:
`sound.playSound("meow")` and `sound.playSound(1)` refer to the same sound. The sound has to exist
in the project — a name that matches nothing plays nothing.

## Statement functions

| Call | Arguments | Becomes |
|---|---|---|
| `sound.playSound(name)` | sound name or number | `sound_play` |
| `sound.playSoundUntilDone(name)` | sound name or number | `sound_playuntildone` |
| `sound.stopAllSounds()` | — | `sound_stopallsounds` |
| `sound.changeVolume(change)` | percentage points to add | `sound_changevolumeby` |
| `sound.setVolume(volume)` | new volume as a percentage | `sound_setvolumeto` |
| `sound.changeEffect(effect, change)` | effect name, amount | `sound_changeeffectby` |
| `sound.setEffect(effect, value)` | effect name, new value | `sound_seteffectto` |
| `sound.clearEffects()` | — | `sound_cleareffects` |

## Value functions

| Call | Returns |
|---|---|
| `sound.volume()` | the sprite's volume as a percentage (`sound_volume`) |

## Playing sounds

### `sound.playSound(name)`

Starts the sound and returns immediately, so the blocks that follow run while the sound is still
playing. Starting a second sound does not stop the first.

```js
sound.playSound("meow");
looks.say("...and the cat said nothing.");
```

### `sound.playSoundUntilDone(name)`

Starts the sound and waits for it to finish before continuing. Only the sound in *this* call is
waited on.

```js
sound.playSoundUntilDone("music");
looks.say("The music is over.");
```

### `sound.stopAllSounds()`

Stops every sound playing anywhere in the project, including sounds belonging to other sprites.

```js
sound.stopAllSounds();
```

## Volume

Volume is a percentage; `100` is the default, `0` is silent. Scratch clamps the result to
`0`–`100`.

### `sound.changeVolume(change)` / `sound.setVolume(volume)`

```js
sound.setVolume(100);
sound.changeVolume(-20); // quieter
sound.changeVolume(20);  // back up
```

### `sound.volume()`

Reads the volume back as a number.

```js
if (sound.volume() > 0) {
    sound.setVolume(0);
} else {
    sound.setVolume(100);
}
```

## Sound effects

### `sound.changeEffect(effect, change)` / `sound.setEffect(effect, value)`

Applies one of Scratch's two sound effects. The effect name is a string literal, matched
case-insensitively and normalised to uppercase; anything else falls back to `PITCH`.

| Effect | What it does |
|---|---|
| `"PITCH"` | raises or lowers the pitch |
| `"PAN"` | shifts the sound left or right |

```js
sound.setEffect("PITCH", 20);
sound.changeEffect("PAN", -10);
sound.clearEffects();
```

### `sound.clearEffects()`

Resets both sound effects to 0.

## What is not here

Scratch's **Music** extension — play drum, play note for beats, rest for beats, set instrument,
set tempo, change tempo, tempo — is **not exposed** by this library, and jvavscratch registers no
`music` library. The corresponding opcodes exist in the compiler's opcode table, but nothing maps
a call onto them, so there is no way to reach them from the dialect today. If you need them, they
must come from an installed package that registers its own library. The same is true of the
Video Sensing and LEGO WeDo 2.0 blocks.

Recording audio, and the loudness reporter, are not part of this library either —
`sensing.loudness()` reports the microphone volume and is documented under
[Built-in Functions](/api/builtins).

## See also

- [Looks](/api/looks) — graphic effects and speech bubbles, which pair with sound effects.
- [Built-in Functions](/api/builtins) — `sensing.loudness()` for "how loud is it right now".
- [API Examples](/api/examples) — a sound-and-animation example.
