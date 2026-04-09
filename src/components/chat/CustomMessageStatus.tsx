import React from "react";
import { useMessageContext, useChannelStateContext } from "stream-chat-react";

const DoubleCheck: React.FC<{ color: string }> = ({ color }) => (
  <svg
    width="16"
    height="11"
    viewBox="0 0 16 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 5.5L4.5 9L11 2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 5.5L8.5 9L15 2"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SingleCheck: React.FC<{ color: string }> = ({ color }) => (
  <svg
    width="12"
    height="9"
    viewBox="0 0 12 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1 4.5L4.5 8L11 1"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CustomMessageStatus: React.FC = () => {
  const { message, isMyMessage } = useMessageContext();
  const { read } = useChannelStateContext();

  if (!isMyMessage || !isMyMessage()) return null;

  // Sending state
  if (message.status === "sending") {
    return (
      <span className="inline-flex items-center ml-1">
        <SingleCheck color="#9e9e9e" />
      </span>
    );
  }

  // Failed
  if (message.status === "failed") {
    return (
      <span className="inline-flex items-center ml-1 text-red-500 text-[10px]">
        !
      </span>
    );
  }

  // Read status: check if any OTHER user's last_read timestamp is >= this message's creation time
  let isRead = false;
  if (read && message.created_at) {
    const messageTime = new Date(message.created_at).getTime();
    
    // Iterate over channel read states
    Object.values(read).forEach((readState: any) => {
      // Ignore our own read state
      if (readState.user?.id !== message.user?.id) {
        if (new Date(readState.last_read).getTime() >= messageTime) {
          isRead = true;
        }
      }
    });
  }

  if (isRead) {
    return (
      <span className="inline-flex items-center ml-1">
        <DoubleCheck color="#D400B3" />
      </span>
    );
  }

  // Delivered (sent successfully but not yet read)
  return (
    <span className="inline-flex items-center ml-1">
      <DoubleCheck color="#b1b1b1ff" />
    </span>
  );
};

export default CustomMessageStatus;
