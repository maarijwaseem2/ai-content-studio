import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import api from "@/lib/api";
import { toast } from "sonner";

export default function Admin() {
  const [statsData, setStatsData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usage, setUsage] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [generations, setGenerations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "requests" | "generations"
  >("overview");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, u, us, r, g] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/admin/usage"),
          api.get("/admin/subscription-requests"),
          api.get("/admin/generations"),
        ]);
        setStatsData(s.data);
        setUsers(u.data);
        setUsage(us.data);
        setRequests(r.data);
        setGenerations(g.data);
      } catch (e) {
        toast.error("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSearch = async (val: string) => {
    setSearchTerm(val);
    try {
      const { data } = await api.get(`/admin/users?search=${val}`);
      setUsers(data);
    } catch (e) {
      toast.error("Search failed.");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.post(`/admin/subscription-requests/${id}/approve`);
      toast.success("Request approved and credits added!");
      setRequests(requests.filter((r) => r.id !== id));
    } catch (e) {
      toast.error("Failed to approve request.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/admin/subscription-requests/${id}/reject`);
      toast.success("Request rejected.");
      setRequests(requests.filter((r) => r.id !== id));
    } catch (e) {
      toast.error("Failed to reject request.");
    }
  };

  const fetchUserHistory = async (user: any) => {
    try {
      setSelectedUser(user);
      const { data } = await api.get(`/admin/users/${user.id}/content`);
      setUserHistory(data);
      setActiveTab("users"); // Ensure we stay on users tab or we'll add a sub-state
    } catch (e) {
      toast.error("Failed to fetch user history.");
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading Admin Dashboard...
        </p>
      </div>
    );
  }

  const stats = [
    { label: "Total users", value: statsData?.totalUsers || 0 },
    { label: "Total generations", value: statsData?.totalGenerations || 0 },
    { label: "Active users (7d)", value: statsData?.activeUsers7d || 0 },
    { label: "Avg. credits / user", value: statsData?.avgCredits || 0 },
  ];

  const tonesDistribution = statsData?.tonesDistribution || {};
  const maxTone = Math.max(
    ...(Object.values(tonesDistribution) as number[]),
    1,
  );

  return (
    <div className="p-6 md:p-10 max-w-[1280px] mx-auto flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="label-eyebrow mb-1">Internal</div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Admin portal
          </h1>
        </div>
        <div className="flex bg-secondary/50 p-1 rounded-lg">
          {(["overview", "users", "requests", "generations"] as const).map(
            (t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === t
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === "requests" && requests.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-highlight text-[8px] font-mono text-black">
                    {requests.length}
                  </span>
                )}
              </button>
            ),
          )}
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="surface-card p-5">
                <div className="label-eyebrow">{s.label}</div>
                <div className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="surface-card p-6 lg:col-span-2">
              <div className="label-eyebrow mb-1">Usage</div>
              <div className="text-base font-medium mb-6">
                Generations · last 14 days
              </div>
              <div className="flex items-end justify-between gap-1.5 h-44">
                {usage.map((day, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div className="w-full flex items-end h-full">
                      <div
                        className="w-full rounded-t-md bg-foreground/80"
                        style={{
                          height: `${(day.val / (Math.max(...usage.map((u) => u.val)) || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground">
                      {day.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card p-6">
              <div className="label-eyebrow mb-1">Distribution</div>
              <div className="text-base font-medium mb-4">Tones used</div>
              <div className="flex flex-col gap-3">
                {Object.entries(tonesDistribution).length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No data yet.
                  </div>
                ) : (
                  Object.entries(tonesDistribution).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{k}</span>
                        <span className="font-mono text-muted-foreground">
                          {v as number}
                        </span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground"
                          style={{
                            width: `${((v as number) / maxTone) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="flex flex-col gap-6">
          <div className="surface-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="label-eyebrow">All users</div>
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full bg-secondary/50 border-none rounded-md px-3 py-1.5 text-xs focus:ring-1 ring-highlight outline-none"
                />
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border">
                <tr className="text-left">
                  {[
                    "Name",
                    "Email",
                    "Generations",
                    "Plan",
                    "Last Active",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-6 py-3 label-eyebrow font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-xs">
                      {u.email.split("@")[0]}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground font-mono text-xs">
                      {u.email}
                    </td>
                    <td className="px-6 py-3 tabular-nums">{u._count.items}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${u.role === "ADMIN" ? "bg-highlight text-black" : "bg-secondary"}`}
                      >
                        {u.role}
                        {u.subscriptionStatus === "ACTIVE"
                          ? ` / ${u.subscriptionTier}`
                          : ""}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground font-mono text-[10px]">
                      {u.lastUsed
                        ? new Date(u.lastUsed).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => fetchUserHistory(u)}
                        className={`text-[10px] font-medium transition-colors ${selectedUser?.id === u.id ? "text-highlight" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedUser && (
            <div className="surface-card p-6 border-2 border-highlight/20 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="label-eyebrow">Generation History</div>
                  <h3 className="text-lg font-semibold">
                    {selectedUser.email}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Close
                </button>
              </div>

              {userHistory.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No generations found for this user.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {userHistory.map((h: any) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-lg bg-secondary/30 border border-border"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] bg-foreground/10 px-2 py-0.5 rounded font-mono font-medium">
                          {h.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs font-semibold mb-1 truncate">
                        {h.productName}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {h.outputJson?.description || "No description"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <div className="surface-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="label-eyebrow">Subscription Requests</div>
          </div>
          {requests.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No pending subscription requests.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border">
                <tr className="text-left">
                  {["User", "Tier", "Requested At", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 label-eyebrow font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-6 py-3 text-xs">
                      <div className="font-medium">{r.user.email}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {r.userId}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[10px] bg-highlight/20 text-highlight-foreground px-2 py-0.5 rounded-full font-mono font-semibold">
                        {r.tier}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground text-xs font-mono">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="px-3 py-1 bg-foreground text-background text-[10px] font-medium rounded hover:opacity-90 active:scale-95 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          className="px-3 py-1 bg-secondary text-foreground text-[10px] font-medium rounded hover:bg-secondary/80 active:scale-95 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {activeTab === "generations" && (
        <div className="surface-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <div className="label-eyebrow">Global Generation Feed</div>
          </div>
          {generations.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No generations recorded yet.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border">
                <tr className="text-left">
                  {["User", "Product", "Type", "Created At"].map((h) => (
                    <th key={h} className="px-6 py-3 label-eyebrow font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {generations.map((g) => (
                  <tr
                    key={g.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-6 py-3 text-xs font-mono">
                      {g.user.email}
                    </td>
                    <td className="px-6 py-3 text-xs font-medium">
                      {g.productName}
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-[10px] bg-secondary px-2 py-0.5 rounded font-mono uppercase">
                        {g.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground font-mono text-[10px]">
                      {new Date(g.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
