<script lang="ts">
  import type { Snippet } from 'svelte';

  import Card from './card.svelte';

  const props: {
    children: Snippet;
  } = $props();
</script>

<div class="grid *:row-1 *:col-1">
  <Card data={null} />

  {@render props.children()}
</div>
