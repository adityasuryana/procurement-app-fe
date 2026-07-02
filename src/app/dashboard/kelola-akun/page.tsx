"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  ShieldCheck,
  User,
  Key,
  Mail,
  Save,
  Search,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// ─── Types ──────────────────────────────────────────────────────────────────

interface UserAccount {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  role: string
  createdAt?: string
}

interface FormState {
  username: string
  firstName: string
  lastName: string
  email: string
  role: string
  password: string
}

const EMPTY_FORM: FormState = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "Staff",
  password: "",
}

const ROLES = ["Admin", "Staff", "Manager", "Viewer"]

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015"

/** Reads the JWT token from localStorage and returns an Authorization header object. */
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return { "Content-Type": "application/json" }
  try {
    const session = localStorage.getItem("user_session")
    const token = session ? JSON.parse(session).token : null
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" }
  } catch {
    return { "Content-Type": "application/json" }
  }
}

// ─── Modal Component ─────────────────────────────────────────────────────────

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── User Form ───────────────────────────────────────────────────────────────

function UserForm({
  form,
  setForm,
  onSubmit,
  isLoading,
  isEdit,
  error,
}: {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  isEdit: boolean
  error: string
}) {
  const inputClass =
    "w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-4">
      {error && (
        <div className="p-3 border border-red-200 bg-red-50/60 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Nama Depan <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <input
              type="text"
              required
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              placeholder="Nama depan"
              className={inputClass}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Nama Belakang
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              placeholder="Nama belakang"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Username <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <input
            type="text"
            required
            value={form.username}
            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            placeholder="username"
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="email@domain.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Role <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <select
              required
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            {isEdit ? "Password Baru" : "Password"}{" "}
            {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
            <input
              type="password"
              required={!isEdit}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder={isEdit ? "Kosongkan jika tidak diganti" : "Password"}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="submit"
          disabled={
            isLoading ||
            !form.firstName.trim() ||
            !form.username.trim() ||
            !form.email.trim() ||
            (!isEdit && !form.password.trim())
          }
          className="px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-xl text-xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {isEdit ? "Simpan Perubahan" : "Tambah Akun"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteConfirmModal({
  user,
  onConfirm,
  onCancel,
  isLoading,
}: {
  user: UserAccount
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <Modal title="Konfirmasi Hapus Akun" onClose={onCancel}>
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-red-700 dark:text-red-300">
              Tindakan ini tidak dapat dibatalkan
            </p>
            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
              Akun{" "}
              <span className="font-bold">
                {user.firstName} {user.lastName}
              </span>{" "}
              ({user.username}) akan dihapus permanen dari database.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel} className="px-4 rounded-xl text-xs">
            Batal
          </Button>
          <Button
            disabled={isLoading}
            onClick={onConfirm}
            className="px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Hapus Akun
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function KelolaAkunPage() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [filtered, setFiltered] = useState<UserAccount[]>([])
  const [search, setSearch] = useState("")
  const [isFetching, setIsFetching] = useState(true)

  // Admin guard
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    const session = localStorage.getItem("user_session")
    if (session) {
      try {
        const userData = JSON.parse(session)
        setIsAdmin((userData.role || "").toLowerCase() === "admin")
      } catch {
        setIsAdmin(false)
      }
    } else {
      setIsAdmin(false)
    }
  }, [])

  // Modal states
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<UserAccount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null)

  // Form states
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch all users ──────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setIsFetching(true)
    try {
      const res = await fetch(`${API_URL}/api/users`, { headers: getAuthHeaders() })
      if (!res.ok) throw new Error("Gagal mengambil data")
      const data: UserAccount[] = await res.json()
      setUsers(data)
      setFiltered(data)
    } catch (err) {
      console.error(err)
      showToast("Gagal memuat data akun", "error")
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Search filter ────────────────────────────────────────────────────────
  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      users.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
      )
    )
  }, [search, users])

  // ── Open add modal ───────────────────────────────────────────────────────
  const openAdd = () => {
    setForm(EMPTY_FORM)
    setFormError("")
    setShowAdd(true)
  }

  // ── Open edit modal ──────────────────────────────────────────────────────
  const openEdit = (user: UserAccount) => {
    setEditTarget(user)
    setForm({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      password: "",
    })
    setFormError("")
  }

  // ── Submit add (register) ─────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormError("")
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          role: form.role,
        }),
      })
      if (res.ok) {
        setShowAdd(false)
        await fetchUsers()
        showToast(`Akun "${form.username}" berhasil ditambahkan`)
      } else {
        const err = await res.json().catch(() => ({}))
        setFormError(err.message || "Gagal menambahkan akun")
      }
    } catch {
      setFormError("Gagal terhubung ke server")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Submit edit (update) ──────────────────────────────────────────────
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setIsSubmitting(true)
    setFormError("")
    try {
      const payload: Record<string, string> = {
        username: form.username.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        role: form.role,
      }
      if (form.password.trim()) payload.password = form.password.trim()

      const res = await fetch(`${API_URL}/api/users/${editTarget.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        setEditTarget(null)
        await fetchUsers()
        showToast(`Akun "${form.username}" berhasil diperbarui`)
      } else {
        const err = await res.json().catch(() => ({}))
        setFormError(err.message || "Gagal memperbarui akun")
      }
    } catch {
      setFormError("Gagal terhubung ke server")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/users/${deleteTarget.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (res.ok) {
        setDeleteTarget(null)
        await fetchUsers()
        showToast(`Akun "${deleteTarget.username}" berhasil dihapus`)
      } else {
        showToast("Gagal menghapus akun", "error")
        setDeleteTarget(null)
      }
    } catch {
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  // ── Role badge color ──────────────────────────────────────────────────
  const roleBadgeClass = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/50"
      case "Manager":
        return "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50"
      case "Staff":
        return "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
      default:
        return "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  // Waiting for session to be read
  if (isAdmin === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Access denied for non-admin
  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Akses Ditolak</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Halaman ini hanya dapat diakses oleh pengguna dengan role <span className="font-bold text-foreground">Admin</span>.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/dashboard")}
          className="rounded-xl text-xs px-5 h-8"
        >
          Kembali ke Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col p-6 gap-6 min-h-0">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-xs font-semibold shadow-xl border animate-in slide-in-from-top-2 duration-300 flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
              : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <ShieldCheck className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Kelola Akun</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manajemen akun pengguna yang dapat mengakses dashboard.
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl text-xs px-4 h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Akun
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari username, nama, email..."
          className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs flex-1">
        {isFetching ? (
          <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">Memuat data akun...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
            <Users className="w-8 h-8 opacity-30" />
            <p className="text-xs">{search ? "Tidak ada akun yang cocok" : "Belum ada akun terdaftar"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                    Nama
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                    Username
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                    Role
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">
                      {u.username}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${roleBadgeClass(
                          u.role
                        )}`}
                      >
                        {u.role || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="Edit akun"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Hapus akun"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!isFetching && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t bg-muted/20 text-[10px] text-muted-foreground">
            Menampilkan {filtered.length} dari {users.length} akun
          </div>
        )}
      </div>

      {/* ── Modals ── */}

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Tambah Akun Baru" onClose={() => setShowAdd(false)}>
          <UserForm
            form={form}
            setForm={setForm}
            onSubmit={handleAdd}
            isLoading={isSubmitting}
            isEdit={false}
            error={formError}
          />
        </Modal>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <Modal
          title={`Edit Akun — ${editTarget.firstName} ${editTarget.lastName}`}
          onClose={() => setEditTarget(null)}
        >
          <UserForm
            form={form}
            setForm={setForm}
            onSubmit={handleEdit}
            isLoading={isSubmitting}
            isEdit={true}
            error={formError}
          />
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  )
}
