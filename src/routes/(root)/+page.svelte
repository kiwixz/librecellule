<script lang="ts">
  import { browser } from '$app/environment';
  import Menu from '@lucide/svelte/icons/menu';
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
    <div class="dropdown dropdown-top">
      <div tabindex="0" role="button" class="btn btn-square" aria-label="Menu"><!-- safari cant focus buttons -->
        <Menu />
      </div>

      <ul class="mb-1 w-40 dropdown-content bg-base-200 rounded-box shadow menu">
        <li>
          <button onclick={() => game.reset()}>
            <Shuffle /> New Deal
          </button>
        </li>
      </ul>
    </div>

    <div class="ml-auto flex flex-col flex-wrap gap-1">
      {#if game.canRedo()}
        <button class="btn" onclick={() => game.redo()}>
          <Redo /> Redo
        </button>
      {/if}
      <button class="btn" disabled={!game.canUndo()} onclick={() => game.undo()}>
        <Undo /> Undo
      </button>
    </div>
  </div>
</div>
