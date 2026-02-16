/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { build, files, prerendered, version } from '$service-worker';

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const cache = await caches.open(version);
    await cache.addAll([
      ...prerendered,
      ...build,
      ...files,
    ]);
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

  ev.respondWith((async () => {
    const url = new URL(ev.request.url);
    const cache = await caches.open(version);

    let response = await cache.match(ev.request);

    if (!response) {
      response = await fetch(ev.request);
      if (response.ok)
        cache.put(ev.request, response.clone());
    }
    else if (!build.includes(url.pathname)) {
      fetch(ev.request).then((response) => {
        if (response.ok)
          cache.put(ev.request, response);
      });
    }

    return response;
  })());
});
