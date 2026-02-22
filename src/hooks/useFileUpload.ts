import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File, userId: string): Promise<string | null> => {
    // Deprecated: Upload is now handled by Laravel API directly in useCreatePoem
    console.warn("useFileUpload hook is deprecated for direct uploads in this migration.");
    return null;
  };

  const deleteFile = async (fileUrl: string): Promise<boolean> => {
    // Deprecated
    return true;
  };

  return {
    uploadFile,
    deleteFile,
    isUploading,
    progress,
  };
};

export const getFileType = (url: string | null | undefined): "image" | "audio" | "video" | "unknown" => {
  if (!url) return "unknown";
  const ext = url.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["mp3", "wav", "mpeg", "ogg"].includes(ext)) return "audio";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";

  return "unknown";
};
