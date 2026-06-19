/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { initializeApp } from "firebase/app";
import { getMessaging, isSupported, onBackgroundMessage } from "firebase/messaging/sw";

declare let self: ServiceWorkerGlobalScope;

const {
  VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID,
} = (import.meta as any).env;

const hasFirebaseConfig = Boolean(
  VITE_FIREBASE_API_KEY &&
    VITE_FIREBASE_PROJECT_ID &&
    VITE_FIREBASE_MESSAGING_SENDER_ID &&
    VITE_FIREBASE_APP_ID,
);

const getChatTargetUrl = (data?: Record<string, string>) => {
  if (data?.targetUrl) return data.targetUrl;
  if (data?.cid) return `/app/chats/${encodeURIComponent(data.cid)}`;

  const channelType = data?.channel_type || data?.channelType;
  const channelId = data?.channel_id || data?.channelId;

  if (channelType && channelId) {
    return `/app/chats/${encodeURIComponent(`${channelType}:${channelId}`)}`;
  }

  return "/app/chats";
};

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

if (hasFirebaseConfig) {
  const firebaseApp = initializeApp({
    apiKey: VITE_FIREBASE_API_KEY,
    authDomain: VITE_FIREBASE_AUTH_DOMAIN,
    projectId: VITE_FIREBASE_PROJECT_ID,
    storageBucket: VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: VITE_FIREBASE_APP_ID,
  });

  isSupported()
    .then((supported) => {
      if (!supported) return;

      const messaging = getMessaging(firebaseApp);
      onBackgroundMessage(messaging, async (payload) => {
        const data = payload.data;
        const title =
          payload.notification?.title ||
          data?.title ||
          data?.sender_name ||
          "New chat message";
        const body =
          payload.notification?.body ||
          data?.body ||
          data?.message ||
          "You have a new message.";

        await self.registration.showNotification(title, {
          body,
          icon: "/pwa-192x192.png",
          badge: "/pwa-192x192.png",
          data: {
            targetUrl: getChatTargetUrl(data),
            type: "chat",
          },
          tag: data?.cid || data?.channel_id || "kinnect-chat",
        });
      });
    })
    .catch((error) => {
      console.warn("Firebase messaging is not available in this worker:", error);
    });
}

self.addEventListener("notificationclick", (event) => {
  const targetUrl =
    typeof event.notification.data?.targetUrl === "string"
      ? event.notification.data.targetUrl
      : "/app/notifications";

  event.notification.close();

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of windowClients) {
        const windowClient = client as WindowClient;

        if ("focus" in windowClient) {
          await windowClient.focus();
        }

        if ("navigate" in windowClient) {
          await windowClient.navigate(targetUrl);
          return;
        }
      }

      await self.clients.openWindow(targetUrl);
    })(),
  );
});
