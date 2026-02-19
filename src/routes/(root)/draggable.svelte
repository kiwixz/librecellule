<script lang="ts">
  import type { Snippet } from 'svelte';
  import { on } from 'svelte/events';

  const props: {
    children: Snippet;
    handle?: Snippet;
    onstart?: (event: PointerEvent) => boolean;
    onmove?: (event: PointerEvent) => void;
    onend?: (event: PointerEvent, cancelled: boolean) => void;
  } = $props();

  let self: HTMLElement;
  let dragging = $state(false);

  function oncontextmenu(ev: Event) {
    if (dragging)
      ev.preventDefault();
  }

  function onpointerdown(ev: PointerEvent) {
    if (ev.button !== 0)
      return;

    if (props.onstart?.(ev) === false)
      return;

    dragging = true;
    self.setPointerCapture(ev.pointerId);
    const startX = ev.x;
    const startY = ev.y;

    const controller = new AbortController();
    const listenerOptions = { signal: controller.signal };

    const onend = (cancelled: boolean) => {
      return (ev: PointerEvent) => {
        controller.abort();

        self.style.translate = '';
        dragging = false;

        props.onend?.(ev, cancelled);
      };
    };

    on(self, 'pointermove', (ev) => {
      self.style.translate = `${ev.x - startX}px ${ev.y - startY}px`;
      props.onmove?.(ev);
    }, listenerOptions);

    on(self, 'pointerup', onend(false), listenerOptions);
    on(self, 'pointercancel', onend(true), listenerOptions);
  }
</script>

<div bind:this={self} class="relative"
    class:will-change-[translate]={dragging}
    class:z-1={dragging}>
  {#if props.handle}
    <div class="grid *:row-1 *:col-1">
      {@render props.children()}
      <div class="touch-none" {oncontextmenu} {onpointerdown}>
        {@render props.handle()}
      </div>
    </div>
  {:else}
    <div class="touch-none" {oncontextmenu} {onpointerdown}>
      {@render props.children()}
    </div>
  {/if}
</div>
