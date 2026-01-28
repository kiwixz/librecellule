import { ints } from '$lib/range'

export class Generator { // xoshiro128+
  #state: Uint32Array

  constructor(state?: string) {
    const stateInt = state
      ? (i: number) => parseInt(state.slice(i * 8, (i + 1) * 8).padEnd(8, '0'), 16)
      : () => random(2 ** 32)
    this.#state = new Uint32Array(ints(4, i => stateInt(i) || 0xaaaaaaaa))
  }

  state() {
    return this.#state.reduce((r, int) => r + int.toString(16).padStart(8, '0'), '')
  }

  next() {
    const result = (this.#state[0] + this.#state[3]) >>> 0

    const t = this.#state[1] << 9

    this.#state[2] ^= this.#state[0]
    this.#state[3] ^= this.#state[1]
    this.#state[1] ^= this.#state[2]
    this.#state[0] ^= this.#state[3]

    this.#state[2] ^= t
    this.#state[3] = this.#state[3] << 11 | this.#state[3] >> (32 - 11)

    return result
  }
}

export function random(choices: number) {
  return Math.floor(Math.random() * choices)
}
