import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface Occasion {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  icon_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useOccasions = () => {
  return useQuery({
    queryKey: ["occasions"],
    queryFn: async () => {
      const { data } = await api.get("/occasions");
      return data as Occasion[];
    },
  });
};

export const useAllOccasions = () => {
  return useQuery({
    queryKey: ["all-occasions"],
    queryFn: async () => {
      // In a real app we might have a different admin endpoint, but for now reuse index
      const { data } = await api.get("/occasions");
      return data as Occasion[];
    },
  });
};

export const useCreateOccasion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post("/occasions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["occasions"] });
      queryClient.invalidateQueries({ queryKey: ["all-occasions"] });
      toast({ title: "تم إنشاء المناسبة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ في إنشاء المناسبة", description: error?.response?.data?.message || error.message, variant: "destructive" });
    },
  });
};

export const useUpdateOccasion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      // Laravel spoofing for PUT request with files
      formData.append("_method", "PUT");
      const { data } = await api.post(`/occasions/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["occasions"] });
      queryClient.invalidateQueries({ queryKey: ["all-occasions"] });
      toast({ title: "تم تحديث المناسبة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ في تحديث المناسبة", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteOccasion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/occasions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["occasions"] });
      queryClient.invalidateQueries({ queryKey: ["all-occasions"] });
      toast({ title: "تم حذف المناسبة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ في حذف المناسبة", description: error.message, variant: "destructive" });
    },
  });
};
