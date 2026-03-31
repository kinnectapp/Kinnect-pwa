import type { AppNotification } from "@/lib/types/notification";
import { handleApiError } from "@/api/serviceUtils";
import {
  notificationKeys,
  notificationService,
  useNotifications,
} from "@/services/notification.service";
import { Logo } from "@/components/layout/logo";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import React, { useEffect } from "react";
import { toast } from "sonner";

const formatNotificationDate = (value?: string) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const NotificationCard: React.FC<{
  item: AppNotification;
  onAccept: (dateId: number) => void;
  onReject: (dateId: number) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}> = ({ item, onAccept, onReject, isAccepting, isRejecting }) => {
  const canAct =
    item.type === "request" && item.status === "pending" && !!item.dateId;

  return (
    <article className="rounded-[12px] border border-[#E9DDF3] bg-[#FAF8FB] p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F0E6F8]">
          <Logo />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold text-[#1C1C1C]">
                {item.topic || "Notification"}
              </h2>
              <p className="mt-1 text-[13px] leading-[1.45] text-[#5B5563]">
                {item.message || "You have a new notification."}
              </p>
            </div>
            {!item.read && (
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#D400B3]" />
            )}
          </div>
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B8FA8]">
            {formatNotificationDate(item.createdAt)}
          </p>

          {item.type === "request" && !canAct && item.status && (
            <p className="mt-3 text-[12px] font-semibold capitalize text-[#55288D]">
              Status: {item.status}
            </p>
          )}

          {canAct && item.dateId && (
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                disabled={isAccepting || isRejecting}
                onClick={() => onAccept(item.dateId!)}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[#D400B3] text-[14px] font-semibold text-white disabled:opacity-60"
              >
                <Check size={16} />
                {isAccepting ? "Accepting..." : "Accept"}
              </button>
              <button
                type="button"
                disabled={isAccepting || isRejecting}
                onClick={() => onReject(item.dateId!)}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-[#F3CDD7] bg-[#FFF5F7] text-[14px] font-semibold text-[#C71F48] disabled:opacity-60"
              >
                <X size={16} />
                {isRejecting ? "Rejecting..." : "Reject"}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useNotifications();

  const refreshNotifications = React.useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["user-profile"] }),
      queryClient.invalidateQueries({ queryKey: ["user-matches"] }),
    ]);
  }, [queryClient]);

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllRead,
  });

  const acceptMutation = useMutation({
    mutationFn: notificationService.acceptDateRequest,
    onSuccess: async (response: { message?: string } | undefined) => {
      toast.success(response?.message || "Date request accepted.");
      await refreshNotifications();
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: notificationService.rejectDateRequest,
    onSuccess: async (response: { message?: string } | undefined) => {
      toast.success(response?.message || "Date request rejected.");
      await refreshNotifications();
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });

  useEffect(() => {
    markAllReadMutation.mutate(undefined, {
      onSuccess: async () => {
        await refreshNotifications();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-145px)] bg-white px-4 pb-24">
      <div className="mx-auto max-w-2xl pt-2">
        <div className="mb-5">
          <h1 className="text-[22px] font-semibold text-[#1C1C1C]">
            Notifications
          </h1>
          <p className="mt-1 text-[14px] text-[#756E80]">
            Stay up to date with date requests, match updates, and app activity.
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[35vh] items-center justify-center">
            <span className="loader" />
          </div>
        ) : notifications.length ? (
          <div className="space-y-3">
            {notifications.map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
                onAccept={(dateId) => acceptMutation.mutate(dateId)}
                onReject={(dateId) => rejectMutation.mutate(dateId)}
                isAccepting={acceptMutation.isPending && acceptMutation.variables === item.dateId}
                isRejecting={rejectMutation.isPending && rejectMutation.variables === item.dateId}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F6EFF5]">
              <Logo />
            </div>
            <h2 className="mt-4 text-[20px] font-semibold text-[#1C1C1C]">
              No Notifications Yet
            </h2>
            <p className="mt-2 max-w-sm text-[14px] leading-[1.45] text-[#756E80]">
              When you get notifications, they will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
