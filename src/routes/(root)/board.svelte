<script lang="ts">
  import type { DepotCardRef, MovableCardRef, TableauCardRef } from './types';

  import Card from '$lib/card.svelte';
  import { unreachable } from '$lib/unreachable';
  import Draggable from './draggable.svelte';
  import { Game } from './game.svelte';
  import { BoardZone } from './types';

  type DragDestination = {
    zone: BoardZone.Depots;
    cellIdx: number;
  } | {
    zone: BoardZone.Tableau;
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

    const zone = parseInt(destination.dataset.zone!);
    switch (zone) {
      case BoardZone.Depots:
        return { zone, cellIdx: parseInt(destination.dataset.cellIdx!) };
      case BoardZone.Tableau:
        return { zone, pileIdx: parseInt(destination.dataset.pileIdx!) };
    }

    unreachable();
  }

  function onDragStart(card: MovableCardRef) {
    return (ev: PointerEvent) => {
      console.debug('drag start', card, ev);
      return true;
    };
  }

  function onDragMove(card: MovableCardRef) {
    return (ev: PointerEvent) => {
      console.debug('drag move', card, ev);

      let destinationRef = findDragDestination(ev.x, ev.y);
      if (destinationRef?.zone === BoardZone.Depots && (card.zone !== destinationRef.zone || destinationRef.cellIdx !== card.cellIdx)) {
        highlightedDepotCell = destinationRef.cellIdx;
        highlightedTableauPile = null;
      }
      else if (destinationRef?.zone === BoardZone.Tableau && (card.zone !== destinationRef.zone || destinationRef.pileIdx !== card.pileIdx)) {
        highlightedDepotCell = null;
        highlightedTableauPile = destinationRef.pileIdx;
      }
      else {
        highlightedDepotCell = null;
        highlightedTableauPile = null;
      }
    };
  }

  function onDragEnd(card: MovableCardRef) {
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
        {@const ref: DepotCardRef = { zone: BoardZone.Depots, cellIdx }}
        <div data-zone={ref.zone} data-cell-idx={cellIdx}
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
        {@const ref: TableauCardRef = { zone: BoardZone.Tableau, pileIdx, cardIdx }}
        <div data-zone={ref.zone} data-pile-idx={pileIdx}
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
