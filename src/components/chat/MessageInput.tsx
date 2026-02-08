'use client';

import React, { useState, useRef } from "react";
import { Send, Mic, X } from "lucide-react";

interface MessageInputProps {
  onSendMessage?: (content: string, type: "text" | "audio") => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage = () => {},
}) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        // In a real app, you would upload this blob or convert it
        console.log("Audio recorded:", blob);
        onSendMessage("", "audio");
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
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
              Recording... {recordingTime}s
            </span>
          </div>
          <button
            onClick={handleCancelRecording}
            className="p-1 hover:bg-red-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Start a message"
            disabled={isRecording}
            className="w-full px-4 py-3 bg-gray-100 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:opacity-50"
            rows={1}
            style={{ minHeight: "44px", maxHeight: "100px" }}
          />
        </div>

        {!isRecording && message.trim() === "" && (
          <button
            onClick={handleStartRecording}
            className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors flex-shrink-0"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {isRecording && (
          <button
            onClick={handleStopRecording}
            className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors flex-shrink-0 animate-pulse"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {message.trim() !== "" && (
          <button
            onClick={handleSend}
            className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
