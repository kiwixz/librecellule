import type { IDBPDatabase, IDBPTransaction } from 'idb';
import type { DeepReadonly } from '$lib/deep_readonly';
import type { Game } from '$lib/game/store.svelte';
import type { Settings } from '$lib/settings.svelte';

import { browser } from '$app/environment';
import { openDB } from 'idb';

export const maxGameHistoryLength = 1000;

export interface GameHistory {
  games: Game[];
  head: number;
  rewind: number;
}

async function upgrade(database: IDBPDatabase, version: number,
  _newVersion: number | null, transaction: IDBPTransaction<unknown, string[], 'versionchange'>): Promise<void> {
  if (version < 1)
    database.createObjectStore('kv');

  if (version < 20261000) {
    const history = database.createObjectStore('history');

    const kv = transaction.objectStore('kv');
    const game = await kv.get('game');

    if (game) {
      await history.put(game, 0);
      await kv.delete('game');
    }
  }
}

class Database {
  #database: Promise<IDBPDatabase> | null = browser ? this.#load() : null;

  async readSettings(): Promise<Settings | undefined> {
    return await (await this.#database)!.get('kv', 'settings');
  }

  async writeSettings(settings: DeepReadonly<Settings>): Promise<void> {
    await (await this.#database)!.put('kv', settings, 'settings');
  }

  async readGameHistory(): Promise<GameHistory | undefined> {
    const transaction = (await this.#database)!.transaction(['kv', 'history']);
    const kv = transaction.objectStore('kv');
    const history = transaction.objectStore('history');

    const [games, head, rewind] = await Promise.all([
      history.getAll(),
      history.openKeyCursor(null, 'prev'),
      kv.get('historyRewind'),
    ]);
    if (!head)
      return undefined;

    return {
      games,
      head: head.key as number,
      rewind: Math.min(rewind ?? 0, games.length - 1),
    };
  }

  async writeGameHistory(head: number, game: DeepReadonly<Game>): Promise<void> {
    const transaction = (await this.#database)!.transaction(['kv', 'history'], 'readwrite');
    const kv = transaction.objectStore('kv');
    const history = transaction.objectStore('history');

    await Promise.all([
      history.delete(IDBKeyRange.upperBound(head - maxGameHistoryLength)),
      history.delete(IDBKeyRange.lowerBound(head, true)),
      history.put(game, head),
      kv.put(0, 'historyRewind'),
      transaction.done,
    ]);
  }

  async writeGameHistoryRewind(rewind: number): Promise<void> {
    await (await this.#database)!.put('kv', rewind, 'historyRewind');
  }

  async #load(): Promise<IDBPDatabase> {
    return await openDB('data', 20261000, { upgrade });
  }
}

export default new Database();
