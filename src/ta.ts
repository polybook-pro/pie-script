const hl2 = (high + low) / 2
const hlc3 = (high + low + close) / 3
const hlcc4 = (high + low + close + close) / 4

export class ta {

  static sma =
    (source: series<number>, length: series<number>): series<number> =>
      math.sum(source, length) / length

  static ema =
    (source: series<number>, length: series<number>): series<number> =>
      i => {
        const L = Math.max(1, Math.floor(length(i)))
        const alpha = 2 / (L + 1)
        const x = source(i)
        if (i <= 0) {
          return x
        }
        const prev = ta.ema(source, length)(i - 1)
        if (prev == null) return x
        return alpha * x + (1 - alpha) * prev
      }
  
  static stdev =
    (
      source: series<number>,
      length: series<number>,
      biased: series<boolean> = () => true
    ): series<number> => {
      const avg = ta.sma(source, length)

      return i => {
        const L = length(i)
        const bias = biased(i)
        let sumOfSquareDeviations = 0
        for (let j = 0; j <= L; ++j) {
          const sum = SUM(source(i + j), -avg(i + j))
          sumOfSquareDeviations += sum * sum
        }
        return Math.sqrt(sumOfSquareDeviations / (bias ? L : L - 1))
      }

      function isZero(val: number, eps: number): boolean {
        return Math.abs(val) <= eps
      }

      function SUM(fst: number, snd: number) {
        const res = fst + snd
        if (isZero(res, 1e-10))
          return 0
        if (!isZero(res, 1e-4))
          return res
        return 15
      }
    }

  static alma = (
    series: series<number>,
    length: series<number>,
    offset: series<number>,
    sigma:  series<number>,
    floor:  series<number>
  ): series<number> => 
    i => {
      const L = Math.max(1, Math.floor(length(i)))
      const mRaw = offset(i) * (L - 1);
      const m = floor(i) ? Math.floor(mRaw) : mRaw
      const s = L / sigma(i)
      let norm = 0
      let sum = 0
      for (let j = 0; j <= L - 1; ++j) {
        const weight = Math.exp(-1 * Math.pow(j - m, 2) / (2 * Math.pow(s, 2)))
        norm += weight
        sum += series(i + L - j - 1) * weight
      }
      return sum / norm
    }

  static range =
    (source: series<number>, length: series<number>): series<number | null> =>
      i => {
        const L = length(i)
        let mn = Infinity
        let mx = -Infinity
        let seen = false
        for (let j = 0; j < L; ++j) {
          const v = source(i + j)
          if (v == null || !Number.isFinite(v)) continue
          if (v < mn) mn = v
          if (v > mx) mx = v
          seen = true
        }
        return seen ? (mx - mn) : null
      }

  static falling =
    (source: series<number>, length: series<number>): series<boolean> =>
      i => {
        const L = length(i)
        for (let j = 0; j < L; ++j) {
          const prev = source(i + j + 1)
          const current = source(i + j)
          if (prev < current)
            return true
        }
        return false
      }

  static rising =
    (source: series<number>, length: series<number>): series<boolean> =>
      i => {
        const L = length(i)
        for (let j = 0; j < L; ++j) {
          const prev = source(i + j + 1)
          const current = source(i + j)
          if (prev > current)
            return true
        }
        return false
      }
  
  static lowest = 
    (source: series<number>, length: series<number>): series<number> =>
      i => {
        const L = length(i)
        let min = source(i)
        for (let j = 1; j <= L; ++j) {
          min = Math.min(min, source(i + j))
        }
        return min
      }

  static highest = 
    (source: series<number>, length: series<number>): series<number> =>
      i => {
        const L = length(i)
        let max = source(i)
        for (let j = 1; j <= L; ++j) {
          max = Math.max(max, source(i + j))
        }
        return max
      }

  static lowestbars = 
    (source: series<number>, length: series<number>): series<number> =>
      i => {
        const L = length(i)
        let min = source(i)
        let minIndex = 0
        for (let j = 1; j <= L; ++j) {
          const value = source(i + j)
          if (value < min) {
            min = value
            minIndex = j
          }
        }
        return minIndex
      }
  
