<script lang="ts">
  import Card from '$lib/card.svelte';
  import Draggable from './draggable.svelte';
  import { Game } from './game.svelte';

  const props: { game: Game } = $props();

  function onFoundationDragStart(card: number) {
    return (ev: PointerEvent) => {
      console.debug('foundation start', card, ev);
      return false;
    };
  }

  function onFoundationDragMove(card: number) {
    return (ev: PointerEvent) => {
      console.debug('foundation move', card, ev);
    };
  }

  function onFoundationDragEnd(card: number) {
    return (ev: PointerEvent) => {
      console.debug('foundation end', card, ev);
    };
  }

  function onTableauDragStart(pile: number, card: number) {
    return (ev: PointerEvent) => {
      console.debug('tableau start', pile, card, ev);
      return true;
    };
  }

  function onTableauDragMove(pile: number, card: number) {
    return (ev: PointerEvent) => {
      console.debug('tableau move', pile, card, ev);
    };
  }

  function onTableauDragEnd(pile: number, card: number) {
    return (ev: PointerEvent) => {
      console.debug('tableau end', pile, card, ev);
    };
  }
</script>

<div>
  <div class="flex">
    <div class="flex p-[2%] gap-[1%]">
      {#each props.game?.cards.depots as card, cardIdx (card)}
        <Draggable onstart={onFoundationDragStart(cardIdx)} onmove={onFoundationDragMove(cardIdx)} onend={onFoundationDragEnd(cardIdx)}>
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
      {#snippet recurse(cardIdx = 0)}
        <Draggable onstart={onTableauDragStart(pileIdx, cardIdx)} onmove={onTableauDragMove(pileIdx, cardIdx)} onend={onTableauDragEnd(pileIdx, cardIdx)}>
          <div class="grid *:row-1 *:col-1">
            <Card {...pile[cardIdx]} />
            {#if cardIdx < pile.length - 1}
              <div class="mt-[round(40%,1px)]">
                {@render recurse(cardIdx + 1)}
              </div>
            {/if}
          </div>
        </Draggable>
      {/snippet}

      {@render recurse()}
    {/each}
  </div>
</div>
