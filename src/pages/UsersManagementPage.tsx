import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  ShieldCheck,
  Trash2,
  Mail,
  Calendar,
  ArrowRight,
  Phone,
  Edit,
  Save,
  X,
  Search,
  Upload,
  Ban,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers, useUpdateUserRole, useDeleteUser, useUpdateUserProfile, useToggleUserUpload, UserWithRole } from "@/hooks/useUsers";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const UsersManagementPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: users, isLoading } = useUsers();
  const updateRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const updateProfile = useUpdateUserProfile();
  const toggleUpload = useToggleUserUpload();

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserWithRole | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-muted-foreground mb-4">
            هذه الصفحة متاحة للمسؤولين فقط
          </p>
          <Button onClick={() => navigate("/")}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  const handleRoleChange = (userId: string, role: "admin" | "user") => {
    updateRole.mutate({ userId, role });
  };

  const handleDeleteUser = () => {
    if (deletingUserId) {
      deleteUser.mutate(deletingUserId);
      setDeletingUserId(null);
    }
  };

  const openEditDialog = (u: UserWithRole) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditPhone(u.phone_number || "");
    setEditPassword("");
  };

  const handleSaveProfile = () => {
    if (editingUser) {
      updateProfile.mutate({
        userId: editingUser.id,
        name: editName,
        phoneNumber: editPhone || null,
        password: editPassword || undefined,
        passwordConfirmation: editPassword || undefined,
      });
      setEditingUser(null);
    }
  };

  const handleToggleUpload = (userId: string, currentStatus: boolean) => {
    toggleUpload.mutate({ userId, canUpload: !currentStatus });
  };

  const adminCount = users?.filter((u) => u.role === "admin").length || 0;
  const userCount = users?.filter((u) => u.role === "user").length || 0;
  const activeUploaders = users?.filter((u) => u.can_upload).length || 0;

  // Filter users based on search query
  const filteredUsers = users?.filter((u) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (u.name?.toLowerCase().includes(query) ?? false) ||
      (u.email?.toLowerCase().includes(query) ?? false) ||
      (u.phone_number?.includes(query) ?? false)
    );
  });

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold font-amiri">
              إدارة المستخدمين
            </h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  إجمالي المستخدمين
                </CardTitle>
                <div className="p-2 rounded-full bg-primary/20">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{users?.length || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">مستخدم مسجل</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  المسؤولين
                </CardTitle>
                <div className="p-2 rounded-full bg-green-500/20">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{adminCount}</div>
                <p className="text-xs text-muted-foreground mt-1">صلاحيات كاملة</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  المستخدمين العاديين
                </CardTitle>
                <div className="p-2 rounded-full bg-blue-500/20">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{userCount}</div>
                <p className="text-xs text-muted-foreground mt-1">صلاحيات محدودة</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  مفعّلي الرفع
                </CardTitle>
                <div className="p-2 rounded-full bg-purple-500/20">
                  <UserCheck className="w-5 h-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeUploaders}</div>
                <p className="text-xs text-muted-foreground mt-1">يمكنهم إضافة قصائد</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Users Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>قائمة المستخدمين</CardTitle>
              <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم أو البريد أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 text-right"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-right font-bold">الاسم</TableHead>
                        <TableHead className="text-right font-bold">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right font-bold">رقم الهاتف</TableHead>
                        <TableHead className="text-right font-bold">تاريخ التسجيل</TableHead>
                        <TableHead className="text-right font-bold">الصلاحية</TableHead>
                        <TableHead className="text-right font-bold">صلاحية الرفع</TableHead>
                        <TableHead className="text-right font-bold">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              {u.email || "—"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span dir="ltr">{u.phone_number || "—"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(u.created_at), "d MMM yyyy", {
                                locale: ar,
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={u.role === "admin" ? "default" : "secondary"}
                              className={u.role === "admin" ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                              {u.role === "admin" ? (
                                <><ShieldCheck className="w-3 h-3 ml-1" /> مسؤول</>
                              ) : (
                                <><Shield className="w-3 h-3 ml-1" /> مستخدم</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={u.can_upload ? "default" : "outline"}
                              size="sm"
                              className={`text-xs gap-1 ${u.can_upload ? "bg-purple-500 hover:bg-purple-600" : ""}`}
                              onClick={() => handleToggleUpload(u.id, u.can_upload)}
                              disabled={toggleUpload.isPending}
                            >
                              {u.can_upload ? (
                                <>
                                  <Upload className="w-3 h-3" />
                                  مفعّل
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3 h-3" />
                                  غير مفعّل
                                </>
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {/* Edit button */}
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(u)}
                                title="تعديل البيانات"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              {u.id !== user.id && (
                                <>
                                  <Button
                                    variant={u.role === "user" ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => handleRoleChange(u.id, u.role === "admin" ? "user" : "admin")}
                                  >
                                    {u.role === "admin" ? "إزالة الصلاحية" : "ترقية لمسؤول"}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => setDeletingUserId(u.id)}
                                    title="حذف المستخدم"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {searchQuery ? "لا توجد نتائج للبحث" : "لا يوجد مستخدمين"}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(val) => !val && setEditingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل بيانات المستخدم</DialogTitle>
            <DialogDescription className="text-right">
              قم بتعديل بيانات المستخدم الحالية واضغط على حفظ.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">الاسم</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-right"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+966 5XX XXX XXXX"
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input
                value={editingUser?.email || ""}
                disabled
                className="text-left bg-muted"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">لا يمكن تعديل البريد الإلكتروني</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">تعيين كلمة مرور جديدة</Label>
              <Input
                id="edit-password"
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="اتركه فارغاً للحفاظ على الحالية"
                dir="ltr"
                className="text-left"
              />
              <p className="text-[10px] text-muted-foreground">يمكن للمسؤول إعادة تعيين كلمة مرور المستخدم في حال نسيانها</p>
            </div>
          </div>
          <DialogFooter className="flex-row-reverse gap-2">
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              <X className="w-4 h-4 ml-2" />
              إلغاء
            </Button>
            <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
              <Save className="w-4 h-4 ml-2" />
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog
        open={!!deletingUserId}
        onOpenChange={(val) => !val && setDeletingUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا المستخدم؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف بيانات المستخدم نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  );
};

export default UsersManagementPage;