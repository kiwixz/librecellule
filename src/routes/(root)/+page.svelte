<script lang="ts">
  import { browser } from '$app/environment';
  import { resolve } from '$app/paths';
  import Menu from '@lucide/svelte/icons/menu';
  import Redo from '@lucide/svelte/icons/redo-2';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import Shuffle from '@lucide/svelte/icons/shuffle';
  import Settings from '@lucide/svelte/icons/settings';
  import Undo from '@lucide/svelte/icons/undo-2';
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

<svelte:head>
  <title>LibreCellule</title>
</svelte:head>

<svelte:window {onkeydown} />

<div class="min-h-dvh">
  <main class="mx-auto max-w-[110lvmin]">
    <Board {game} />
  </main>

  <div class="fixed bottom-0 p-2 w-full flex flex-wrap justify-between gap-2 items-end
      pointer-events-none *:pointer-events-auto">
    <div class="dropdown dropdown-top">
      <div tabindex="0" role="button" class="btn btn-square" aria-label="Menu"><!-- safari cant focus buttons -->
        <Menu />
      </div>

      <ul class="mb-1 w-40 dropdown-content bg-base-200 rounded-box shadow menu [&>li>*]:py-2">
        <li>
          <a href={resolve('/settings')}>
            <Settings /> Settings
          </a>
        </li>
        <li>
          <button onclick={() => game.reset()}>
            <Shuffle /> New Deal
          </button>
        </li>
        <li>
          <button onclick={() => game.reset(game.seed)}>
            <RotateCcw /> Restart
          </button>
        </li>
      </ul>
    </div>

    <div class="flex flex-col flex-wrap gap-2">
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
