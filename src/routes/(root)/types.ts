export interface CardData {
  rank: number;
  suit: number;
}

export interface BoardData {
  depots: CardData[];
  foundations: CardData[];
  tableau: CardData[][];
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
  pileIdx: number;
  cardIdx: number;
}
export type CardRef = DepotCardRef | FoundationCardRef | TableauCardRef;
