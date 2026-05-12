import { useMemo, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Trash2, Pencil, Eye, BookmarkX } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function Saved() {
  const allItems = useStore((s) => s.items);
  const items = useMemo(() => allItems.filter((i) => i.saved), [allItems]);
  const setItems = useStore((s) => s.setItems);
  const delItem = useStore((s) => s.deleteItem);
  const toggleSave = useStore((s) => s.toggleSave);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      try {
        const { data } = await api.get("/content/saved");
        const mapped = data.map((it: any) => ({
          ...it,
          input: it.inputJson,
          content: it.outputJson,
          saved: it.isSaved,
          createdAt: new Date(it.createdAt).getTime(),
        }));
        // Note: this replaces the whole store items with ONLY saved items
        // Better to load all and then filter, but for "Saved page" specifically
        // it might be safer to merge or just use a separate fetch
        setItems(mapped);
      } catch (e) {
        toast.error("Failed to load saved items.");
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, [setItems]);

  async function handleDelete(id: string) {
    try {
      await api.delete(`/content/${id}`);
      delItem(id);
      toast.success("Deleted.");
    } catch (e) {
      toast.error("Failed to delete.");
    }
  }

  async function handleUnsave(id: string) {
    try {
      await api.patch(`/content/${id}`, { isSaved: false });
      toggleSave(id);
      toast.success("Removed from bookmarks.");
    } catch (e) {
      toast.error("Failed to update.");
    }
  }
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const cats = useMemo(
    () => Array.from(new Set(items.map((i) => i.category).filter(Boolean))),
    [items],
  );

  const filtered = items.filter(
    (i) =>
      (cat === "all" || i.category === cat) &&
      (i.productName.toLowerCase().includes(q.toLowerCase()) ||
        i.category.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="p-6 md:p-10 max-w-[1280px] mx-auto">
      <div className="mb-8">
        <div className="label-eyebrow mb-1">Library</div>
        <h1 className="text-3xl font-semibold tracking-tight">Saved content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your bookmarked generations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by product or category"
            className="pl-9"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {cats.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <div className="text-base font-medium">Nothing saved yet</div>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Generate content and bookmark your best results.
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <NavLink to="/app/generate">Open generator</NavLink>
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((it) => (
            <div key={it.id} className="surface-card p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <div className="text-base font-semibold truncate">
                    {it.productName}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {it.category || "—"} ·{" "}
                    {new Date(it.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-1 text-[10px]">
                  <span className="px-2 py-0.5 rounded-full bg-secondary font-mono">
                    {it.tone}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {it.content.description}
              </p>
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-border">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  {it.language}
                </span>
                <div className="flex gap-1">
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="size-8"
                  >
                    <NavLink to={`/app/content/${it.id}`}>
                      <Eye className="size-3.5" />
                    </NavLink>
                  </Button>
                  <Button
                    asChild
                    size="icon"
                    variant="ghost"
                    className="size-8"
                  >
                    <NavLink to={`/app/content/${it.id}`}>
                      <Pencil className="size-3.5" />
                    </NavLink>
                  </Button>
                  <Button
                    onClick={() => handleUnsave(it.id)}
                    size="icon"
                    variant="ghost"
                    className="size-8"
                  >
                    <BookmarkX className="size-3.5" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(it.id)}
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
