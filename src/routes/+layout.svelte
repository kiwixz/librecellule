<script lang="ts">
  import './layout.css';

  const { children } = $props();

  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': 'LibreCellule',
    'applicationCategory': 'GameApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': 0,
    },
  };
</script>

{@render children()}

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html `<script type="application/ld+json">${JSON.stringify(jsonld)}</script >` }
