import React from 'react';
import { useMessageContext } from 'stream-chat-react';

export const CustomQuotedMessage: React.FC = () => {
    const { message } = useMessageContext();
    const quotedMessage = message.quoted_message;

    if (!quotedMessage) return null;

    // Check if the quoted message has text or is just an attachment
    const hasText = quotedMessage.text && quotedMessage.text.trim().length > 0;
    const hasAttachment = quotedMessage.attachments && quotedMessage.attachments.length > 0;

    // Determine the preview text to show
    let previewText = quotedMessage.text;
    if (!hasText && hasAttachment) {
        const attachment = quotedMessage.attachments![0];
        if (attachment.type === 'image') previewText = '📷 Photo';
        else if (attachment.type === 'video') previewText = '🎥 Video';
        else if (attachment.type === 'voiceRecording' || attachment.type === 'audio') previewText = '🎤 Voice Note';
        else previewText = '📎 Attachment';
    }

    return (
        <div 
            className="flex flex-col bg-black/5 rounded-lg border  p-2 mb-1 cursor-pointer overflow-hidden max-w-full hover:bg-black/10 transition-colors"
            onClick={() => {
                // Find the original message element and scroll to it
                const element = document.getElementById(`msg-${quotedMessage.id}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Optional: add a brief highlight effect
                    element.classList.add('bg-black/5', 'transition-colors', 'duration-1000');
                    setTimeout(() => {
                        element.classList.remove('bg-black/5');
                    }, 2000);
                }
            }}
        >
            <div className="flex justify-between items-center mb-0.5">
                <span className="text-[11px] font-semibold  ">
                    {quotedMessage.user?.name || quotedMessage.user?.id || 'User'}
                </span>
            </div>
            <p className="text-[12px] text-gray-600 truncate whitespace-nowrap overflow-hidden">
                {previewText}
            </p>
        </div>
    );
};
