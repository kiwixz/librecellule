import type { IDBPDatabase } from 'idb';
import type { Game } from '$lib/game/store.svelte';
import type { Settings } from '$lib/settings.svelte';

import { openDB } from 'idb';

function upgrade(database: IDBPDatabase, version: number): void {
  if (version < 1)
    database.createObjectStore('kv');
}

class Database {
  #database: IDBPDatabase | null = null;
  #openingPromise: Promise<void> | null = null;

  async readSettings(): Promise<Settings | undefined> {
    await this.#open();
    return await this.#database!.get('kv', 'settings');
  }

  async writeSettings(settings: Settings): Promise<void> {
    await this.#open();
    await this.#database!.put('kv', settings, 'settings');
  }

  async readGame(): Promise<Game | undefined> {
    await this.#open();
    return await this.#database!.get('kv', 'game');
  }

  async writeGame(game: Game): Promise<void> {
    await this.#open();
    await this.#database!.put('kv', game, 'game');
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

export default new Database();
