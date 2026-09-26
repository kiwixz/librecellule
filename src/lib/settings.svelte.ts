import { browser } from '$app/environment';
import database from './database';

export interface Settings {
  autoWin: boolean;
}

class SettingsStore {
  #data: Settings = $state({
    autoWin: true,
  });

  #loaded: Promise<void> | null = browser ? this.#load().catch(console.error) : null;

  get autoWin(): boolean {
    return this.#data.autoWin;
  }

  async mutate<T>(callback: (settings: Settings) => T): Promise<T> {
    await this.#loaded;
    const r = callback(this.#data);
    await this.#save();
    return r;
  }

  async #load(): Promise<void> {
    this.#data = { ...this.#data, ...await database.readSettings() };
  }

  async #save(): Promise<void> {
    await database.writeSettings($state.snapshot(this.#data));
  }
}

export default new SettingsStore();
