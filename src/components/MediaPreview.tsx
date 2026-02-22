import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, X, Play, Image, Music, Video } from "lucide-react";
import { getFileType } from "@/hooks/useFileUpload";

interface MediaPreviewProps {
  url: string;
  title?: string;
}

export const MediaPreview = ({ url, title }: MediaPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileType = getFileType(url);

  const getIcon = () => {
    switch (fileType) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "audio":
        return <Music className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const renderContent = () => {
    switch (fileType) {
      case "image":
        return (
          <img
            src={url}
            alt={title || "صورة"}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
        );
      case "audio":
        return (
          <audio controls className="w-full">
            <source src={url} />
            متصفحك لا يدعم تشغيل الصوت
          </audio>
        );
      case "video":
        return (
          <video controls className="max-w-full max-h-[70vh] rounded-lg">
            <source src={url} />
            متصفحك لا يدعم تشغيل الفيديو
          </video>
        );
      default:
        return (
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-4">لا يمكن معاينة هذا الملف</p>
            <Button onClick={() => window.open(url, "_blank")}>
              فتح في نافذة جديدة
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        {getIcon()}
        معاينة
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{title || "معاينة الوسائط"}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {renderContent()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Compact version for cards
export const MediaPreviewButton = ({ url }: { url: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileType = getFileType(url);

  const getIcon = () => {
    switch (fileType) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "audio":
        return <Music className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="h-8 w-8"
        title="معاينة الوسائط"
      >
        {getIcon()}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>معاينة الوسائط</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {fileType === "image" && (
              <img
                src={url}
                alt="صورة"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
            {fileType === "audio" && (
              <audio controls className="w-full">
                <source src={url} />
              </audio>
            )}
            {fileType === "video" && (
              <video controls className="max-w-full max-h-[70vh] rounded-lg">
                <source src={url} />
              </video>
            )}
            {fileType === "unknown" && (
              <Button onClick={() => window.open(url, "_blank")}>
                فتح في نافذة جديدة
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
