---
title: Examples
---

# Examples

Sample projects and code snippets demonstrating jvavscratch features.

## Full projects

### Pi spigot

A classic algorithm for computing digits of π using the spigot method.
Located in the `examples/pi-spigot/` directory of the repository.

```
examples/pi-spigot/
  src/
    Sprite1.js        # the algorithm
  assets/
    stage/            # blank stage
  jvavscratch.toml
  project.d.json
```

Build it with:

```bash
jvavscratch build examples/pi-spigot
```

## Code snippets

See the pages below for categorized examples of each API area:

- [API Examples](/api/examples) — standard library calls, movement, looks, sound
- [Grammar: Control Flow](/grammar/control-flow) — if/else, loops, switch
- [Grammar: Event Blocks](/grammar/events) — green flag, key presses, broadcasts
- [Grammar: Functions](/grammar/functions) — defining and calling functions
- [Grammar: Classes](/grammar/classes) — class definitions and inheritance

## Adding your own

If you build an interesting project with jvavscratch, consider contributing it
as an example. Place it under `examples/<project-name>/` following the standard
project layout and add a short description.
