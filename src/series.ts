function na(x: any): x is null {
  return x === null
}

type series<T> = (index: number) => T
type seriesOrConst<T> = T | series<T>

type S<T> = series<T>
type SC<T> = seriesOrConst<T>

function series<T>(x: seriesOrConst<T>): series<T> {
  return isSeries(x) ? x : () => x
}

function isSeries<T>(x: any): x is series<T> {
  return typeof x === 'function'
}

type LiftArgs<Args extends any[]> = {
  [K in keyof Args]:
    Args[K] extends series<infer A> ? seriesOrConst<A> : never
};

type SupportLifted<F> =
  F extends (...args: infer A) => series<infer R>
    ? (...args: LiftArgs<A>) => series<R>
    : never;

// makes function support taking both T as constant and series<T>
function supportConst<F extends (...args: any[]) => series<any>>(f: F): SupportLifted<F> {
  return ((...args: any[]) => {
    return f(...(args.map(series) as any));
  }) as SupportLifted<F>;
}