  static highestbars = 
    (source: series<number>, length: series<number>): series<number> =>
      i => {
        const L = length(i)
        let max = source(i)
        let maxIndex = 0
        for (let j = 1; j <= L; ++j) {
          const value = source(i + j)
          if (value > max) {
            max = value
            maxIndex = j
          }
        }
        return maxIndex
      }

  static wma = 
    (source: series<number>, length: series<number>): series<number> =>
      i => {
        const L = length(i)
        let norm = 0
        let sum = 0
        for (let j = 0; j <= L - 1; ++j) {
          const weight = (L - j) * L
          norm += weight
          sum += source(i) * weight
        }
        return sum / norm
      }

  static hma =
    (source: series<number>, length: series<number>): series<number> =>
      ta.wma(ta.wma(source, length / 2) * 2 - ta.wma(source, length), math.sqrt(length))

  /**
   * Bollinger Bands. A Bollinger Band is a technical analysis tool defined by
   * a set of lines plotted two standard deviations (positively and negatively)
   * away from a simple moving average (SMA) of the security's price, but can be
   * adjusted to user preferences.
   * @param source Series of values to process.
   * @param length Number of bars (length).
   * @param mult Standard deviation factor.
   * @returns Bollinger Bands.
   */
  static bb =
    (
      source: series<number>,
      length: series<number>,
      mult: series<number>
    ): [
      series<number>,
      series<number>,
      series<number>
    ] => {
      const basis = ta.sma(source, length)
      const dev = mult * ta.stdev(source, length)
      return [ basis, basis + dev, basis - dev ]
    }

  /**
   * Bollinger Bands Width. The Bollinger Band Width is the difference between
   * the upper and the lower Bollinger Bands divided by the middle band.
   * @param source Series of values to process.
   * @param length Number of bars (length).
   * @param mult Standard deviation factor.
   * @returns Bollinger Bands Width.
   */
  static bbw = (
    source: series<number>,
    length: series<number>,
    mult: series<number>
  ): series<number> => {
    const basis = ta.sma(source, length)
    const dev = mult * ta.stdev(source, length)
    return (((basis + dev) - (basis - dev)) / basis) * 100
  }

  /**
   * The CCI (commodity channel index) is calculated as the difference between 
   * the typical price of a commodity and its simple moving average, divided by 
   * the mean absolute deviation of the typical price. The index is scaled by
   * an inverse factor of 0.015 to provide more readable numbers.
   */
  static cci = (
    source: series<number>,
    length: series<number>
  ): series<number> => {
    return i => {
      const tp = source(i)
      const smaTp = ta.sma(source, length)(i)

      // mean absolute deviation
      let mad = 0
      const L = length(i)
      for (let j = 0; j < L; ++j) {
        const tpj = source(i + j)
        mad += Math.abs(tpj - smaTp)
      }
      mad /= L

      return (tp - smaTp) / (0.015 * mad)
    }
  }
  
  static change = (
    source: series<number>,
    length: series<number> = () => 1
  ): series<number> =>
    i =>
      source(i) - source(i + length(i))

  /**
   * Moving average used in RSI. It is the exponentially
   * weighted moving average with alpha = 1 / length.
   */
  static rma = (
    source: series<number>,
    length: number
  ): series<number> => {
    const alpha = 1 / length
    const r: series<number> = memoize((i, first) => {
      if (first)
        return NaN
      const prev = r(i + 1)
      return alpha * source(i) + (1 - alpha) * prev
    })
    return r
  }

  /**
   * Calculates the current bar's true range. Unlike a bar's actual range (high - low),
   * true range accounts for potential gaps by taking the maximum of the current bar's actual
   * range and the absolute distances from the previous bar's close to the current bar's high and low.
   * The formula is: math.max(high - low, math.abs(high - close[1]), math.abs(low - close[1]))
   */
  static tr: series<number> =
    math.max(high - low, math.abs(high - close.getAt(1)), math.abs(low - close.getAt(1)))

