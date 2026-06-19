import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_VAPID_KEY,
  STREAM_PUSH_PROVIDER_NAME,
} from "@/env";
import type { StreamChat } from "stream-chat";
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  type Messaging,
} from "firebase/messaging";

const STREAM_PUSH_DEVICE_TOKEN_KEY = "kinnect-stream-push-device-token";

let firebaseApp: FirebaseApp | null = null;
let messagingSupportPromise: Promise<boolean> | null = null;

const hasFirebaseConfig = () =>
  Boolean(
    FIREBASE_API_KEY &&
      FIREBASE_PROJECT_ID &&
      FIREBASE_MESSAGING_SENDER_ID &&
      FIREBASE_APP_ID &&
      FIREBASE_VAPID_KEY,
  );

const getFirebaseApp = () => {
  if (!firebaseApp) {
    firebaseApp = initializeApp({
      apiKey: FIREBASE_API_KEY,
      authDomain: FIREBASE_AUTH_DOMAIN,
      projectId: FIREBASE_PROJECT_ID,
      storageBucket: FIREBASE_STORAGE_BUCKET,
      messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
      appId: FIREBASE_APP_ID,
    });
  }

  return firebaseApp;
};

const getMessagingIfSupported = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return null;
  if (!hasFirebaseConfig()) return null;

  messagingSupportPromise ??= isSupported();
  const supported = await messagingSupportPromise;
  return supported ? getMessaging(getFirebaseApp()) : null;
};

export const registerStreamPushDevice = async (
  client: StreamChat,
  userId: string,
) => {
  if (!STREAM_PUSH_PROVIDER_NAME) return;

  const messaging = await getMessagingIfSupported();
  if (!messaging) return;

  const permission =
    Notification.permission === "default"
      ? await Notification.requestPermission()
      : Notification.permission;

  if (permission !== "granted") return;

  const serviceWorkerRegistration = await navigator.serviceWorker.ready;
  const fcmToken = await getToken(messaging, {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });

  if (!fcmToken) return;

  const savedToken = localStorage.getItem(STREAM_PUSH_DEVICE_TOKEN_KEY);
  if (savedToken === fcmToken) return;

  if (savedToken) {
    await client.removeDevice(savedToken, userId).catch(() => undefined);
  }

  await client.addDevice(
    fcmToken,
    "firebase",
    userId,
    STREAM_PUSH_PROVIDER_NAME,
  );
  localStorage.setItem(STREAM_PUSH_DEVICE_TOKEN_KEY, fcmToken);
};

export const unregisterStreamPushDevice = async (
  client: StreamChat,
  userId?: string,
) => {
  const savedToken = localStorage.getItem(STREAM_PUSH_DEVICE_TOKEN_KEY);
  if (!savedToken) return;

  await client.removeDevice(savedToken, userId).catch(() => undefined);
  localStorage.removeItem(STREAM_PUSH_DEVICE_TOKEN_KEY);
};
