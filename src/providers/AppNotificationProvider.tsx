import { notificationKeys, notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/store/auth.store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useRef } from "react";

type Props = {
  children: React.ReactNode;
};

const isChatNotification = (topic?: string, message?: string) => {
  const value = `${topic ?? ""} ${message ?? ""}`.toLowerCase();
  return value.includes("message");
};

const showSystemNotification = async (
  title: string,
  body: string,
  targetUrl: string,
  tag: string,
) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      tag,
      data: {
        targetUrl,
        type: "app-notification",
      },
    });
    return;
  }

  const notification = new Notification(title, { body });
  notification.onclick = () => {
    window.focus();
    window.location.href = targetUrl;
  };
};

export const AppNotificationProvider: React.FC<Props> = ({ children }) => {
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const seededRef = useRef(false);
  const knownIdsRef = useRef<Set<number>>(new Set());

  const notificationsQuery = useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: notificationService.getNotifications,
    enabled: !!userId,
    refetchInterval: 30_000,
  });

  const notifications = useMemo(
    () => notificationsQuery.data ?? [],
    [notificationsQuery.data],
  );

  useEffect(() => {
    if (!notificationsQuery.isSuccess) return;

    if (!userId) {
      seededRef.current = false;
      knownIdsRef.current = new Set();
      return;
    }

    if (!seededRef.current) {
      knownIdsRef.current = new Set(notifications.map((item) => item.id));
      seededRef.current = true;
      return;
    }

    const nextKnownIds = new Set(knownIdsRef.current);
    const freshNotifications = notifications.filter(
      (item) => !knownIdsRef.current.has(item.id),
    );

    notifications.forEach((item) => nextKnownIds.add(item.id));
    knownIdsRef.current = nextKnownIds;

    if (document.visibilityState === "visible") return;

    freshNotifications.forEach((item) => {
      if (isChatNotification(item.topic, item.message)) return;

      void showSystemNotification(
        item.topic || "Kinnect",
        item.message || "You have a new notification.",
        "/app/notifications",
        `app-notification-${item.id}`,
      );
    });
  }, [notifications, notificationsQuery.isSuccess, userId]);

  useEffect(() => {
    if (!userId || typeof window === "undefined") return;

    const onFocus = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.list(userId),
      });
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [queryClient, userId]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  return <>{children}</>;
};
