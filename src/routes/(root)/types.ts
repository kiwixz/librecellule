export interface CardData {
  rank: number;
  suit: number;
}

export interface BoardData {
  depots: CardData[];
  foundations: CardData[];
  tableau: CardData[][];
}
