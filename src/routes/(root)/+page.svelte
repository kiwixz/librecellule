<script lang="ts">
  import { browser } from '$app/environment';
  import Undo from '@lucide/svelte/icons/undo-2';
  import Redo from '@lucide/svelte/icons/redo-2';
  import Shuffle from '@lucide/svelte/icons/shuffle';
  import Board from './board.svelte';
  import Game from './game.svelte';

  const game = new Game();
  if (browser)
    game.load();

  function onkeydown(ev: KeyboardEvent): void {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z') {
      game.undo();
    }
    else if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'y' || ev.key === 'Z')) {
      game.redo();
    }
  }
</script>

<svelte:window {onkeydown} />

<div class="relative min-h-dvh">
  <main class="max-w-[120lvmin] mx-auto">
    <Board {game} />
  </main>

  <div class="absolute bottom-0 p-1 w-full flex flex-wrap gap-2 items-end">
    <div class="flex max-sm:flex-col-reverse flex-wrap gap-1">
      <button class="btn" onclick={() => game.reset()}>
        <Shuffle /> New Deal
      </button>
      <div class="join">
        <button class="btn join-item" disabled={!game.canUndo()} onclick={() => game.undo()}>
          <Undo /> Undo
        </button>
        {#if game.canRedo()}
          <button class="btn join-item" onclick={() => game.redo()}>
            <Redo /> Redo
          </button>
        {/if}
      </div>
    </div>

    <div class="ml-auto leading-none break-all">
      {game?.seed}
    </div>
  </div>
</div>
