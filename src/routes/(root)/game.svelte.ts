import type { BoardData, CardData, CardRef, MovableCardRef, MoveDestination, TableauCardRef } from './types';

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

export default class Game {
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
      depots: createTuple(4, null),
      foundations: createTuple(4, null),
      tableau: generateTuple(8, i => ints(i < 4 ? 7 : 6, popCard)),
    };
  }

  canMove(ref: MovableCardRef) {
    switch (ref.zone) {
      case BoardZone.Depots: return true;
      case BoardZone.Tableau: return isTableauSequence(this.#board.tableau[ref.columnIdx].slice(ref.cardIdx));
    }
  }

  canMoveTo(ref: MovableCardRef, destination: MoveDestination) {
    if (destination.zone === BoardZone.Tableau) {
      const column = this.#board.tableau[destination.columnIdx];
      return column.length > 0 ? isTableauSequence([column.at(-1)!, this.card(ref)!]) : true;
    }

    if (ref.zone === BoardZone.Tableau && ref.cardIdx < this.#board.tableau[ref.columnIdx].length - 1)
      return false;

    const destinationCard = this.card(destination);

    switch (destination.zone) {
      case BoardZone.Depots:
        return destinationCard === null;
      case BoardZone.Foundations: {
        const card = this.card(ref)!;
        return (card.rank === 0 && destinationCard === null)
          || (card.suit === destinationCard?.suit && card.rank === destinationCard.rank + 1);
      }
    }
  }

  move(ref: MovableCardRef, destination: MoveDestination) {
    const card = this.card(ref)!;

    switch (destination.zone) {
      case BoardZone.Depots:
        this.#board.depots[destination.cellIdx] = card;
        break;
      case BoardZone.Foundations:
        this.#board.foundations[destination.cellIdx] = card;
        break;
      case BoardZone.Tableau: {
        const column = this.#board.tableau[destination.columnIdx];
        if (ref.zone === BoardZone.Tableau) {
          column.push(...this.#board.tableau[ref.columnIdx].slice(ref.cardIdx));
        }
        else {
          column.push(card);
        }
        break;
      }
    }

    switch (ref.zone) {
      case BoardZone.Depots:
        this.#board.depots[ref.cellIdx] = null;
        break;
      case BoardZone.Tableau:{
        this.#board.tableau[ref.columnIdx].length = ref.cardIdx;
        break;
      }
    }
  }

  autoMove(ref: TableauCardRef) {
    for (const zone of [BoardZone.Foundations, BoardZone.Depots]) {
      for (let i = 0; i < 4; ++i) {
        const destination = { zone, cellIdx: i } as MoveDestination;
        if (this.canMoveTo(ref, destination)) {
          this.move(ref, destination);
          return true;
        }
      }
    }

    return false;
  }
}
