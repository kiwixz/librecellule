<script lang="ts">
  import Card from '$lib/card.svelte'
  import Draggable from './draggable.svelte'
  import { Game } from './game.svelte'

  const props: { game: Game } = $props()

  function onFoundationDragMove(card: number) {
    return (ev: PointerEvent) => {
      console.debug('foundation move', card, ev)
    }
  }

  function onFoundationDragEnd(card: number) {
    return (ev: PointerEvent) => {
      console.debug('foundation end', card, ev)
    }
  }

  function onTableauDragMove(pile: number, card: number) {
    return (ev: PointerEvent) => {
      console.debug('tableau move', pile, card, ev)
    }
  }

  function onTableauDragEnd(pile: number, card: number) {
    return (ev: PointerEvent) => {
      console.debug('tableau end', pile, card, ev)
    }
  }
</script>

<div>
  <div class="flex">
    <div class="flex p-[2%] gap-[1%]">
      {#each props.game?.cards.depots as card, cardIdx (card)}
        <Draggable onmove={onFoundationDragMove(cardIdx)} onend={onFoundationDragEnd(cardIdx)}>
          <Card {...card} />
        </Draggable>
      {/each}
    </div>

    <div class="flex p-[2%] gap-[1%]">
      {#each props.game?.cards.foundations as card (card)}
        <Card {...card} />
      {/each}
    </div>
  </div>

  <div class="flex p-[2%] gap-[1%]">
    {#each props.game?.cards.tableau as pile, pileIdx (pile)}
      <div class="grid *:row-1 *:col-1">
        {#each pile as card, cardIdx (card)}
          <div style="margin-top: {cardIdx * 40}%">
            <Draggable onmove={onTableauDragMove(pileIdx, cardIdx)} onend={onTableauDragEnd(pileIdx, cardIdx)}>
              <Card {...card} />
            </Draggable>
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
