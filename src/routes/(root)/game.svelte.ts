import type { BoardData, CardData, CardRef, MovableCardRef, MoveDestination } from './types';

import { Generator } from '$lib/random';
import { createTuple, generateTuple } from '$lib/tuple';
import { ints } from '$lib/range';
import { BoardZone } from './types';

function isTableauSequence(sequence: CardData[]) {
  const color = (card: CardData) => card.suit === 1 || card.suit === 2;

  for (let i = 1; i < sequence.length; ++i) {
    if (color(sequence[i]) === color(sequence[i - 1]) || sequence[i].rank !== sequence[i - 1].rank - 1)
      return false;
  }

  return true;
}

export class Game {
  #seed = $state('');
  #board: BoardData = $state({
    depots: createTuple(4, null),
    foundations: createTuple(4, null),
    tableau: createTuple(8, []),
  });

  get seed() {
    return this.#seed;
  }

  get board(): Readonly<BoardData> {
    return this.#board;
  }

  card(ref: CardRef) {
    switch (ref.zone) {
      case BoardZone.Depots: return this.#board.depots[ref.cellIdx];
      case BoardZone.Foundations: return this.#board.foundations[ref.cellIdx];
      case BoardZone.Tableau: return this.#board.tableau[ref.columnIdx][ref.cardIdx];
    }
  }

  reset(seed?: string) {
    const generator = new Generator(seed);
    this.#seed = generator.state;

    const deck = ints(4 * 13, i => ({ rank: i % 13, suit: Math.floor(i / 13) }));
    const popCard = () => {
      const i = generator.nextInt(deck.length);
      [deck[i], deck[deck.length - 1]] = [deck[deck.length - 1], deck[i]];
      return deck.pop() as CardData;
    };

    this.#board = {
      depots: generateTuple(4, i => ({ rank: 1 + i, suit: 3 })),
      foundations: generateTuple(4, i => ({ rank: 0, suit: i })),
      tableau: generateTuple(8, i => ints(i < 4 ? 7 : 6, popCard)),
    };
  }

  canMove(ref: MovableCardRef) {
    switch (ref.zone) {
      case BoardZone.Depots: return true;
      case BoardZone.Tableau: return isTableauSequence(this.#board.tableau[ref.columnIdx].slice(ref.cardIdx));
    }
  }

  canMoveTo(card: CardData, destination: MoveDestination) {
    switch (destination.zone) {
      case BoardZone.Depots: return this.#board.depots[destination.cellIdx] === null;
      case BoardZone.Tableau: {
        const column = this.#board.tableau[destination.columnIdx];
        return column ? isTableauSequence([column.at(-1)!, card]) : true;
      }
    }
  }
}