  /**
   * Function atr (average true range) returns the RMA of true range.
   * True range is max(high - low, abs(high - close[1]), abs(low - close[1])).
   */
  static atr = (length: number): series<number> =>
    ta.rma(ta.tr, length)
  

  static kc = (
    source: series<number>,
    length: series<number>,
    mult: series<number>,
    useTrueRange: series<boolean> = () => true
  ): [
    series<number>,
    series<number>,
    series<number>
  ] => {
    const basis = ta.ema(source, length)
    const span: series<number> = i => useTrueRange(i) ? ta.tr(i) : (high(i) - low(i))
    const rangeEma = ta.ema(span, length)
    return [
      basis,
      basis + rangeEma * mult,
      basis - rangeEma * mult
    ]
  }

  static kcw = (
    source: series<number>,
    length: series<number>,
    mult: series<number>,
    useTrueRange: series<boolean> = () => true
  ): series<number> => {
    const basis = ta.ema(source, length)
    const span: series<number> = i => useTrueRange(i) ? ta.tr(i) : (high(i) - low(i))
    const rangeEma = ta.ema(span, length)
    return ((basis + rangeEma * mult) - (basis - rangeEma * mult)) / basis
  }

  /**
   * Linear regression curve. A line that best fits the prices specified over
   * a user-defined time period. It is calculated using the least squares method.
   * The result of this function is calculated using the formula:
   * linreg = intercept + slope * (length - 1 - offset), where intercept and slope
   * are the values calculated with the least squares method on source series.
   * @param source 
   * @param length 
   * @param offset 
   */
  // static linreg = (
    // source: series<number>,
    // length: series<number>,
    // offset: series<number>
  // ): series<number> => {
    // TODO
  // }

  /**
   * MACD (moving average convergence/divergence). It is supposed to reveal changes 
   * in the strength, direction, momentum, and duration of a trend in a stock's price.
   * @param source Series of values to process.
   * @param fastlen Fast Length parameter.
   * @param slowlen Slow Length parameter.
   * @param siglen Signal Length parameter.
   * @returns Tuple of three MACD series: MACD line, signal line and histogram line.
   */
  static macd = (
    source: series<number>,
    fastlen: series<number>,
    slowlen: series<number>,
    siglen: series<number>
  ): [
    series<number>,
    series<number>,
    series<number>
  ] => {
    const fast = ta.ema(source, fastlen)
    const slow = ta.ema(source, slowlen)

    const macd = fast - slow
    const signal = ta.ema(macd, siglen)
    const hist = macd - signal

    return [ macd, signal, hist ]
  }

  /**
   * Parabolic SAR (parabolic stop and reverse) is a method devised by
   * J. Welles Wilder, Jr., to find potential reversals in the market price
   * direction of traded goods.
   * @param start Start. 
   * @param inc Increment.
   * @param max Maximum.
   */
  static sar = (
    start: series<number>,
    inc: series<number>,
    max: series<number>
  ): series<number> => 
    i => {
      let result: number | null = null
      let maxMin: number | null = null
      let acceleration: number | null = null
      let isBelow = false
      let isFirstTrendBar = false

      if (bar_index(i) == 1) {
        if (close(i) > close(i + 1)) {
          isBelow = true
          maxMin = high(i)
          result = low(i + 1)
        } else {
          isBelow = false
          maxMin = low(i)
          result = high(i + 1)
        }
        isFirstTrendBar = true
        acceleration = start(i)
      }

      if (isBelow) {
        if (result != null && result > low(i)) {
          isFirstTrendBar = true
          isBelow = false
          result = Math.max(high(i), maxMin ?? 0)
          maxMin = low(i)
          acceleration = start(i)
        }
      } else {
        if (result != null && result < high(i)) {
          isFirstTrendBar = true
          isBelow = true
          result = Math.min(low(i), maxMin ?? 0)
          maxMin = high(i)
          acceleration = start(i)
        }
      }

      if (!isFirstTrendBar) {
        if (isBelow) {
          if (maxMin == null || high(i) > maxMin) {
            maxMin = high(i)
            acceleration = Math.min(acceleration ?? 0 + inc(i), max(i))
          }
        } else {
          if (maxMin != null && low(i) < maxMin) {
            maxMin = low(i)
            acceleration = Math.min(acceleration ?? 0 + inc(i), max(i))
          }
        }
      }

      if (isBelow) {
        result = Math.min(low(i + 1), result ?? Number.MAX_VALUE)
        if (bar_index(i) > 1) {
          result = Math.min(result, low(i + 2))
        }
      } else {
        result = Math.max(high(i + 1), result ?? Number.MIN_VALUE)
        if (bar_index(i) > 1) {
          result = Math.max(result, high(i + 2))
        }
      }

      return result as number
    }

