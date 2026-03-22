"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ShieldCheck,
  Users,
  Briefcase,
  Building2,
  Award,
  Gift,
  TrendingUp,
  Activity,
  Server,
  Database,
  Globe,
  Clock,
  Search,
  MoreHorizontal,
  Trash2,
  UserCog,
  Eye,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  HardDrive,
  Wifi,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ──────────────────────────────────────────────────
interface AdminUser {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  candidate?: { id: string } | null;
  employer?: { id: string; companyName: string } | null;
  agency?: { id: string; agencyName: string } | null;
}

interface StatsData {
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
    newThisWeek: number;
    newThisMonth: number;
  };
  platform: {
    totalCandidates: number;
    totalClients: number;
    totalJobs: number;
    totalPlacements: number;
    totalReferrals: number;
    totalApplications: number;
  };
  revenue: {
    total: number;
    paid: number;
    pending: number;
  };
  activityByType: Record<string, number>;
}

interface SystemData {
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: number;
    uptimeFormatted: string;
    memory: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      rssFormatted: string;
      heapUsedFormatted: string;
      heapTotalFormatted: string;
    };
  };
  database: {
    type: string;
    records: Record<string, number>;
  };
  integrations: Record<
    string,
    { configured: boolean; label: string }
  >;
}

interface LogEntry {
  id: string;
  type: string;
  title: string;
  content: string | null;
  userId: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

// ─── Constants ──────────────────────────────────────────────
const ROLES = ["ALL", "ADMIN", "RECRUITER", "EMPLOYER", "CANDIDATE", "AGENCY"];
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  RECRUITER: "bg-blue-100 text-blue-700",
  EMPLOYER: "bg-purple-100 text-purple-700",
  CANDIDATE: "bg-green-100 text-green-700",
  AGENCY: "bg-orange-100 text-orange-700",
};
const PIE_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

const TRAFFIC_SOURCES = [
  { name: "Direct", value: 42 },
  { name: "Google", value: 28 },
  { name: "LinkedIn", value: 18 },
  { name: "Referral", value: 12 },
];

const TOP_PAGES = [
  { page: "/", views: 1240, unique: 890 },
  { page: "/jobs", views: 856, unique: 654 },
  { page: "/employers", views: 432, unique: 321 },
  { page: "/candidates", views: 387, unique: 298 },
  { page: "/pricing", views: 265, unique: 198 },
  { page: "/register", views: 198, unique: 176 },
];

const UK_REGIONS = [
  { name: "London", visitors: 340 },
  { name: "South East", visitors: 180 },
  { name: "North West", visitors: 150 },
  { name: "West Midlands", visitors: 120 },
  { name: "Yorkshire", visitors: 95 },
  { name: "Scotland", visitors: 85 },
  { name: "East Midlands", visitors: 70 },
  { name: "South West", visitors: 65 },
];

