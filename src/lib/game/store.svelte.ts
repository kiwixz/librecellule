import type { DeepReadonly } from '$lib/deep_readonly';
import type { Board, MovableCardRef, MoveDestination } from './board';

import { browser } from '$app/environment';
import database from '$lib/database';
import { Generator } from '$lib/random';
import { emptyBoard } from './board';
import { applyMove, deal } from './rules';

export interface Game {
  seed: string;
  board: Board;
}

export class GameStore {
  #data: Game = $state({ seed: '', board: emptyBoard() });
  #history: Game[] = $state([]);
  #undoHistory: Game[] = $state([]);

  #loadingPromise: Promise<void> | null = null;

  constructor() {
    if (browser)
      this.load();
  }

  get seed(): string {
    return this.#data.seed;
  }

  get board(): DeepReadonly<Board> {
    return this.#data.board;
  }

  canUndo(): boolean {
    return this.#history.length > 0;
  }

  canRedo(): boolean {
    return this.#undoHistory.length > 0;
  }

  load(): Promise<void> {
    this.#loadingPromise ??= (async () => {
      try {
        const data = await database.readGame();
        if (data) {
          this.#data = data;
        }
        else {
          await this.reset();
        }
      }
      finally {
        this.#loadingPromise = null;
      }
    })();

    return this.#loadingPromise;
  }

  async reset(seed?: string): Promise<void> {
    const generator = new Generator(seed);

    await this.#mutate((game) => {
      game.seed = generator.state;
      game.board = deal(generator);
    });
  }

  async move(ref: MovableCardRef, destination: MoveDestination): Promise<void> {
    await this.#mutate((game) => {
      applyMove(game.board, ref, destination);
    });
  }

  async undo(): Promise<void> {
    const data = this.#history.pop();
    if (!data)
      return;

    this.#undoHistory.push($state.snapshot(this.#data));
    this.#data = data;
    await this.#save();
  }

  async redo(): Promise<void> {
    const data = this.#undoHistory.pop();
    if (!data)
      return;

    this.#history.push($state.snapshot(this.#data));
    this.#data = data;
    await this.#save();
  }

  async #mutate(callback: (game: Game) => void): Promise<void> {
    const previous = $state.snapshot(this.#data);
    callback(this.#data);

    this.#history.push(previous);
    if (this.#history.length > 10000)
      this.#history.shift();
    this.#undoHistory = [];

    await this.#save();
  }

  async #save(): Promise<void> {
    await database.writeGame($state.snapshot(this.#data));
  }
}

export default new GameStore();
