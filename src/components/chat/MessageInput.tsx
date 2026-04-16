"use client";

import React, { useState, useRef } from "react";
import { Send, Mic, X } from "lucide-react";
import { audioService } from "@/services/audio.service";
import { toast } from "sonner";

interface MessageInputProps {
  onSendMessage?: (content: string, type: "text" | "audio") => void;
  onSendAudioUrl?: (audioUrl: string, duration: number) => void;
  onTyping?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage = () => {},
  onSendAudioUrl = () => {},
  onTyping,
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());

        if (blob.size === 0) {
          toast.error("No audio recorded");
          return;
        }

        setIsUploading(true);
        try {
          const duration = await audioService.getAudioDuration(blob);
          const audioUrl = await audioService.uploadAudio(blob);
          onSendAudioUrl(audioUrl, duration);
          toast.success("Audio message sent");
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Failed to upload audio",
          );
          console.error("Audio upload error:", error);
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Failed to access microphone");
      console.error("Microphone error:", error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
    }
  };

  const handleCancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecordingTime(0);
      mediaRecorderRef.current = null;
      chunksRef.current = [];
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message, "text");
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {isRecording && (
        <div className="mb-3 flex items-center justify-between bg-red-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-700">
              Recording... {audioService.formatDuration(recordingTime)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleStopRecording}
              className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
            >
              Stop
            </button>
            <button
              onClick={handleCancelRecording}
              className="p-1 hover:bg-red-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mb-3 flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-700">Uploading audio...</span>
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            onTyping?.();
          }}
          placeholder="Type a message..."
          disabled={isRecording || isUploading}
          className="flex-1 rounded-full border px-4 py-2 text-sm disabled:bg-gray-100 resize-none [-webkit-text-size-adjust:100%]"
          rows={1}
          onKeyDown={handleKeyPress}
        />

        <button
          onClick={handleStartRecording}
          disabled={isRecording || isUploading || message.trim().length > 0}
          title={isRecording ? "Recording..." : "Record audio"}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-40 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Mic className="w-5 h-5" />
        </button>

        <button
          onClick={handleSend}
          disabled={!message.trim() || isRecording || isUploading}
          className="px-4 py-2 rounded-full bg-[#55288D] text-white disabled:opacity-40 hover:bg-[#45227d] transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
