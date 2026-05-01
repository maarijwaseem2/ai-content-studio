import { useStore } from "@/lib/store";

export default function Admin() {
  const items = useStore((s) => s.items);
  const total = items.length;
  const tones = items.reduce<Record<string, number>>((a, i) => ({ ...a, [i.tone]: (a[i.tone] || 0) + 1 }), {});
  const langs = items.reduce<Record<string, number>>((a, i) => ({ ...a, [i.language]: (a[i.language] || 0) + 1 }), {});
  const topTone = Object.entries(tones).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const topLang = Object.entries(langs).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Mock users
  const users = [
    { name: "Maya Owen", email: "maya@studio.co", gens: 142, plan: "Pro" },
    { name: "James Liu", email: "james@brand.com", gens: 87, plan: "Starter" },
    { name: "Asad Khan", email: "asad@example.com", gens: total, plan: "Starter" },
    { name: "Sarah Chen", email: "sarah@dtc.io", gens: 51, plan: "Free" },
    { name: "Omar Faruq", email: "omar@shop.pk", gens: 312, plan: "Business" },
  ];

  // Activity bars
  const days = Array.from({ length: 14 }, (_, i) => ({
    label: `D${i + 1}`,
    val: 8 + Math.round(Math.sin(i / 2) * 5 + Math.random() * 6),
  }));
  const max = Math.max(...days.map((d) => d.val));

  const stats = [
    { label: "Total users", value: users.length },
    { label: "Total generations", value: total + 593 },
    { label: "Active users (7d)", value: 4 },
    { label: "Avg. credits / user", value: 187 },
    { label: "Most-used tone", value: topTone },
    { label: "Most-used language", value: topLang },
  ];

  return (
    <div className="p-6 md:p-10 max-w-[1280px] mx-auto flex flex-col gap-8">
      <div>
        <div className="label-eyebrow mb-1">Internal</div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin overview</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-card p-5">
            <div className="label-eyebrow">{s.label}</div>
            <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="surface-card p-6 lg:col-span-2">
          <div className="label-eyebrow mb-1">Usage</div>
          <div className="text-base font-medium mb-6">Generations · last 14 days</div>
          <div className="flex items-end justify-between gap-1.5 h-44">
            {days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end h-full">
                  <div
                    className="w-full rounded-t-md bg-foreground/80"
                    style={{ height: `${(day.val / max) * 100}%` }}
                  />
                </div>
                <div className="text-[9px] font-mono text-muted-foreground">{day.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="label-eyebrow mb-1">Distribution</div>
          <div className="text-base font-medium mb-4">Tones used</div>
          <div className="flex flex-col gap-3">
            {Object.entries(tones).length === 0 ? (
              <div className="text-sm text-muted-foreground">No data yet.</div>
            ) : (
              Object.entries(tones).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{k}</span>
                    <span className="font-mono text-muted-foreground">{v}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-foreground" style={{ width: `${(v / Math.max(...Object.values(tones))) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="surface-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="label-eyebrow">Recent users</div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 border-b border-border">
            <tr className="text-left">
              {["Name", "Email", "Generations", "Plan"].map((h) => (
                <th key={h} className="px-6 py-3 label-eyebrow font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.email} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-3 font-medium">{u.name}</td>
                <td className="px-6 py-3 text-muted-foreground font-mono text-xs">{u.email}</td>
                <td className="px-6 py-3 tabular-nums">{u.gens}</td>
                <td className="px-6 py-3"><span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary">{u.plan}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
