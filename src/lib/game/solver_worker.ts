import type { Board } from './board';

import { isWinnable } from './solver';

self.addEventListener('message', (ev: MessageEvent<Board>) => {
  const start = performance.now();
  const winnable = isWinnable(ev.data);
  self.postMessage({ winnable, time: performance.now() - start });
});
