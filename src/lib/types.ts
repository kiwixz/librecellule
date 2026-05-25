import type { Tuple } from '$lib/tuple';

export interface SettingsData {
  autoWin: boolean;
};

export interface CardData {
  suit: number;
  rank: number;
}

export interface BoardData {
  depots: Tuple<CardData | null, 4>;
  foundations: Tuple<CardData | null, 4>;
  tableau: Tuple<CardData[], 8>;
}

export interface GameData {
  seed: string;
  board: BoardData;
};
