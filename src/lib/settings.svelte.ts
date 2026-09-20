import { browser } from '$app/environment';
import database from './database';

export interface Settings {
  autoWin: boolean;
}

class SettingsStore {
  #data: Settings = $state({
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

  async mutate<T>(callback: (settings: Settings) => T): Promise<T> {
    const r = callback(this.#data);
    await this.#save();
    return r;
  }

  async #save(): Promise<void> {
    await database.writeSettings($state.snapshot(this.#data));
  }
}

export default new SettingsStore();
