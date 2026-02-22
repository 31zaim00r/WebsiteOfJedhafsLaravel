import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Filter, Search, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePoems, useSearchPoems, useDeletePoem, type Poem } from "@/hooks/usePoems";
import { useOccasions } from "@/hooks/useOccasions";
import { PoemCard } from "@/components/PoemCard";
import { PoemsTableView } from "@/components/PoemsTableView";
import { PoemForm } from "@/components/PoemForm";
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

const PoemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const occasionId = searchParams.get("occasion") || undefined;
  const category = searchParams.get("category") || undefined;
  const searchQuery = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data: occasions } = useOccasions();
  const { data: poems, isLoading: poemsLoading } = usePoems(occasionId, category);
  const { data: searchResults, isLoading: searchLoading } = useSearchPoems(searchQuery);
  const deletePoem = useDeletePoem();

  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedOccasion = occasions?.find((o) => o.id.toString() === occasionId);
  const displayPoems = searchQuery ? searchResults : poems;
  const isLoading = searchQuery ? searchLoading : poemsLoading;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ search: localSearch });
    } else {
      searchParams.delete("search");
      setSearchParams(searchParams);
    }
  };

  const handleOccasionChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("occasion");
    } else {
      searchParams.set("occasion", value);
    }
    searchParams.delete("search");
    setLocalSearch("");
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", value);
    }
    searchParams.delete("search");
    setLocalSearch("");
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchParams({});
    setLocalSearch("");
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deletePoem.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">الرئيسية</Link>
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>القصائد</span>
            {selectedOccasion && (
              <>
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span className="text-primary">{selectedOccasion.name}</span>
              </>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold font-amiri mb-2">
              {selectedOccasion ? selectedOccasion.name : searchQuery ? `نتائج البحث: ${searchQuery}` : "جميع القصائد"}
            </h1>
            {selectedOccasion?.description && (
              <p className="text-muted-foreground">{selectedOccasion.description}</p>
            )}
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="ابحث عن قصيدة أو شاعر..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Button type="submit">بحث</Button>
          </form>

          <div className="flex gap-2 items-center">
            <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "grid" | "table")}>
              <ToggleGroupItem value="grid" aria-label="عرض شبكي" className="px-3">
                <LayoutGrid className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="عرض جدولي" className="px-3">
                <List className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Select value={occasionId || "all"} onValueChange={handleOccasionChange}>
              <SelectTrigger className="w-44 underline-offset-4 font-bold">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="المناسبة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المناسبات</SelectItem>
                {occasions?.map((occasion) => (
                  <SelectItem key={occasion.id} value={occasion.id.toString()}>
                    {occasion.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={category || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-44 underline-offset-4 font-bold border-emerald-500/30 text-emerald-500">
                <LayoutGrid className="w-4 h-4 ml-2" />
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التصنيفات</SelectItem>
                <SelectItem value="وقفة">وقفة</SelectItem>
                <SelectItem value="موشح">موشح</SelectItem>
                <SelectItem value="متعدد الأوزان">متعدد الأوزان</SelectItem>
              </SelectContent>
            </Select>

            {(occasionId || category || searchQuery) && (
              <Button variant="outline" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(selectedOccasion || searchQuery) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedOccasion && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                المناسبة: {selectedOccasion.name}
              </Badge>
            )}
            {category && (
              <Badge variant="outline" className="border-emerald-500 text-emerald-500 bg-emerald-500/5">
                التصنيف: {category}
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="bg-accent/10 text-accent-foreground">
                بحث: {searchQuery}
              </Badge>
            )}
          </div>
        )}

        {/* Poems Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : displayPoems && displayPoems.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayPoems.map((poem, index) => (
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
            <PoemsTableView
              poems={displayPoems}
              showActions
              onEdit={(p) => setEditingPoem(p)}
              onDelete={(id) => setDeletingId(id)}
            />
          )
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {searchQuery
                ? "لم يتم العثور على نتائج للبحث"
                : "لا توجد قصائد في هذه المناسبة حتى الآن"}
            </p>
            <Button variant="outline" onClick={clearFilters}>
              عرض جميع القصائد
            </Button>
          </div>
        )}
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
              لا يمكن التراجع عن هذا الإجراء وسيتم حذف الملف المرفق نهائياً.
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

export default PoemsPage;
