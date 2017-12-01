# Bosc

**A data-driven, object-oriented scripting language**

```
'Hello World!' print
```

> ```
> 'Hello World!'
> ```

```
5 times #([x] 5 - x) push 'Boom'
```

> ```
> { '0': 5,
>   '1': 4,
>   '2': 3,
>   '3': 2,
>   '4': 1,
>   '5': 'Boom' }
> ```

## Objects (or Tables)

### Everything is an Object

In Bosc there is only one data structure: the **table**. Everything is a table,
including primitives like `3`, `'Hello'`, and `true`. Hence forth I will use the
terms object and table interchangeably.

The table is most similar to a map or dictionary in other languages. However, it
also acts as an array by letting numerical keys represent list entries.

There are three ways to define a table: as a **list** `[1 2 3]`, as a **map**
`{key 'value'}`, and as a **function** `#([args] symbol1 symbol2)`. In the end
though, the different forms just choose how each value is assigned to a key.

Don't worry about the `local : [variable]` we will come back to that later.

```
local : list [1 2 3] ,
local : map  { name 'Gabe' age 23 } ,
local : fun  #([x] x + 1)
```

> ```
> { local: self,
>  list: { '0': 1, '1': 2, '2': 3 },
>  map: { name: 'Gabe', age: 23 },
>  fun: { '0': 'x', '1': '+', '2': 1, args: { '0': 'x' } } }
> ```

## The Interpreter

The interpreter is very simple and for the most part has one expectation about
the structure of your code. Let me explain:

1. The first symbol consumed should be an **object**, for example `3`.
2. The second symbol should be a **method** of the preceding object, for example
   `+`.
3. The next zero or more symbols should be the **arguments** for the previous
   method, for example `4`.
4. Once the method is evaluated it takes the returned object and returns to
   state 2 (expecting another method).

**Note that symbols are delimited by spaces.**

Following the above process, lets explore the code block bellow:

```
3 + 4 / 2
```

> ```
> 3.5
> ```

In this example `3` is our object, `+` is our method, and `4` is the single
argument (to the `+` method). This returns the object `7`, which subsequently
has the method `/` which takes the argument `2`. The end result is the object
`3.5`.

## Storing data with `local`

Like everything else in Bosc, **`local` is a table**. Every table comes
preloaded with the `:` method. The `:` method takes two arguments, a key and a
value, and creates that entry in the source object. It then returns the object
manipulated. So, like in our earlier example, when we say `local : x 3` we are
assigning the value `3` to the `x` key of our local object.

`local` **receives some special treatment from the interpreter**. When the
interpreter encounters an unknown symbol (variable name) it will check the
`local` table for that key. If found it will inject the corresponding value in
place of the symbol. Look at the example bellow. After we have defined x, we can
use it as symbol in future statements.

`local` also has some **special properties to enable lexical scoping** -- we
will explore this more when we learn how to define methods.

```
local : x 3 ,
x + 10
```

> ```
> 13
> ```

## A quick note about `,`

`,` is another preloaded method that comes with every object in Bosc. It takes
one argument -- and then returns that argument. This allows one to switch the
object they are currently operating on. In the example above, after the
statement `local : x 3`, I no longer want to call any methods on `local`.
Therefore, by using the `,` method I can switch gears and make `x` my source
object.

## Functions/Methods

A function is list of symbols with an `args` key that defines a list of
arguments. The short hand to define a function is `#([args] symbols)`.

### The `$( ... )` special form

The only exception to the object-method-argument rule is the special form
`$(function arg1 arg2)`. This allows one to call a function without having to
reference `local`. That being said, there is never a strict requirement to do
so. This is equivalent to `local function arg1 arg2`.

```
local : func #([x] x + 1) ,
$(func 5) ; Same result as "local fun 5"
```

> ```
> 6
> ```
