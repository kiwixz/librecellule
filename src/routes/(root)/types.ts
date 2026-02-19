import type { Tuple } from '$lib/tuple';

export interface CardData {
  rank: number;
  suit: number;
}

export interface BoardData {
  depots: Tuple<CardData | null, 4>;
  foundations: Tuple<CardData | null, 4>;
  tableau: Tuple<CardData[], 8>;
}

export enum BoardZone {
  Depots,
  Foundations,
  Tableau,
};

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
