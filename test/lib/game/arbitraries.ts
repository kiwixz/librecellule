import fc from 'fast-check';
import type { Board, Card, Cells, Tableau } from '$lib/game/board';
import { generateTuple } from '$lib/tuple';

export const card: fc.Arbitrary<Card> = fc.record({
  suit: fc.integer({ min: 0, max: 3 }),
  rank: fc.integer({ min: 0, max: 12 }),
});

export const cells: fc.Arbitrary<Cells> = fc.tuple(...generateTuple(4, () => fc.option(card)));
export const tableau: fc.Arbitrary<Tableau> = fc.tuple(...generateTuple(8, () => fc.array(card)));
export const board: fc.Arbitrary<Board> = fc.record({ depots: cells, foundations: cells, tableau });
