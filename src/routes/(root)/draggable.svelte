<script lang="ts">
  import type { Snippet } from 'svelte';
  import { on } from 'svelte/events';

  const props: {
    children: Snippet;
    handle?: Snippet;
    onStart?: (event: PointerEvent) => boolean;
    onMove?: (event: PointerEvent) => void;
    onEnd?: (event: PointerEvent, cancelled: boolean) => void;
  } = $props();

  let self: HTMLElement;
  let dragging = $state(false);
  let pointer: number;

  function onpointerdown(ev: PointerEvent): void {
    if (ev.button !== 0 || dragging)
      return;

    if (props.onStart?.(ev) === false)
      return;

    dragging = true;
    pointer = ev.pointerId;
    self.setPointerCapture(pointer);
    const startX = ev.x;
    const startY = ev.y;

    const controller = new AbortController();
    const listenerOptions = { signal: controller.signal };

    const onEnd = (cancelled: boolean) => {
      return (ev: PointerEvent) => {
        if (ev.pointerId !== pointer)
          return;

        controller.abort();

        props.onEnd?.(ev, cancelled);

        self.style.translate = '';
        dragging = false;
      };
    };

    on(self, 'pointermove', (ev) => {
      if (ev.pointerId !== pointer)
        return;

      self.style.translate = `${ev.x - startX}px ${ev.y - startY}px`;
      props.onMove?.(ev);
    }, listenerOptions);

    on(self, 'pointerup', onEnd(false), listenerOptions);
    on(self, 'pointercancel', onEnd(true), listenerOptions);
  }
</script>

<div bind:this={self} class="relative"
    class:will-change-[translate]={dragging}
    class:z-2={dragging}>
  {#if props.handle}
    <div class="grid *:row-1 *:col-1">
      {@render props.children()}
      <div class="touch-none" {onpointerdown}>
        {@render props.handle()}
      </div>
    </div>
  {:else}
    <div class="touch-none" {onpointerdown}>
      {@render props.children()}
    </div>
  {/if}
</div>
