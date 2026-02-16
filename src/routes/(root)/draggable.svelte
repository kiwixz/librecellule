<script lang="ts">
  import type { Snippet } from 'svelte';
  import { on } from 'svelte/events';

  const props: {
    children: Snippet;
    onmove: (ev: PointerEvent) => void;
    onend: (ev: PointerEvent) => void;
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

    dragging = true;
    self.setPointerCapture(ev.pointerId);

    const startX = ev.x;
    const startY = ev.y;

    const controller = new AbortController();
    const { signal } = controller;
    const cancel = () => {
      controller.abort();

      self.style.translate = '';
      dragging = false;
    };

    on(self, 'pointermove', (ev) => {
      self.style.translate = `${ev.clientX - startX}px ${ev.clientY - startY}px`;
      props.onmove?.(ev);
    }, { signal });

    on(self, 'pointerup', () => {
      props.onend?.(ev);
      cancel();
    }, { signal });

    on(self, 'pointercancel', cancel, { signal });

    ev.stopPropagation();
  }
</script>

<div bind:this={self} class="touch-none"
    style:will-change="{dragging ? 'translate' : null}"
    {oncontextmenu} {onpointerdown}>
  {@render props.children()}
</div>
