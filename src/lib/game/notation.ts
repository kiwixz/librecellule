import type { DeepReadonly } from '$lib/deep_readonly';
import type { Tuple } from '$lib/tuple';
import type { Card } from './board';

import { generateTuple, mapTuple } from '$lib/tuple';

const ranks = 'A23456789TJQK';
const suits = 'shdc';

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

export function parseTableau(columns: DeepReadonly<Tuple<string, 8>>): Tuple<Card[], 8> {
  if (columns.length !== 8)
    throw new Error(`Invalid tableau: ${columns.length} columns`);

  return generateTuple(8, i => columns[i] ? columns[i].split(' ').map(parseCard) : []);
}

export function formatTableau(tableau: DeepReadonly<Tuple<Card[], 8>>): Tuple<string, 8> {
  return mapTuple(tableau, column => column.map(formatCard).join(' '));
}
