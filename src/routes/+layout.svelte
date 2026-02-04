<script lang="ts">
  import './layout.css'
  import manifest from '$lib/manifest.json?min'

  let { children } = $props()
</script>

<svelte:head>
  <link rel="manifest" href={manifest} />
</svelte:head>

{@render children()}
