<script lang="ts">
  import spritesheet from '$lib/paris.svg'

  let props = $props()

  let rankStr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'jack', 'queen', 'king'][props.rank]
  let suitStr = ['spade', 'heart', 'diamond', 'club'][props.suit]
</script>

<svg height=200 viewBox="0 0 57 88">
  <use href="{spritesheet}#{rankStr}_{suitStr}" />
</svg>
