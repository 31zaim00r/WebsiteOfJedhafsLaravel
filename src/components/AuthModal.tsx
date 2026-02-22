import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
}

export const AuthModal = ({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhoneNumber("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "خطأ في تسجيل الدخول",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: "تم تسجيل الدخول بنجاح" });
          onClose();
          resetForm();
        }
      } else {
        if (!name.trim()) {
          toast({
            title: "خطأ",
            description: "يرجى إدخال الاسم",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          toast({
            title: "خطأ",
            description: "كلمات المرور غير متطابقة",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, name, phoneNumber || undefined);
        if (error) {
          toast({
            title: "خطأ في إنشاء الحساب",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({ title: "تم إنشاء الحساب بنجاح" });
          onClose();
          resetForm();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {mode === "register" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">الاسم</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="أدخل اسمك"
                  required={mode === "register"}
                  className="text-right"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  رقم الهاتف (اختياري)
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="973XXXXXXXX"
                  dir="ltr"
                  className="text-left"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              dir="ltr"
              className="text-left"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              dir="ltr"
              className="text-left"
            />
          </div>

          {mode === "register" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required={mode === "register"}
                minLength={6}
                dir="ltr"
                className="text-left"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
            ) : null}
            {mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
          </Button>
        </form>

        <div className="flex flex-col gap-2 mt-4 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-primary hover:underline"
          >
            {mode === "login"
              ? "ليس لديك حساب؟ إنشاء حساب جديد"
              : "لديك حساب بالفعل؟ تسجيل الدخول"}
          </button>

          {mode === "login" && (
            <button
              type="button"
              onClick={() => toast({
                title: "استعادة كلمة المرور",
                description: "يرجى التواصل مع إدارة المأتم لإعادة تعيين كلمة المرور الخاصة بك.",
                variant: "default",
              })}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              نسيت كلمة المرور؟
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
