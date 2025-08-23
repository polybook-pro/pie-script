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
    public a = 100
  ) {}

  static new = (
    other: series<color>,
    alpha: series<number>
  ): series<color> =>
    i => {
      const ci = other(i)
      return new color(ci.r, ci.g, ci.b, alpha(i))
    }

  static rgb =
    (
      r: series<number>,
      g: series<number>,
      b: series<number>,
      alpha: series<number> = () => 100
    ): series<color> =>
      i => new color(r(i), g(i), b(i), alpha(i))

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

  static r =
    (c: series<color>): series<number> =>
      i => c(i).r
  static g = 
    (c: series<color>): series<number> =>
      i => c(i).g
  static b = 
    (c: series<color>): series<number> =>
      i => c(i).b
  static a = 
    (c: series<color>): series<number> =>
      i => c(i).a
  static alpha = color.a
  static t = color.a

  static lerp =
    (a: series<color>, b: series<color>, t: series<number>): series<color> => 
      color.rgb(
        math.lerp(color.r(a), color.r(b), t),
        math.lerp(color.g(a), color.g(b), t),
        math.lerp(color.b(a), color.b(b), t),
        math.lerp(color.a(a), color.a(b), t)
      )
  static mix = color.lerp

  static from_gradient =
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

  fade = (alpha = 100) =>
    color.new(this, (alpha / 100) * this.a)

  static fade =
    (c: series<color>, alpha: series<number>): series<color> =>
      color.new(c, (alpha / 100) * color.a(c))
}