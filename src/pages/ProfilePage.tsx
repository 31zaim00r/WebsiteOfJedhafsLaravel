import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Phone, Mail, Lock, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentUserProfile, useUpdateUserProfile } from "@/hooks/useUsers";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
    const { user } = useAuth();
    const { data: profile, isLoading: profileLoading } = useCurrentUserProfile(user?.id);
    const updateUserProfile = useUpdateUserProfile();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (profile) {
            setFormData((prev) => ({
                ...prev,
                name: profile.name || profile.user_metadata?.name || "",
                phoneNumber: profile.phone_number || profile.user_metadata?.phone_number || "",
            }));
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast({
                title: "خطأ",
                description: "كلمات المرور غير متطابقة",
                variant: "destructive",
            });
            return;
        }

        try {
            await updateUserProfile.mutateAsync({
                userId: user.id,
                name: formData.name,
                phoneNumber: formData.phoneNumber,
                password: formData.password || undefined,
                passwordConfirmation: formData.confirmPassword || undefined,
            });

            setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        } catch (error) {
            // Error handled by mutation
        }
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-20">
            <div className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold font-amiri mb-8 text-center">
                        الملف الشخصي
                    </h1>

                    <Card className="border border-border/50 shadow-xl overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b border-border/50 flex items-end p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-2xl bg-background border-2 border-primary flex items-center justify-center shadow-lg -mb-10">
                                    <User className="w-10 h-10 text-primary" />
                                </div>
                                <div className="mb-2">
                                    <h2 className="text-xl font-bold">{profile?.name || profile?.user_metadata?.name}</h2>
                                    <p className="text-muted-foreground text-sm">{profile?.email}</p>
                                </div>
                            </div>
                        </div>

                        <CardContent className="pt-16 pb-8 px-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Basic Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            المعلومات الأساسية
                                        </h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="name">الاسم</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="الاسم الكامل"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                                            <Input
                                                id="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                placeholder="973XXXXXXXX"
                                                dir="ltr"
                                                className="text-left"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>البريد الإلكتروني</Label>
                                            <Input
                                                value={profile?.email || ""}
                                                disabled
                                                className="bg-muted/50 cursor-not-allowed"
                                            />
                                            <p className="text-[10px] text-muted-foreground">لا يمكن تغيير البريد الإلكتروني حالياً</p>
                                        </div>
                                    </div>

                                    {/* Security */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                            <Lock className="w-4 h-4" />
                                            الأمان وتغيير كلمة المرور
                                        </h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="password">كلمة المرور الجديدة</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                                dir="ltr"
                                                className="text-left"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                placeholder="••••••••"
                                                dir="ltr"
                                                className="text-left"
                                            />
                                        </div>
                                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                            <p className="text-xs text-muted-foreground">اترك حقول كلمة المرور فارغة إذا كنت لا ترغب في تغييرها.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border flex justify-end">
                                    <Button type="submit" className="gap-2" disabled={updateUserProfile.isPending}>
                                        {updateUserProfile.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        حفظ التغييرات
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

export default ProfilePage;
