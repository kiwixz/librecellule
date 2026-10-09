import type { DeepReadonly } from '$lib/deep_readonly';
import type { Board } from './board';

import { isWinnable } from './solver';

export interface SolverRequest {
  id: number;
  board: DeepReadonly<Board>;
}

export interface SolverReply {
  id: number;
  winnable: boolean | null;
  time: number;
}

let controller: AbortController | null = null;

self.addEventListener('message', async (ev: MessageEvent<SolverRequest>) => {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const start = performance.now();
  const winnable = await isWinnable(ev.data.board, signal);
  if (signal.aborted)
    return;

  const r: SolverReply = { id: ev.data.id, winnable, time: performance.now() - start };
  self.postMessage(r);
});
