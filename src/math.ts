class math {

  /**
   * Constant for <a href="https://wikipedia.org/wiki/E_(mathematical_constant)">Euler's number</a>, equals to 2.7182818284590452.
   */
  static readonly e = 2.7182818284590452

  /**
   * Constant for <a href="https://wikipedia.org/wiki/Pi">Archimedes' constant</a>, equals to 3.1415926535897932.
   */
  static readonly pi = 3.1415926535897932

  /**
   * Constant for the <a href="https://wikipedia.org/wiki/Golden_ratio">golden ratio</a>, equals to 1.6180339887498948.
   */
  static readonly phi = 1.6180339887498948

  /**
   * Constant for the <a href="https://en.wikipedia.org/wiki/Golden_ratio#Golden_ratio_conjugate_and_powers">golden ratio conjugate</a>, equals to 0.6180339887498948.
   */
  static readonly rphi = 0.6180339887498948

  /**
   * Rounds the specified number down to the largestwhole integer
   * number that is less than or equal to it.
   * @param n The number to round.
   * @returns The largest integer value that is less than or equal to the number.
   */
  static floor = (n: series<number>) =>
    n.map(Math.floor)

  /**
   * Rounds the specified number up to the smallest whole integer
   * number that is greater than or equal to it.
   * @param n The number to round.
   * @returns The largest integer value that is less than or equal to the number.
   */
  static ceil = (n: series<number>) =>
    n.map(Math.ceil)

  /**
   * Returns the value of number rounded to the nearest integer,
   * with ties rounding up. If the `precision` parameter is used,
   * returns a float value rounded to that amount of decimal places.
   * @param n The number to round.
   * @param precision The number to round.
   * @returns The largest integer value that is less than or equal to the number.
   */
  static round = (n: series<number>, precision?: series<number>) =>
    precision !== undefined ?
      math.roundBy(n, precision) :
      n.map(Math.round)

  static floorBy = (s: series<number>, d: series<number>): series<number> =>
    i => Math.floor(s(i) / d(i)) * d(i)
  static ceilBy = (s: series<number>, d: series<number>): series<number> =>
    i => Math.ceil(s(i) / d(i)) * d(i)
  static roundBy = (s: series<number>, d: series<number>): series<number> =>
    i => Math.round(s(i) / d(i)) * d(i)

  /**
   * Returns the greatest of multiple values.
   * @param numbers A sequence of numbers to use in the calculation.
   * @returns The greatest of multiple given values.
   */
  static max = (...numbers: series<number>[]): series<number> =>
    i => Math.max(...numbers.map(f => f(i)))

  static min = (...numbers: series<number>[]): series<number> =>
    i => Math.min(...numbers.map(f => f(i)))

  static clamp = (x: series<number>, min: series<number>, max: series<number>): series<number> =>
    i => Math.min(Math.max(x(i), min(i)), max(i))

  static clamp01 = (x: series<number>): series<number> =>
    math.clamp(x, 0, 1)

  static lerp = 
    (a: series<number>, b: series<number>, t: series<number>): series<number> =>
      i => a(i) + (b(i) - a(i)) * t(i)

  static ilerp = 
    (x: series<number>, a: series<number>, b: series<number>): series<number> =>
      i => (x(i) - a(i)) / (b(i) - a(i))
    
  static abs =
    (x: series<number>): series<number> =>
      i => Math.abs(x(i))
  static log =
    (x: series<number>): series<number> =>
      i => Math.log(x(i))
  static log2 =
    (x: series<number>): series<number> =>
      i => Math.log2(x(i))
  static log10 =
    (x: series<number>): series<number> =>
      i => Math.log10(x(i))
  static sqrt =
    (x: series<number>): series<number> =>
      i => Math.sqrt(x(i))
  static pow =
    (x: series<number>, power: series<number>): series<number> =>
      i => Math.pow(x(i), power(i))
  static sign =
    (x: series<number>): series<number> =>
      i => Math.sign(x(i))

  static avg =
    (...x: series<number>[]): series<number> =>
      i => {
        let sum = 0
        for (let j = 0; j < x.length; ++j)
          sum += x[j](i)
        return sum / x.length
      }
  static sum =
    (x: series<number>, length: series<number>): series<number> =>
      i => {
        const L = length(i)
        let sum = 0
        for (let j = 0; j < L; ++j)
          sum += x(i + j)
        return sum
      }

  static radians =
    (x: series<number>): series<number> =>
      i => x(i) / 180 * math.pi
  static toradians = math.radians
  static degrees =
    (x: series<number>): series<number> =>
      i => x(i) / math.pi * 180
  static todegrees = math.degrees

  static sin =
    (x: series<number>): series<number> =>
      i => Math.sin(x(i))
  static asin =
    (x: series<number>): series<number> =>
      i => Math.asin(x(i))
  static cos =
    (x: series<number>): series<number> =>
      i => Math.cos(x(i))
  static acos =
    (x: series<number>): series<number> =>
      i => Math.acos(x(i))
  static tan =
    (x: series<number>): series<number> =>
      i => Math.tan(x(i))
  static atan =
    (x: series<number>): series<number> =>
      i => Math.atan(x(i))

  static random =
    (
      min: series<number> = () => 0,
      max: series<number> = () => 1
      // TODO: support seed and indexing
      // seed: series<number> = () => 0
    ): series<number> =>
      math.lerp(min, max, Math.random)

  // TODO:
  // round_to_mintick

}