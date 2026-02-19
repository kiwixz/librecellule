type TupleImpl<T, L extends number, R extends T[] = []>
  = R['length'] extends L ? R : TupleImpl<T, L, [T, ...R]>;
export type Tuple<T, L extends number> = TupleImpl<T, L>;

export function createTuple<T, L extends number>(length: L, value: T) {
  return Array(length).fill(value) as Tuple<T, L>;
};

export function generateTuple<L extends number, T>(length: L, map: ((index: number) => T)) {
  return Array.from({ length }, (_, index) => map(index)) as Tuple<T, L>;
}
