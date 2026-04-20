import React from "react";
import {
  Attachment,
  useChannelActionContext,
  useMessageContext,
} from "stream-chat-react";

const getQuotedPreviewText = (quotedMessage: any) => {
  if (quotedMessage?.deleted_at || quotedMessage?.type === "deleted") {
    return "This message was deleted";
  }

  if (quotedMessage?.text?.trim()) {
    return quotedMessage.text;
  }

  const attachment = quotedMessage?.attachments?.[0];
  if (!attachment) return "";

  if (attachment.type === "image") return "Photo";
  if (attachment.type === "video") return "Video";
  if (attachment.type === "voiceRecording" || attachment.type === "audio") {
    return "Voice note";
  }

  return "Attachment";
};

export const CustomQuotedMessage: React.FC = () => {
  const { jumpToMessage } = useChannelActionContext("CustomQuotedMessage");
  const { handleAction, isMyMessage, message } = useMessageContext("CustomQuotedMessage");
  const quotedMessage = message.quoted_message;

  if (!quotedMessage) return null;

  const isMine = isMyMessage?.() ?? false;
  const previewText = getQuotedPreviewText(quotedMessage);
  const senderName = quotedMessage.user?.name || quotedMessage.user?.id || "User";

  return (
    <>
      <button
        type="button"
        className={`mb-2 flex w-full items-start overflow-hidden rounded-[12px] border-l-4 px-3 py-2 text-left transition-colors ${
          isMine
            ? "border-white/80 bg-white/10 text-white hover:bg-white/15"
            : "border-[#D2D6E2] bg-[#F5F5F7] text-[#6F7184] hover:bg-[#EEF0F4]"
        }`}
        onClick={() => jumpToMessage(quotedMessage.id)}
      >
        <div className="min-w-0 flex-1">
          <p
            className={`text-[12px] font-semibold leading-5 ${
              isMine ? "text-white" : "text-[#8A8EA2]"
            }`}
          >
            {senderName}
          </p>
          <p
            className={`mt-1 text-[13px] leading-6 ${
              isMine ? "text-white/85" : "text-[#6F7184]"
            }`}
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              overflow: "hidden",
            }}
          >
            {previewText}
          </p>
        </div>
      </button>

      {message.attachments?.length ? (
        <Attachment actionHandler={handleAction} attachments={message.attachments} />
      ) : null}
    </>
  );
};
