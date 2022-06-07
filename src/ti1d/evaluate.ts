import math from "mathjs-expression-parser";

export function evalVal(val: string): number {
  return math.eval(val);
}

export function evalAll<T extends string[]>(
  data: T
): { [_ in keyof T]: number } {
  return data.map(evalVal) as { [_ in keyof T]: number };
}

export function evalFunction(f: string): (x: number) => number {
  const compiled = math.compile(f);
  return (x: number) => compiled.eval({ x });
}
