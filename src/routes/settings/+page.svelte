<script lang="ts">
  import type { SettingsData } from '$lib/types';

  import { version } from '$app/environment';
  import { resolve } from '$app/paths';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import settings from '$lib/settings.svelte';

  const bindableSettings = new Proxy(settings, {
    get(settings, key: keyof SettingsData) {
      return settings[key];
    },
    set(settings, key: keyof SettingsData, value) {
      settings.mutate((data) => {
        data[key] = value;
      });
      return true;
    },
  });
</script>

<svelte:head>
  <title>LibreCellule - Settings</title>
</svelte:head>

<div class="mx-auto pt-8 px-4 max-w-lg">
  <h1 class="flex gap-4 items-center text-2xl font-bold">
    <a href={resolve('/')} class="btn btn-circle" aria-label="Go back">
      <ArrowLeft />
    </a>
    Settings
  </h1>

  <main class="pt-8 flex flex-col flex-wrap gap-6">
    <label class="label field">
      Automatically finish to foundations
      <input type="checkbox" class="toggle" bind:checked={bindableSettings.autoWin} />
    </label>
  </main>

  <p class="absolute bottom-2 right-2 text-sm">
    version {version}
  </p>
</div>

<style>
  .field {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
  }
</style>
