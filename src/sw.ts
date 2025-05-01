/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  console.log('[Service worker] pushing...');

  async function showNotification() {
    if (!event.data) {
      console.error('[Service Worker] Push event has no data.');
      return;
    }

    const data = await event.data.json();

    await self.registration.showNotification(data.title, {
      body: data.options.body,
    });
  }

  event.waitUntil(showNotification());
});
