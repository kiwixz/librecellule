<script lang="ts">
  import type { Card } from '$lib/game/board';

  import spritesheet from '$lib/assets/paris.svg';

  const emptyMargin = 1;
  const width = 57;
  const height = 88;

  const props: {
    card: Card | null;
  } = $props();

  const rankStr = $derived([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'][props.card?.rank ?? -1]);
  const suitStr = $derived(['spade', 'heart', 'diamond', 'club'][props.card?.suit ?? -1]);
</script>

<svg width="100%" viewBox="0 0 {width} {height}">
  {#if props.card}
    <use href="{spritesheet}#{rankStr}_{suitStr}" />
  {:else}
    <rect x={emptyMargin} y={emptyMargin} width={width - emptyMargin * 2} height={height - emptyMargin * 2}
        rx="4" fill="#0004" />
  {/if}
</svg>
