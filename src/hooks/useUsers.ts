import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export interface UserWithRole {
  id: string;
  name: string;
  email: string | null;
  phone_number: string | null;
  can_upload: boolean;
  created_at: string;
  role: "admin" | "user";
}

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get<UserWithRole[]>("/users");
      return response.data;
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "user" }) => {
      await api.put(`/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "تم تحديث صلاحيات المستخدم" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث الصلاحيات",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "تم حذف المستخدم" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف المستخدم",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      name,
      phoneNumber,
      password,
      passwordConfirmation
    }: {
      userId: string;
      name: string;
      phoneNumber: string | null;
      password?: string;
      passwordConfirmation?: string;
    }) => {
      await api.put(`/users/${userId}/profile`, {
        name,
        phone_number: phoneNumber,
        password,
        password_confirmation: passwordConfirmation
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({ title: "تم تحديث بيانات المستخدم" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث البيانات",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });
};

export const useToggleUserUpload = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, canUpload }: { userId: string; canUpload: boolean }) => {
      await api.patch(`/users/${userId}/toggle-upload`, { can_upload: canUpload });
    },
    onSuccess: (_, { canUpload }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({ title: canUpload ? "تم تفعيل صلاحية الرفع" : "تم إلغاء صلاحية الرفع" });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث الصلاحيات",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    },
  });
};

// Hook to get current user's profile
export const useCurrentUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await api.get("/user");
      return response.data;
    },
    enabled: !!userId,
  });
};
