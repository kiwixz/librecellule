<script lang="ts">
  import { fade } from 'svelte/transition';

  let message: string | null = $state(null);
  let timer: ReturnType<typeof setTimeout>;

  export function show(newMessage: string): void {
    message = newMessage;
    clearTimeout(timer);
    timer = setTimeout(() => message = null, 2000);
  }
</script>

<div class="toast toast-top toast-end pointer-events-none" role="status">
  {#if message}
    <div class="alert animate-none" transition:fade={{ duration: 150 }}>
      {message}
    </div>
  {/if}
</div>
