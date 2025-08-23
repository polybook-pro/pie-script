class math {

  static floor = supportConst(
    (s: S<number>) =>
      i => Math.floor(s(i))
  )
  static ceil = supportConst(
    (s: S<number>) =>
      i => Math.ceil(s(i))
  )
  static round = supportConst(
    (s: S<number>) =>
      i => Math.round(s(i))
  )

  static floorBy = supportConst(
    (s: S<number>, d: S<number>) =>
      i => Math.floor(s(i) / d(i)) * d(i)
  )
  static ceilBy = supportConst(
    (s: S<number>, d: S<number>) =>
      i => Math.ceil(s(i) / d(i)) * d(i)
  )
  static roundBy = supportConst(
    (s: S<number>, d: S<number>) =>
      i => Math.round(s(i) / d(i)) * d(i)
  )


  static max = supportConst(
    (...a: S<number>[]): S<number> =>
      i => Math.max(...a.map(f => f(i)))
  )
  static min = supportConst(
    (...a: S<number>[]): S<number> =>
      i => Math.min(...a.map(f => f(i)))
  )

  static clamp = supportConst(
    (x: S<number>, min: S<number>, max: S<number>): S<number> =>
      i => Math.min(Math.max(x(i), min(i)), max(i))
  )

  static clamp01 = (x: seriesOrConst<number>): S<number> =>
    math.clamp(x, 0, 1)

  static lerp = supportConst(
    (a: S<number>, b: S<number>, t: S<number>): S<number> =>
      i => a(i) + (b(i) - a(i)) * t(i)
  )

  static ilerp = supportConst(
    (x: S<number>, a: S<number>, b: S<number>): S<number> =>
      i => (x(i) - a(i)) / (b(i) - a(i))
  )

}