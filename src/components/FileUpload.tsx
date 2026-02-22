import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, X, File, Image, Music, Video, Download, Eye, FileText } from "lucide-react";
import { useFileUpload, getFileType } from "@/hooks/useFileUpload";
import { useAuth } from "@/contexts/AuthContext";

interface FileUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  onFileSelect?: (file: File) => void; // Validation for file select
}

// Extended file types for documents
const ACCEPTED_FILE_TYPES = [
  "image/*",
  "audio/*",
  "video/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
].join(",");

export const FileUpload = ({
  value,
  onChange,
  accept = ACCEPTED_FILE_TYPES,
  onFileSelect,
}: FileUploadProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile, deleteFile, isUploading, progress } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localFile, setLocalFile] = useState<File | null>(null);

  // Sync relative to external changes (like form reset)
  useEffect(() => {
    if (!value && localFile) {
      setLocalFile(null);
    }
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (500MB limit)
    const MAX_SIZE = 500 * 1024 * 1024; // 500MB
    if (file.size > MAX_SIZE) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "يجب أن يكون حجم الملف أقل من 500 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    if (onFileSelect) {
      setLocalFile(file);
      onFileSelect(file);
      // Create a local preview URL if it's an image
      if (file.type.startsWith('image/')) {
        const localUrl = URL.createObjectURL(file);
        onChange(localUrl);
      } else {
        // We set a marker for non-images to indicate a file is selected
        // but we'll use localFile.name for the display
        onChange(file.name);
      }
      return;
    }

    if (!user) return; // Original logic requires user for supabase path

    const url = await uploadFile(file, user.id);
    if (url) {
      onChange(url);
    }
  };

  const handleRemove = async () => {
    if (value && !localFile) {
      await deleteFile(value);
    }
    setLocalFile(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isDocument = (url: string | null | undefined) => {
    if (!url) return false;
    const ext = url.split(".").pop()?.toLowerCase();
    return ["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt"].includes(ext || "");
  };

  const getDocumentType = (url: string): string => {
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "PDF";
    if (["doc", "docx"].includes(ext || "")) return "Word";
    if (["ppt", "pptx"].includes(ext || "")) return "PowerPoint";
    if (["xls", "xlsx"].includes(ext || "")) return "Excel";
    if (ext === "txt") return "نص";
    return "مستند";
  };

  const handleDownload = async () => {
    if (!value) return;

    try {
      const response = await fetch(value);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `file.${getFileExtension(value)}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const getFileExtension = (url: string) => {
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? match[1] : 'file';
  };

  const getPreview = () => {
    if (!value) return null;

    const fileType = localFile ? getFileType(localFile.name) : getFileType(value);
    const isFileDocument = localFile ? isDocument(localFile.name) : isDocument(value);
    const displayValue = localFile ? (localFile.type.startsWith('image/') ? URL.createObjectURL(localFile) : null) : value;

    return (
      <>
        <div className="relative rounded-lg border border-border p-4 bg-muted/30">
          <div className="flex items-center gap-3">
            {fileType === "image" && (displayValue || localFile) ? (
              <img
                src={displayValue || (localFile ? URL.createObjectURL(localFile) : "")}
                alt="معاينة"
                className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setPreviewOpen(true)}
              />
            ) : isFileDocument ? (
              <div
                className="w-16 h-16 bg-destructive/10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-destructive/20 transition-colors"
                onClick={() => setPreviewOpen(true)}
              >
                <FileText className="w-8 h-8 text-destructive" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                {fileType === "audio" && <Music className="w-8 h-8 text-primary" />}
                {fileType === "video" && <Video className="w-8 h-8 text-primary" />}
                {fileType === "unknown" && <File className="w-8 h-8 text-primary" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {localFile ? localFile.name : (
                  <>
                    {fileType === "image" && "صورة"}
                    {fileType === "audio" && "ملف صوتي"}
                    {fileType === "video" && "ملف فيديو"}
                    {isFileDocument && `ملف ${getDocumentType(value)}`}
                    {!isFileDocument && fileType === "unknown" && "ملف"}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="w-3 h-3" />
                  معاينة
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={handleDownload}
                >
                  <Download className="w-3 h-3" />
                  تحميل
                </Button>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={handleRemove}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-right">معاينة الملف</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {fileType === "image" && (
                <img src={value} alt="معاينة" className="w-full h-auto rounded-lg" />
              )}
              {isFileDocument && (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">ملف {getDocumentType(value)}</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    اضغط على زر التحميل لتنزيل الملف
                  </p>
                  {value.toLowerCase().includes('.pdf') && (
                    <iframe
                      src={value}
                      className="w-full h-[60vh] rounded-lg border mt-4"
                      title="PDF Preview"
                    />
                  )}
                </div>
              )}
              {fileType === "audio" && (
                <audio controls className="w-full">
                  <source src={value} />
                </audio>
              )}
              {fileType === "video" && (
                <video controls className="w-full rounded-lg">
                  <source src={value} />
                </video>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" />
                تحميل الملف
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  if (isUploading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Upload className="w-4 h-4 animate-pulse text-primary" />
          <span className="text-sm">جاري الرفع...</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    );
  }

  if (value) {
    return getPreview();
  }

  return (
    <div className="space-y-2">
      <div
        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">انقر لرفع ملف</p>
            <p className="text-xs text-muted-foreground">
              صور، PDF، Word، PowerPoint، Excel، ملفات صوتية أو فيديو
            </p>
          </div>
        </div>
      </div>
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
