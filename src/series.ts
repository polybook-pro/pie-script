interface Function {
  plus(this: series<number>, x: number | series<number>): series<number>;
  minus(this: series<number>, x: number | series<number>): series<number>;
  times(this: series<number>, x: number | series<number>): series<number>;
  div(this: series<number>, x: number | series<number>): series<number>;
  unaryMinus(this: series<number>): series<number>;
  unaryPlus(this: series<number>): series<number>;
  getAt<U>(this: series<U>, shift: number): series<U>;
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
  shift: number
): series<T> {
  return i => this(i + shift)
}
Function.prototype.map = function<T, R>(
  this: series<T>,
  predicate: (value: T, index: number) => R
): series<R> {
  return i => predicate(this(i), i)
}