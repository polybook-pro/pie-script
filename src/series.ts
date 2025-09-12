interface Function {
  plus(this: series<number>, x: number | series<number>): series<number>;
  minus(this: series<number>, x: number | series<number>): series<number>;
  times(this: series<number>, x: number | series<number>): series<number>;
  div(this: series<number>, x: number | series<number>): series<number>;
  invDiv(this: series<number>, x: number | series<number>): series<number>;
  unaryMinus(this: series<number>): series<number>;
  unaryPlus(this: series<number>): series<number>;
  getAt<U>(this: series<U>, shift: number | series<number>): series<U>;
  map<T, R>(this: series<T>, pred: (value: T, index: number) => R): series<R>;
}

type series<T> = (index: number) => T

function isSeries<T>(x: any): x is series<T> {
  return typeof x === 'function'
}

Function.prototype.plus = function(
  this: series<number>,
  x: number | series<number>
): series<number> {
  if (isSeries(x)) {
    return i => this(i) + x(i)
  } else {
    return i => this(i) + x
  }
}
Function.prototype.minus = function(
  this: series<number>,
  x: number | series<number>
): series<number> {
  if (isSeries(x)) {
    return i => this(i) - x(i)
  } else {
    return i => this(i) - x
  }
}
Function.prototype.times = function(
  this: series<number>,
  x: number | series<number>
): series<number> {
  if (isSeries(x)) {
    return i => this(i) * x(i)
  } else {
    return i => this(i) * x
  }
}
Function.prototype.div = function(
  this: series<number>,
  x: number | series<number>
): series<number> {
  if (isSeries(x)) {
    return i => this(i) / x(i)
  } else {
    return i => this(i) / x
  }
}
Function.prototype.invDiv = function(
  this: series<number>,
  x: number | series<number>
): series<number> {
  if (isSeries(x)) {
    return i => x(i) / this(i)
  } else {
    return i => x / this(i)
  }
}
Function.prototype.unaryMinus = function(
  this: series<number>
): series<number> {
  return i => -this(i)
}
Function.prototype.unaryPlus = function(
  this: series<number>
): series<number> {
  return i => +this(i)
}
Function.prototype.getAt = function<T>(
  this: series<T>,
  shift: number | series<number>
): series<T> {
  if (typeof shift === 'function') {
    return i => this(i + shift(i))
  } else {
    return i => this(i + shift)
  }
}
Function.prototype.map = function<T, R>(
  this: series<T>,
  predicate: (value: T, index: number) => R
): series<R> {
  return i => predicate(this(i), i)
}

function memoize<T>(
  series: (index: number, first: boolean) => T
): series<T> {
  let first = true
  const cache = new Map<number, T>()
  return i => {
    if (cache.has(i)) {
      return cache.get(i)!
    }
    const value = series(i, first)
    first = false
    cache.set(i, value)
    return value
  }
}