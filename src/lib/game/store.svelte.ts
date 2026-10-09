import type { DeepReadonly } from '$lib/deep_readonly';
import type { Board, MovableCardRef, MoveDestination } from './board';

import { browser } from '$app/environment';
import database, { maxGameHistoryLength } from '$lib/database';
import { Generator } from '$lib/random';
import { emptyBoard } from './board';
import { applyMove, deal } from './rules';

export interface Game {
  seed: string;
  board: Board;
}

function redeal(game: Game, seed?: string): void {
  const generator = new Generator(seed);
  game.seed = generator.state;
  game.board = deal(generator);
}

export class GameStore {
  #data: Game = $state({ seed: '', board: emptyBoard() });
  #history: Game[] = [];
  #historyLength = $state(0);
  #historyHead = -1;
  #historyRewind = $state(0);

  #loading: Promise<void> | null = browser ? this.#load().catch(console.error) : null;

  get seed(): string {
    return this.#data.seed;
  }

  get board(): DeepReadonly<Board> {
    return this.#data.board;
  }

  canUndo(): boolean {
    return this.#historyRewind < this.#historyLength - 1;
  }

  canRedo(): boolean {
    return this.#historyRewind > 0;
  }

  async reset(seed?: string): Promise<void> {
    await this.#mutate((game) => {
      redeal(game, seed);
    });
  }

  async move(ref: MovableCardRef, destination: MoveDestination): Promise<void> {
    await this.#mutate((game) => {
      applyMove(game.board, ref, destination);
    });
  }

  async undo(): Promise<void> {
    await this.#loading;

    if (this.canUndo())
      await this.#restore(this.#historyRewind + 1);
  }

  async redo(): Promise<void> {
    await this.#loading;

    if (this.canRedo())
      await this.#restore(this.#historyRewind - 1);
  }

  async #mutate(callback: (game: Game) => void): Promise<void> {
    await this.#loading;

    callback(this.#data);
    await this.#push();
  }

  async #load(): Promise<void> {
    const history = await database.readGameHistory();
    if (!history) {
      redeal(this.#data);
      await this.#push();
      return;
    }

    this.#history = history.games;
    this.#historyLength = history.games.length;
    this.#historyHead = history.head;
    this.#historyRewind = history.rewind;
    this.#data = this.#history.at(-1 - this.#historyRewind)!;
  }

  async #push(): Promise<void> {
    const game = $state.snapshot(this.#data);

    this.#history.splice(this.#history.length - this.#historyRewind);
    this.#history.push(game);
    if (this.#history.length > maxGameHistoryLength)
      this.#history.shift();

    this.#historyLength = this.#history.length;
    this.#historyHead += 1 - this.#historyRewind;
    this.#historyRewind = 0;

    await database.writeGameHistory(this.#historyHead, game);
  }

  async #restore(rewind: number): Promise<void> {
    this.#historyRewind = rewind;
    this.#data = this.#history.at(-1 - rewind)!;

    await database.writeGameHistoryRewind(rewind);
  }
}

export default new GameStore();
