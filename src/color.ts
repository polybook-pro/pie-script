class color {

  static aqua    = color.hex`#00BCD4`
  static black   = color.hex`#363A45`
  static blue    = color.hex`#2196F3`
  static fuchsia = color.hex`#E040FB`
  static gray    = color.hex`#787B86`
  static green   = color.hex`#4CAF50`
  static lime    = color.hex`#00E676`
  static maroon  = color.hex`#880E4F`
  static navy    = color.hex`#311B92`
  static olive   = color.hex`#808000`
  static orange  = color.hex`#FF9800`
  static purple  = color.hex`#9C27B0`
  static red     = color.hex`#F23645`
  static silver  = color.hex`#B2B5BE`
  static teal    = color.hex`#089981`
  static white   = color.hex`#FFFFFF`
  static yellow  = color.hex`#FDD835`

  constructor(
    public r: number,
    public g: number,
    public b: number,
    public alpha = 100
  ) {}

  static new = supportConst(
    (c: S<color>, alpha: S<number>) =>
      i => {
        const ci = c(i)
        if (na(ci))
          return null
        return new color(ci.r, ci.g, ci.b, alpha(i))
      }
  )

  static rgb = supportConst(
    (r: S<number>, g: S<number>, b: S<number>, alpha: S<number>): S<color> =>
      i => new color(r(i), g(i), b(i), alpha(i))
  )

  static hex(arg: string | TemplateStringsArray) {
    let str = (typeof arg === 'string' ? arg : arg[0]).trim()
    if (str.startsWith('#')) str = str.substring(1)

    const fullHex = str.length === 3
      ? str.split("").map(ch => ch + ch).join("")
      : str

    return new color(
      parseInt(fullHex.substring(0, 2), 16),
      parseInt(fullHex.substring(2, 4), 16),
      parseInt(fullHex.substring(4, 6), 16),
      100
    )
  }

  static r = supportConst(
    (c: S<color>): S<number> =>
      i => c(i).r
  )
  static g = supportConst(
    (c: S<color>): S<number> =>
      i => c(i).g
  )
  static b = supportConst(
    (c: S<color>): S<number> =>
      i => c(i).b
  )
  static a = supportConst(
    (c: S<color>): S<number> =>
      i => c(i).alpha
  )
  static alpha = color.a
  static t = color.a

  static lerp = supportConst(
    (a: S<color>, b: S<color>, t: S<number>) => 
      color.rgb(
        math.lerp(color.r(a), color.r(b), t),
        math.lerp(color.g(a), color.g(b), t),
        math.lerp(color.b(a), color.b(b), t),
        math.lerp(color.a(a), color.a(b), t)
      )
  )
  static mix = color.lerp

  static from_gradient = supportConst(
    (
      value: series<number>,
      
      bottom_value: series<number>,
      top_value: series<number>,

      bottom_color: series<color>,
      top_color: series<color>
    ) =>
      color.mix(
        bottom_color,
        top_color,
        math.ilerp(value, bottom_value, top_value)
      )
  )

  fade(alpha = 100) {
    return color.new(this, this.alpha * (alpha / 100))
  }

  static fade = supportConst(
    (c: S<color>, alpha: S<number>): S<color> =>
      color.new(c, color.a(c) * (alpha / 100))
  )
 
}