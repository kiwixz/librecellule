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

export type MoveDestination = {
  zone: BoardZone.Depots | BoardZone.Foundations;
  cellIdx: number;
} | {
  zone: BoardZone.Tableau;
  columnIdx: number;
};
