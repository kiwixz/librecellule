<script lang="ts">
  import type { DepotCardRef, FoundationCardRef, MovableCardRef, MoveDestination, TableauCardRef } from './types';

  import Card from '$lib/card.svelte';
  import { unreachable } from '$lib/unreachable';
  import Draggable from './draggable.svelte';
  import { Game } from './game.svelte';
  import { BoardZone } from './types';

  const props: { game: Game } = $props();

  let dragging = false;
  let highlightedDestination: MoveDestination | null = $state(null);

  function findDragDestination(x: number, y: number): MoveDestination | null {
    const destinationCandidates = document.elementsFromPoint(x, y);

    const destination = destinationCandidates.find(el => el.classList.contains('drag-destination')) as HTMLElement | undefined;
    if (!destination)
      return null;

    const zone = parseInt(destination.dataset.zone!);
    switch (zone) {
      case BoardZone.Depots:
      case BoardZone.Foundations:
        return { zone, cellIdx: parseInt(destination.dataset.cellIdx!) };
      case BoardZone.Tableau:
        return { zone, columnIdx: parseInt(destination.dataset.columnIdx!) };
    }
    unreachable();
  }

  function onDragStart(ref: MovableCardRef) {
    return () => {
      if (dragging || !props.game.canMove(ref))
        return false;

      dragging = true;
      return true;
    };
  }

  function onDragMove(ref: MovableCardRef) {
    return (ev: PointerEvent) => {
      let destination = findDragDestination(ev.x, ev.y);
      highlightedDestination = destination
        && props.game.canMoveTo(ref, destination)
        && (destination.zone !== BoardZone.Depots || ref.zone !== destination.zone || destination.cellIdx !== ref.cellIdx)
        && (destination.zone !== BoardZone.Tableau || ref.zone !== destination.zone || destination.columnIdx !== ref.columnIdx)
        ? destination
        : null;
    };
  }

  function onDragEnd(ref: MovableCardRef) {
    return (ev: PointerEvent, cancelled: boolean) => {
      console.debug('drag end', ref, ev, cancelled);

      dragging = false;
      highlightedDestination = null;
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
            class:highlighted={highlightedDestination?.zone === ref.zone && highlightedDestination.cellIdx === cellIdx}>
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
      {#each props.game?.board.foundations as card, cellIdx (card)}
      {@const ref: FoundationCardRef = { zone: BoardZone.Foundations, cellIdx }}
        <div data-zone={ref.zone} data-cell-idx={cellIdx}
            class="drag-destination"
            class:highlighted={highlightedDestination?.zone === ref.zone && highlightedDestination.cellIdx === cellIdx}>
          {#if card}
            <Card {...card} />
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <div class="piles">
    {#each props.game?.board.tableau as column, columnIdx (column)}
      {#snippet recurse(cardIdx = 0)}
        {@const ref: TableauCardRef = { zone: BoardZone.Tableau, columnIdx, cardIdx }}
        <div data-zone={ref.zone} data-column-idx={columnIdx}
            class="drag-destination"
            class:highlighted={highlightedDestination?.zone === ref.zone && highlightedDestination.columnIdx === columnIdx}>
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