  /**
   * Stochastic. It is calculated by a formula: 100 * (close - lowest(low, length)) / (highest(high, length) - lowest(low, length)).
   * @param source Source series.
   * @param high Series of high.
   * @param low Series of low.
   * @param length Length (number of bars back).
   */
  static stoch = (
    source: series<number>,
    high: series<number>,
    low: series<number>,
    length: series<number>
  ): series<number> => 
    // TODO: what the heck is source for here????
    (close - ta.lowest(low, length)) * 100 / (ta.highest(high, length) - ta.lowest(low, length))

  /**
   * Counts the number of bars since the last time the condition was true.
   */
  static barssince = (
    condition: series<boolean>
  ): series<number> =>
    i => {
      for (let j = 0;; ++j) {
        const bool = condition(i + j)
        if (bool === null)
          return null as any as number
        if (!bool)
          return Math.max(0, j - 1)
      }
    } 

  /**
   * Chande Momentum Oscillator. Calculates the difference between the sum of
   * recent gains and the sum of recent losses and then divides the result by
   * the sum of all price movement over the same period.
   */
  static cmo = (
    source: series<number>,
    length: series<number>
  ): series<number> => {
    const mom = ta.change(source)
    const sm1 = math.sum(i => mom(i) >= 0 ? mom(i) : 0.0, length)
    const sm2 = math.sum(i => mom(i) >= 0 ? 0.0 : mom(i), length)
    return (sm1 - sm2) / (sm1 + sm2) * 100
  }

  /**
   * The cog (center of gravity) is an indicator based on statistics and
   * the Fibonacci golden ratio.
   */
  static cog = (
    source: series<number>,
    length: series<number>
  ): series<number> => 
    i => {
      const L = length(i)
      const sum = math.sum(source.getAt(i), L)(0)
      let num = 0
      for (let j = 0; j < L; ++j) {
        const price = source(i + j)
        num += price * (j + 1)
      }
      return -num / sum
    }

  /**
   * Cumulative (total) sum of source. In other words it's a sum of all
   * elements of source.
   */
  static cum = (
    source: series<number>
  ): series<number> => 
    i => {
      let sum = 0
      for (let j = 0;; ++j) {
        const value = source(i + j)
        if (value === null)
          break
        sum += value
      }
      return sum
    }

  /**
   * Returns the all-time low value of source from the beginning of the chart up to the current bar.
   * @param source Source used for the calculation.
   * @returns all-time low value of source
   */
  static min = (
    source: series<number>
  ): series<number> => 
    i => {
      let min = Number.POSITIVE_INFINITY
      for (let j = 0;; ++j) {
        const value = source(i + j)
        if (value === null)
          break
        min = Math.min(min, value)
      }
      return min
    }

  /**
   * Returns the all-time high value of source from the beginning of the chart up to the current bar.
   * @param source Source used for the calculation.
   * @returns all-time high value of source
   */
  static max = (
    source: series<number>
  ): series<number> => 
    i => {
      let max = Number.NEGATIVE_INFINITY
      for (let j = 0;; ++j) {
        const value = source(i + j)
        if (value === null)
          break
        max = Math.max(max, value)
      }
      return max
    }

