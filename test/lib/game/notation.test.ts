import { expect, suite, test } from 'vitest';
import { formatBoard, formatCells, formatTableau, parseBoard, parseCard, parseCells, parseTableau } from '$lib/game/notation';
import { deal } from '$lib/game/rules';
import { Generator } from '$lib/random';

suite('notation', () => {
  test('cards should parse to their rank and suit', () => {
    expect(parseCard('As')).toEqual({ rank: 0, suit: 0 });
    expect(parseCard('2h')).toEqual({ rank: 1, suit: 1 });
    expect(parseCard('3d')).toEqual({ rank: 2, suit: 2 });
    expect(parseCard('9c')).toEqual({ rank: 8, suit: 3 });
    expect(parseCard('Ts')).toEqual({ rank: 9, suit: 0 });
    expect(parseCard('Jh')).toEqual({ rank: 10, suit: 1 });
    expect(parseCard('Qd')).toEqual({ rank: 11, suit: 2 });
    expect(parseCard('Kc')).toEqual({ rank: 12, suit: 3 });
  });

  test('invalid cards should throw', () => {
    for (const text of ['', 'A', 'AS', 'as', '1s', '10s', 'As '])
      expect(() => parseCard(text), text).toThrow('Invalid card');
  });

  test('cells should parse card by card', () => {
    expect(parseCells('As __ Kc __')).toEqual([
      { rank: 0, suit: 0 },
      null,
      { rank: 12, suit: 3 },
      null,
    ]);
  });

  test('formatted cells should parse back to the same cards', () => {
    const board = deal(new Generator('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
    board.depots[1] = board.tableau[0].pop()!;
    board.depots[3] = board.tableau[1].pop()!;

    expect(parseCells(formatCells(board.depots))).toEqual(board.depots);
  });

  test('tableaus should parse column by column', () => {
    expect(parseTableau(['Ks Qh', '', '', '', 'Jd', '', 'Tc', 'As'])).toEqual([
      [{ rank: 12, suit: 0 }, { rank: 11, suit: 1 }],
      [],
      [],
      [],
      [{ rank: 10, suit: 2 }],
      [],
      [{ rank: 9, suit: 3 }],
      [{ rank: 0, suit: 0 }],
    ]);
  });

  test('formatted tableaus should parse back to the same board', () => {
    const board = deal(new Generator('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));

    expect(parseTableau(formatTableau(board.tableau))).toEqual(board.tableau);
  });

  test('boards should parse zone by zone', () => {
    expect(parseBoard({
      depots: '__ 2h __ Qd',
      foundations: 'As __ Kc __',
      tableau: ['Ks Qh', '', '', '', 'Jd', '', 'Tc', 'As'],
    })).toEqual({
      depots: [null, { rank: 1, suit: 1 }, null, { rank: 11, suit: 2 }],
      foundations: [{ rank: 0, suit: 0 }, null, { rank: 12, suit: 3 }, null],
      tableau: [
        [{ rank: 12, suit: 0 }, { rank: 11, suit: 1 }],
        [],
        [],
        [],
        [{ rank: 10, suit: 2 }],
        [],
        [{ rank: 9, suit: 3 }],
        [{ rank: 0, suit: 0 }],
      ],
    });
  });

  test('formatted boards should parse back to the same board', () => {
    const board = deal(new Generator('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));
    board.depots[2] = board.tableau[2].pop()!;

    expect(parseBoard(formatBoard(board))).toEqual(board);
  });
});
