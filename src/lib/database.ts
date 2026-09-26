import type { IDBPDatabase } from 'idb';
import type { Game } from '$lib/game/store.svelte';
import type { Settings } from '$lib/settings.svelte';

import { browser } from '$app/environment';
import { openDB } from 'idb';

function upgrade(database: IDBPDatabase, version: number): void {
  if (version < 1)
    database.createObjectStore('kv');
}

class Database {
  #database: Promise<IDBPDatabase> | null = browser ? this.#load() : null;

  async readSettings(): Promise<Settings | undefined> {
    return await (await this.#database)!.get('kv', 'settings');
  }

  async writeSettings(settings: Settings): Promise<void> {
    await (await this.#database)!.put('kv', settings, 'settings');
  }

  async readGame(): Promise<Game | undefined> {
    return await (await this.#database)!.get('kv', 'game');
  }

  async writeGame(game: Game): Promise<void> {
    await (await this.#database)!.put('kv', game, 'game');
  }

  async #load(): Promise<IDBPDatabase> {
    return await openDB('data', 1, { upgrade });
  }
}

export default new Database();
