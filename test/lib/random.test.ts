import { expect, suite, test } from 'vitest';
import { Generator } from '$lib/random';

suite('Generator', () => {
  test('hardcoded seeds still work', () => {
    const nextState = (seed: string) => {
      const gen = new Generator(seed);
      gen.nextInt32();
      return gen.state;
    };

    expect(nextState('ace')).toBe('192a1f30c059f5103568b9e050f985ae');
    expect(nextState('aceace')).toBe('1920d130c0533b10356277e050f985ae');
    expect(nextState('aceaceaceace')).toBe('d7867d6c0ef5974c783b974c659e03db');
    expect(nextState('aceaceaceaceaceace')).toBe('d786d18688246246ffb31aac60f953db');
    expect(nextState('aceaceaceaceaceaceaceace')).toBe('d786d18688888888ff1ff06260f953db');
    expect(nextState('aceaceaceaceaceaceaceaceaceace')).toBe('eaceac4688888888ff1ff06223175231');
    expect(nextState('aceaceaceaceaceaceaceaceaceaceac')).toBe('eaceacea88888888ff1ff06223123231');
  });

  test('same seeds should produce same sequences', () => {
    const gen1 = new Generator();
    const gen2 = new Generator(gen1.state);

    for (let i = 0; i < 100; i++) {
      expect(gen1.nextInt32()).toBe(gen2.nextInt32());
    }
  });

  test('different seeds should produce different sequences', () => {
    const gen1 = new Generator('a');
    const gen2 = new Generator('b');

    for (let i = 0; i < 100; i++) {
      expect(gen1.nextInt32()).not.toBe(gen2.nextInt32());
    }
  });

  test('uppercase seeds should work', () => {
    expect(new Generator('ABCDEF').state).toMatch(/^abcdef/);
  });
});
