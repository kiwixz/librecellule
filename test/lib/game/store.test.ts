import { IDBFactory } from 'fake-indexeddb';
import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { beforeEach, expect, suite, test, vi } from 'vitest';
import { BoardZone } from '$lib/game/board';
import { formatBoard } from '$lib/game/notation';

vi.mock('$app/environment', () => ({ browser: true }));

async function reload() {
  vi.resetModules();
  const { default: game } = await import('$lib/game/store.svelte');
  await vi.waitFor(() => expect(game.seed).not.toBe(''), { interval: 1 });
  return game;
}

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

suite('game store', () => {
  test('undo history should survive reloads', async () => {
    let game = await reload();
    await game.reset('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');

    const boards = [formatBoard(game.board)];
    for (let i = 0; i < 2; ++i) {
      await game.move({ zone: BoardZone.Tableau, columnIdx: i, cardIdx: 6 }, { zone: BoardZone.Depots, cellIdx: i });
      boards.push(formatBoard(game.board));
    }

    await game.undo();
    expect(formatBoard(game.board)).toEqual(boards[1]);

    game = await reload();
    expect(formatBoard(game.board)).toEqual(boards[1]);

    await game.undo();
    expect(formatBoard(game.board)).toEqual(boards[0]);

    await game.redo();
    await game.redo();
    expect(formatBoard(game.board)).toEqual(boards[2]);
  });

  test('games saved in database version 1 should still load', async () => {
    const database = await openDB('data', 1, { upgrade: db => db.createObjectStore('kv') });
    await database.put('kv', {
      seed: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      board: {
        depots: [{ rank: 0, suit: 0 }, null, null, { rank: 12, suit: 3 }],
        foundations: [null, { rank: 1, suit: 1 }, null, null],
        tableau: [[{ rank: 2, suit: 2 }, { rank: 3, suit: 3 }], [], [], [], [], [], [], []],
      },
    }, 'game');
    database.close();

    const game = await reload();
    expect(game.seed).toBe('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    expect(formatBoard(game.board)).toEqual({
      depots: 'As __ __ Kc',
      foundations: '__ 2h __ __',
      tableau: ['3d 4c', '', '', '', '', '', '', ''],
    });
  });
});
