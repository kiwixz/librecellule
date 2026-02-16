export interface CardData {
  rank: number;
  suit: number;
}

export interface BoardData {
  depots: CardData[];
  foundations: CardData[];
  tableau: CardData[][];
}

export interface DepotCardRef {
  zone: 'depots';
  cellIdx: number;
}
export interface FoundationCardRef {
  zone: 'foundations';
  cellIdx: number;
}
export interface TableauCardRef {
  zone: 'tableau';
  pileIdx: number;
  cardIdx: number;
}
export type CardRef = DepotCardRef | FoundationCardRef | TableauCardRef;
