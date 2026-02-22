import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Users, BookOpen, Calendar, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useAuth } from "@/contexts/AuthContext";
import { useAllOccasions, useCreateOccasion, useUpdateOccasion, useDeleteOccasion, type Occasion } from "@/hooks/useOccasions";
import { usePoems, useDeletePoem, type Poem } from "@/hooks/usePoems";
import { PoemCard } from "@/components/PoemCard";
import { PoemForm } from "@/components/PoemForm";
import { Loader2 } from "lucide-react";

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: occasions, isLoading: occasionsLoading } = useAllOccasions();
  const { data: poems, isLoading: poemsLoading } = usePoems();
  const createOccasion = useCreateOccasion();
  const updateOccasion = useUpdateOccasion();
  const deleteOccasion = useDeleteOccasion();
  const deletePoem = useDeletePoem();

  const [occasionFormOpen, setOccasionFormOpen] = useState(false);
  const [editingOccasion, setEditingOccasion] = useState<Occasion | null>(null);
  const [deletingOccasionId, setDeletingOccasionId] = useState<string | null>(null);
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [deletingPoemId, setDeletingPoemId] = useState<string | null>(null);

  const [occasionForm, setOccasionForm] = useState({
    name: "",
    description: "",
    icon: null as File | null,
    is_active: true,
  });

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-muted-foreground mb-4">هذه الصفحة متاحة للمسؤولين فقط</p>
          <Button onClick={() => navigate("/")}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const openOccasionForm = (occasion?: Occasion) => {
    if (occasion) {
      setEditingOccasion(occasion);
      setOccasionForm({
        name: occasion.name,
        description: occasion.description || "",
        icon: null,
        is_active: occasion.is_active,
      });
    } else {
      setEditingOccasion(null);
      setOccasionForm({ name: "", description: "", icon: null, is_active: true });
    }
    setOccasionFormOpen(true);
  };

  const handleOccasionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", occasionForm.name);
      formData.append("description", occasionForm.description);
      if (occasionForm.icon) {
        formData.append("icon", occasionForm.icon);
      }
      formData.append("is_active", occasionForm.is_active ? "1" : "0");

      if (editingOccasion) {
        await updateOccasion.mutateAsync({ id: editingOccasion.id, formData });
      } else {
        await createOccasion.mutateAsync(formData);
      }
      setOccasionFormOpen(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeleteOccasion = async () => {
    if (deletingOccasionId) {
      await deleteOccasion.mutateAsync(deletingOccasionId);
      setDeletingOccasionId(null);
    }
  };

  const handleDeletePoem = async () => {
    if (deletingPoemId) {
      await deletePoem.mutateAsync(deletingPoemId);
      setDeletingPoemId(null);
    }
  };

  const isOccasionSaving = createOccasion.isPending || updateOccasion.isPending;

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold font-amiri mb-8">
            لوحة التحكم
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">المناسبات</CardTitle>
                <Calendar className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{occasions?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">القصائد</CardTitle>
                <BookOpen className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{poems?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">المناسبات النشطة</CardTitle>
                <Eye className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{occasions?.filter(o => o.is_active).length || 0}</div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate("/admin/users")}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">إدارة المستخدمين</CardTitle>
                <Users className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">إدارة الصلاحيات</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="occasions" className="space-y-6">
            <TabsList>
              <TabsTrigger value="occasions">المناسبات</TabsTrigger>
              <TabsTrigger value="poems">القصائد</TabsTrigger>
            </TabsList>

            {/* Occasions Tab */}
            <TabsContent value="occasions">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">إدارة المناسبات</h2>
                <Button onClick={() => openOccasionForm()}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة مناسبة
                </Button>
              </div>

              {occasionsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {occasions?.map((occasion) => (
                    <Card key={occasion.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${occasion.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                          <div className="flex items-center gap-3">
                            {occasion.icon_url && (
                              <img src={occasion.icon_url} alt={occasion.name} className="w-10 h-10 rounded-full object-cover border border-primary/20" />
                            )}
                            <div>
                              <h3 className="font-bold">{occasion.name}</h3>
                              {occasion.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1">{occasion.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openOccasionForm(occasion)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeletingOccasionId(occasion.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Poems Tab */}
            <TabsContent value="poems">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">إدارة القصائد</h2>
              </div>

              {poemsLoading ? (
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
                      onDelete={(id) => setDeletingPoemId(id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد قصائد</p>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Occasion Form Modal */}
      <Dialog open={occasionFormOpen} onOpenChange={setOccasionFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOccasion ? "تعديل المناسبة" : "إضافة مناسبة جديدة"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOccasionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم المناسبة *</Label>
              <Input
                id="name"
                value={occasionForm.name}
                onChange={(e) => setOccasionForm({ ...occasionForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                value={occasionForm.description}
                onChange={(e) => setOccasionForm({ ...occasionForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">أيقونة المناسبة</Label>
              <Input
                id="icon"
                type="file"
                accept="image/*"
                onChange={(e) => setOccasionForm({ ...occasionForm, icon: e.target.files?.[0] || null })}
              />
              {editingOccasion?.icon_url && !occasionForm.icon && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">الأيقونة الحالية:</p>
                  <img src={editingOccasion.icon_url} alt="Current icon" className="w-16 h-16 rounded-lg object-cover border" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={occasionForm.is_active}
                onCheckedChange={(checked) => setOccasionForm({ ...occasionForm, is_active: checked })}
              />
              <Label htmlFor="is_active">مفعّلة</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isOccasionSaving}>
                {isOccasionSaving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                {editingOccasion ? "حفظ التعديلات" : "إضافة"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOccasionFormOpen(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Poem Edit Modal */}
      <PoemForm
        isOpen={!!editingPoem}
        onClose={() => setEditingPoem(null)}
        poem={editingPoem}
      />

      {/* Delete Occasion Confirmation */}
      <AlertDialog open={!!deletingOccasionId} onOpenChange={() => setDeletingOccasionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه المناسبة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إزالة ربط جميع القصائد المرتبطة بهذه المناسبة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOccasion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Poem Confirmation */}
      <AlertDialog open={!!deletingPoemId} onOpenChange={() => setDeletingPoemId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه القصيدة؟</AlertDialogTitle>
            <AlertDialogDescription>
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePoem}
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

export default AdminPage;
