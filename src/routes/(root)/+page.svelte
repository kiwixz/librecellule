<script lang="ts">
  import { browser } from '$app/environment'
  import Card from '$lib/card.svelte'
  import { Generator } from '$lib/random'

  if (browser)
    var generator = new Generator()
</script>

<div class="h-dvh bg-green-900 text-green-200">
  <main>
    <Card rank=7 suit=1 />
  </main>

  <div class="absolute bottom-0 right-0">
    {generator?.state()}
  </div>
</div>