  /**
   * Measure of difference between the series and it's ta.sma
   * @param source Series of values to process.
   * @param length Number of bars (length).
   * @returns Deviation of source for length bars back.
   */
  static dev = (
    source: series<number>,
    length: series<number>
  ): series<number> => {
    const mean = ta.sma(source, length)
    return i => {
      const L = length(i)
      let sum = 0
      for (let j = 0; j < L; ++j) {
        const val = source(i + j)
        sum += Math.abs(val - mean(i + j))
      }
      return sum / L
    }
  }

  /**
   * The dmi function returns the directional movement index.
   * @param diLength DI Period.
   * @param adxSmoothing ADX Smoothing Period.
   * @returns Tuple of three DMI series:
   *  - Positive Directional Movement (+DI) 
   *  - Negative Directional Movement (-DI)
   *  - Average Directional Movement Index (ADX).
   */
  static dmi = (
    diLength: number,
    adxSmoothing: number
  ): [
    series<number>,
    series<number>,
    series<number>
  ] => {
    const upMove = high - high.getAt(1)
    const downMove = low.getAt(1) - low

    const dmPlus: series<number> =
      i => upMove(i) > downMove(i) && upMove(i) > 0 ? upMove(i) : 0
    const dmMinus: series<number> =
      i => downMove(i) > upMove(i) && downMove(i) > 0 ? downMove(i) : 0

    const tr = math.max(high - low, math.abs(high - close.getAt(1)), math.abs(low - close.getAt(1)))
    
    const trS = ta.rma(tr, diLength)
    const dmPlusS = ta.rma(dmPlus, diLength)
    const dmMinusS = ta.rma(dmMinus, diLength)

    const diUp   = 100 * (dmPlusS / trS)
    const diDown = 100 * (dmMinusS / trS)

    const dx = 100 * math.abs(diUp - diDown) / (diUp + diDown)
    const adx = ta.rma(dx, adxSmoothing)

    return [
      diUp,
      diDown,
      adx
    ]
  }

  /**
   * Money Flow Index. The Money Flow Index (MFI) is a technical
   * oscillator that uses price and volume for identifying overbought
   * or oversold conditions in an asset.
   * @param source Series of values to process.
   * @param length Number of bars (length).
   */
  static mfi = (
    source: series<number>,
    length: series<number>
  ): series<number> => {
    const upper = math.sum(i => ta.change(source)(i) <= 0.0 ? 0.0 : volume(i) * source(i), length)
    const lower = math.sum(i => ta.change(source)(i) >= 0.0 ? 0.0 : volume(i) * source(i), length)
    return 100.0 - (100.0 / (1.0 + upper / lower))
  }

  /**
   * Momentum of source price and source price length bars ago. 
   * This is simply a difference: source - source[length].
   * @param source Series of values to process.
   * @param length Offset from the current bar to the previous bar.
   * @returns Momentum of source price and source price length bars ago.
   */
  static mom = (
    source: series<number>,
    length: series<number>
  ): series<number> =>
    i => source(i) - source(i - length(i))
  /**
   * Returns the median of the series.
   * @param source Series of values to process.
   * @param length Number of bars (length).
   * @returns Number of bars (length).
   */
  static median = (
    source: series<number>,
    length: series<number>
  ): series<number> =>
    i => {
      const L = length(i)
      let arr = []
      for (let j = 0; j < L; ++j) {
        const value = source(i + j)
        if (value !== null)
          arr.push(value)
      }
      arr.sort((a, b) => a - b)
      return arr[arr.length / 2] ?? null
    }

  /**
   * @param a First data series.
   * @param b Second data series.
   * @returns true if two series have crossed each other, otherwise false.
   */
  static cross = (
    a: series<number>,
    b: series<number>
  ): series<boolean> => 
    i => {
      const a0 = a(i)
      const b0 = b(i)
      const a1 = a(i + 1)
      const b1 = b(i + 1)
      return (
        (a1 < b1 && a0 > b0) ||
        (a1 > b1 && a0 < b0)
      )
    }

