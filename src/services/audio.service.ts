import { http } from "@/api/http";
import { handleApiError } from "@/api/serviceUtils";

/**
 * Service for handling audio uploads
 */
export const audioService = {
  /**
   * Upload audio blob and return the URL
   */
  uploadAudio: async (audioBlob: Blob): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      // Using the upload endpoint - adjust based on your backend
      const { data } = await http.post("/upload/audio", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data?.url || data?.audioUrl) {
        return data.url || data.audioUrl;
      }

      throw new Error("No audio URL returned from server");
    } catch (error) {
      console.error("Audio upload failed:", error);
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Convert audio blob to base64 for local storage/preview
   */
  blobToBase64: (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Get audio duration from blob
   */
  getAudioDuration: (blob: Blob): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio();
      audio.src = audioUrl;
      audio.onloadedmetadata = () => {
        URL.revokeObjectURL(audioUrl);
        resolve(audio.duration);
      };
      audio.onerror = reject;
    });
  },

  /**
   * Format duration in seconds to MM:SS
   */
  formatDuration: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  },
};
