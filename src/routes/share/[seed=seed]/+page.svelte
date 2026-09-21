<script lang="ts">
  import type { PageProps } from './$types';

  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  import game from '$lib/game/store.svelte';

  const { data }: PageProps = $props();

  onMount(async () => {
    await game.load();
    await game.reset(data.seed);
    await goto(resolve('/'), { replaceState: true });
  });
</script>
