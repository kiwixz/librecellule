<script lang="ts">
  import { browser } from '$app/environment';
  import Board from './board.svelte';
  import { Game } from './game.svelte';

  if (browser) {
    var game = new Game();
    game.reset();
  }
</script>

<div class="relative min-h-dvh">
  <main class="max-w-[120lvmin] mx-auto">
    <Board {game} />
  </main>

  <div class="absolute bottom-0 right-0">
    {game?.seed}
  </div>
</div>
