import { expect, suite, test } from 'vitest';
import { BoardZone } from '$lib/game/board';
import { parseBoard } from '$lib/game/notation';
import { applyMove, deal } from '$lib/game/rules';
import { isWinnable } from '$lib/game/solver';
import { Generator } from '$lib/random';

suite('solver', () => {
  test('some deals should be winnable', async () => {
    const board = deal(new Generator('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));

    expect(await isWinnable(board)).toBe(true);
  });

  test('filling the last depot should lose a game that needs it', async () => {
    const board = parseBoard({
      depots: 'Ks Kh Kd __',
      foundations: '8s 8h 8d 8c',
      tableau: ['9s Ts', '9h Th', '9d Td', '9c Tc', 'Js Qs', 'Jh Qh', 'Jd Qd', 'Jc Qc Kc'],
    });
    expect(await isWinnable(board)).toBe(true);

    applyMove(board, { zone: BoardZone.Tableau, columnIdx: 7, cardIdx: 2 }, { zone: BoardZone.Depots, cellIdx: 3 });
    expect(await isWinnable(board)).toBe(false);
  });

  test('dead ends should be seen while moves are left', async () => {
    const board = parseBoard({
      depots: 'Ks Kh Kd Kc',
      foundations: '8s 8h 8d 6c',
      tableau: ['9s Ts', '9h Th', '9d Td', '9c Tc', 'Js Qs', 'Jh Qh', 'Jd Qd', 'Jc Qc 8c 7c'],
    });

    expect(await isWinnable(board)).toBe(false);
  });
});
