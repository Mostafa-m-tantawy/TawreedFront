import { create } from "zustand";

interface RecorderState {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let combinedStream: MediaStream | null = null;

export const useRecorderStore = create<RecorderState>((set) => ({
  isRecording: false,

  startRecording: async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    combinedStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ]);

    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
    });

    recordedChunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.webm";
      a.click();
      URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
    set({ isRecording: true });
  },

  stopRecording: () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      combinedStream?.getTracks().forEach((t) => t.stop());
      set({ isRecording: false });
    }
  },
}));
