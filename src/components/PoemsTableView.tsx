import { Link } from "react-router-dom";
import { Calendar, User, Download, Eye, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, BookOpen } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Poem, useIncrementDownloads } from "@/hooks/usePoems";
import { useAuth } from "@/contexts/AuthContext";

type SortKey = "title" | "poet_name" | "occasion" | "year" | "category" | "views_count" | "downloads_count";
type SortDirection = "asc" | "desc";

interface PoemsTableViewProps {
  poems: Poem[];
  onEdit?: (poem: Poem) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const getMediaType = (url: string): "image" | "audio" | "video" | "pdf" | "unknown" => {
  const lower = url.toLowerCase();
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)/)) return "image";
  if (lower.match(/\.(mp3|wav|ogg|m4a)/)) return "audio";
  if (lower.match(/\.(mp4|webm|mov|avi)/)) return "video";
  if (lower.includes(".pdf")) return "pdf";
  return "unknown";
};

export const PoemsTableView = ({ poems, onEdit, onDelete, showActions = false }: PoemsTableViewProps) => {
  const { user, isAdmin } = useAuth();
  const incrementDownloads = useIncrementDownloads();
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedPoems = useMemo(() => {
    const sorted = [...poems].sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      switch (sortKey) {
        case "title":
          valA = a.title;
          valB = b.title;
          break;
        case "poet_name":
          valA = a.poet_name;
          valB = b.poet_name;
          break;
        case "occasion":
          valA = a.occasion?.name || "";
          valB = b.occasion?.name || "";
          break;
        case "year":
          valA = a.year || 0;
          valB = b.year || 0;
          break;
        case "category":
          valA = a.category || "";
          valB = b.category || "";
          break;
        case "views_count":
          valA = a.views_count;
          valB = b.views_count;
          break;
        case "downloads_count":
          valA = a.downloads_count;
          valB = b.downloads_count;
          break;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB, 'ar')
          : valB.localeCompare(valA, 'ar');
      }

      return sortDirection === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
    return sorted;
  }, [poems, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const SortIndicator = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />;
    return sortDirection === "asc"
      ? <ArrowUp className="w-4 h-4 mr-2 text-primary" />
      : <ArrowDown className="w-4 h-4 mr-2 text-primary" />;
  };

  const handleDownload = (poemId: number, url: string, title: string) => {
    incrementDownloads.mutate(poemId);
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead
              className="text-right font-bold cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center">
                العنوان
                <SortIndicator column="title" />
              </div>
            </TableHead>
            <TableHead
              className="text-right font-bold cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => handleSort("poet_name")}
            >
              <div className="flex items-center">
                الشاعر
                <SortIndicator column="poet_name" />
              </div>
            </TableHead>
            <TableHead
              className="text-right font-bold cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => handleSort("occasion")}
            >
              <div className="flex items-center">
                المناسبة
                <SortIndicator column="occasion" />
              </div>
            </TableHead>
            <TableHead
              className="text-right font-bold cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => handleSort("category")}
            >
              <div className="flex items-center">
                التصنيف
                <SortIndicator column="category" />
              </div>
            </TableHead>
            <TableHead
              className="text-right font-bold cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => handleSort("year")}
            >
              <div className="flex items-center">
                السنة
                <SortIndicator column="year" />
              </div>
            </TableHead>
            <TableHead
              className="text-right font-bold cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => handleSort("views_count")}
            >
              <div className="flex items-center">
                <Eye className="w-4 h-4 ml-1" />
                المشاهدات
                <SortIndicator column="views_count" />
              </div>
            </TableHead>
            <TableHead
              className="text-right font-bold cursor-pointer hover:bg-muted/70 transition-colors"
              onClick={() => handleSort("downloads_count")}
            >
              <div className="flex items-center">
                <Download className="w-4 h-4 ml-1" />
                التحميلات
                <SortIndicator column="downloads_count" />
              </div>
            </TableHead>
            <TableHead className="text-right font-bold">الملف</TableHead>
            {showActions && <TableHead className="text-right font-bold">الإجراءات</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPoems.map((poem) => {
            const canModify = showActions && (isAdmin || user?.id.toString() === poem.created_by.toString());

            return (
              <TableRow key={poem.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <Link
                    to={`/poem/${poem.id}`}
                    className="font-bold text-foreground hover:text-primary transition-colors font-amiri text-lg"
                  >
                    {poem.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="w-4 h-4" />
                    {poem.poet_name}
                  </div>
                </TableCell>
                <TableCell>
                  {poem.occasion ? (
                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold font-cairo whitespace-nowrap">
                      {poem.occasion.name}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {poem.category ? (
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/60 bg-transparent text-[10px] font-bold font-cairo py-0.5 px-3 shadow-sm whitespace-nowrap">
                      {poem.category}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {poem.year ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {poem.year}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-bold text-xs opacity-70">
                    {poem.views_count}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-bold text-xs opacity-70">
                    {poem.downloads_count}
                  </div>
                </TableCell>
                <TableCell>
                  {poem.media_url ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-primary hover:text-primary"
                        onClick={() => incrementDownloads.mutate(poem.id)}
                      >
                        <a href={poem.media_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 ml-1" />
                          معاينة
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleDownload(poem.id, poem.media_url!, poem.title)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                {showActions && canModify && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => onEdit?.(poem)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete?.(poem.id.toString())}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
                {showActions && !canModify && <TableCell />}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