// ─── Main Component ─────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [system, setSystem] = useState<SystemData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logTypes, setLogTypes] = useState<string[]>([]);

  // Users tab state
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Logs tab state
  const [logTypeFilter, setLogTypeFilter] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(1);

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Role change dialog
  const [roleTarget, setRoleTarget] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // ─── Auth check ─────────────────────────────────────────
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.role !== "ADMIN") {
          router.push("/crm");
          return;
        }
        setLoading(false);
      })
      .catch(() => router.push("/crm"));
  }, [router]);

  // ─── Data fetching ──────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setStats(await res.json());
    } catch {
      /* silent */
    }
  }, []);

  const fetchSystem = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/system");
      if (res.ok) setSystem(await res.json());
    } catch {
      /* silent */
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (userSearch) params.set("search", userSearch);
      if (userRoleFilter !== "ALL") params.set("role", userRoleFilter);
      if (userStatusFilter !== "all") params.set("status", userStatusFilter);
      params.set("page", String(userPage));
      params.set("limit", "20");
      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setUserTotal(data.pagination.total);
        setUserTotalPages(data.pagination.totalPages);
      }
    } catch {
      /* silent */
    }
  }, [userSearch, userRoleFilter, userStatusFilter, userPage]);

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (logTypeFilter) params.set("type", logTypeFilter);
      params.set("page", String(logPage));
      params.set("limit", "20");
      const res = await fetch(`/api/admin/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setLogTypes(data.activityTypes);
        setLogTotal(data.pagination.total);
        setLogTotalPages(data.pagination.totalPages);
      }
    } catch {
      /* silent */
    }
  }, [logTypeFilter, logPage]);

  useEffect(() => {
    if (!loading) {
      fetchStats();
      fetchSystem();
      fetchUsers();
      fetchLogs();
    }
  }, [loading, fetchStats, fetchSystem, fetchUsers, fetchLogs]);

  // Polling for logs
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [loading, fetchLogs]);

  // ─── Handlers ───────────────────────────────────────────
  async function handleToggleActive(user: AdminUser) {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        toast.success(`User ${user.isActive ? "deactivated" : "activated"}`);
        fetchUsers();
      } else {
        toast.error("Failed to update user");
      }
    } catch {
      toast.error("Failed to update user");
    }
  }

  async function handleDeleteUser() {
    if (!deleteTarget || deleteConfirm !== "DELETE") return;
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmToken: "DELETE" }),
      });
      if (res.ok) {
        toast.success("User deleted");
        setDeleteDialogOpen(false);
        setDeleteTarget(null);
        setDeleteConfirm("");
        fetchUsers();
        fetchStats();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete user");
      }
    } catch {
      toast.error("Failed to delete user");
    }
  }

  async function handleChangeRole() {
    if (!roleTarget || !newRole) return;
    try {
      const res = await fetch(`/api/admin/users/${roleTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        toast.success(`Role changed to ${newRole}`);
        setRoleDialogOpen(false);
        setRoleTarget(null);
        setNewRole("");
        fetchUsers();
        fetchStats();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to change role");
      }
    } catch {
      toast.error("Failed to change role");
    }
  }

  async function handleBulkDelete() {
    if (selectedUsers.size === 0) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: Array.from(selectedUsers),
          confirmToken: "DELETE",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Deleted ${data.deletedCount} users`);
        setSelectedUsers(new Set());
        fetchUsers();
        fetchStats();
      }
    } catch {
      toast.error("Bulk delete failed");
    }
  }

  function handleExportCSV() {
    const headers = ["Name", "Email", "Role", "Status", "Joined"];
    const rows = users.map((u) => [
      `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      u.email,
      u.role,
      u.isActive ? "Active" : "Inactive",
      new Date(u.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  function handleExportLogs() {
    const headers = ["Date", "Type", "Title", "User", "Content"];
    const rows = logs.map((l) => [
      new Date(l.createdAt).toLocaleString(),
      l.type,
      l.title,
      l.user ? l.user.email : "System",
      l.content || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activity-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Logs exported");
  }

  function toggleUserSelection(userId: string) {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function toggleAllUsers() {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  }

  // ─── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  // ─── Derived data ───────────────────────────────────────
  const roleChartData = stats
    ? Object.entries(stats.users.byRole).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  const platformChartData = stats
    ? [
        { name: "Candidates", value: stats.platform.totalCandidates },
        { name: "Clients", value: stats.platform.totalClients },
        { name: "Jobs", value: stats.platform.totalJobs },
        { name: "Placements", value: stats.platform.totalPlacements },
        { name: "Applications", value: stats.platform.totalApplications },
      ]
    : [];

  const memoryPercent = system
    ? Math.round((system.system.memory.heapUsed / system.system.memory.heapTotal) * 100)
    : 0;

  // ─── Render ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="size-7 text-indigo-600" />
            Super Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage users, monitor system health, and view analytics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchStats();
            fetchSystem();
            fetchUsers();
            fetchLogs();
            toast.success("Data refreshed");
          }}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="size-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="traffic">
            <Globe className="size-4" />
            <span className="hidden sm:inline">Traffic</span>
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <Activity className="size-4" />
            <span className="hidden sm:inline">Monitoring</span>
          </TabsTrigger>
          <TabsTrigger value="system">
            <Server className="size-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
          <TabsTrigger value="logs">
            <FileText className="size-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════ OVERVIEW TAB ════════════════════ */}
        <TabsContent value="overview">
          <div className="space-y-6 pt-4">
            {/* Stat cards row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{stats?.users.total || 0}</p>
                    </div>
                    <Users className="size-8 text-indigo-500 opacity-50" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats?.users.active || 0} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">New This Week</p>
                      <p className="text-2xl font-bold">{stats?.users.newThisWeek || 0}</p>
                    </div>
                    <TrendingUp className="size-8 text-green-500 opacity-50" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats?.users.newThisMonth || 0} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Placements</p>
                      <p className="text-2xl font-bold">
                        {stats?.platform.totalPlacements || 0}
                      </p>
                    </div>
                    <Award className="size-8 text-purple-500 opacity-50" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stats?.platform.totalApplications || 0} applications
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="text-2xl font-bold">
                        {"\u00A3"}
                        {((stats?.revenue.total || 0) / 100).toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="size-8 text-emerald-500 opacity-50" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {"\u00A3"}{((stats?.revenue.paid || 0) / 100).toLocaleString()} paid
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Users by Role Pie */}
              <Card>
                <CardHeader>
                  <CardTitle>Users by Role</CardTitle>
                </CardHeader>
                <CardContent>
                  {roleChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={roleChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {roleChartData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Platform Stats Bar */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  {platformChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={platformChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Platform detail cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Candidates", value: stats?.platform.totalCandidates, icon: Users, color: "text-blue-600" },
                { label: "Clients", value: stats?.platform.totalClients, icon: Building2, color: "text-purple-600" },
                { label: "Jobs", value: stats?.platform.totalJobs, icon: Briefcase, color: "text-indigo-600" },
                { label: "Placements", value: stats?.platform.totalPlacements, icon: Award, color: "text-green-600" },
                { label: "Referrals", value: stats?.platform.totalReferrals, icon: Gift, color: "text-orange-600" },
                { label: "Applications", value: stats?.platform.totalApplications, icon: FileText, color: "text-pink-600" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.label}>
                    <CardContent className="pt-2 text-center">
                      <Icon className={`mx-auto size-6 ${item.color} opacity-60`} />
                      <p className="mt-1 text-xl font-bold">{item.value || 0}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    const tabEl = document.querySelector('[data-slot="tabs-trigger"][value="users"]') as HTMLElement;
                    tabEl?.click();
                  }}
                >
                  <UserCog className="size-4" />
                  Manage Users
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const tabEl = document.querySelector('[data-slot="tabs-trigger"][value="logs"]') as HTMLElement;
                    tabEl?.click();
                  }}
                >
                  <FileText className="size-4" />
                  View Logs
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const tabEl = document.querySelector('[data-slot="tabs-trigger"][value="monitoring"]') as HTMLElement;
                    tabEl?.click();
                  }}
                >
                  <Activity className="size-4" />
                  System Status
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════ USERS TAB ════════════════════ */}
        <TabsContent value="users">
          <div className="space-y-4 pt-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-9"
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                />
              </div>

              <Select
                value={userRoleFilter}
                onValueChange={(val: string | null) => {
                  setUserRoleFilter(val ?? "ALL");
                  setUserPage(1);
                }}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={userStatusFilter}
                onValueChange={(val: string | null) => {
                  setUserStatusFilter(val ?? "all");
                  setUserPage(1);
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-2">
                {selectedUsers.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="size-4" />
                    Delete ({selectedUsers.size})
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="size-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            users.length > 0 && selectedUsers.size === users.length
                          }
                          onCheckedChange={toggleAllUsers}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.has(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {user.firstName || ""} {user.lastName || ""}
                            {!user.firstName && !user.lastName && (
                              <span className="text-muted-foreground">No name</span>
                            )}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role] || "bg-gray-100 text-gray-700"}`}
                            >
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => handleToggleActive(user)}
                              size="sm"
                            />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <button className="rounded p-1 hover:bg-gray-100">
                                  <MoreHorizontal className="size-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/crm/settings`)
                                  }
                                >
                                  <Eye className="size-4" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setRoleTarget(user);
                                    setNewRole(user.role);
                                    setRoleDialogOpen(true);
                                  }}
                                >
                                  <UserCog className="size-4" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleActive(user)}
                                >
                                  {user.isActive ? (
                                    <>
                                      <XCircle className="size-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="size-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => {
                                    setDeleteTarget(user);
                                    setDeleteConfirm("");
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="size-4" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {userTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(userPage - 1) * 20 + 1}-
                  {Math.min(userPage * 20, userTotal)} of {userTotal}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm">
                    Page {userPage} of {userTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={userPage >= userTotalPages}
                    onClick={() => setUserPage((p) => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ════════════════════ TRAFFIC TAB ════════════════════ */}
        <TabsContent value="traffic">
          <div className="space-y-6 pt-4">
            {/* GA notice */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-800">
                      Connect Google Analytics for live data
                    </p>
                    <p className="mt-1 text-sm text-amber-700">
                      Add your GA Measurement ID to the environment variable{" "}
                      <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs">
                        NEXT_PUBLIC_GA_MEASUREMENT_ID
                      </code>{" "}
                      to enable real-time analytics tracking. The data below is placeholder data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Page Views (Today)", value: "1,247", sub: "Week: 8,432 | Month: 34,218" },
                { label: "Unique Visitors", value: "892", sub: "48% returning visitors" },
                { label: "Bounce Rate", value: "34.2%", sub: "Down 2.1% from last week" },
                { label: "Avg Session Duration", value: "4m 32s", sub: "Up 12s from last week" },
              ].map((card) => (
                <Card key={card.label}>
                  <CardContent className="pt-2">
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Top Pages */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                        <TableHead className="text-right">Unique</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {TOP_PAGES.map((page) => (
                        <TableRow key={page.page}>
                          <TableCell className="font-mono text-sm">
                            {page.page}
                          </TableCell>
                          <TableCell className="text-right">
                            {page.views.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {page.unique.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Traffic Sources Pie */}
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={TRAFFIC_SOURCES}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {TRAFFIC_SOURCES.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Geographic distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution (UK Regions)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={UK_REGIONS} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="visitors" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════ MONITORING TAB ════════════════════ */}
        <TabsContent value="monitoring">
          <div className="space-y-6 pt-4">
            {/* Health cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-2">
                  <div className="flex items-center gap-2">
                    <Server className="size-5 text-green-600" />
                    <span className="text-sm font-medium">Server Status</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="size-3 rounded-full bg-green-500" />
                    <span className="text-sm font-semibold text-green-700">Online</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Uptime: {system?.system.uptimeFormatted || "..."}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-2">
                  <div className="flex items-center gap-2">
                    <Database className="size-5 text-blue-600" />
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="size-3 rounded-full bg-green-500" />
                    <span className="text-sm font-semibold text-green-700">Connected</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {system?.database.type || "SQLite"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-5 text-purple-600" />
                    <span className="text-sm font-medium">Memory Usage</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm">
                      <span>{system?.system.memory.heapUsedFormatted || "..."}</span>
                      <span className="text-muted-foreground">
                        {system?.system.memory.heapTotalFormatted || "..."}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all ${memoryPercent > 80 ? "bg-red-500" : memoryPercent > 60 ? "bg-amber-500" : "bg-green-500"}`}
                        style={{ width: `${memoryPercent}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {memoryPercent}% used
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-amber-600" />
                    <span className="text-sm font-medium">Process Info</span>
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">RSS: </span>
                      {system?.system.memory.rssFormatted || "..."}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Platform: </span>
                      {system?.system.platform || "..."} ({system?.system.arch || "..."})
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* External services */}
            <Card>
              <CardHeader>
                <CardTitle>External Services</CardTitle>
                <CardDescription>
                  Service status based on environment configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {system?.integrations &&
                    Object.entries(system.integrations).map(([key, svc]) => (
                      <div
                        key={key}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        {svc.configured ? (
                          <CheckCircle2 className="size-5 text-green-600" />
                        ) : (
                          <XCircle className="size-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{svc.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {svc.configured ? "Configured" : "Not configured"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent errors */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Logs</CardTitle>
                <CardDescription>Last 20 activities</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                          No activity logs
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.slice(0, 20).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
                              {log.type}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate text-sm">
                            {log.title}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.user
                              ? `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim() || log.user.email
                              : "System"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════ SYSTEM TAB ════════════════════ */}
        <TabsContent value="system">
          <div className="space-y-6 pt-4">
            {/* Environment info */}
            <Card>
              <CardHeader>
                <CardTitle>Environment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Node Version</p>
                    <p className="font-mono font-medium">
                      {system?.system.nodeVersion || "..."}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Database</p>
                    <p className="font-mono font-medium">
                      {system?.database.type || "SQLite"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Platform</p>
                    <p className="font-mono font-medium">
                      {system?.system.platform || "..."} / {system?.system.arch || "..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature flags */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Configuration</CardTitle>
                <CardDescription>
                  Integration and feature status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {system?.integrations &&
                    Object.entries(system.integrations).map(([key, svc]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Wifi className="size-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{svc.label}</span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${svc.configured ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {svc.configured ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Database stats */}
            <Card>
              <CardHeader>
                <CardTitle>Database Records</CardTitle>
                <CardDescription>
                  Total records per model
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {system?.database.records &&
                    Object.entries(system.database.records).map(
                      ([model, count]) => (
                        <div
                          key={model}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <span className="text-sm capitalize">{model}</span>
                          <span className="font-mono font-semibold">
                            {(count as number).toLocaleString()}
                          </span>
                        </div>
                      )
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Cache management */}
            <Card>
              <CardHeader>
                <CardTitle>Cache Management</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.success(
                      "Cache clear must be done via CLI: rm -rf .next"
                    );
                  }}
                >
                  <HardDrive className="size-4" />
                  Clear Build Cache
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    fetchStats();
                    fetchSystem();
                    toast.success("Stats refreshed");
                  }}
                >
                  <RefreshCw className="size-4" />
                  Refresh Stats
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ════════════════════ LOGS TAB ════════════════════ */}
        <TabsContent value="logs">
          <div className="space-y-4 pt-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={logTypeFilter || "__all__"}
                onValueChange={(val: string | null) => {
                  setLogTypeFilter(!val || val === "__all__" ? "" : val);
                  setLogPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Types</SelectItem>
                  {logTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportLogs}>
                  <Download className="size-4" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={fetchLogs}>
                  <RefreshCw className="size-4" />
                  Refresh
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-green-50 px-3 py-2 text-xs text-green-700">
              <span className="mr-1 inline-block size-2 rounded-full bg-green-500" />
              Auto-refreshing every 10 seconds
            </div>

            {/* Logs table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          No logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
                              {log.type}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate text-sm">
                            {log.title}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.user
                              ? `${log.user.firstName || ""} ${log.user.lastName || ""}`.trim() ||
                                log.user.email
                              : "System"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {log.content || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {logTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(logPage - 1) * 20 + 1}-
                  {Math.min(logPage * 20, logTotal)} of {logTotal}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logPage <= 1}
                    onClick={() => setLogPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm">
                    Page {logPage} of {logTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logPage >= logTotalPages}
                    onClick={() => setLogPage((p) => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ═══════════ DELETE DIALOG ═══════════ */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user{" "}
              <strong>{deleteTarget?.email}</strong> and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== "DELETE"}
              onClick={handleDeleteUser}
            >
              <Trash2 className="size-4" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════ ROLE CHANGE DIALOG ═══════════ */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for <strong>{roleTarget?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={newRole} onValueChange={(val: string | null) => setNewRole(val ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.filter((r) => r !== "ALL").map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleChangeRole}>Save Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
