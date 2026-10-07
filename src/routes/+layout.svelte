<script module lang="ts">
  import { browser } from '$app/environment';

  const policy = browser
    ? window.trustedTypes?.createPolicy('librecellule', { createHTML: html => html })
    : null;

  function trustedHtml(html: string): TrustedHTML | string {
    return policy?.createHTML(html) ?? html;
  }
</script>

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
{@html trustedHtml(`<script type="application/ld+json">${JSON.stringify(jsonld)}</script >`)}
