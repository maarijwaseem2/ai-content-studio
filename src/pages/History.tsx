import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function History() {
  const items = useStore((s) => s.items);
  const setItems = useStore((s) => s.setItems);
  const delItem = useStore((s) => s.deleteItem);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data } = await api.get("/content");
        // Map backend fields to frontend store format if necessary
        const mapped = data.map((it: any) => ({
          ...it,
          input: it.inputJson,
          content: it.outputJson,
          saved: it.isSaved,
          createdAt: new Date(it.createdAt).getTime(),
        }));
        setItems(mapped);
      } catch (e) {
        toast.error("Failed to load history.");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
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

  return (
    <div className="p-6 md:p-10 max-w-[1280px] mx-auto">
      <div className="mb-8 flex justify-between items-end flex-wrap gap-3">
        <div>
          <div className="label-eyebrow mb-1">Activity</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Generation history
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every piece of content you've generated.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <NavLink to="/app/generate">
            <Sparkles className="size-4" /> New generation
          </NavLink>
        </Button>
      </div>

      {loading ? (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <p className="text-sm text-muted-foreground">No history yet.</p>
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 border-b border-border">
              <tr className="text-left">
                {[
                  "Product",
                  "Category",
                  "Tone",
                  "Language",
                  "Date",
                  "Status",
                  "",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 label-eyebrow font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr
                  key={it.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{it.productName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {it.category || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary">
                      {it.tone}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {it.language}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {new Date(it.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <span className="size-1.5 rounded-full bg-highlight" />{" "}
                      Completed
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        className="size-7"
                      >
                        <NavLink to={`/app/content/${it.id}`}>
                          <Eye className="size-3.5" />
                        </NavLink>
                      </Button>
                      <Button
                        onClick={() => handleDelete(it.id)}
                        size="icon"
                        variant="ghost"
                        className="size-7 text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
