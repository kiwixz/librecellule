import type { DeepReadonly } from '$lib/deep_readonly';
import type { Generator } from '$lib/random';
import type { AutoMoveDestination, Board, Card, MovableCardRef, MoveDestination } from './board';

import { shuffle } from '$lib/random';
import { ints } from '$lib/range';
import { createTuple, generateTuple } from '$lib/tuple';
import { BoardZone, cardAt } from './board';

export function isTableauSequence(sequence: readonly Card[]): boolean {
  const color = (card: Card) => card.suit === 1 || card.suit === 2;

  for (let i = 1; i < sequence.length; ++i) {
    if (color(sequence[i]) === color(sequence[i - 1]) || sequence[i].rank !== sequence[i - 1].rank - 1)
      return false;
  }

  return true;
}

export function lowestMovableCard(board: DeepReadonly<Board>): MovableCardRef | null {
  let r: MovableCardRef | null = null;
  let lowest: Card | null = null;

  for (const [cellIdx, card] of board.depots.entries()) {
    if (!card)
      continue;

    if (lowest && card.rank >= lowest.rank)
      continue;

    r = { zone: BoardZone.Depots, cellIdx };
    lowest = card;
  }

  for (const [columnIdx, column] of board.tableau.entries()) {
    if (column.length === 0)
      continue;

    const card = column.at(-1)!;

    if (lowest && card.rank >= lowest.rank)
      continue;

    r = { zone: BoardZone.Tableau, columnIdx, cardIdx: column.length - 1 };
    lowest = card;
  }

  return r;
}

export function maxSupermove(board: DeepReadonly<Board>, toEmptyColumn: boolean): number {
  const emptyDepots = board.depots.reduce((r, card) => r + +(card === null), 0);
  const emptyColumns = board.tableau.reduce((r, column) => r + +(column.length === 0), 0);
  const temporaryColumns = emptyColumns - +toEmptyColumn;
  return (1 + emptyDepots) * (2 ** temporaryColumns);
}

export function canMove(board: DeepReadonly<Board>, ref: MovableCardRef): boolean {
  switch (ref.zone) {
    case BoardZone.Depots:
      return true;

    case BoardZone.Tableau: {
      const sequence = board.tableau[ref.columnIdx].slice(ref.cardIdx);
      return sequence.length === 1
        || (isTableauSequence(sequence)
          && sequence.length <= maxSupermove(board, false));
    }
  }
}

export function canMoveTo(board: DeepReadonly<Board>, ref: MovableCardRef, destination: MoveDestination): boolean {
  if (destination.zone === BoardZone.Tableau) {
    const column = board.tableau[destination.columnIdx];
    if (column.length > 0)
      return isTableauSequence([column.at(-1)!, cardAt(board, ref)!]);
    if (ref.zone !== BoardZone.Tableau)
      return true;
    const supermove = board.tableau[ref.columnIdx].length - ref.cardIdx;
    return supermove <= maxSupermove(board, true);
  }

  if (ref.zone === BoardZone.Tableau && ref.cardIdx < board.tableau[ref.columnIdx].length - 1)
    return false;

  const destinationCard = cardAt(board, destination);

  switch (destination.zone) {
    case BoardZone.Depots:
      return destinationCard === null;
    case BoardZone.Foundations: {
      const card = cardAt(board, ref)!;
      return (card.rank === 0 && destinationCard === null)
        || (card.suit === destinationCard?.suit && card.rank === destinationCard.rank + 1);
    }
  }
}

export function autoMoveDestination(board: DeepReadonly<Board>, ref: MovableCardRef): AutoMoveDestination | null {
  const card = cardAt(board, ref)!;

  if (card.rank === 0) {
    const destination: AutoMoveDestination = { zone: BoardZone.Foundations, cellIdx: card.suit };
    if (canMoveTo(board, ref, destination))
      return destination;
  }

  for (const zone of [BoardZone.Foundations, BoardZone.Depots]) {
    if (zone === ref.zone)
      continue;

    for (let i = 0; i < 4; ++i) {
      const destination = { zone, cellIdx: i } as AutoMoveDestination;
      if (canMoveTo(board, ref, destination))
        return destination;
    }
  }

  return null;
}

export function canAutoWin(board: DeepReadonly<Board>): boolean {
  for (const column of board.tableau) {
    for (let i = 1; i < column.length; ++i) {
      if (column[i].rank > column[i - 1].rank)
        return false;
    }
  }
  return true;
}

export function deal(generator: Generator): Board {
  let deck = ints(4 * 13, (i): Card => ({ rank: i % 13, suit: Math.floor(i / 13) }));
  deck = shuffle(deck, generator);

  return {
    depots: createTuple(4, null),
    foundations: createTuple(4, null),
    tableau: generateTuple(8, i => ints(i < 4 ? 7 : 6, () => deck.pop()!)),
  };
}

export function applyMove(board: Board, ref: MovableCardRef, destination: MoveDestination): void {
  let cards: Card[];
  switch (ref.zone) {
    case BoardZone.Depots:
      cards = [board.depots[ref.cellIdx]!];
      board.depots[ref.cellIdx] = null;
      break;
    case BoardZone.Tableau:
      cards = board.tableau[ref.columnIdx].splice(ref.cardIdx);
      break;
  }

  switch (destination.zone) {
    case BoardZone.Depots:
      board.depots[destination.cellIdx] = cards[0];
      break;
    case BoardZone.Foundations:
      board.foundations[destination.cellIdx] = cards[0];
      break;
    case BoardZone.Tableau:
      board.tableau[destination.columnIdx].push(...cards);
      break;
  }
}
