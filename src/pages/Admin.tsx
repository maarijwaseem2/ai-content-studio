import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  Activity,
  ShieldCheck,
  Users,
  CreditCard,
  Trash2,
  AlertTriangle,
  Search,
  Sparkles,
  TrendingUp,
  Server,
} from "lucide-react";

type Tab =
  | "overview"
  | "users"
  | "requests"
  | "deletions"
  | "generations";

export default function Admin() {
  const [statsData, setStatsData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usage, setUsage] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [deletions, setDeletions] = useState<any[]>([]);
  const [generations, setGenerations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "VERIFIED" | "PENDING" | "DELETED"
  >("ALL");

  useEffect(() => {
    async function fetchData() {
      try {
        const [s, u, us, r, g, d] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users"),
          api.get("/admin/usage"),
          api.get("/admin/subscription-requests"),
          api.get("/admin/generations"),
          api.get("/admin/deletion-requests"),
        ]);
        setStatsData(s.data);
        setUsers(u.data);
        setUsage(us.data);
        setRequests(r.data);
        setGenerations(g.data);
        setDeletions(d.data);
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
      setActiveTab("users");
    } catch (e) {
      toast.error("Failed to fetch user history.");
    }
  };

  async function approveDeletion(id: string, email: string) {
    if (
      !window.confirm(
        `Permanently delete account "${email}"? This cannot be undone.`,
      )
    )
      return;
    try {
      await api.post(`/admin/deletion-requests/${id}/approve`);
      toast.success(`Account deleted: ${email}`);
      setDeletions((d) => d.filter((x) => x.id !== id));
      setUsers((us) => us.filter((u) => u.email !== email));
    } catch (e) {
      toast.error("Failed to delete account.");
    }
  }

  async function rejectDeletion(id: string) {
    try {
      await api.post(`/admin/deletion-requests/${id}/reject`);
      toast.success("Deletion request rejected.");
      setDeletions((d) => d.filter((x) => x.id !== id));
    } catch (e) {
      toast.error("Failed to reject request.");
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="p-12 text-center">
          <p className="text-sm text-zinc-400 animate-pulse">
            Booting admin control center...
          </p>
        </div>
      </AdminShell>
    );
  }

  const stats = [
    {
      label: "Total users",
      value: statsData?.totalUsers || 0,
      icon: Users,
      accent: "text-sky-400",
    },
    {
      label: "Generations",
      value: statsData?.totalGenerations || 0,
      icon: Sparkles,
      accent: "text-violet-400",
    },
    {
      label: "Active (7d)",
      value: statsData?.activeUsers7d || 0,
      icon: TrendingUp,
      accent: "text-emerald-400",
    },
    {
      label: "Avg. credits",
      value: statsData?.avgCredits || 0,
      icon: CreditCard,
      accent: "text-amber-400",
    },
  ];

  const tonesDistribution = statsData?.tonesDistribution || {};
  const maxTone = Math.max(
    ...(Object.values(tonesDistribution) as number[]),
    1,
  );

  const tabs: { id: Tab; label: string; icon: any; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "users", label: "Users", icon: Users },
    {
      id: "requests",
      label: "Subscriptions",
      icon: CreditCard,
      badge: requests.length,
    },
    {
      id: "deletions",
      label: "Deletions",
      icon: Trash2,
      badge: deletions.length,
    },
    { id: "generations", label: "Feed", icon: Server },
  ];

  const filteredUsers =
    statusFilter === "ALL"
      ? users
      : users.filter((u) => (u.accountStatus || "VERIFIED") === statusFilter);
  const statusCounts = {
    ALL: users.length,
    VERIFIED: users.filter(
      (u) => (u.accountStatus || "VERIFIED") === "VERIFIED",
    ).length,
    PENDING: users.filter((u) => u.accountStatus === "PENDING").length,
    DELETED: users.filter((u) => u.accountStatus === "DELETED").length,
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <ShieldCheck className="size-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-violet-400">
                Admin · Control Center
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
                Mission control
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System operational
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                    active
                      ? "bg-zinc-100 text-zinc-900 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {t.label}
                  {t.badge && t.badge > 0 ? (
                    <span
                      className={`ml-1 min-w-[18px] px-1.5 py-0.5 rounded-full text-[9px] font-mono ${
                        active
                          ? "bg-zinc-900 text-zinc-100"
                          : t.id === "deletions"
                            ? "bg-red-500/20 text-red-300"
                            : "bg-violet-500/20 text-violet-300"
                      }`}
                    >
                      {t.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-10 flex flex-col gap-8">
        {activeTab === "overview" && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                        {s.label}
                      </span>
                      <Icon className={`size-4 ${s.accent}`} />
                    </div>
                    <div className="text-3xl font-semibold tracking-tight tabular-nums text-zinc-50">
                      {s.value}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 lg:col-span-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                  Usage
                </div>
                <div className="text-base font-medium mb-6 text-zinc-100">
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
                          className="w-full rounded-t-md bg-gradient-to-t from-violet-500 to-fuchsia-400"
                          style={{
                            height: `${(day.val / (Math.max(...usage.map((u) => u.val)) || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500">
                        {day.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                  Distribution
                </div>
                <div className="text-base font-medium mb-4 text-zinc-100">
                  Tones used
                </div>
                <div className="flex flex-col gap-3">
                  {Object.entries(tonesDistribution).length === 0 ? (
                    <div className="text-sm text-zinc-500">No data yet.</div>
                  ) : (
                    Object.entries(tonesDistribution).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between text-xs mb-1 text-zinc-300">
                          <span>{k}</span>
                          <span className="font-mono text-zinc-500">
                            {v as number}
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
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
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  All users
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full bg-zinc-800/60 border border-zinc-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:ring-1 ring-violet-500 outline-none"
                  />
                </div>
              </div>

              <div className="px-6 py-3 border-b border-zinc-800 flex flex-wrap gap-2">
                {(
                  ["ALL", "VERIFIED", "PENDING", "DELETED"] as const
                ).map((s) => {
                  const active = statusFilter === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
                        active
                          ? s === "VERIFIED"
                            ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                            : s === "PENDING"
                              ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                              : s === "DELETED"
                                ? "border-red-500/50 bg-red-500/15 text-red-300"
                                : "border-zinc-600 bg-zinc-800 text-zinc-100"
                          : "border-zinc-800 text-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      {s.toLowerCase()} · {statusCounts[s]}
                    </button>
                  );
                })}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900/80 border-b border-zinc-800">
                    <tr className="text-left">
                      {[
                        "Name",
                        "Email",
                        "Status",
                        "Generations",
                        "Plan",
                        "Last Active",
                        "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-sm text-zinc-500"
                        >
                          No users match this filter.
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map((u) => {
                      const status = u.accountStatus || "VERIFIED";
                      const isDeleted = status === "DELETED";
                      return (
                        <tr
                          key={u.id}
                          className={`border-b border-zinc-800 last:border-0 transition-colors ${
                            isDeleted
                              ? "opacity-60 hover:bg-red-950/20"
                              : "hover:bg-zinc-800/40"
                          }`}
                        >
                          <td className="px-6 py-3 font-medium text-xs text-zinc-100">
                            {u.email.split("@")[0]}
                          </td>
                          <td className="px-6 py-3 text-zinc-400 font-mono text-xs">
                            {u.email}
                          </td>
                          <td className="px-6 py-3">
                            <StatusBadge status={status} />
                          </td>
                          <td className="px-6 py-3 tabular-nums text-zinc-200">
                            {u._count.items}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                u.role === "ADMIN"
                                  ? "bg-fuchsia-500/20 text-fuchsia-300"
                                  : "bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              {u.role}
                              {u.subscriptionStatus === "ACTIVE"
                                ? ` / ${u.subscriptionTier}`
                                : ""}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-zinc-500 font-mono text-[10px]">
                            {isDeleted && u.deletedAt
                              ? `deleted ${new Date(u.deletedAt).toLocaleDateString()}`
                              : u.lastUsed
                                ? new Date(u.lastUsed).toLocaleDateString()
                                : "Never"}
                          </td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => fetchUserHistory(u)}
                              className={`text-[10px] font-medium transition-colors ${
                                selectedUser?.id === u.id
                                  ? "text-violet-300"
                                  : "text-zinc-400 hover:text-zinc-100"
                              }`}
                            >
                              View History
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedUser && (
              <div className="rounded-xl border border-violet-500/30 bg-zinc-900/60 p-6 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      Generation History
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100">
                      {selectedUser.email}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-xs text-zinc-400 hover:text-zinc-100"
                  >
                    Close
                  </button>
                </div>

                {userHistory.length === 0 ? (
                  <div className="text-center py-8 text-sm text-zinc-500">
                    No generations found for this user.
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {userHistory.map((h: any) => (
                      <div
                        key={h.id}
                        className="p-4 rounded-lg bg-zinc-800/40 border border-zinc-800"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] bg-zinc-700/60 px-2 py-0.5 rounded font-mono font-medium text-zinc-200">
                            {h.category}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(h.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs font-semibold mb-1 truncate text-zinc-100">
                          {h.productName}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
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
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Subscription Requests
              </div>
            </div>
            {requests.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-500">
                No pending subscription requests.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-zinc-900/80 border-b border-zinc-800">
                  <tr className="text-left">
                    {["User", "Tier", "Requested At", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-zinc-800 last:border-0"
                    >
                      <td className="px-6 py-3 text-xs">
                        <div className="font-medium text-zinc-100">
                          {r.user.email}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {r.userId}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono font-semibold">
                          {r.tier}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-zinc-500 text-xs font-mono">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="px-3 py-1 bg-emerald-500 text-zinc-950 text-[10px] font-medium rounded hover:bg-emerald-400 active:scale-95 transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-medium rounded hover:bg-zinc-700 active:scale-95 transition-all"
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

        {activeTab === "deletions" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
              <AlertTriangle className="size-4 text-red-400 mt-0.5 shrink-0" />
              <div className="text-xs text-zinc-300">
                <span className="font-medium text-red-300">Caution:</span>{" "}
                Approving a deletion permanently removes the user account and
                all of their generated content. This action cannot be undone.
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-800">
                <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Account deletion requests
                </div>
              </div>
              {deletions.length === 0 ? (
                <div className="p-12 text-center text-sm text-zinc-500">
                  No pending deletion requests.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900/80 border-b border-zinc-800">
                    <tr className="text-left">
                      {["User", "Generations", "Reason", "Requested", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {deletions.map((d) => (
                      <tr
                        key={d.id}
                        className="border-b border-zinc-800 last:border-0 align-top"
                      >
                        <td className="px-6 py-3 text-xs">
                          <div className="font-medium text-zinc-100">
                            {d.user.email}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            Joined{" "}
                            {new Date(d.user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-zinc-200 tabular-nums">
                          {d.user._count.items}
                        </td>
                        <td className="px-6 py-3 text-xs text-zinc-400 max-w-xs">
                          {d.reason ? (
                            <span className="italic">"{d.reason}"</span>
                          ) : (
                            <span className="text-zinc-600">No reason given</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-zinc-500 text-xs font-mono">
                          {new Date(d.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                approveDeletion(d.id, d.user.email)
                              }
                              className="px-3 py-1 bg-red-500 text-white text-[10px] font-medium rounded hover:bg-red-400 active:scale-95 transition-all"
                            >
                              Delete account
                            </button>
                            <button
                              onClick={() => rejectDeletion(d.id)}
                              className="px-3 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-medium rounded hover:bg-zinc-700 active:scale-95 transition-all"
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
          </div>
        )}

        {activeTab === "generations" && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Global Generation Feed
              </div>
            </div>
            {generations.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-500">
                No generations recorded yet.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-zinc-900/80 border-b border-zinc-800">
                  <tr className="text-left">
                    {["User", "Product", "Type", "Created At"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generations.map((g) => (
                    <tr
                      key={g.id}
                      className="border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-6 py-3 text-xs font-mono text-zinc-300">
                        {g.user.email}
                      </td>
                      <td className="px-6 py-3 text-xs font-medium text-zinc-100">
                        {g.productName}
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono uppercase">
                          {g.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-zinc-500 font-mono text-[10px]">
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
    </AdminShell>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-950 text-zinc-100">
      <div className="min-h-[calc(100vh-3.5rem)] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.08),transparent_50%)]">
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; cls: string }
  > = {
    VERIFIED: {
      label: "Verified",
      cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    },
    PENDING: {
      label: "Pending OTP",
      cls: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    },
    DELETED: {
      label: "Deleted",
      cls: "bg-red-500/15 text-red-300 border-red-500/40",
    },
  };
  const meta = map[status] || map.VERIFIED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border ${meta.cls}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}
