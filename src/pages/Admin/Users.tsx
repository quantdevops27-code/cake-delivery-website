import { useState } from "react";
import { Mail, Phone, Plus, Search, ShieldCheck, Trash2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { adminModuleLabels, adminModules, type AdminModule } from "@contracts/admin-permissions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type UserRole = "user" | "admin" | "manager" | "supervisor";
type UserStatus = "active" | "inactive" | "blocked";
type AuthProvider = "mobile" | "google" | "email" | "demo";

type ManagedUser = {
  id: number;
  unionId: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  role: UserRole;
  status: UserStatus;
  authProvider: AuthProvider;
  permissions: string[];
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  lastSignInAt: Date | string;
  totalOrders: number;
  totalSpent: number;
};

type UserForm = {
  id?: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  authProvider: AuthProvider;
  permissions: AdminModule[];
  notes: string;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  phone: "",
  role: "user",
  status: "active",
  authProvider: "mobile",
  permissions: [],
  notes: "",
};

function formatDate(value?: Date | string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString();
}

function statusClass(status: UserStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-700";
  if (status === "blocked") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

export default function Users() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<UserForm>(emptyForm);

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.users.list.useQuery({
    search: search || undefined,
    role,
    status,
    page,
    limit: 20,
  });

  const createUser = trpc.users.create.useMutation({
    onSuccess: async () => {
      toast.success("User created");
      setDialogOpen(false);
      setForm(emptyForm);
      await utils.users.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateUser = trpc.users.update.useMutation({
    onSuccess: async () => {
      toast.success("User updated");
      setDialogOpen(false);
      setForm(emptyForm);
      await utils.users.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteUser = trpc.users.delete.useMutation({
    onSuccess: async () => {
      toast.success("User deleted");
      await utils.users.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const openCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (user: ManagedUser) => {
    setForm({
      id: user.id,
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      role: user.role,
      status: user.status,
      authProvider: user.authProvider,
      permissions: user.permissions.filter((item): item is AdminModule =>
        adminModules.includes(item as AdminModule),
      ),
      notes: user.notes ?? "",
    });
    setDialogOpen(true);
  };

  const saveUser = () => {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: form.status,
      authProvider: form.authProvider,
      permissions: form.role === "admin" ? [] : form.permissions,
      notes: form.notes.trim(),
    };

    if (!payload.name) {
      toast.error("User name is required");
      return;
    }

    if (form.id) {
      updateUser.mutate({ id: form.id, ...payload });
      return;
    }

    createUser.mutate(payload);
  };

  const totalAdmins = data?.items.filter((user) => user.role === "admin").length ?? 0;
  const staffUsers = data?.items.filter((user) => ["manager", "supervisor"].includes(user.role)).length ?? 0;
  const activeUsers = data?.items.filter((user) => user.status === "active").length ?? 0;

  const togglePermission = (module: AdminModule) => {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(module)
        ? current.permissions.filter((item) => item !== module)
        : [...current.permissions, module],
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#6B3A3A]">User Management</h2>
            <p className="text-sm text-[#1A1A1A]/50">
              Manage login identities, admin access, status and account notes.
            </p>
          </div>
          <Button onClick={openCreate} className="rounded-full bg-[#6B3A3A] text-white hover:bg-[#512929]">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B3A3A]/50">Users</p>
            <p className="mt-2 text-2xl font-semibold text-[#6B3A3A]">{data?.total ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B3A3A]/50">Active</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">{activeUsers}</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6B3A3A]/50">Staff</p>
            <p className="mt-2 text-2xl font-semibold text-[#6B3A3A]">{staffUsers + totalAdmins}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_170px_170px]">
            <label className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/35" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="h-12 w-full rounded-full border border-[#6B3A3A]/15 bg-white px-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B3A3A]/20"
                placeholder="Search name, email, phone, login id..."
              />
            </label>
            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value as UserRole | "all");
                setPage(1);
              }}
              className="h-12 rounded-full border border-[#6B3A3A]/15 bg-white px-4 text-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="manager">Managers</option>
              <option value="supervisor">Supervisors</option>
              <option value="user">Users</option>
            </select>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as UserStatus | "all");
                setPage(1);
              }}
              className="h-12 rounded-full border border-[#6B3A3A]/15 bg-white px-4 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white/70">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#6B3A3A]/10 bg-[#F8EDEB]/70 text-left text-[#1A1A1A]/50">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-[#1A1A1A]/45" colSpan={6}>
                      Loading users...
                    </td>
                  </tr>
                ) : data?.items.length ? (
                  data.items.map((user) => (
                    <tr key={user.id} className="border-b border-[#6B3A3A]/5 transition-colors hover:bg-[#F8EDEB]/35">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name ?? ""} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B3A3A] text-sm font-semibold text-white">
                              {(user.name ?? "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-[#6B3A3A]">{user.name ?? "Unnamed user"}</p>
                            <p className="font-mono text-xs text-[#1A1A1A]/45">{user.unionId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-2 text-xs text-[#1A1A1A]/60">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email ?? "No email"}
                        </p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-[#1A1A1A]/60">
                          <Phone className="h-3.5 w-3.5" />
                          {user.phone ?? "No mobile"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${user.role === "admin" ? "bg-[#6B3A3A] text-white" : "bg-[#6B3A3A]/8 text-[#6B3A3A]"}`}>
                          {user.role === "admin" && <ShieldCheck className="h-3.5 w-3.5" />}
                          {user.role}
                        </span>
                        <p className="mt-1 text-xs capitalize text-[#1A1A1A]/45">{user.authProvider} login</p>
                        {user.role !== "admin" && user.permissions.length > 0 && (
                          <p className="mt-1 max-w-40 truncate text-xs text-[#1A1A1A]/45">
                            {user.permissions.map((item) => adminModuleLabels[item as AdminModule] ?? item).join(", ")}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-[#1A1A1A]/60">Last login: {formatDate(user.lastSignInAt)}</p>
                        <p className="text-xs text-[#1A1A1A]/60">
                          {user.totalOrders} orders | Rs.{user.totalSpent.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => openEdit(user as ManagedUser)}>
                            <UserCog className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full border-red-200 text-xs text-red-600 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm(`Delete ${user.name ?? "this user"}?`)) {
                                deleteUser.mutate({ id: user.id });
                              }
                            }}
                            disabled={user.role === "admin"}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center text-[#1A1A1A]/45" colSpan={6}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: data.totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPage(pageNumber)}
                className={`h-10 w-10 rounded-full text-sm font-semibold ${
                  pageNumber === page
                    ? "bg-[#6B3A3A] text-white"
                    : "border border-[#6B3A3A]/15 bg-white/75 text-[#6B3A3A]"
                }`}
              >
                {pageNumber}
              </button>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-[#6B3A3A]">
                {form.id ? "Edit User" : "Add User"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/55">Name</span>
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="admin-input" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/55">Mobile</span>
                <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="admin-input" />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/55">Email</span>
                <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="admin-input" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/55">Role</span>
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })} className="admin-input">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/55">Status</span>
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as UserStatus })} className="admin-input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="blocked">Blocked</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/55">Login Provider</span>
                <select value={form.authProvider} onChange={(event) => setForm({ ...form, authProvider: event.target.value as AuthProvider })} className="admin-input">
                  <option value="mobile">Mobile OTP</option>
                  <option value="google">Google</option>
                  <option value="email">Email</option>
                  <option value="demo">Demo</option>
                </select>
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B3A3A]/55">Admin Notes</span>
                <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="admin-input min-h-24" />
              </label>
              {form.role === "admin" ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 sm:col-span-2">
                  Admin role gets full backend and admin panel access automatically.
                </div>
              ) : form.role === "manager" || form.role === "supervisor" ? (
                <div className="space-y-3 rounded-2xl border border-[#6B3A3A]/10 bg-[#F8EDEB]/60 p-4 sm:col-span-2">
                  <div>
                    <p className="text-sm font-semibold text-[#6B3A3A]">Module Access</p>
                    <p className="text-xs text-[#1A1A1A]/50">
                      Select exactly what this {form.role} can open and edit.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {adminModules
                      .filter((module) => module !== "users")
                      .map((module) => (
                        <label
                          key={module}
                          className="flex items-center gap-2 rounded-xl border border-[#6B3A3A]/10 bg-white/75 px-3 py-2 text-sm font-medium text-[#6B3A3A]"
                        >
                          <input
                            type="checkbox"
                            checked={form.permissions.includes(module)}
                            onChange={() => togglePermission(module)}
                            className="h-4 w-4 accent-[#6B3A3A]"
                          />
                          {adminModuleLabels[module]}
                        </label>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#6B3A3A]/10 bg-[#F8EDEB]/60 p-4 text-sm text-[#1A1A1A]/55 sm:col-span-2">
                  Customer users do not get backend module access.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" className="rounded-full" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveUser}
                disabled={createUser.isPending || updateUser.isPending}
                className="rounded-full bg-[#6B3A3A] text-white hover:bg-[#512929]"
              >
                Save User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