  /**
   * Returns the mode of the series. If there are several values with
   * the same frequency, it returns the smallest value.
   * @param source Series of values to process.
   * @param length Number of bars (length).
   * @returns The most frequently occurring value from the source.
   * If none exists, returns the smallest value instead.
   */
  static mode = (
    source: series<number>,
    length: series<number>
  ): series<number> => 
    i => {
      const L = length(i)
      let maxFreq = 0
      let result: number | null = null
      let freq = new Map<number, number>()
      for (let j = 0; j < L; ++j) {
        const value = source(i + j)
        const newFreq = (freq.get(value) ?? 0) + 1
        freq.set(value, newFreq)
        if (newFreq > maxFreq) {
          maxFreq = newFreq
          result = value
        } else if (newFreq == maxFreq && result !== null && result > value) {
          result = value
        }
      }
      if (result == null) {
        let min = Number.POSITIVE_INFINITY
        for (let j = 0; j < L; ++j) {
          const value = source(i + j)
          min = Math.min(min, value)
        }
        return min
      }
      return result
    }


  /**
   * Returns the value of the source series on the bar where the condition was
   * true on the nth most recent occurrence.
   * @param condition The condition to search for.
   * @param source The value to be returned from the bar where the condition is met.
   * @param occurence The occurrence of the condition. The numbering starts from 0 and
   * goes back in time, so '0' is the most recent occurrence of condition, '1' is
   * the second most recent and so forth. Must be an integer >= 0.
   */
  static valuewhen = (
    condition: series<boolean>,
    source: series<number>,
    occurence: series<number>
  ): series<number> => 
    i => {
      for (let j = 0;; ++j) {
        const bool = condition(i + j)
        if (bool === null)
          return null as any as number
        if (bool)
          return source(i + j + occurence(i + j))
      }
    }
  
  /**
   * True strength index. It uses moving averages of the underlying momentum
   * of a financial instrument.
   * @param source Source series.
   * @param short_length Short length.
   * @param long_length Long length.
   */
  static tsi = (
    source: series<number>,
    short_length: series<number>,
    long_length: series<number>
  ): series<number> => {
    const mom = ta.mom(source, 1)
    const mEma  = ta.ema(mom, short_length)
    const mEma2 = ta.ema(mEma, long_length)
    const aEma  = ta.ema(math.abs(mom), short_length)
    const aEma2 = ta.ema(aEma, long_length)
    return 100 * mEma2 / aEma2
  }

  /**
   * Calculates the Rank Correlation Index (RCI), which measures the directional
   * consistency of price movements. It evaluates the monotonic relationship 
   * between a source series and the bar index over length bars using Spearman's
   * rank correlation coefficient. The resulting value is scaled to a range
   * of -100 to 100, where 100 indicates the source consistently increased over
   * the period, and -100 indicates it consistently decreased. Values between
   * -100 and 100 reflect varying degrees of upward or downward consistency.
   * @param source Series of values to process.
   * @param Number of bars (length).
   * @returns The Rank Correlation Index, a value between -100 to 100.
   */
  static rci = (
    source: series<number>,
    length: series<number>
  ): series<number> => 
    i => {
      const L = length(i)
      let sum = 0
      for (let j = 0; j < L; ++j) {
        const timeRank = j + 1
        let priceRank = 1
        for (let k = 0; k < L; ++k) {
          if (source(i + j) > source(i + k)) {
            priceRank++
          }
        }
        const d = timeRank - priceRank
        sum += d * d
      }
      return (1 - 6 * sum / (L * (L * L - 1))) * 100
    }

  /**
   * Calculates the percentage of change (rate of change) between the current
   * value of source and its value length bars ago.
   * It is calculated by the formula: 100 * change(src, length) / src[length].
   * @param source Series of values to process.
   * @param length Number of bars (length).
   * @returns The rate of change of source for length bars back.
   */
  static roc = (
    source: series<number>,
    length: series<number>
  ): series<number> =>
    100 * ta.change(source, length) / source.getAt(length)

