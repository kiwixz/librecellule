import type { IDBPDatabase } from 'idb';
import type { GameData } from '$lib/types';

import { openDB } from 'idb';

function upgrade(database: IDBPDatabase, version: number): void {
  if (version < 1)
    database.createObjectStore('kv');
}

class Impl {
  #database: IDBPDatabase | null = null;
  #openingPromise: Promise<void> | null = null;

  async readGameData(): Promise<GameData | undefined> {
    await this.#open();
    return await this.#database!.get('kv', 'game');
  }

  async writeGameData(state: GameData): Promise<void> {
    await this.#open();
    await this.#database!.put('kv', state, 'game');
  }

  async #open(): Promise<void> {
    if (this.#database)
      return;
    if (this.#openingPromise)
      return this.#openingPromise;

    this.#openingPromise = (async () => {
      try {
        this.#database = await openDB('data', 1, { upgrade });
      }
      finally {
        this.#openingPromise = null;
      }
    })();
    return this.#openingPromise;
  }
}

export default new Impl();
