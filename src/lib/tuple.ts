import type { DeepReadonly } from './deep_readonly';

type TupleImpl<T, L extends number, R extends T[] = []>
  = R['length'] extends L ? R : TupleImpl<T, L, [T, ...R]>;
export type Tuple<T, L extends number> = TupleImpl<T, L>;

export function createTuple<T, L extends number>(length: L, value: T): Tuple<T, L> {
  return generateTuple(length, () => structuredClone(value));
}

export function generateTuple<T, L extends number>(length: L, map: ((index: number) => T)): Tuple<T, L> {
  return Array.from({ length }, (_, index) => map(index)) as Tuple<T, L>;
}

export function mapTuple<T extends DeepReadonly<unknown[]>, U>(tuple: T, map: ((value: T[number], index: number) => U)): Tuple<U, T['length']> {
  return tuple.map(map) as Tuple<U, T['length']>;
}
