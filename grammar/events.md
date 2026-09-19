---
title: Event Blocks
---

# Event Blocks

jvavscratch uses **comment directives** to map JavaScript code to Scratch event
blocks. These are not function calls — they are special comments that the compiler
recognises and converts into the corresponding Scratch hat blocks.

## Green flag

```js
//#whenflagclicked()
// Code here runs when the green flag is clicked.
sprite.say("Hello!")
```

This produces the "when green flag clicked" hat block. All code below the
directive (until the next event directive or end of file) is placed under
that hat.

## Sprite click

```js
//#whenthisspriteclicked()
sprite.say("You clicked me!")
playSound("clap")
```

Produces the "when this sprite clicked" hat block.

## Key pressed

```js
//#whenkeypressed("space")
sprite.jump(10)
playSound("jump")

//#whenkeypressed("right arrow")
sprite.move(5)

//#whenkeypressed("left arrow")
sprite.move(-5)
```

The argument is a key name matching Scratch's key names: `"space"`,
`"up arrow"`, `"down arrow"`, `"left arrow"`, `"right arrow"`, `"a"`–`"z"`,
`"0"`–`"9"`, etc.

## Broadcasts

Broadcasts let different sprites or code sections communicate.

### Sending a broadcast

```js
broadcast("game start")
sprite.say("Game started!")
```

### Receiving a broadcast

```js
//#whenbroadcastreceived("game start")
startTimer()
spawnEnemies()

//#whenbroadcastreceived("game over")
stopTimer()
showScore()
```

The argument to `whenbroadcastreceived` is a string that matches the
argument to `broadcast()`. Broadcasts are one of the few ways to trigger
code from outside the current sprite.

## Combining events

Each event directive starts a new top-level block chain. You can have as
many event directives in a file as you need:

```js
//#whenflagclicked()
setupGame()

//#whenkeypressed("space")
sprite.jump(10)

//#whenbroadcastreceived("game over")
showGameOver()
```

Each directive produces its own hat block in Scratch.

## Limitations

1. Event directives are comment-based — they must appear at the start of
   a statement position (not inside a function or loop).
2. There is no way to register custom event types; you are limited to the
   four Scratch hat blocks (green flag, sprite click, key pressed,
   broadcast received).
3. Broadcast names are strings — they are matched by exact value, so
   `"Game Over"` and `"game over"` are different broadcasts.
