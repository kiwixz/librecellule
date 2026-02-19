<script lang="ts">
  import type { DepotCardRef, MovableCardRef, MoveDestination, TableauCardRef } from './types';

  import Card from '$lib/card.svelte';
  import { unreachable } from '$lib/unreachable';
  import Draggable from './draggable.svelte';
  import { Game } from './game.svelte';
  import { BoardZone } from './types';

  const props: { game: Game } = $props();

  let highlightedDepotCell: number | null = $state(null);
  let highlightedTableauColumn: number | null = $state(null);

  function findDragDestination(x: number, y: number): MoveDestination | null {
    const destinationCandidates = document.elementsFromPoint(x, y);

    const destination = destinationCandidates.find(el => el.classList.contains('drag-destination')) as HTMLElement | undefined;
    if (!destination)
      return null;

    const zone = parseInt(destination.dataset.zone!);
    switch (zone) {
      case BoardZone.Depots:
        return { zone, cellIdx: parseInt(destination.dataset.cellIdx!) };
      case BoardZone.Tableau:
        return { zone, columnIdx: parseInt(destination.dataset.columnIdx!) };
    }

    unreachable();
  }

  function onDragStart(card: MovableCardRef) {
    return () => props.game.canMove(card);
  }

  function onDragMove(card: MovableCardRef) {
    return (ev: PointerEvent) => {
      console.debug('drag move', card, ev);

      let destinationRef = findDragDestination(ev.x, ev.y);
      if (destinationRef?.zone === BoardZone.Depots && (card.zone !== destinationRef.zone || destinationRef.cellIdx !== card.cellIdx)) {
        highlightedDepotCell = destinationRef.cellIdx;
        highlightedTableauColumn = null;
      }
      else if (destinationRef?.zone === BoardZone.Tableau && (card.zone !== destinationRef.zone || destinationRef.columnIdx !== card.columnIdx)) {
        highlightedDepotCell = null;
        highlightedTableauColumn = destinationRef.columnIdx;
      }
      else {
        highlightedDepotCell = null;
        highlightedTableauColumn = null;
      }
    };
  }

  function onDragEnd(card: MovableCardRef) {
    return (ev: PointerEvent, cancelled: boolean) => {
      console.debug('drag end', card, ev, cancelled);

      highlightedDepotCell = null;
      highlightedTableauColumn = null;
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
          {#if card}
            <Draggable
                onstart={onDragStart(ref)}
                onmove={onDragMove(ref)}
                onend={onDragEnd(ref)}>
              <Card {...card} />
            </Draggable>
          {/if}
        </div>
      {/each}
    </div>

    <div class="piles">
      {#each props.game?.board.foundations as card (card)}
        {#if card}
          <Card {...card} />
        {/if}
      {/each}
    </div>
  </div>

  <div class="piles">
    {#each props.game?.board.tableau as column, columnIdx (column)}
      {#snippet recurse(cardIdx = 0)}
        {@const ref: TableauCardRef = { zone: BoardZone.Tableau, columnIdx, cardIdx }}
        <div data-zone={ref.zone} data-column-idx={columnIdx}
            class="drag-destination"
            class:highlighted={highlightedTableauColumn === columnIdx}>
          <Draggable
              onstart={onDragStart(ref)}
              onmove={onDragMove(ref)}
              onend={onDragEnd(ref)}>
            {#snippet handle()}
              <Card {...column[cardIdx]} />
            {/snippet}
            {#if cardIdx < column.length - 1}
              <div class="mt-[round(40%,1px)]">
                {@render recurse(cardIdx + 1)}
              </div>
            {/if}
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
