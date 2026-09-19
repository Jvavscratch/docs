---
title: Classes and Inheritance
---

# Classes and Inheritance

Classes in jvavscratch are a **compile-time** construct. A class declaration registers a layout, and each `new` appends a row to a Scratch list. There is no object on a heap, no reference semantics, and nothing that runs.

That makes classes useful for grouping a sprite's related state and behaviour, and unstable enough that the language reference itself recommends a procedural approach for anything performance-sensitive. Read this page before committing to them.

## Declaring a class

```js
class Apple {
    tastinessFactor = 0;

    constructor() {
        looks.sayForSeconds("A new apple was created!", 2);
    }

    eat() {
        looks.say(operation.join("Tastiness: ", tastinessFactor));
    }
}
```

Four things are happening:

- **Property declarations** (`tastinessFactor = 0;`) define the class's fields. The initialiser is evaluated at construction time, so it may be any expression the dialect supports. A property with no initialiser gets `0`.
- **The constructor is optional and is a method like any other**, named `new` in the generated project (`Apple.new`).
- **Methods become custom blocks** named `ClassName.method`. `Apple` above generates two procedures: `Apple.new` and `Apple.eat`.
- **There is no `this`.** Inside a method, a property is referenced by its bare name — `tastinessFactor`, not `this.tastinessFactor`. Writing `this.tastinessFactor` compiles into a dropped value and silently gives you nothing.

The class must be declared **before** the code that constructs or extends it. A `new` for an unknown class is a hard error: `Reference found to non-existant class`.

## Constructing instances

A `new` expression is only valid on the right-hand side of a variable declaration. The variable's *name* becomes the instance's name:

```js
let myApple = new Apple();
```

That single line expands into roughly:

1. A list named `Apple.instances` gets a row containing the string `"myApple"`, followed by one row per property, initialised from the class declaration.

   ```
   Apple.instances = [ "myApple", 0 ]
   ```
2. If the class has a constructor, `Apple.new` is called with the property values and the constructor's own arguments.

Because the instance's identity is the variable name, **give every instance a distinct name**. `method.get` and `method.set` look an instance up by name with `item # of list`, which finds the *first* match; a second `new Apple()` assigned to the same variable name appends a second row but every lookup keeps finding the first, so the two instances alias each other.

`new` anywhere other than a declaration is not supported. `new Apple();` as a statement is dropped with a warning (`No impl for 'NewExpression'`), and a `new` inside an assignment to an existing variable aborts the build with `Attempt to create a new expression without a variable!`.

### Calling methods

Methods are called on the instance variable, with normal argument syntax:

```js
let myApple = new Apple();
myApple.eat();
```

This works because constructing an instance registers a per-instance block library named after the variable. Two consequences:

- The library exists only for that **name**, and only after the declaration has been compiled. `let b = myApple;` does not give you `b.eat()` — you would get `Unknown library, got: 'b'`.
- Method calls feed the class's properties in as the first arguments, followed by the method's own parameters. That is why a method sees its properties as if they were parameters, and why a method call gets more expensive the more properties a class has.

## Reading and writing properties

From outside the class, properties are **not** reachable through the instance. `myApple.tastinessFactor` is not a member access the compiler understands — member expressions are only rewritten for list indexing and `.length`.

Use the `method` library, passing the class name and instance name as strings:

```js
let t = method.get("Apple", "myApple", "tastinessFactor");   // read
method.set("Apple", "myApple", "tastinessFactor", 15);       // write
```

`method.set` finds the instance row, offsets past the instance name by the property's position in the class's property list, and writes the value there — so the property must be one the class declares. An unknown class is a hard error; an unknown property name resolves to a wrong offset rather than an error, so misspellings corrupt a neighbouring property instead of failing.

Inside a method, reading a property by its bare name works — the value is passed in as an argument. **Writing one does not**: `tastinessFactor = 500;` inside a method compiles into an assignment to a *global variable* of that name, and the instance's row is untouched. Mutate instance state with `method.set` from the caller, or pass the new value in and return it.

## Lifetime

Instances are never garbage collected. A row stays in `ClassName.instances` until you delete it, which means restarting the game leaves the previous run's instances in place. Clean up explicitly:

```js
method.destroy("Apple", "myApple");   // delete one instance and its property rows
method.cleanup("Apple");              // delete every instance of the class
let count = method.instancesOf("Apple");
```

`instancesOf` computes the count as the list length divided by the number of rows per instance, so it stays correct as instances come and go — as long as nothing else writes to `Apple.instances`. Nothing stops you: it is an ordinary list, visible in the palette, and editing it by hand (or with `list.*`) corrupts every instance of that class.

Declare `Apple.instances` in `assets/stage/stage.json` alongside your other globals:

```json
"globalLists": { "Apple.instances": [] }
```

Otherwise the list exists only as a reference from the generated blocks.

## Inheritance

```js
class Fruit {
    color = "RED";
}

class Apple extends Fruit {
    tastinessFactor = 0;

    constructor() {
        looks.sayForSeconds("A new apple was created!", 2);
    }

    eat() {
        looks.say(
            operation.join(
                "The apple with the color '", color,
                "' has a tastiness factor of: ", tastinessFactor
            )
        );
    }
}

let myApple = new Apple();
method.set("Apple", "myApple", "tastinessFactor", 15);
method.set("Apple", "myApple", "color", "green");

myApple.eat();
```

`extends` copies the parent's property list and method list into the subclass and then adds the subclass's own members. The subclass therefore has both `color` and `tastinessFactor`, in the parent's order first — which is what makes the offset arithmetic in `method.get` continue to line up.

Limits:

- **The parent must already be declared.** Class layouts are read from a build-wide table keyed by name; extending an unknown class produces a broken subclass rather than an error.
- **`super` is not implemented** and, per the language reference, is not planned. The subclass constructor cannot call the parent's. If you need parent constructor behaviour, give the parent a normal method and call it explicitly with `instance.method(...)`.
- **`static` members do not exist.** `Utils.randomNumber(1, 10)` is compiled as a library call on a library named `Utils`, produces `Unknown library, got: 'Utils'`, and is dropped.
- **Getters and setters do not work as properties.** `get score() { … }` compiles into a method named `score`, but `player.score` is not a member access the compiler knows, so reading it yields nothing.
- **No private members, no interfaces, no abstract classes.**

## Why the language reference calls classes unstable

All of the above adds up to: the class's *shape* is fixed at compile time, but its *data* lives in a list that any part of the program can write to, and its *identity* is a variable name that the compiler resolves textually.

Practical advice:

1. Use a class when a sprite genuinely has several co-varying fields and several operations over them. Do not use one to model a single scalar.
2. Always clean up. Long-running projects accumulate instance rows.
3. Prefer a plain object-free style — parallel global lists, or a set of `turbo_` procedures taking their state as parameters — for anything in a hot loop. Every method call passes every property as an argument, and every property read is a list lookup by computed index.
4. Never edit `ClassName.instances` by hand, and never reuse an instance variable name.

## See also

- [Functions](/grammar/functions) — methods are custom blocks; the same declare-before-use and argument-count rules apply.
- [Variables and Assignment](/grammar/variables) — the lists behind the instances, and how to declare them.
