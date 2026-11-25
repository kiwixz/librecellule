import type { DeepReadonly } from '$lib/deep_readonly';
import type { Tuple } from '$lib/tuple';

import { createTuple } from '$lib/tuple';

export interface Card {
  suit: number;
  rank: number;
}

export type Cells = Tuple<Card | null, 4>;
export type Tableau = Tuple<Card[], 8>;

export interface Board {
  depots: Cells;
  foundations: Cells;
  tableau: Tableau;
}

export enum BoardZone {
  Depots,
  Foundations,
  Tableau,
}

export interface DepotCardRef {
  zone: BoardZone.Depots;
  cellIdx: number;
}
export interface FoundationCardRef {
  zone: BoardZone.Foundations;
  cellIdx: number;
}
export interface TableauCardRef {
  zone: BoardZone.Tableau;
  columnIdx: number;
  cardIdx: number;
}
export type MovableCardRef = DepotCardRef | TableauCardRef;
export type CardRef = DepotCardRef | FoundationCardRef | TableauCardRef;

export type AutoMoveDestination = {
  zone: BoardZone.Depots | BoardZone.Foundations;
  cellIdx: number;
};

export type MoveDestination = AutoMoveDestination | {
  zone: BoardZone.Tableau;
  columnIdx: number;
};

export function emptyBoard(): Board {
  return {
    depots: createTuple(4, null),
    foundations: createTuple(4, null),
    tableau: createTuple(8, []),
  };
}

export function cardAt(board: DeepReadonly<Board>, ref: CardRef): Readonly<Card> | null {
  switch (ref.zone) {
    case BoardZone.Depots: return board.depots[ref.cellIdx];
    case BoardZone.Foundations: return board.foundations[ref.cellIdx];
    case BoardZone.Tableau: return board.tableau[ref.columnIdx][ref.cardIdx];
  }
}
