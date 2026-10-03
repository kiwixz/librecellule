import { ints } from '$lib/range';

export class Generator { // xoshiro128+
  #state: Uint32Array;

  constructor(seed?: string) {
    const stateInt = seed
      ? (i: number) => parseInt(seed.slice(i * 8, (i + 1) * 8).padEnd(8, '0'), 16)
      : () => randomInt(2 ** 32);
    this.#state = new Uint32Array(ints(4, i => stateInt(i) || 0x12345678 << i));
  }

  get state(): string {
    return this.#state.reduce((r, int) => r + int.toString(16).padStart(8, '0'), '');
  }

  next(): number {
    return this.nextInt32() / 2 ** 32;
  }

  nextInt(choices: number): number {
    return Math.floor(this.next() * choices);
  }

  nextInt32(): number {
    const result = (this.#state[0] + this.#state[3]) >>> 0;

    const t = this.#state[1] << 9;

    this.#state[2] ^= this.#state[0];
    this.#state[3] ^= this.#state[1];
    this.#state[1] ^= this.#state[2];
    this.#state[0] ^= this.#state[3];

    this.#state[2] ^= t;
    this.#state[3] = this.#state[3] << 11 | this.#state[3] >>> (32 - 11);

    return result;
  }

  jump(): void {
    const state = new Uint32Array(4);
    for (const word of [0x8764000b, 0xf542d2d3, 0x6fa035c3, 0x77f2db5b]) {
      for (let bit = 0; bit < 32; ++bit) {
        if (word & 1 << bit)
          this.#state.forEach((int, i) => state[i] ^= int);
        this.nextInt32();
      }
    }

    this.#state = state;
  }
}

export function nextSeed(seed: string): string {
  const generator = new Generator(seed);
  generator.jump();
  return generator.state;
}

export function randomInt(choices: number): number {
  return Math.floor(Math.random() * choices);
}

export function shuffle<T>(array: Readonly<T[]>, generator: Generator): T[] {
  const r = [...array];
  for (let i = r.length - 1; i > 0; --i) {
    const j = generator.nextInt(i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
