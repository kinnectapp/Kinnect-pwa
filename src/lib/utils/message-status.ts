// Message status indicators
export type MessageStatus = "pending" | "sent" | "delivered" | "read";

export interface MessageStatusMap {
  [messageId: string]: MessageStatus;
}

export const getStatusIcon = (status: MessageStatus): string => {
  switch (status) {
    case "pending":
      return "⏱️";
    case "sent":
      return "✓";
    case "delivered":
      return "✓✓";
    case "read":
      return "✓✓"; // Same visual, but we'll style differently
    default:
      return "";
  }
};

export const getStatusLabel = (status: MessageStatus): string => {
  switch (status) {
    case "pending":
      return "Sending...";
    case "sent":
      return "Sent";
    case "delivered":
      return "Delivered";
    case "read":
      return "Read";
    default:
      return "";
  }
};

export const getStatusColor = (status: MessageStatus): string => {
  switch (status) {
    case "pending":
      return "text-gray-400";
    case "sent":
      return "text-gray-500";
    case "delivered":
      return "text-gray-600";
    case "read":
      return "text-blue-500";
    default:
      return "text-gray-400";
  }
};
