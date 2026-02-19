import type { BoardData, CardData } from './types';

import { Generator } from '$lib/random';
import { createTuple, generateTuple } from '$lib/tuple';
import { ints } from '$lib/range';

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
}
