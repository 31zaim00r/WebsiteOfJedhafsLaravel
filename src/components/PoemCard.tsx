import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, Edit, Trash2, Download, Eye, FileImage, FileAudio, FileVideo, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Poem, useIncrementDownloads } from "@/hooks/usePoems";
import { useAuth } from "@/contexts/AuthContext";

interface PoemCardProps {
  poem: Poem;
  index?: number;
  onEdit?: (poem: Poem) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const getMediaType = (url: string): "image" | "audio" | "video" | "pdf" | "unknown" => {
  const lower = url.toLowerCase();
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)/)) return "image";
  if (lower.match(/\.(mp3|wav|ogg|m4a)/)) return "audio";
  if (lower.match(/\.(mp4|webm|mov|avi)/)) return "video";
  if (lower.includes(".pdf")) return "pdf";
  return "unknown";
};

const MediaIcon = ({ type }: { type: "image" | "audio" | "video" | "pdf" | "unknown" }) => {
  switch (type) {
    case "image": return <FileImage className="w-5 h-5" />;
    case "audio": return <FileAudio className="w-5 h-5" />;
    case "video": return <FileVideo className="w-5 h-5" />;
    case "pdf": return <FileText className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
};

export const PoemCard = ({ poem, index = 0, onEdit, onDelete, showActions = false }: PoemCardProps) => {
  const { user, isAdmin } = useAuth();
  const incrementDownloads = useIncrementDownloads();
  const canModify = showActions && (isAdmin || user?.id.toString() === poem.created_by.toString());
  const mediaType = poem.media_url ? getMediaType(poem.media_url) : null;

  const handleDownload = () => {
    if (!poem.media_url) return;
    incrementDownloads.mutate(poem.id);
    const link = document.createElement('a');
    link.href = poem.media_url;
    link.download = poem.title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/20 rounded-tr-xl group-hover:border-primary/40 transition-colors" />

      <div className="p-5">
        {/* Header: Title and Badges */}
        <div className="flex items-start justify-between mb-4">
          <Link to={`/poem/${poem.id}`} className="flex-1">
            <h3 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors font-amiri leading-tight">
              {poem.title}
            </h3>
          </Link>

          <div className="flex flex-col items-end gap-2 mr-4">
            {poem.occasion && (
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold font-cairo whitespace-nowrap px-2">
                {poem.occasion.name}
              </Badge>
            )}
            {poem.category && (
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/60 bg-transparent text-[10px] font-bold font-cairo py-0.5 px-3 shadow-sm whitespace-nowrap">
                {poem.category}
              </Badge>
            )}
          </div>
        </div>

        {/* Info Row: Poet & Year */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-primary/60" />
            <span className="text-sm font-medium">{poem.poet_name}</span>
          </div>
          {poem.year && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary/60" />
              <span className="text-sm font-medium">{poem.year}</span>
            </div>
          )}
          <div className="flex items-center gap-4 mr-auto opacity-60">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{poem.views_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{poem.downloads_count}</span>
            </div>
          </div>
        </div>

        {/* Media Row */}
        {poem.media_url && (
          <div className="mb-5 p-3 bg-muted/40 rounded-lg border border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-background rounded-md border text-primary">
                <MediaIcon type={mediaType!} />
              </div>
              <span className="text-sm font-bold opacity-80">
                {mediaType === "image" && "ملف صورة"}
                {mediaType === "audio" && "ملف صوتي"}
                {mediaType === "video" && "ملف فيديو"}
                {mediaType === "pdf" && "ملف PDF"}
                {mediaType === "unknown" && "ملف مرفق"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-8 px-2 text-xs text-primary hover:bg-primary/10"
                onClick={() => incrementDownloads.mutate(poem.id)}
              >
                <a href={poem.media_url} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 ml-1" />
                  معاينة
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <Link to={`/poem/${poem.id}`}>
            <Button variant="outline" size="sm" className="bg-transparent border-primary/40 text-primary hover:bg-primary/5 px-6 font-bold">
              عرض التفاصيل
            </Button>
          </Link>

          {canModify && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"
                onClick={() => onEdit?.(poem)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-muted"
                onClick={() => onDelete?.(poem.id.toString())}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
