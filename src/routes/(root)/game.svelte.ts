import { Generator } from '$lib/random';
import { ints } from '$lib/range';
import type { BoardData, CardData } from './types';

export class Game {
  #seed = $state('');
  #board: BoardData = $state({
    depots: Array(4),
    foundations: Array(4),
    tableau: Array(8).fill([]),
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
      depots: ints(4, i => ({ rank: 1 + i, suit: 3 })),
      foundations: ints(4, i => ({ rank: 0, suit: i })),
      tableau: ints(8, i => ints(i < 4 ? 7 : 6, popCard)),
    };
  }
}
