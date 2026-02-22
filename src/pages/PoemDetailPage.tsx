import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User, Play, Edit, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePoem, useDeletePoem, useIncrementViews, useIncrementDownloads } from "@/hooks/usePoems";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { PoemForm } from "@/components/PoemForm";
import { Eye, Download } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getMediaType = (url: string): "image" | "audio" | "video" | "pdf" | "unknown" => {
  const ext = url.split(".").pop()?.toLowerCase();
  if (!ext) return "unknown";

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (["mp3", "wav", "mpeg", "ogg", "m4a"].includes(ext)) return "audio";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";

  return "unknown";
};

const MediaSection = ({ url }: { url: string }) => {
  const type = getMediaType(url);

  if (type === "pdf") {
    return (
      <div className="mt-8 rounded-2xl overflow-hidden border border-border bg-muted/20">
        <iframe
          src={url}
          className="w-full h-[600px] border-0 mb-[-6px]"
          title="PDF Preview"
        />
      </div>
    );
  }

  if (type === "audio") {
    return (
      <div className="mt-8 p-6 rounded-2xl border border-border bg-muted/20">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" />
          الاستماع للقصيدة
        </h3>
        <audio controls className="w-full">
          <source src={url} />
          متصفحك لا يدعم تشغيل الملفات الصوتية.
        </audio>
      </div>
    );
  }

  if (type === "video") {
    return (
      <div className="mt-8 rounded-2xl overflow-hidden border border-border bg-muted/20">
        <video controls className="w-full aspect-video">
          <source src={url} />
          متصفحك لا يدعم تشغيل ملفات الفيديو.
        </video>
      </div>
    );
  }

  if (type === "image") {
    return (
      <div className="mt-8 rounded-2xl overflow-hidden border border-border bg-muted/20">
        <img src={url} alt="Media" className="w-full h-auto" />
      </div>
    );
  }

  return null;
};

const PoemDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: poem, isLoading } = usePoem(id!);
  const { user, isAdmin } = useAuth();
  const deletePoem = useDeletePoem();
  const incrementViews = useIncrementViews();
  const incrementDownloads = useIncrementDownloads();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const hasIncrementedView = useRef(false);

  useEffect(() => {
    if (poem && !hasIncrementedView.current) {
      incrementViews.mutate(poem.id);
      hasIncrementedView.current = true;
    }
  }, [poem]);

  const canModify = user && (isAdmin || user.id.toString() === poem?.created_by?.toString());

  const handleDelete = async () => {
    if (poem) {
      await deletePoem.mutateAsync(poem.id.toString());
      navigate("/poems");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: poem?.title,
        text: `${poem?.title} - ${poem?.poet_name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-96 mb-4" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">القصيدة غير موجودة</h1>
          <Button asChild>
            <Link to="/poems">العودة للقصائد</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">الرئيسية</Link>
          <ArrowRight className="w-4 h-4 rotate-180" />
          <Link to="/poems" className="hover:text-primary">القصائد</Link>
          {poem.occasion && (
            <>
              <ArrowRight className="w-4 h-4 rotate-180" />
              <Link to={`/poems?occasion=${poem.occasion.id}`} className="hover:text-primary">
                {poem.occasion.name}
              </Link>
            </>
          )}
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-primary">{poem.title}</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="bg-card rounded-2xl p-8 border border-border mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold font-amiri mb-4">
                  {poem.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    {poem.poet_name}
                  </span>
                  {poem.year && (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      {poem.year}
                    </span>
                  )}
                  <div className="flex items-center gap-4 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Eye className="w-4 h-4" />
                      {poem.views_count} مشاهدة
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <Download className="w-4 h-4" />
                      {poem.downloads_count} تحميل
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {poem.occasion && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                    {poem.occasion.name}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-border">
              {poem.media_url && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  onClick={() => incrementDownloads.mutate(poem.id)}
                >
                  <a href={poem.media_url} target="_blank" rel="noopener noreferrer">
                    <Play className="w-4 h-4 ml-2" />
                    استماع / تحميل
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 ml-2" />
                مشاركة
              </Button>

              {canModify && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setIsDeleteOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Media Section */}
          {poem.media_url && <MediaSection url={poem.media_url} />}

          {/* Poem Content */}
          <div className="bg-card rounded-2xl p-8 md:p-12 border border-border mt-8">
            <div className="relative">
              {/* Decorative Corners */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary rounded-bl-2xl" />

              <div className="py-8 px-4">
                <pre className="font-amiri text-xl md:text-2xl leading-loose text-foreground whitespace-pre-wrap text-center">
                  {poem.content}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-muted-foreground">
                " {poem.poet_name} "
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-primary" />
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-primary" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <PoemForm isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} poem={poem} />

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه القصيدة؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء. سيتم حذف القصيدة نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PoemDetailPage;
