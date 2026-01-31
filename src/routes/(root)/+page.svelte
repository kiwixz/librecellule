<script lang="ts">
  import { browser } from '$app/environment'
  import { Generator } from '$lib/random'
  import { ints } from '$lib/range'
  import Board from './board.svelte'

  if (browser)
    var generator = new Generator()

  let cards = {
    depots: ints(4, i => ({ rank: 2 + i, suit: 3 })),
    foundations: ints(4, i => ({ rank: 1, suit: i })),
    tableau: Array(8).fill([{ rank: 7, suit: 1 }, { rank: 6, suit: 0 }]),
  }
</script>

<div class="min-h-dvh bg-green-900 text-green-200">
  <main class="max-w-[120lvmin] mx-auto">
    <Board {cards} />
  </main>

  <div class="absolute bottom-0 right-0">
    {generator?.state()}
  </div>
</div>
