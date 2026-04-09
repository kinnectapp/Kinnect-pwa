export type NotificationType = "request" | "notification";
export type NotificationStatus = "accepted" | "rejected" | "pending";

export type AppNotification = {
  id: number;
  username?: string;
  userId?: number;
  otherUsername?: string;
  otherUserId?: number;
  topic?: string;
  message?: string;
  type?: NotificationType;
  dateId?: number;
  read?: boolean;
  status?: NotificationStatus;
  createdAt?: string;
  updatedAt?: string;
};
