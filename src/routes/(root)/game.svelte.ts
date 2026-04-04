import type { DeepReadonly } from '$lib/deep_readonly';
import type { BoardData, CardData, GameData } from '$lib/types';
import type { CardRef, MovableCardRef, MoveDestination } from './types';

import Database from '$lib/database';
import { Generator } from '$lib/random';
import { ints } from '$lib/range';
import { createTuple, generateTuple } from '$lib/tuple';
import { BoardZone } from './types';

function isTableauSequence(sequence: CardData[]): boolean {
  const color = (card: CardData) => card.suit === 1 || card.suit === 2;

  for (let i = 1; i < sequence.length; ++i) {
    if (color(sequence[i]) === color(sequence[i - 1]) || sequence[i].rank !== sequence[i - 1].rank - 1)
      return false;
  }

  return true;
}

class GameState {
  #data: GameData = $state({
    seed: '',
    board: {
      depots: createTuple(4, null),
      foundations: createTuple(4, null),
      tableau: createTuple(8, []),
    },
  });

  #database = new Database();

  #history: GameData[] = $state([]);
  #undoHistory: GameData[] = $state([]);

  get seed(): string {
    return this.#data.seed;
  }

  get board(): DeepReadonly<BoardData> {
    return this.#data.board;
  }

  canUndo(): boolean {
    return this.#history.length > 0;
  }

  canRedo(): boolean {
    return this.#undoHistory.length > 0;
  }

  mutate<T>(callback: (state: GameData) => T): T {
    this.#history.push($state.snapshot(this.#data));
    if (history.length > 10000)
      this.#history.shift();
    this.#undoHistory = [];

    const r = callback(this.#data);
    this.#save();
    return r;
  }

  async load(): Promise<boolean> {
    const data = await this.#database.readGameData();
    if (!data)
      return false;

    this.#data = data;
    return true;
  }

  undo(): void {
    const data = this.#history.pop();
    if (!data)
      return;

    this.#undoHistory.push($state.snapshot(this.#data));
    this.#data = data;
    this.#save();
  }

  redo(): void {
    const data = this.#undoHistory.pop();
    if (!data)
      return;

    this.#history.push($state.snapshot(this.#data));
    this.#data = data;
    this.#save();
  }

  #save(): void {
    this.#database.writeGameData($state.snapshot(this.#data));
  }
}

export default class Game {
  #state = new GameState();

  get seed(): string {
    return this.#state.seed;
  }

  get board(): DeepReadonly<BoardData> {
    return this.#state.board;
  }

  card(ref: CardRef): Readonly<CardData> | null {
    switch (ref.zone) {
      case BoardZone.Depots: return this.board.depots[ref.cellIdx];
      case BoardZone.Foundations: return this.board.foundations[ref.cellIdx];
      case BoardZone.Tableau: return this.board.tableau[ref.columnIdx][ref.cardIdx];
    }
  }

  maxSupermove(toEmptyColumn: boolean): number {
    const emptyDepots = this.board.depots.reduce((r, card) => r + +(card === null), 0);
    const emptyColumns = this.board.tableau.reduce((r, card) => r + +(card.length === 0), 0);
    const temporaryColumns = emptyColumns - +toEmptyColumn;
    return (1 + emptyDepots) * (2 ** temporaryColumns);
  }

  canMove(ref: MovableCardRef): boolean {
    switch (ref.zone) {
      case BoardZone.Depots:
        return true;

      case BoardZone.Tableau:{
        const sequence = this.board.tableau[ref.columnIdx].slice(ref.cardIdx);
        return sequence.length === 1
          || (isTableauSequence(sequence)
            && sequence.length <= this.maxSupermove(false));
      }
    }
  }

  canMoveTo(ref: MovableCardRef, destination: MoveDestination): boolean {
    if (destination.zone === BoardZone.Tableau) {
      const column = this.board.tableau[destination.columnIdx];
      if (column.length > 0)
        return isTableauSequence([column.at(-1)!, this.card(ref)!]);
      if (ref.zone !== BoardZone.Tableau)
        return true;
      const supermove = this.board.tableau[ref.columnIdx].length - ref.cardIdx;
      return supermove <= this.maxSupermove(true);
    }

    if (ref.zone === BoardZone.Tableau && ref.cardIdx < this.board.tableau[ref.columnIdx].length - 1)
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

  canUndo(): boolean {
    return this.#state.canUndo();
  }

  canRedo(): boolean {
    return this.#state.canRedo();
  }

  reset(seed?: string): void {
    const generator = new Generator(seed);

    const deck = ints(4 * 13, i => ({ rank: i % 13, suit: Math.floor(i / 13) }));
    const popCard = () => {
      const i = generator.nextInt(deck.length);
      [deck[i], deck[deck.length - 1]] = [deck[deck.length - 1], deck[i]];
      return deck.pop() as CardData;
    };

    this.#state.mutate((state) => {
      state.seed = generator.state;
      state.board = {
        depots: createTuple(4, null),
        foundations: createTuple(4, null),
        tableau: generateTuple(8, i => ints(i < 4 ? 7 : 6, popCard)),
      };
    });
  }

  move(ref: MovableCardRef, destination: MoveDestination): void {
    const card = this.card(ref)!;

    this.#state.mutate((state) => {
      switch (destination.zone) {
        case BoardZone.Depots:
          state.board.depots[destination.cellIdx] = card;
          break;
        case BoardZone.Foundations:
          state.board.foundations[destination.cellIdx] = card;
          break;
        case BoardZone.Tableau: {
          const column = state.board.tableau[destination.columnIdx];
          if (ref.zone === BoardZone.Tableau) {
            column.push(...this.board.tableau[ref.columnIdx].slice(ref.cardIdx));
          }
          else {
            column.push(card);
          }
          break;
        }
      }

      switch (ref.zone) {
        case BoardZone.Depots:
          state.board.depots[ref.cellIdx] = null;
          break;
        case BoardZone.Tableau:{
          state.board.tableau[ref.columnIdx].length = ref.cardIdx;
          break;
        }
      }
    });
  }

  autoMove(ref: MovableCardRef): boolean {
    const card = this.card(ref)!;

    if (card.rank === 0) {
      const destination: MoveDestination = { zone: BoardZone.Foundations, cellIdx: card.suit };

      if (this.canMoveTo(ref, destination)) {
        this.move(ref, destination);
        return true;
      }
    }

    for (const zone of [BoardZone.Foundations, BoardZone.Depots]) {
      if (zone === ref.zone)
        continue;

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

  async load(): Promise<void> {
    if (!await this.#state.load())
      this.reset();
  }

  undo(): void {
    this.#state.undo();
  }

  redo(): void {
    this.#state.redo();
  }
}
