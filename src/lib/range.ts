export function ints<T = number>(length: number, map: ((int: number) => T) = i => (i as T)) {
  return Array.from({ length }, (_, index) => map(index));
}
