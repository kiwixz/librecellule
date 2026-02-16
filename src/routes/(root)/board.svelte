<script lang="ts">
  import Card from '$lib/card.svelte';
  import { unreachable } from '$lib/unreachable';
  import Draggable from './draggable.svelte';
  import { Game } from './game.svelte';
  import type { DepotCardRef, TableauCardRef } from './types';

  type DragDestination = {
    zone: 'depots';
    cellIdx: number;
  } | {
    zone: 'tableau';
    pileIdx: number;
  } | null;

  const props: { game: Game } = $props();

  let highlightedDepotCell: number | null = $state(null);
  let highlightedTableauPile: number | null = $state(null);

  function findDragDestination(x: number, y: number): DragDestination {
    const destinationCandidates = document.elementsFromPoint(x, y);

    const destination = destinationCandidates.find(el => el.classList.contains('drag-destination')) as HTMLElement | undefined;
    if (!destination)
      return null;

    if (destination.dataset.zone === 'depots') {
      return {
        zone: destination.dataset.zone,
        cellIdx: parseInt(destination.dataset.cellIdx!),
      };
    }
    else if (destination.dataset.zone === 'tableau') {
      return {
        zone: destination.dataset.zone,
        pileIdx: parseInt(destination.dataset.pileIdx!),
      };
    }

    unreachable();
  }

  function onDragStart(card: DepotCardRef | TableauCardRef) {
    return (ev: PointerEvent) => {
      console.debug('drag start', card, ev);
      return true;
    };
  }

  function onDragMove(card: DepotCardRef | TableauCardRef) {
    return (ev: PointerEvent) => {
      console.debug('drag move', card, ev);

      let destinationRef = findDragDestination(ev.x, ev.y);
      if (destinationRef?.zone === 'depots' && (card.zone !== 'depots' || destinationRef.cellIdx !== card.cellIdx)) {
        highlightedDepotCell = destinationRef.cellIdx;
        highlightedTableauPile = null;
      }
      else if (destinationRef?.zone === 'tableau' && (card.zone !== 'tableau' || destinationRef.pileIdx !== card.pileIdx)) {
        highlightedDepotCell = null;
        highlightedTableauPile = destinationRef.pileIdx;
      }
      else {
        highlightedDepotCell = null;
        highlightedTableauPile = null;
      }
    };
  }

  function onDragEnd(card: DepotCardRef | TableauCardRef) {
    return (ev: PointerEvent) => {
      console.debug('drag end', card, ev);

      highlightedDepotCell = null;
      highlightedTableauPile = null;
    };
  }
</script>

<div>
  <div class="flex">
    <div class="piles">
      {#each props.game?.board.depots as card, cellIdx (card)}
        {@const ref: DepotCardRef = { zone: 'depots', cellIdx }}
        <div data-zone="depots" data-cell-idx={cellIdx}
            class="drag-destination"
            class:highlighted={highlightedDepotCell === cellIdx}>
          <Draggable
              onstart={onDragStart(ref)}
              onmove={onDragMove(ref)}
              onend={onDragEnd(ref)}>
            <Card {...card} />
          </Draggable>
        </div>
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
        <div data-zone="tableau" data-pile-idx={pileIdx}
            class="drag-destination"
            class:highlighted={highlightedTableauPile === pileIdx}>
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
        </div>
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

.drag-destination {
  @media (prefers-reduced-motion: no-preference) {
    transition: filter 200ms;
  }

  &.highlighted {
    &, .drag-destination {
      &:not(:has(.drag-destination)) {
        filter: brightness(60%);
      }
    }
  }
}
</style>
