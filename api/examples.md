---
title: API Examples
---

# API Examples

Practical examples showing how to use the jvavscratch standard library in your
projects. Each example can be dropped into a `src/Sprite1.js` file and compiled
with `jvavscratch build`.

## Hello world

```js
//#whenflagclicked()
looks.say("Hello, world!")
```

This creates the simplest possible project: a sprite that says "Hello, world!"
when the green flag is clicked.

## Movement with key controls

```js
//#whenkeypressed("right arrow")
motion.changexby(10)

//#whenkeypressed("left arrow")
motion.changexby(-10)

//#whenkeypressed("up arrow")
motion.changeyby(10)

//#whenkeypressed("down arrow")
motion.changeyby(-10)
```

## Loop with condition

```js
//#whenflagclicked()
let score = 0

while (score < 100) {
  score = score + 1
  looks.say(score)
  control.wait(0.1)
}
looks.say("Done!")
```

## Using lists

```js
//#whenflagclicked()
let items = list.create("apple", "banana", "cherry")
looks.say(list.getitem(items, 0))
```

## Broadcasts between sprites

In Sprite1:

```js
//#whenkeypressed("space")
broadcast("jump")
```

In Sprite2:

```js
//#whenbroadcastreceived("jump")
motion.changeyby(20)
control.wait(0.2)
motion.changeyby(-20)
```

## Custom blocks (procedures)

```js
function greet(name) {
  looks.say("Hello, " + name + "!")
}

//#whenflagclicked()
greet("World")
```

## Sensing and conditional logic

```js
//#whenflagclicked()
let touching = sensing.touchingcolor("#ff0000")
if (touching) {
  looks.say("Red!")
} else {
  looks.say("Not red.")
}
```

## Pen drawing

```js
//#whenflagclicked()
pen.clear()
pen.setpensize(3)
pen.setpencolor("#ff0000")
pen.penDown()
motion.movesteps(100)
motion.turnrightdegrees(90)
motion.movesteps(100)
motion.turnrightdegrees(90)
motion.movesteps(100)
motion.turnrightdegrees(90)
motion.movesteps(100)
```

This draws a square.

## Timer-based game loop

```js
//#whenflagclicked()
let time = 0
while (time < 30) {
  time = time + 1
  looks.say("Time: " + time)
  sensing.resettimer()
  control.wait(1)
}
looks.say("Time's up!")
broadcast("game over")
```

## Async operations

```js
//#whenflagclicked()
async function loadData() {
  looks.say("Loading...")
  control.wait(2)
  looks.say("Done!")
}
loadData()
```

The `async` keyword allows you to structure code with `await`-like patterns
using `control.wait()`. Note that true asynchronous I/O is not supported —
`async` is primarily useful for structuring sequential timed operations.
