<script lang="ts">
  import spritesheet from '$lib/paris.svg'

  const props: {
    rank: number
    suit: number
  } = $props()

  const rankStr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'][props.rank]
  const suitStr = ['spade', 'heart', 'diamond', 'club'][props.suit]
</script>

<svg width="100%" viewBox="0 0 57 88">
  <use href="{spritesheet}#{rankStr}_{suitStr}" />
</svg>
