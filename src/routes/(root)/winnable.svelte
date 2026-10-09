<script lang="ts">
  import type { DeepReadonly } from '$lib/deep_readonly';
  import type { Board } from '$lib/game/board';

  import CircleCheck from '@lucide/svelte/icons/circle-check';
  import CircleX from '@lucide/svelte/icons/circle-x';
  import { onMount } from 'svelte';
  import solverUrl from '$lib/game/solver_worker?worker&url';
  import { trustedScriptUrl } from '$lib/trusted_types';

  const props: {
    board: DeepReadonly<Board>;
  } = $props();

  const playing = $derived(props.board.tableau.some(column => column.length > 0)
    || props.board.depots.some(card => card !== null));

  let winnable: boolean | null = $state(null);
  let solveTime: number | null = $state(null);

  let solver: Worker;
  let board: DeepReadonly<Board>;
  let solving: DeepReadonly<Board> | null = null;

  function solve(): void {
    solving = board;
    solver.postMessage(board);
  }

  onMount(() => {
    solver = new Worker(trustedScriptUrl(solverUrl) as string, { type: 'module' });
    solver.onmessage = (ev: MessageEvent<{ winnable: boolean | null; time: number }>) => {
      if (solving !== board) {
        solve();
        return;
      }

      solving = null;
      winnable = ev.data.winnable;
      solveTime = ev.data.time;
    };

    return () => solver.terminate();
  });

  $effect(() => {
    if (!playing)
      return;

    board = $state.snapshot(props.board);
    if (!solving)
      solve();
  });
</script>

<div class="h-10 flex items-center gap-2 pointer-events-none!" role="status">
  {#if playing && winnable !== null}
    <div class="badge">
      {#if winnable}
        <CircleCheck /> Winnable
      {:else}
        <CircleX /> Not winnable
      {/if}
    </div>
  {/if}
  {#if playing && solveTime !== null}
    <span class="text-xs">{solveTime.toFixed(1)} ms</span>
  {/if}
</div>
