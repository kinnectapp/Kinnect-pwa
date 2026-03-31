import { endpoints } from "@/api/endpoints";
import { http } from "@/api/http";
import type { AppNotification } from "@/lib/types/notification";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

type NotificationListResponse = {
  data?: {
    notifications?: AppNotification[];
  };
};

type NotificationUnreadResponse = {
  data?: {
    notificationCount?: number;
  };
};

export const notificationKeys = {
  all: ["app-notifications"] as const,
  list: (userId?: string | number) => [...notificationKeys.all, "list", userId] as const,
  unread: (userId?: string | number) =>
    [...notificationKeys.all, "unread", userId] as const,
};

export const notificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    const { data } = await http.get<NotificationListResponse>(
      endpoints.notification.list,
    );

    return data.data?.notifications ?? [];
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await http.get<NotificationUnreadResponse>(
      endpoints.notification.unread,
    );

    return data.data?.notificationCount ?? 0;
  },

  markAllRead: async () => {
    const { data } = await http.put(endpoints.notification.readAll, {});
    return data;
  },

  acceptDateRequest: async (dateId: number) => {
    const { data } = await http.put(endpoints.date.accept(dateId), {});
    return data;
  },

  rejectDateRequest: async (dateId: number) => {
    const { data } = await http.put(endpoints.date.reject(dateId), {});
    return data;
  },
};

export const useUnreadNotifications = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: notificationKeys.unread(userId),
    queryFn: notificationService.getUnreadCount,
    enabled: !!userId,
    refetchInterval: 30_000,
  });
};

export const useNotifications = () => {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: notificationService.getNotifications,
    enabled: !!userId,
  });
};
