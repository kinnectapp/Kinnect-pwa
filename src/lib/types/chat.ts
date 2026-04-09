export type MessageType = "text" | "audio";
export type MessageStatus = "sent" | "read";
export type SenderType = "user" | "other";

export interface Message {
  id: string;
  sender: SenderType;
  type: MessageType;
  content?: string;
  duration?: number;
  waveform?: number[];
  timestamp: Date;
  status: MessageStatus;
}

export interface ChatUser {
  id: string;
  name: string;
  age: number;
  avatar: string;
  lastSeen: Date;
  status?: "online" | "offline" | "away";
}