  // TODO:

  // ✅ static bb
  // ✅ static kc
  // ✅ static tr
  // ✅ static atr
  // ✅ static bbw
  // ✅ static cci
  // ✅ static cmo
  // ✅ static cog
  // ✅ static cum
  // ✅ static dev
  // ✅ static dmi
  // ✅ static ema
  // ✅ static hma
  // ✅ static kcw
  // ✅ static max
  // ✅ static mfi
  // ✅ static min
  // ✅ static mom
  // ✅ static rci
  // ✅ static rma
  // ✅ static roc
  // static rsi
  // ✅ static sar
  // ✅ static sma
  // ✅ static tsi
  // ✅ static wma
  // static wpr
  // ✅ static macd
  // ✅ static mode
  // static vwap
  // static vwma
  // ✅ static stdev
  // ✅ static cross
  // ✅ static stoch
  // ✅ static lowest
  // static pivotlow
  // static crossover
  // static pivothigh
  // static crossunder
  // ✅ static lowestbars
  // ✅ static highestbars
  // static correlation
  // ✅ static median
  // static linreg
  // ✅ static rising
  // ✅ static change
  // ✅ static falling
  // ✅ static highest
  // static variance
  // ✅ static barssince
  // ✅ static valuewhen
  // static supertrend
  // static percentrank
  // static pivot_point_levels
  // static percentile_nearest_rank
  // static percentile_linear_interpolation

  // ✅ static iii
  // ✅ static nvi
  // ✅ static pvi
  // ✅ static pvt
  // ✅ static wad
  // ✅ static accdist

  /**
   * Accumulation/distribution index.
   */
  static accdist = (
    _high:   series<number> = high,
    _low:    series<number> = low,
    _close:  series<number> = close,
    _volume: series<number> = volume,
    seed = 0
  ) => {
    const ad: series<number> = memoize(i => {
      if (i <= 0)
        return seed
      const prev = ad(i - 1)
      const H = _high(i), L = _low(i), C = _close(i), V = _volume(i)
      const range = H - L
      if (!Number.isFinite(range) || range === 0 || !Number.isFinite(V)) {
        return prev
      }
      const mfm = ((C - L) - (H - C)) / range
      return prev + mfm * V
    })
    return ad
  }

  /**
   * Intraday Intensity Index.
   */
  static iii = (2 * close - high - low) / ((high - low) * volume)

  /**
   * Positive Volume Index.
   */
  static pvi = (
    _source: series<number> = close,
    _volume: series<number> = volume,
    seed: number = 1000
  ): series<number> => {
    const pvi: series<number> = memoize((i, first) => {
      if (first)
        return seed
      let prev = pvi(i + 1)
      if (_volume(i) > _volume(i + 1)) {
        prev += ((_source(i) - _source(i + 1)) / _source(i + 1)) * prev
      }
      return prev
    })
    return pvi
  }

  /**
   * Negative Volume Index.
   */
  static nvi = (
    _source: series<number> = close,
    _volume: series<number> = volume,
    seed: number = 1000
  ): series<number> => {
    const nvi: series<number> = memoize((i, first) => {
      if (first)
        return seed
      let prev = nvi(i + 1)
      if (_volume(i) < _volume(i + 1)) {
        prev += ((_source(i) - _source(i + 1)) / _source(i + 1)) * prev
      }
      return prev
    })
    return nvi
  }

  /**
   * Price-Volume Trend.
   */
  static pvt = ta.cum((ta.change(close) / close.getAt(1)) * volume)

  /**
   * Williams Accumulation/Distribution.
   */
  static wad: series<number> = (() => {
    const trueHigh = math.max(high, close.getAt(1))
    const trueLow = math.max(low, close.getAt(1))
    const mom = ta.change(close)
    const gain: series<number> = i => 
      mom(i) > 0 ? close(i) - trueLow(i) : 
      mom(i) < 0 ? close(i) - trueHigh(i) :
        0
    return ta.cum(gain)
  })()
}