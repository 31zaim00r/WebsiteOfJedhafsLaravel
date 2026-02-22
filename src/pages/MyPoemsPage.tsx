import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PoemCard } from "@/components/PoemCard";
import { PoemForm } from "@/components/PoemForm";
import { useMyPoems, useDeletePoem, type Poem } from "@/hooks/usePoems";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUserProfile } from "@/hooks/useUsers";
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

const MyPoemsPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: poems, isLoading } = useMyPoems(user?.id);
  const { data: userProfile } = useCurrentUserProfile(user?.id);
  const deletePoem = useDeletePoem();
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">يجب تسجيل الدخول لعرض قصائدك</h1>
          <Button onClick={() => navigate("/")}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (deletingId) {
      await deletePoem.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold font-amiri mb-2">
                قصائدي
              </h1>
              <p className="text-muted-foreground">
                إدارة القصائد التي أضفتها
              </p>
            </div>
            {(isAdmin || userProfile?.can_upload) && (
              <Button onClick={() => navigate("/add-poem")}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة قصيدة جديدة
              </Button>
            )}
          </div>

          {/* Poems Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : poems && poems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {poems.map((poem, index) => (
                <PoemCard
                  key={poem.id}
                  poem={poem}
                  index={index}
                  showActions
                  onEdit={(p) => setEditingPoem(p)}
                  onDelete={(id) => setDeletingId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">
                لم تقم بإضافة أي قصائد بعد
              </p>
              {(isAdmin || userProfile?.can_upload) && (
                <Button onClick={() => navigate("/add-poem")}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة قصيدتك الأولى
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      <PoemForm
        isOpen={!!editingPoem}
        onClose={() => setEditingPoem(null)}
        poem={editingPoem}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
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

export default MyPoemsPage;
