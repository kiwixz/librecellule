export function ints<T = number>(length: number, map?: (int: number) => T) {
  return Array.from({ length }, (_, index) => map ? map(index) : index)
}
