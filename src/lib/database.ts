import type { IDBPDatabase } from 'idb';
import type { GameData } from '$lib/types';

import { openDB } from 'idb';

function upgrade(database: IDBPDatabase, version: number): void {
  if (version < 1)
    database.createObjectStore('kv');
}

export default class Database {
  #database: IDBPDatabase | null = null;

  async open(): Promise<void> {
    if (!this.#database)
      this.#database = await openDB('data', 1, { upgrade });
  }

  async readGameData(): Promise<GameData | undefined> {
    await this.open();
    return await this.#database?.get('kv', 'game');
  }

  async writeGameData(state: GameData) {
    await this.open();
    await this.#database!.put('kv', state, 'game');
  }
}
