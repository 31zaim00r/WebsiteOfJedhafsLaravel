import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOccasions } from "@/hooks/useOccasions";
import { useCreatePoem, useUpdatePoem, type Poem, type CreatePoemInput, type PoemCategory } from "@/hooks/usePoems";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Link } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";

const POEM_CATEGORIES: { value: PoemCategory; label: string }[] = [
  { value: "وقفة", label: "وقفة" },
  { value: "موشح", label: "موشح" },
  { value: "متعدد الأوزان", label: "متعدد الأوزان" },
];

interface PoemFormProps {
  isOpen: boolean;
  onClose: () => void;
  poem?: Poem | null;
}

export const PoemForm = ({ isOpen, onClose, poem }: PoemFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: occasions } = useOccasions();
  const createPoem = useCreatePoem();
  const updatePoem = useUpdatePoem();

  const [mediaInputType, setMediaInputType] = useState<"upload" | "url">("upload");
  const [formData, setFormData] = useState<CreatePoemInput>({
    title: "",
    content: "",
    poet_name: "",
    year: null,
    media_url: null,
    occasion_id: null,
    category: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (poem) {
      setFormData({
        title: poem.title,
        content: poem.content || "",
        poet_name: poem.poet_name,
        year: poem.year,
        media_url: poem.media_url,
        occasion_id: poem.occasion_id,
        category: poem.category,
      });
      // Detect if existing media is a URL or uploaded file
      if (poem.media_url) {
        setMediaInputType(poem.media_url.includes("poem-media") ? "upload" : "url");
      }
    } else {
      setFormData({
        title: "",
        content: "",
        poet_name: "",
        year: null,
        media_url: null,
        occasion_id: null,
        category: null,
      });
      setMediaInputType("upload");
      setSelectedFile(null);
    }
  }, [poem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      if (poem) {
        await updatePoem.mutateAsync({ id: poem.id, ...formData, file: selectedFile || undefined });
      } else {
        if (!selectedFile && !formData.media_url) {
          toast({
            title: "تنبيه",
            description: "يجب إرفاق ملف أو إضافة رابط للقصيدة",
            variant: "destructive",
          });
          return;
        }
        await createPoem.mutateAsync({ ...formData, file: selectedFile || undefined });
      }
      onClose();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createPoem.isPending || updatePoem.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold font-amiri">
            {poem ? "تعديل القصيدة" : "إضافة قصيدة جديدة"}
          </DialogTitle>
          <DialogDescription className="text-center">
            أدخل بيانات القصيدة والوسائط المرتبطة بها
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="أدخل نص القصيدة هنا..."
              className="min-h-[150px] leading-relaxed"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              الوسائط *
            </Label>
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
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              {poem ? "حفظ التعديلات" : "إضافة القصيدة"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
