import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export type PoemCategory = 'وقفة' | 'موشح' | 'متعدد الأوزان';

export interface Poem {
  id: number;
  title: string;
  content: string | null;
  poet_name: string;
  year: number | null;
  media_url: string | null;
  occasion_id: number | null;
  category: PoemCategory | null;
  created_by: number;
  views_count: number;
  downloads_count: number;
  created_at: string;
  updated_at: string;
  occasion?: {
    id: number;
    name: string;
  } | null;
}

export interface CreatePoemInput {
  title: string;
  content: string | null;
  poet_name: string;
  year?: number | null;
  media_url?: string | null;
  occasion_id?: number | null;
  category?: PoemCategory | null;
  file?: File;
}

export interface UpdatePoemInput extends Partial<Omit<Poem, 'id'>> {
  id: string | number;
  file?: File;
}

export const usePoems = (occasionId?: string, category?: string) => {
  return useQuery({
    queryKey: ["poems", occasionId, category],
    queryFn: async () => {
      let url = "/poems";
      const params = new URLSearchParams();
      if (occasionId) params.append("occasion_id", occasionId);
      if (category) params.append("category", category);

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const { data } = await api.get(url);
      return data as Poem[];
    },
  });
};

export const useMyPoems = (userId?: string) => {
  return useQuery({
    queryKey: ["my-poems", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data } = await api.get("/my-poems");
      return data as Poem[];
    },
    enabled: !!userId,
  });
};

export const usePoem = (id: string) => {
  return useQuery({
    queryKey: ["poem", id],
    queryFn: async () => {
      const { data } = await api.get(`/poems/${id}`);
      return data as Poem;
    },
    enabled: !!id,
  });
};

export const useCreatePoem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (poem: CreatePoemInput) => {
      const formData = new FormData();
      formData.append('title', poem.title);
      formData.append('poet_name', poem.poet_name);
      if (poem.content) formData.append('content', poem.content);
      if (poem.year) formData.append('year', poem.year.toString());
      if (poem.occasion_id) formData.append('occasion_id', poem.occasion_id.toString());
      if (poem.category) formData.append('category', poem.category);

      // Handle file or url
      if (poem.file) {
        formData.append('file', poem.file);
      } else if (poem.media_url) {
        formData.append('media_url', poem.media_url);
      }

      const { data } = await api.post("/poems", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poems"] });
      queryClient.invalidateQueries({ queryKey: ["my-poems"] });
      toast({ title: "تم إنشاء القصيدة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ في إنشاء القصيدة", description: error.response?.data?.message || error.message, variant: "destructive" });
    },
  });
};

export const useUpdatePoem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, file, ...poem }: UpdatePoemInput & { id: number | string }) => {
      const formData = new FormData();
      formData.append('_method', 'PUT');

      if (poem.title) formData.append('title', poem.title);
      if (poem.poet_name) formData.append('poet_name', poem.poet_name);

      // Handle nullable fields correctly for FormData
      formData.append('content', poem.content || "");
      formData.append('year', poem.year ? poem.year.toString() : "");
      formData.append('occasion_id', poem.occasion_id ? poem.occasion_id.toString() : "");
      formData.append('category', poem.category || "");

      if (file) {
        formData.append('file', file);
      } else if (poem.media_url) {
        formData.append('media_url', poem.media_url);
      }

      const { data } = await api.post(`/poems/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poems"] });
      queryClient.invalidateQueries({ queryKey: ["my-poems"] });
      queryClient.invalidateQueries({ queryKey: ["poem"] });
      toast({ title: "تم تحديث القصيدة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ في تحديث القصيدة", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeletePoem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/poems/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["poems"] });
      queryClient.invalidateQueries({ queryKey: ["my-poems"] });
      toast({ title: "تم حذف القصيدة بنجاح" });
    },
    onError: (error: any) => {
      toast({ title: "خطأ في حذف القصيدة", description: error.message, variant: "destructive" });
    },
  });
};

export const useSearchPoems = (searchQuery: string) => {
  return useQuery({
    queryKey: ["search-poems", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const { data } = await api.get(`/poems?search=${searchQuery}`);
      return data as Poem[];
    },
    enabled: searchQuery.trim().length > 0,
  });
};

export const useIncrementViews = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const { data } = await api.post(`/poems/${id}/view`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["poem", id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["poems"] });
    },
  });
};

export const useIncrementDownloads = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const { data } = await api.post(`/poems/${id}/download`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["poem", id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["poems"] });
    },
  });
};
