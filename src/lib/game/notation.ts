import type { DeepReadonly } from '$lib/deep_readonly';
import type { Tuple } from '$lib/tuple';
import type { Board, Card } from './board';

import { generateTuple, mapTuple } from '$lib/tuple';

const ranks = 'A23456789TJQK';
const suits = 'shdc';
const emptyCell = '__';

export interface BoardNotation {
  depots: string;
  foundations: string;
  tableau: Tuple<string, 8>;
}

export function parseCard(text: string): Card {
  const rank = ranks.indexOf(text[0]);
  const suit = suits.indexOf(text[1]);
  if (text.length !== 2 || rank < 0 || suit < 0)
    throw new Error(`Invalid card: ${text}`);

  return { rank, suit };
}

export function formatCard(card: Readonly<Card>): string {
  return ranks[card.rank] + suits[card.suit];
}

export function parseCells(text: string): Tuple<Card | null, 4> {
  const cells = text.split(' ');
  if (cells.length !== 4)
    throw new Error(`Invalid cells: ${text}`);

  return generateTuple(4, i => cells[i] === emptyCell ? null : parseCard(cells[i]));
}

export function formatCells(cells: DeepReadonly<Tuple<Card | null, 4>>): string {
  return cells.map(card => card ? formatCard(card) : emptyCell).join(' ');
}

export function parseTableau(columns: DeepReadonly<Tuple<string, 8>>): Tuple<Card[], 8> {
  if (columns.length !== 8)
    throw new Error(`Invalid tableau: ${columns.length} columns`);

  return generateTuple(8, i => columns[i] ? columns[i].split(' ').map(parseCard) : []);
}

export function formatTableau(tableau: DeepReadonly<Tuple<Card[], 8>>): Tuple<string, 8> {
  return mapTuple(tableau, column => column.map(formatCard).join(' '));
}

export function parseBoard(board: DeepReadonly<BoardNotation>): Board {
  return {
    depots: parseCells(board.depots),
    foundations: parseCells(board.foundations),
    tableau: parseTableau(board.tableau),
  };
}

export function formatBoard(board: DeepReadonly<Board>): BoardNotation {
  return {
    depots: formatCells(board.depots),
    foundations: formatCells(board.foundations),
    tableau: formatTableau(board.tableau),
  };
}
