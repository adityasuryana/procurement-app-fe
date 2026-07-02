"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  QrCode,
  Plus,
  Search,
  Phone,
  Mail,
  Building2,
  Calendar,
  Download,
  Loader2,
  X,
  Trash2,
  AlertTriangle,
  UserCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"

// ─── Types ───────────────────────────────────────────────────────────────────

export type QRContact = {
  id: string | number
  firstName: string
  lastName: string
  phone: string
  email: string
  position: string
  date?: string
  createdAt?: string
  company?: string
  website?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 6
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015"

const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-700",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-700",
  "from-indigo-500 to-blue-700",
]

function getGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i)
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
}

function generateVCard(contact: Pick<QRContact, "firstName" | "lastName" | "email" | "phone" | "position">) {
  return `BEGIN:VCARD\nVERSION:3.0\nN:${contact.lastName};${contact.firstName};;;\nFN:${contact.firstName} ${contact.lastName}\nORG:PT Duta Esa Adiperkasa\nEMAIL;type=WORK:${contact.email}\nTEL;type=WORK:${contact.phone}\nTITLE:${contact.position}\nURL:https://dea-corp.co.id\nEND:VCARD`
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background z-10">
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl text-xs font-semibold shadow-xl border animate-in slide-in-from-top-2 duration-300 flex items-center gap-2 ${
      type === "success"
        ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
        : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
    }`}>
      {type === "success" ? <QrCode className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
      {msg}
    </div>
  )
}

// ─── QR Card ──────────────────────────────────────────────────────────────────

function QRCard({ contact, onDelete, onDownload }: { contact: QRContact; onDelete: (c: QRContact) => void; onDownload: (c: QRContact) => void }) {
  const grad = getGradient(contact.firstName + contact.lastName)
  const initials = `${contact.firstName[0] ?? ""}${contact.lastName[0] ?? ""}`.toUpperCase()
  const vcard = generateVCard(contact)
  const dateStr = contact.createdAt
    ? new Date(contact.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : contact.date ?? "—"

  return (
    <div className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/25 transition-all duration-200">
      {/* Card Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">
            {contact.firstName} {contact.lastName}
          </h3>
          <p className="text-[11px] font-semibold text-primary truncate mt-0.5">{contact.position}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" /> {dateStr}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t mx-4" />

      {/* Body */}
      <div className="flex items-start gap-3 p-4">
        {/* Contact info */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate font-medium text-foreground">{contact.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate">PT Duta Esa Adiperkasa</span>
          </div>
        </div>

        {/* QR Code */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="bg-white border border-border rounded-xl p-2 shadow-xs">
            <QRCodeSVG id={`qr-${contact.id}`} value={vcard} size={88} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t flex">
        <button
          onClick={() => onDownload(contact)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Unduh QR
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={() => onDelete(contact)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Hapus
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EMPTY_FORM = { firstName: "", lastName: "", phone: "", email: "", position: "" }

export default function KontakQRPage() {
  const [contacts, setContacts] = useState<QRContact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  // Modals
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<QRContact | null>(null)

  // Form
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchContacts = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/qrcontact`)
      const data = res.ok ? await res.json() : []
      setContacts([...data].sort((a: QRContact, b: QRContact) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      ))
    } catch {
      setContacts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchContacts() }, [])

  // ── Filter & Paginate ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return contacts.filter(c =>
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.position?.toLowerCase().includes(q)
    )
  }, [contacts, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  // ── Handlers ─────────────────────────────────────────────────────────────
  const isFormValid = Boolean(form.firstName.trim() && form.lastName.trim() && form.phone.trim() && form.email.trim() && form.position.trim())

  const handleSave = async () => {
    if (!isFormValid) return
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/qrcontact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, company: "PT Duta Esa Adiperkasa", website: "https://dea-corp.com/" }),
      })
      if (res.ok) {
        const newContact = await res.json()
        setContacts(prev => [newContact, ...prev])
        setShowAdd(false)
        setForm(EMPTY_FORM)
        setPage(1)
        showToast(`Kontak QR "${form.firstName} ${form.lastName}" berhasil dibuat`)
      } else {
        showToast("Gagal menyimpan kontak", "error")
      }
    } catch {
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/qrcontact/${deleteTarget.id}`, { method: "DELETE" })
      if (res.ok) {
        setContacts(prev => prev.filter(c => c.id !== deleteTarget.id))
        showToast(`Kontak "${deleteTarget.firstName} ${deleteTarget.lastName}" berhasil dihapus`)
      } else {
        showToast("Gagal menghapus kontak", "error")
      }
    } catch {
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleDownload = (contact: QRContact) => {
    const svg = document.getElementById(`qr-${contact.id}`)
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width * 4
      canvas.height = img.height * 4
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const a = document.createElement("a")
        a.download = `QR_${contact.firstName}_${contact.lastName}.png`
        a.href = canvas.toDataURL("image/png")
        a.click()
      }
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    showToast(`QR Code "${contact.firstName} ${contact.lastName}" diunduh`)
  }

  const inputClass = "w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Kontak QR</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola kontak beserta QR Code VCard yang dapat dipindai.
          </p>
        </div>
        <Button
          onClick={() => { setShowAdd(true); setForm(EMPTY_FORM) }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl text-xs px-4 h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Kontak QR
        </Button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-xs font-semibold">
          <QrCode className="w-4 h-4 text-primary" />
          <span>{contacts.length} Kontak Terdaftar</span>
        </div>
        {search && (
          <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl text-xs font-semibold text-primary">
            <Search className="w-3.5 h-3.5" />
            {filtered.length} hasil ditemukan
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Cari nama, email, posisi..."
          className={inputClass}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-xs">Memuat data kontak...</span>
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-2xl gap-3 text-muted-foreground">
          <UserCircle2 className="w-10 h-10 opacity-25" />
          <p className="text-xs">{search ? "Tidak ada kontak yang cocok" : "Belum ada kontak terdaftar"}</p>
          {!search && (
            <Button onClick={() => setShowAdd(true)} variant="outline" className="text-xs rounded-xl px-4 h-8">
              <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {paginated.map(c => (
            <QRCard key={c.id} contact={c} onDelete={setDeleteTarget} onDownload={handleDownload} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-3">
          <p className="text-xs text-muted-foreground">
            Halaman <span className="font-semibold text-foreground">{page}</span> dari{" "}
            <span className="font-semibold text-foreground">{totalPages}</span> · {filtered.length} kontak
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-xl border text-xs font-bold transition-colors ${
                  n === page
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Add Modal ── */}
      {showAdd && (
        <Modal title="Tambah Kontak QR Baru" onClose={() => setShowAdd(false)}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Depan *</label>
                <div className="relative">
                  <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <input type="text" required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Nama depan" className={inputClass} />
                </div>
              </div>
              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Belakang *</label>
                <div className="relative">
                  <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <input type="text" required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Nama belakang" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">No. Telepon *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="text" inputMode="numeric" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="0812XXXXXXXX" className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="nama@dea-corp.co.id" className={inputClass} />
              </div>
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jabatan *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="text" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} placeholder="Contoh: Manager Operasional" className={inputClass} />
              </div>
            </div>

            {/* Live QR Preview */}
            {isFormValid && (
              <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pratinjau QR Code</p>
                <div className="bg-white p-3 rounded-xl border shadow-sm">
                  <QRCodeSVG value={generateVCard(form)} size={140} />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Scan untuk simpan sebagai kontak di ponsel
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setShowAdd(false)} className="rounded-xl text-xs px-4">Batal</Button>
              <Button
                onClick={handleSave}
                disabled={!isFormValid || isSaving}
                className="px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-xl text-xs"
              >
                {isSaving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Menyimpan...</> : <><QrCode className="w-3.5 h-3.5 mr-1.5" />Simpan & Buat QR</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <Modal title="Hapus Kontak QR" onClose={() => setDeleteTarget(null)}>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700 dark:text-red-300">Tindakan ini tidak dapat dibatalkan</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                  Kontak <span className="font-bold">{deleteTarget.firstName} {deleteTarget.lastName}</span> akan dihapus permanen beserta QR Code-nya.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="px-4 rounded-xl text-xs">Batal</Button>
              <Button
                disabled={isDeleting}
                onClick={handleDelete}
                className="px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Trash2 className="w-3.5 h-3.5 mr-1.5" />Hapus</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}