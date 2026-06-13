<script lang="ts">
  import type { DepotCardRef, FoundationCardRef, MovableCardRef, MoveDestination, TableauCardRef } from './types';

  import { calcCenter } from '$lib/geometry';
  import unreachable from '$lib/unreachable';
  import Card from './card.svelte';
  import CardSpace from './card_space.svelte';
  import Draggable from './draggable.svelte';
  import Game from './game.svelte';
  import { BoardZone } from './types';

  const props: { game: Game } = $props();

  let dragging = false;
  let highlightedDestination: MoveDestination | null = $state(null);

  function parseDragDestination(destination: HTMLElement): MoveDestination {
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

  function findDragDestination(ref: MovableCardRef, ev: PointerEvent): MoveDestination | undefined {
    const element = ev.currentTarget as Element;
    const bounds = element.getBoundingClientRect();
    const center = calcCenter(bounds);

    let destination;
    let distanceSqr = Infinity;
    for (let corner = 0; corner < 4; ++corner) {
      const elements = document.elementsFromPoint(
        corner % 2 === 0 ? bounds.left : bounds.right,
        corner < 2 ? bounds.top : bounds.bottom);

      const destElement = elements.find(el => el.classList.contains('drag-destination')) as HTMLElement | undefined;
      if (!destElement)
        continue;

      const newDestination = parseDragDestination(destElement);
      if (!props.game.canMoveTo(ref, newDestination))
        continue;

      const destBounds = destElement.getBoundingClientRect();
      const destCenter = calcCenter(destBounds);
      const newDistanceSqr = (destCenter.x - center.x) ** 2 + (destCenter.y - center.y) ** 2;
      if (newDistanceSqr < distanceSqr) {
        destination = newDestination;
        distanceSqr = newDistanceSqr;
      }
    }

    return destination;
  }

  function findCardElement(ref: MoveDestination): Element | null {
    const selector = `.drag-destination[data-zone="${ref.zone}"]` + (() => {
      switch (ref.zone) {
        case BoardZone.Depots:
        case BoardZone.Foundations:
          return `[data-cell-idx="${ref.cellIdx}"]`;
        case BoardZone.Tableau:
          return `[data-column-idx="${ref.columnIdx}"]`;
      }
    })();

    return document.querySelector(selector);
  }

  function moveAnimation(element: Element, destination: Element, finish: (ev: AnimationPlaybackEvent) => void): void {
    const bounds = element.getBoundingClientRect();
    const destBounds = destination.getBoundingClientRect();
    const deltaX = destBounds.left - bounds.left;
    const deltaY = destBounds.top - bounds.top;

    element.animate([
      { zIndex: 1 },
      { zIndex: 1, translate: `${deltaX}px ${deltaY}px` },
    ], {
      duration: 300,
      easing: 'ease-in-out',
    }).onfinish = finish;
  }

  function autoWin(): void {
    const ref = props.game.lowestMovableCard();
    if (!ref)
      return;

    const destination = props.game.canAutoMove(ref);
    if (!destination)
      return;

    const element = findCardElement(ref)!;
    const destElement = findCardElement(destination)!;

    moveAnimation(element, destElement, async () => {
      if (!props.game.canMove(ref) || !props.game.canMoveTo(ref, destination))
        return;

      await props.game.move(ref, destination);
      autoWin();
    });
  }

  function onDoubleClick(ref: MovableCardRef): (ev: MouseEvent) => void {
    return (ev: MouseEvent) => {
      ev.stopPropagation();

      const element = ev.currentTarget as Element;

      const destination = props.game.canAutoMove(ref);
      if (!destination)
        return;

      const destElement = findCardElement(destination)!;

      moveAnimation(element, destElement, async () => {
        if (!props.game.canMove(ref) || !props.game.canMoveTo(ref, destination))
          return;

        await props.game.move(ref, destination);
        if (props.game.canAutoWin())
          autoWin();
      });
    };
  }

  function onDragStart(ref: MovableCardRef): () => boolean {
    return () => {
      if (dragging || !props.game.canMove(ref))
        return false;

      dragging = true;
      return true;
    };
  }

  function onDragMove(ref: MovableCardRef): (ev: PointerEvent) => void {
    return (ev: PointerEvent) => {
      let destination = findDragDestination(ref, ev);
      highlightedDestination = destination
        && (destination.zone !== BoardZone.Depots || ref.zone !== destination.zone || destination.cellIdx !== ref.cellIdx)
        && (destination.zone !== BoardZone.Tableau || ref.zone !== destination.zone || destination.columnIdx !== ref.columnIdx)
        ? destination
        : null;
    };
  }

  function onDragEnd(ref: MovableCardRef): (ev: PointerEvent, cancelled: boolean) => void {
    return (ev: PointerEvent, cancelled: boolean) => {
      highlightedDestination = null;
      dragging = false;

      if (cancelled)
        return;

      let destination = findDragDestination(ref, ev);
      if (!destination)
        return;

      props.game.move(ref, destination);
    };
  }
</script>

<div class="select-none">
  <div class="flex">
    <div class="piles">
      {#each props.game.board.depots as card, cellIdx (cellIdx)}
        {@const ref: DepotCardRef = { zone: BoardZone.Depots, cellIdx }}
        <CardSpace>
          <div data-zone={ref.zone} data-cell-idx={cellIdx}
            class="relative drag-destination"
            class:highlighted={highlightedDestination?.zone === ref.zone && highlightedDestination.cellIdx === cellIdx}
            ondblclick={onDoubleClick(ref)}>
            {#if card}
              <Draggable
                  onstart={onDragStart(ref)}
                  onmove={onDragMove(ref)}
                  onend={onDragEnd(ref)}>
                <Card data={card} />
              </Draggable>
            {/if}
          </div>
        </CardSpace>
      {/each}
    </div>

    <div class="piles">
      {#each props.game.board.foundations as card, cellIdx (cellIdx)}
      {@const ref: FoundationCardRef = { zone: BoardZone.Foundations, cellIdx }}
        <CardSpace>
          <div data-zone={ref.zone} data-cell-idx={cellIdx}
            class="drag-destination"
            class:highlighted={highlightedDestination?.zone === ref.zone && highlightedDestination.cellIdx === cellIdx}>
            {#if card}
              <Card data={card} />
            {/if}
          </div>
        </CardSpace>
      {/each}
    </div>
  </div>

  <div class="piles">
    {#each props.game.board.tableau as column, columnIdx (columnIdx)}
      <div data-zone={BoardZone.Tableau} data-column-idx={columnIdx}
          class:drag-destination={column.length === 0}
          class:highlighted={column.length === 0 && highlightedDestination?.zone === BoardZone.Tableau && highlightedDestination.columnIdx === columnIdx}>
        <CardSpace>
          {#if column.length > 0}
            {#snippet recurse(cardIdx = 0)}
              {@const ref: TableauCardRef = { zone: BoardZone.Tableau, columnIdx, cardIdx }}
              <div data-zone={ref.zone} data-column-idx={columnIdx}
                  class="relative"
                  class:drag-destination={cardIdx === column.length - 1}
                  class:highlighted={cardIdx === column.length - 1 && highlightedDestination?.zone === ref.zone && highlightedDestination.columnIdx === columnIdx}
                  ondblclick={onDoubleClick(ref)}>
                <Draggable
                    onstart={onDragStart(ref)}
                    onmove={onDragMove(ref)}
                    onend={onDragEnd(ref)}>
                  {#snippet handle()}
                    <Card data={column[cardIdx]} />
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
          {/if}
        </CardSpace>
      </div>
    {/each}
  </div>
</div>

<style>
  .piles {
    display: flex;
    padding: 2%;
    align-items: start;
    gap: 1%;
  }

  .drag-destination {
    @media (prefers-reduced-motion: no-preference) {
      transition: filter 300ms;
    }

    &.highlighted {
      filter: brightness(60%);
    }
  }
</style>
