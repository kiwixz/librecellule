<script lang="ts">
  import Card from '$lib/card.svelte'
  import { Generator } from '$lib/random'

  let generator = new Generator()
</script>

<div class="h-dvh bg-green-900">
  <main>
    <Card rank=7 suit=1 />

    <div class="absolute bottom-0 right-0">{generator.state()}</div>
  </main>
</div>
