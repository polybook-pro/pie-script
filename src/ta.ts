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

  // TODO:

  // static bb
  // static kc
  // static tr
  // static atr
  // static bbw
  // static cci
  // static cmo
  // static cog
  // static cum
  // static dev
  // static dmi
  // static ema
  // static hma
  // static kcw
  // static max
  // static mfi
  // static min
  // static mom
  // static rci
  // static rma
  // static roc
  // static rsi
  // static sar
  // static sma
  // static tsi
  // static wma
  // static wpr
  // static macd
  // static mode
  // static vwap
  // static vwma
  // static stdev
  // static mode
  // static cross
  // static stoch
  // static lowest
  // static pivotlow
  // static crossover
  // static pivothigh
  // static crossunder
  // static lowestbars
  // static highestbars
  // static correlation
  // static median
  // static linreg
  // static rising
  // static change
  // static falling
  // static highest
  // static variance
  // static barssince
  // static valuewhen
  // static supertrend
  // static percentrank
  // static pivot_point_levels
  // static percentile_nearest_rank
  // static percentile_linear_interpolation

  // static iii
  // static nvi
  // static pvi
  // static pvt
  // static wad
  // static accdist
}

// const hlc3 = (high + low + close) / 3
// const hlcc4 = (high + low + close + close) / 4

// const vwap = ta.vwap(hlc3)