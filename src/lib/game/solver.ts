import type { DeepReadonly } from '$lib/deep_readonly';
import type { Board, Card } from './board';

// 8 sorted columns then the sorted depots, joined by spaces, one character per card
type Position = string;

const maxSearchTime = 1000;
const reducedSearchTime = 100;

let winnable = new Set<Position>();
let lost = new Set<Position>();
let searchTime = maxSearchTime;

const rank = (card: number) => card >> 2 & 15;
const suit = (card: number) => card & 3;
const isRed = (suit: number) => suit === 1 || suit === 2;

function encode(columns: Readonly<string[]>, depots: string): Position {
  return [...columns.toSorted(), depots].join(' ');
}

function toPosition(board: DeepReadonly<Board>): Position {
  const pile = (cards: DeepReadonly<(Card | null)[]>) => cards
    .map(card => card ? String.fromCharCode(64 + card.rank * 4 + card.suit) : '');

  return encode(board.tableau.map(column => pile(column).join('')), pile(board.depots).sort().join(''));
}

function nextRanks(position: Position): number[] {
  const r = [13, 13, 13, 13];
  for (let i = 0; i < position.length; ++i) {
    const card = position.charCodeAt(i);
    if (card !== 32)
      --r[suit(card)];
  }
  return r;
}

function successors(position: Position): Position[] {
  const columns = position.split(' ');
  const depots = columns.pop()!;
  const foundations = nextRanks(position);
  const emptyColumn = columns.indexOf('');
  const r: Position[] = [];

  for (let from = 0; from < columns.length + depots.length; ++from) {
    const fromColumn: string | undefined = columns[from];
    const char = fromColumn === undefined ? depots[from - columns.length] : fromColumn.at(-1);
    if (!char)
      continue;

    const card = char.charCodeAt(0);
    const restColumns = fromColumn === undefined ? columns : columns.with(from, fromColumn.slice(0, -1));
    const restDepots = fromColumn === undefined ? depots.replace(char, '') : depots;

    if (rank(card) === foundations[suit(card)]) {
      const next = encode(restColumns, restDepots);
      if (foundations.every((nextRank, s) => isRed(s) === isRed(suit(card)) || nextRank >= rank(card)))
        return [next];
      r.push(next);
    }

    for (let to = 0; to < columns.length; ++to) {
      if (to === from)
        continue;

      const column = columns[to];
      if (column) {
        const top = column.charCodeAt(column.length - 1);
        if (rank(top) !== rank(card) + 1 || isRed(suit(top)) === isRed(suit(card)))
          continue;
      }
      else if (to !== emptyColumn || fromColumn?.length === 1) {
        continue;
      }

      r.push(encode(restColumns.with(to, column + char), restDepots));
    }

    if (fromColumn !== undefined && depots.length < 4)
      r.push(encode(restColumns, [...depots, char].sort().join('')));
  }

  return r;
}

function score(position: Position): number {
  const columns = position.split(' ');
  const depots = columns.pop()!;
  const foundations = nextRanks(position);
  let blockers = 0;
  let r = 2 * depots.length;

  for (const column of columns) {
    if (column)
      r += 2;

    let lowest = 13;
    for (let i = 0; i < column.length; ++i) {
      const card = column.charCodeAt(i);
      if (rank(card) > lowest)
        ++blockers;
      else
        lowest = rank(card);

      if (rank(card) === foundations[suit(card)])
        r += column.length - 1 - i;
    }
  }

  return blockers && r + 4 * blockers;
}

function search(start: Position): boolean | null { // greedy best-first
  const deadline = performance.now() + searchTime;
  const parents = new Map<Position, Position>([[start, '']]);
  const queue: Position[][] = [[start]];
  let lostUsed = false;

  for (;;) {
    const bucket = queue.find(positions => positions?.length);
    if (!bucket) {
      if (!lostUsed)
        lost = new Set();
      for (const position of parents.keys())
        lost.add(position);
      return false;
    }

    if (performance.now() > deadline)
      return null;

    const position = bucket.pop()!;
    for (const next of successors(position)) {
      if (parents.has(next))
        continue;

      if (lost.has(next)) {
        lostUsed = true;
        continue;
      }

      parents.set(next, position);

      const cost = score(next);
      if (cost > 0 && !winnable.has(next)) {
        (queue[cost] ??= []).push(next);
        continue;
      }

      if (!winnable.has(next)) {
        winnable = new Set();
        if (!lostUsed)
          lost = new Set();
      }

      for (let p = next; p; p = parents.get(p)!)
        winnable.add(p);
      return true;
    }
  }
}

export function isWinnable(board: DeepReadonly<Board>): boolean | null {
  const start = toPosition(board);
  const r = winnable.has(start) || score(start) === 0 || (!lost.has(start) && search(start));
  searchTime = r === null ? reducedSearchTime : maxSearchTime;
  return r;
}
