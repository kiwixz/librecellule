import type { Board } from './board';

import { isWinnable } from './solver';

let controller: AbortController | null = null;

self.addEventListener('message', async (ev: MessageEvent<{ id: number; board: Board }>) => {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const start = performance.now();
  const winnable = await isWinnable(ev.data.board, signal);
  if (!signal.aborted)
    self.postMessage({ id: ev.data.id, winnable, time: performance.now() - start });
});
