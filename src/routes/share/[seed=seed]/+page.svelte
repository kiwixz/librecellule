<script lang="ts">
  import type { PageProps } from './$types';

  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import game from '$lib/game/store.svelte';

  const { params }: PageProps = $props();

  onMount(async () => {
    await game.reset(params.seed).catch(console.error);
    await goto(resolve('/'), { replaceState: true });
  });
</script>
