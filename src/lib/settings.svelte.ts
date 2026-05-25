import type { MaybePromise } from './maybe_promise';
import type { SettingsData } from './types';

import { browser } from '$app/environment';
import database from './database';

class Impl {
  #data: SettingsData = $state({
    autoWin: true,
  });

  #loadingPromise: Promise<void> | null = null;

  constructor() {
    if (browser)
      this.load();
  }

  get autoWin(): boolean {
    return this.#data.autoWin;
  }

  async mutate<T>(callback: (settings: SettingsData) => MaybePromise<T>): Promise<T> {
    const r = await callback(this.#data);
    await this.#save();
    return r;
  }

  async load(): Promise<void> {
    if (this.#loadingPromise)
      return this.#loadingPromise;

    this.#loadingPromise = (async () => {
      try {
        this.#data = { ...this.#data, ...await database.readSettings() };
      }
      finally {
        this.#loadingPromise = null;
      }
    })();
    return this.#loadingPromise;
  }

  async #save(): Promise<void> {
    await database.writeSettings($state.snapshot(this.#data));
  }
}

export default new Impl();
