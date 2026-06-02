import { useEffect, useMemo } from "react";
import { NavLink, Navigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import api from "@/lib/api";
import { getCreditLimit } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileText,
  BookmarkCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const stat = (label: string, value: string | number, hint?: string) => ({
  label,
  value,
  hint,
});

function mapContentItems(items: any[]) {
  return items.map((it: any) => ({
    id: it.id,
    productName: it.productName,
    category: it.category,
    tone: it.tone,
    language: it.language,
    createdAt: new Date(it.createdAt).getTime(),
    input: it.inputJson,
    content: it.outputJson,
    saved: it.isSaved,
  }));
}

export default function Dashboard() {
  const { user, credits, items, setUser, setItems } = useStore();
  const saved = items.filter((i) => i.saved);

  // Always refresh profile + generations so stats & graph stay in sync.
  useEffect(() => {
    if (!user) return;
    Promise.all([api.get("/user/profile"), api.get("/content")])
      .then(([{ data: profile }, { data: content }]) => {
        setUser(profile);
        setItems(mapContentItems(content));
      })
      .catch(() => {});
  }, [user?.id, setUser, setItems]);

  if (user?.role === "ADMIN") {
    return <Navigate to="/app/admin" replace />;
  }

  const creditLimit = getCreditLimit(
    credits,
    user?.subscriptionTier,
    user?.creditLimit,
  );

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = items.filter((i) => i.createdAt >= +monthStart);

  const stats = [
    stat("Total generations", items.length, "all time"),
    stat("Saved content", saved.length, "in library"),
    stat("This month", thisMonth.length, "generations"),
    stat("Credits left", credits, `of ${creditLimit}`),
  ];

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const start = d.getTime();
      const end = start + 86400000;
      return {
        d,
        count: items.filter(
          (it) => it.createdAt >= start && it.createdAt < end,
        ).length,
      };
    });
  }, [items]);

  const maxDay = Math.max(...days.map((x) => x.count), 1);
  const hasActivity = days.some((d) => d.count > 0);

  return (
    <div className="p-6 md:p-10 flex flex-col gap-8 max-w-[1280px] mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="label-eyebrow mb-1">Workspace</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Good to see you.
          </h1>
        </div>
        <Button asChild className="rounded-full">
          <NavLink to="/app/generate">
            <Sparkles className="size-4" /> Quick generate
          </NavLink>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-card p-5">
            <div className="label-eyebrow">{s.label}</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
              {s.value}
            </div>
            {s.hint && (
              <div className="text-xs text-muted-foreground mt-1">{s.hint}</div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="flex justify-between items-baseline mb-6">
            <div>
              <div className="label-eyebrow mb-1">Activity</div>
              <div className="text-base font-medium">Last 7 days</div>
            </div>
            <TrendingUp className="size-4 text-muted-foreground" />
          </div>

          {!hasActivity ? (
            <div className="h-40 flex items-center justify-center text-sm text-muted-foreground border border-dashed border-border rounded-lg">
              No generations in the last 7 days. Create one to see activity here.
            </div>
          ) : (
            <div className="flex items-end justify-between gap-2 h-40">
              {days.map((day, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 h-full"
                >
                  <div className="w-full flex flex-col items-center justify-end flex-1 min-h-0">
                    {day.count > 0 && (
                      <span className="text-[10px] font-mono text-muted-foreground mb-1 tabular-nums">
                        {day.count}
                      </span>
                    )}
                    <div
                      className="w-full bg-foreground/80 rounded-t-md transition-all duration-300"
                      style={{
                        height: `${Math.max((day.count / maxDay) * 100, day.count > 0 ? 8 : 0)}%`,
                        minHeight: day.count > 0 ? 4 : 0,
                      }}
                      title={`${day.count} generation${day.count !== 1 ? "s" : ""}`}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {day.d.toLocaleDateString(undefined, { weekday: "short" })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface-card p-6 flex flex-col">
          <div className="label-eyebrow mb-1">Recent</div>
          <div className="text-base font-medium mb-4">Latest generations</div>
          <div className="flex flex-col gap-2 flex-1">
            {items.slice(0, 5).map((it) => (
              <NavLink
                key={it.id}
                to={`/app/content/${it.id}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-secondary/60 transition-colors"
              >
                <div className="size-8 rounded bg-secondary flex items-center justify-center">
                  <FileText className="size-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate font-medium">
                    {it.productName}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate font-mono">
                    {it.tone} · {it.language}
                  </div>
                </div>
                {it.saved && (
                  <BookmarkCheck className="size-3.5 text-highlight" />
                )}
              </NavLink>
            ))}
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground py-8 text-center">
                No generations yet.
              </div>
            )}
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mt-4 justify-start -mx-2"
          >
            <NavLink to="/app/history">
              View all <ArrowRight className="size-3.5" />
            </NavLink>
          </Button>
        </div>
      </div>
    </div>
  );
}
