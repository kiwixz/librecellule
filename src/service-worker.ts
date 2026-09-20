/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, prerendered, version } from '$service-worker';

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const fallback = '/404.html';

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const cache = await caches.open(version);
    await cache.addAll([
      ...prerendered,
      ...build,
      ...files,
    ]);

    const response = await fetch(fallback);
    if (!response.ok)
      throw new Error(`${fallback}: ${response.status}`);
    await cache.put(fallback, new Response(await response.blob()));
  })());
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    for (const cache of await caches.keys()) {
      if (cache !== version)
        await caches.delete(cache);
    }
  })());
});

self.addEventListener('fetch', (ev) => {
  if (ev.request.method !== 'GET')
    return;

  const url = new URL(ev.request.url);
  if (url.origin !== self.location.origin)
    return;

  ev.respondWith((async () => {
    const cache = await caches.open(version);

    const response = await cache.match(ev.request);
    if (response)
      return response;

    if (ev.request.mode === 'navigate')
      return (await cache.match(fallback))!;

    return fetch(ev.request);
  })());
});
