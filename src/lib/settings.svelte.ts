import { browser } from '$app/environment';
import database from './database';

export interface Settings {
  autoWin: boolean;
  optimizedLayout: boolean;
  showWinnable: boolean;
}

class SettingsStore {
  #data: Settings = $state({
    autoWin: true,
    optimizedLayout: true,
    showWinnable: true,
  });

  #loading: Promise<void> | null = browser ? this.#load().catch(console.error) : null;
  #loaded = $state(false);

  get loaded(): boolean {
    return this.#loaded;
  }

  get autoWin(): boolean {
    return this.#data.autoWin;
  }

  get optimizedLayout(): boolean {
    return this.#data.optimizedLayout;
  }

  get showWinnable(): boolean {
    return this.#data.showWinnable;
  }

  async mutate<T>(callback: (settings: Settings) => T): Promise<T> {
    await this.#loading;
    const r = callback(this.#data);
    await this.#save();
    return r;
  }

  async #load(): Promise<void> {
    this.#data = { ...this.#data, ...await database.readSettings() };
    this.#loaded = true;
  }

  async #save(): Promise<void> {
    await database.writeSettings($state.snapshot(this.#data));
  }
}

export default new SettingsStore();
