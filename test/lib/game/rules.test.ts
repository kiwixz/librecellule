import { expect, suite, test } from 'vitest';
import { formatTableau } from '$lib/game/notation';
import { deal } from '$lib/game/rules';
import { Generator } from '$lib/random';

suite('deal', () => {
  test('hardcoded seeds still deal the same board', () => {
    const board = deal(new Generator('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'));

    expect(formatTableau(board.tableau)).toEqual([
      '5h 8d 4h As 7d 5c 8s',
      '3h 6h Kc 4d Jc 8h 7s',
      'Qh Ah 3d 8c 2h Ks Kh',
      'Td Jd 6c Kd 3c Js 6s',
      '9c Qs 2d Qc Th 5s',
      '4c 3s Ac Qd Ts Tc',
      'Ad 9h 2c 9s 6d Jh',
      '9d 2s 4s 7h 7c 5d',
    ]);
  });
});
