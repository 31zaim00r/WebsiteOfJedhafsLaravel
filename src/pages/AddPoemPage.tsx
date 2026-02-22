import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useOccasions } from "@/hooks/useOccasions";
import { useCreatePoem, type CreatePoemInput, type PoemCategory } from "@/hooks/usePoems";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUserProfile } from "@/hooks/useUsers";
import { Loader2, Upload, Link, AlertTriangle } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";

const POEM_CATEGORIES: { value: PoemCategory; label: string }[] = [
  { value: "وقفة", label: "وقفة" },
  { value: "موشح", label: "موشح" },
  { value: "متعدد الأوزان", label: "متعدد الأوزان" },
];

const AddPoemPage = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: occasions } = useOccasions();
  const { data: userProfile, isLoading: profileLoading, isError: profileError } = useCurrentUserProfile(user?.id);
  const createPoem = useCreatePoem();

  const [mediaInputType, setMediaInputType] = useState<"upload" | "url">("upload");
  const [formData, setFormData] = useState<CreatePoemInput>({
    title: "",
    content: "",
    poet_name: "",
    year: null,
    media_url: null,
    occasion_id: null,
    category: null,
    file: undefined,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Check if user can upload (admin always can, regular users need can_upload = true)
  const canUpload = isAdmin || !!userProfile?.can_upload;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // if (!user) return; // Allow guest for now or handle later

    if (!canUpload) {
      toast({
        title: "غير مسموح",
        description: "ليس لديك صلاحية إضافة قصائد. يرجى التواصل مع الإدارة.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPoem.mutateAsync({
        ...formData,
        file: selectedFile || undefined,
        content: formData.content || ""
      });
      navigate("/my-poems");
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!user && !profileLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">يجب تسجيل الدخول للإضافة</h1>
          <p className="text-muted-foreground mb-6">يرجى تسجيل الدخول لتتمكن من إضافة قصائدك.</p>
          <Button onClick={() => navigate("/")}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground font-arabic">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    console.error("Profile loading error");
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-gradient-gold font-amiri">
                إضافة قصيدة جديدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان القصيدة *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="أدخل عنوان القصيدة"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="poet_name">اسم الشاعر *</Label>
                  <Input
                    id="poet_name"
                    value={formData.poet_name}
                    onChange={(e) => setFormData({ ...formData, poet_name: e.target.value })}
                    placeholder="أدخل اسم الشاعر"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="occasion">المناسبة</Label>
                    <Select
                      value={formData.occasion_id?.toString() || "none"}
                      onValueChange={(value) => setFormData({ ...formData, occasion_id: value === "none" ? null : parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المناسبة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون مناسبة</SelectItem>
                        {occasions?.map((occasion) => (
                          <SelectItem key={occasion.id} value={occasion.id.toString()}>
                            {occasion.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">التصنيف</Label>
                    <Select
                      value={formData.category || "none"}
                      onValueChange={(value) => setFormData({ ...formData, category: value === "none" ? null : value as PoemCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون تصنيف</SelectItem>
                        {POEM_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">السنة</Label>
                    <Input
                      id="year"
                      type="number"
                      value={formData.year || ""}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="مثال: 1445"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">نص القصيدة (اختياري)</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="أدخل نص القصيدة هنا..."
                    className="min-h-[200px] leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <Label>الوسائط (اختياري)</Label>
                  <Tabs value={mediaInputType} onValueChange={(v) => setMediaInputType(v as "upload" | "url")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" className="gap-2">
                        <Upload className="w-4 h-4" />
                        رفع ملف
                      </TabsTrigger>
                      <TabsTrigger value="url" className="gap-2">
                        <Link className="w-4 h-4" />
                        رابط خارجي
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="mt-3">
                      <FileUpload
                        value={formData.media_url}
                        onChange={(url) => setFormData({ ...formData, media_url: url })}
                        onFileSelect={(file) => setSelectedFile(file)}
                      />
                    </TabsContent>
                    <TabsContent value="url" className="mt-3">
                      <Input
                        type="url"
                        value={formData.media_url || ""}
                        onChange={(e) => setFormData({ ...formData, media_url: e.target.value || null })}
                        placeholder="رابط صوتي أو مرئي"
                        dir="ltr"
                        className="text-left"
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={createPoem.isPending}>
                    {createPoem.isPending && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                    إضافة القصيدة
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AddPoemPage;
