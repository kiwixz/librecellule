<script lang="ts">
  import { browser } from '$app/environment';
  import Board from './board.svelte';
  import Game from './game.svelte';

  const game = new Game();
  if (browser)
    game.reset();

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

  <div class="absolute bottom-0 right-0">
    {game?.seed}
  </div>
</div>
