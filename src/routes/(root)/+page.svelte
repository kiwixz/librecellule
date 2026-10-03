<script lang="ts">
  import { resolve } from '$app/paths';
  import Menu from '@lucide/svelte/icons/menu';
  import Redo from '@lucide/svelte/icons/redo-2';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import Share2 from '@lucide/svelte/icons/share-2';
  import Shuffle from '@lucide/svelte/icons/shuffle';
  import Settings from '@lucide/svelte/icons/settings';
  import Undo from '@lucide/svelte/icons/undo-2';
  import confetti from 'canvas-confetti';
  import { isWon } from '$lib/game/rules';
  import game from '$lib/game/store.svelte';
  import { nextSeed } from '$lib/random';
  import Board from './board.svelte';
  import Toast from './toast.svelte';

  let winDialog: HTMLDialogElement;
  let toast: Toast;

  const won = $derived(isWon(game.board));

  let confettiTimer: ReturnType<typeof setTimeout>;

  function onkeydown(ev: KeyboardEvent): void {
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z') {
      ev.preventDefault();
      game.undo();
    }
    else if ((ev.ctrlKey || ev.metaKey) && (ev.key === 'y' || ev.key === 'Z')) {
      ev.preventDefault();
      game.redo();
    }
  }

  function onWin(): void {
    winDialog.showModal();

    let delay = 1000 / 30;
    const burst = () => {
      confetti({
        particleCount: 7,
        spread: 90,
        ticks: 400,
        disableForReducedMotion: true,
      });

      ++delay;
      if (delay > 150)
        delay *= 1.2;
      if (delay <= 600)
        confettiTimer = setTimeout(burst, delay);
    };
    burst();
  }

  async function share(): Promise<void> {
    const url = new URL(resolve('/share/[seed=seed]', { seed: game.seed }), location.href).href;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'LibreCellule', url });
        return;
      }
      catch (ex) {
        if (ex instanceof DOMException && ex.name === 'AbortError')
          return;
        console.error(ex);
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.show('Link copied');
    }
    catch (ex) {
      console.error(ex);
      toast.show('Could not share link');
    }
  }
</script>

<svelte:head>
  <title>LibreCellule</title>
</svelte:head>

<svelte:window {onkeydown} />

<div class="min-h-dvh">
  <main class="mx-auto max-w-[110lvmin]">
    <Board {game} {onWin} />
  </main>

  <div class="fixed bottom-0 p-2 w-full flex flex-wrap justify-between gap-2 items-end
      pointer-events-none *:pointer-events-auto">
    <div class="dropdown dropdown-top">
      <div tabindex="0" class="btn btn-square" role="button" aria-label="Menu"><!-- safari cant focus buttons -->
        <Menu />
      </div>

      <ul class="mb-1 w-40 dropdown-content bg-base-200 rounded-box shadow menu [&>li>*]:py-2">
        <li>
          <a href={resolve('/settings')}>
            <Settings /> Settings
          </a>
        </li>
        <li>
          <button onclick={share}>
            <Share2 /> Share
          </button>
        </li>
        <li>
          <button onclick={() => game.reset(won ? nextSeed(game.seed) : undefined)}>
            <Shuffle /> {won ? 'Next Deal' : 'New Deal'}
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

  <dialog bind:this={winDialog} class="modal bg-transparent" onclose={() => clearTimeout(confettiTimer)}>
    <div class="modal-box w-auto px-12 py-8 bg-base-300 text-center">
      <p class="text-5xl font-semibold">You won!</p>

      <form method="dialog" class="modal-action mt-6 justify-center">
        <button class="btn" onclick={() => game.reset(nextSeed(game.seed))}>Next Deal</button>
      </form>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>Close</button>
    </form>
  </dialog>

  <Toast bind:this={toast} />
</div>
