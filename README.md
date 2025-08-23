# PieScript
PieScript is open-source TypeScript-based programming language for trading indicators.

## Introduction
PieScript is primarily used to power trading indicators inside [polybook](https://polybook.pro). I wanted to have similar experience to PineScript™[^1], but without reinventing the wheel of creating own language with own parser and compiler/transpiler. As that may come as a struggle not only for a developer, but also for a user of new language: with no community, IDE, Google, StackOverflow, or now ChatGPT to help with that language.

PieScript is based on a fork of TypeScript 5.5, with one new feature implemented on top — operator overloading. This will come in handy when working with series of numbers.

## Example
```typescript
study("MACD")
const fast = input(12, "fast")
const slow = input(26, "slow")
const fastMA = ta.ema(close, fast)
const slowMA = ta.ema(close, slow)
const macd = fastMA - slowMA
const signal = ta.sma(macd, 9)
plot(macd, "MACD", color.blue)
plot(signal, "Signal", color.orange)
```
As you can see, there are some differences to PineScript™[^1], but most of them come from TypeScript.

## Differences to PineScript™[^1]/Typescript
In PieScript, series are just functions:
```typescript
type series<T> = (i: number) => T
```
And although they are functions, you can use operators like `+` `-` `/` `*` on series and numbers. You can also "slice" series with `[]` operator, like you do in PineScript™[^1]:

```typescript
const index: series<number> = i => i

const plus_two = index + 2
const div_two = index / 2
const shifted = index[4]

const result = plus_two / div_two * shifted
```

<details>
<summary>
How does it work in TypeScript?
</summary>

As written earlier, PieScript is TypeScript fork with one feature on top — operator overloading.

The way it works in TypeScript transpiler is if it sees that operation `+` is done on objects, it checks the existance of `plus` method in that object prototype. In the final transpiled JS it will look like simple `plus` function invocation:
```javascript
const plus_two = index.plus(2) // in transpiled JS
```

Here is an example implementation of `plus` in functions:
```typescript
declare global {
    declare interface Function {
        plus<T>(value: T | series<T>): series<T>
    }
}

Function.prototype.plus = function<T> (this: series<T>, value: T | series<T>): series<T> => {
    if (typeof value === 'function')
        return index => this(index) + value(index)
    else
        return index => this(index) + value
}
```


> In PieScript, I tried to not turn this into unknown magic though. In IDE [polybook](https://polybook.pro) uses (Monaco Editor), hovering on operators like `+` will reveal quick info of `plus` method, and Ctrl+Clicking on `+` will jump into definition of `Function.prototype.plus`.

Current list of overloaded operators:

| Operator  | Method         |
|-----------|----------------|
| a + b     | a.plus(b)      |
| a - b     | a.minus(b)     |
| a * b     | a.times(b)     |
| a / b     | a.div(b)       |
| -a        | a.unaryMinus() |
| +a        | a.unaryPlus()  |
| a[b]      | a.getAt(b)     |

</details>

# Documentation

TODO

# License

PieScript is dual-licensed:

- **Open Source:** You may use, modify, and redistribute this code under the terms of the [GNU General Public License v3.0](./LICENSE).  
- **Commercial / Proprietary:** If you wish to use this code in a closed-source or commercial product, you must obtain a separate license from the copyright holder. Contact: support@polybook.pro.

By default, all usage falls under GPLv3 unless you use PieScript in your closed-source commercial product: then you must have a commercial license agreement.

[^1]: Pine Script™ is a trademark of TradingView, Inc. This project is not affiliated with or endorsed by TradingView.