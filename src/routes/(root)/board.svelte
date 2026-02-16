<script lang="ts">
  import Card from '$lib/card.svelte';
  import Draggable from './draggable.svelte';
  import { Game } from './game.svelte';
  import type { DepotCardRef, TableauCardRef } from './types';

  const props: { game: Game } = $props();

  function onDragStart(card: DepotCardRef | TableauCardRef) {
    return (ev: PointerEvent) => {
      console.debug('drag start', card, ev);
      return true;
    };
  }

  function onDragMove(card: DepotCardRef | TableauCardRef) {
    return (ev: PointerEvent) => {
      console.debug('drag move', card, ev);
    };
  }

  function onDragEnd(card: DepotCardRef | TableauCardRef) {
    return (ev: PointerEvent) => {
      console.debug('drag end', card, ev);
    };
  }
</script>

<div>
  <div class="flex">
    <div class="piles">
      {#each props.game?.board.depots as card, cellIdx (card)}
        {@const ref: DepotCardRef = { zone: 'depots', cellIdx }}
        <Draggable
            onstart={onDragStart(ref)}
            onmove={onDragMove(ref)}
            onend={onDragEnd(ref)}>
          <Card {...card} />
        </Draggable>
      {/each}
    </div>

    <div class="piles">
      {#each props.game?.board.foundations as card (card)}
        <Card {...card} />
      {/each}
    </div>
  </div>

  <div class="piles">
    {#each props.game?.board.tableau as pile, pileIdx (pile)}
      {#snippet recurse(cardIdx = 0)}
        {@const ref: TableauCardRef = { zone: 'tableau', pileIdx, cardIdx }}
        <Draggable
            onstart={onDragStart(ref)}
            onmove={onDragMove(ref)}
            onend={onDragEnd(ref)}>
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

<style>
.piles {
  display: flex;
  padding: 2%;
  gap: 1%;
}
</style>
