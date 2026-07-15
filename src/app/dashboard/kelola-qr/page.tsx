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
  Package,
  Box,
  MapPin,
  Tag,
  Activity,
  FileText,
  Layers,
  CheckCircle2,
  Sliders,
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

export type QRInventory = {
  id: string | number
  name: string
  code: string
  category: string
  location: string
  status: string
  quantity: number
  description?: string
  createdAt?: string
  updatedAt?: string
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

function generateInventoryText(item: Pick<QRInventory, "name" | "code" | "category" | "location" | "status" | "quantity" | "description">) {
  return `[INFORMASI INVENTORY]\nNama Barang : ${item.name}\nKode Asset  : ${item.code}\nKategori    : ${item.category}\nJumlah      : ${item.quantity} Unit\nStatus      : ${item.status}\nLokasi      : ${item.location}\nDeskripsi   : ${item.description || '-'}`
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

// ─── VCard QR Card Component ──────────────────────────────────────────────────

function QRContactCard({ contact, onDelete, onDownload }: { contact: QRContact; onDelete: (c: QRContact) => void; onDownload: (c: QRContact) => void }) {
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
            <QRCodeSVG id={`qr-contact-${contact.id}`} value={vcard} size={88} />
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

// ─── Inventory QR Card Component ──────────────────────────────────────────────

function QRInventoryCard({ item, onDelete, onDownload, getInventoryScanUrl }: { item: QRInventory; onDelete: (i: QRInventory) => void; onDownload: (i: QRInventory) => void; getInventoryScanUrl: (item: any) => string }) {
  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : "—"

  // Dynamic style based on status
  let statusBadgeClass = ""
  switch (item.status) {
    case "Baik":
      statusBadgeClass = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40"
      break
    case "Rusak":
      statusBadgeClass = "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/40"
      break
    case "Dalam Perbaikan":
      statusBadgeClass = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/40"
      break
    case "Dipinjam":
      statusBadgeClass = "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40"
      break
    case "Digunakan":
      statusBadgeClass = "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40"
      break
    default:
      statusBadgeClass = "bg-muted text-muted-foreground border-border"
  }

  // Prettier icons based on category
  const lowerCat = item.category.toLowerCase()
  let CatIcon = Box
  if (lowerCat.includes("elektronik") || lowerCat.includes("komputer") || lowerCat.includes("laptop")) {
    CatIcon = Package
  } else if (lowerCat.includes("furnitur") || lowerCat.includes("kursi") || lowerCat.includes("meja")) {
    CatIcon = Layers
  }

  const grad = getGradient(item.category)

  return (
    <div className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-primary/25 transition-all duration-200">
      {/* Card Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        {/* Category Icon */}
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white shrink-0 shadow-sm`}>
          <CatIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">
            {item.name}
          </h3>
          <p className="text-[11px] font-semibold text-primary truncate mt-0.5">{item.code}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" /> {dateStr}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t mx-4" />

      {/* Body */}
      <div className="flex items-start gap-3 p-4">
        {/* Info list */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate text-foreground font-medium">{item.category}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sliders className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="truncate font-semibold text-foreground">Jumlah: {item.quantity} unit</span>
          </div>
          <div className="pt-1">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeClass}`}>
              <Activity className="w-3 h-3" />
              {item.status}
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="bg-white border border-border rounded-xl p-2 shadow-xs">
            <QRCodeSVG id={`qr-inventory-${item.id}`} value={getInventoryScanUrl(item)} size={88} />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t flex">
        <button
          onClick={() => onDownload(item)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Unduh QR
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={() => onDelete(item)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Hapus
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EMPTY_CONTACT_FORM = { firstName: "", lastName: "", phone: "", email: "", position: "" }
const EMPTY_INVENTORY_FORM = { name: "", code: "", category: "Elektronik", location: "", status: "Baik", quantity: 1, description: "" }

export default function KelolaQRPage() {
  const [activeTab, setActiveTab] = useState<"vcard" | "inventory">("vcard")
  const [serverIp, setServerIp] = useState("127.0.0.1")

  const getInventoryScanUrl = (item: QRInventory | typeof EMPTY_INVENTORY_FORM) => {
    let baseOrigin = "http://localhost:3000"
    
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        const port = window.location.port ? `:${window.location.port}` : ":3000"
        baseOrigin = `http://${serverIp}${port}`
      } else {
        baseOrigin = window.location.origin
      }
    }

    const params = new URLSearchParams({
      name: item.name,
      code: item.code,
      category: item.category,
      location: item.location,
      status: item.status,
      quantity: String(item.quantity),
      description: item.description || ""
    })
    return `${baseOrigin}/public/scan?${params.toString()}`
  }
  
  // Contacts data state
  const [contacts, setContacts] = useState<QRContact[]>([])
  const [isContactsLoading, setIsContactsLoading] = useState(true)
  const [contactsSearch, setContactsSearch] = useState("")
  const [contactsPage, setContactsPage] = useState(1)

  // Inventory data state
  const [inventories, setInventories] = useState<QRInventory[]>([])
  const [isInventoryLoading, setIsInventoryLoading] = useState(true)
  const [inventorySearch, setInventorySearch] = useState("")
  const [inventoryPage, setInventoryPage] = useState(1)

  // Modals
  const [showAddContact, setShowAddContact] = useState(false)
  const [showAddInventory, setShowAddInventory] = useState(false)
  const [deleteContactTarget, setDeleteContactTarget] = useState<QRContact | null>(null)
  const [deleteInventoryTarget, setDeleteInventoryTarget] = useState<QRInventory | null>(null)

  // Forms
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT_FORM)
  const [inventoryForm, setInventoryForm] = useState(EMPTY_INVENTORY_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch Contacts ────────────────────────────────────────────────────────
  const fetchContacts = async () => {
    setIsContactsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/qrcontact`)
      const data = res.ok ? await res.json() : []
      setContacts([...data].sort((a: QRContact, b: QRContact) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      ))
    } catch {
      setContacts([])
    } finally {
      setIsContactsLoading(false)
    }
  }

  // ── Fetch Inventories ─────────────────────────────────────────────────────
  const fetchInventories = async () => {
    setIsInventoryLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/qrinventory`)
      const data = res.ok ? await res.json() : []
      setInventories([...data].sort((a: QRInventory, b: QRInventory) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      ))
    } catch {
      setInventories([])
    } finally {
      setIsInventoryLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
    fetchInventories()

    const fetchServerIp = async () => {
      try {
        const res = await fetch(`${API_URL}/api/server-ip`)
        if (res.ok) {
          const data = await res.json()
          setServerIp(data.ip)
        }
      } catch (e) {
        console.error("Gagal mengambil IP server:", e)
      }
    }
    fetchServerIp()
  }, [])

  // ── Filter & Paginate Contacts ───────────────────────────────────────────
  const filteredContacts = useMemo(() => {
    const q = contactsSearch.toLowerCase()
    return contacts.filter(c =>
      c.firstName?.toLowerCase().includes(q) ||
      c.lastName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.position?.toLowerCase().includes(q)
    )
  }, [contacts, contactsSearch])

  const totalContactPages = Math.max(1, Math.ceil(filteredContacts.length / ITEMS_PER_PAGE))
  const paginatedContacts = filteredContacts.slice((contactsPage - 1) * ITEMS_PER_PAGE, contactsPage * ITEMS_PER_PAGE)

  // ── Filter & Paginate Inventory ──────────────────────────────────────────
  const filteredInventory = useMemo(() => {
    const q = inventorySearch.toLowerCase()
    return inventories.filter(i =>
      i.name?.toLowerCase().includes(q) ||
      i.code?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q) ||
      i.location?.toLowerCase().includes(q) ||
      i.status?.toLowerCase().includes(q)
    )
  }, [inventories, inventorySearch])

  const totalInventoryPages = Math.max(1, Math.ceil(filteredInventory.length / ITEMS_PER_PAGE))
  const paginatedInventory = filteredInventory.slice((inventoryPage - 1) * ITEMS_PER_PAGE, inventoryPage * ITEMS_PER_PAGE)

  // ── Contact Handlers ─────────────────────────────────────────────────────
  const isContactFormValid = Boolean(
    contactForm.firstName.trim() &&
    contactForm.lastName.trim() &&
    contactForm.phone.trim() &&
    contactForm.email.trim() &&
    contactForm.position.trim()
  )

  const handleSaveContact = async () => {
    if (!isContactFormValid) return
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/qrcontact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...contactForm, company: "PT Duta Esa Adiperkasa", website: "https://dea-corp.com/" }),
      })
      if (res.ok) {
        const newContact = await res.json()
        setContacts(prev => [newContact, ...prev])
        setShowAddContact(false)
        setContactForm(EMPTY_CONTACT_FORM)
        setContactsPage(1)
        showToast(`Kontak QR "${contactForm.firstName} ${contactForm.lastName}" berhasil dibuat`)
      } else {
        showToast("Gagal menyimpan kontak", "error")
      }
    } catch {
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteContact = async () => {
    if (!deleteContactTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/qrcontact/${deleteContactTarget.id}`, { method: "DELETE" })
      if (res.ok) {
        setContacts(prev => prev.filter(c => c.id !== deleteContactTarget.id))
        showToast(`Kontak "${deleteContactTarget.firstName} ${deleteContactTarget.lastName}" berhasil dihapus`)
      } else {
        showToast("Gagal menghapus kontak", "error")
      }
    } catch {
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setIsDeleting(false)
      setDeleteContactTarget(null)
    }
  }

  const handleDownloadContact = (contact: QRContact) => {
    const svg = document.getElementById(`qr-contact-${contact.id}`)
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
        a.download = `QR_Contact_${contact.firstName}_${contact.lastName}.png`
        a.href = canvas.toDataURL("image/png")
        a.click()
      }
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    showToast(`QR Code "${contact.firstName} ${contact.lastName}" diunduh`)
  }

  // ── Inventory Handlers ───────────────────────────────────────────────────
  const isInventoryFormValid = Boolean(
    inventoryForm.name.trim() &&
    inventoryForm.code.trim() &&
    inventoryForm.category.trim() &&
    inventoryForm.location.trim() &&
    inventoryForm.status.trim() &&
    inventoryForm.quantity > 0
  )

  const handleSaveInventory = async () => {
    if (!isInventoryFormValid) return
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/qrinventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventoryForm),
      })
      const data = await res.json()
      if (res.ok) {
        setInventories(prev => [data, ...prev])
        setShowAddInventory(false)
        setInventoryForm(EMPTY_INVENTORY_FORM)
        setInventoryPage(1)
        showToast(`QR Inventory "${inventoryForm.name}" berhasil dibuat`)
      } else {
        showToast(data.error || "Gagal menyimpan item inventory", "error")
      }
    } catch {
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteInventory = async () => {
    if (!deleteInventoryTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/qrinventory/${deleteInventoryTarget.id}`, { method: "DELETE" })
      if (res.ok) {
        setInventories(prev => prev.filter(i => i.id !== deleteInventoryTarget.id))
        showToast(`Barang "${deleteInventoryTarget.name}" berhasil dihapus`)
      } else {
        showToast("Gagal menghapus barang", "error")
      }
    } catch {
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setIsDeleting(false)
      setDeleteInventoryTarget(null)
    }
  }

  const handleDownloadInventory = (item: QRInventory) => {
    const svg = document.getElementById(`qr-inventory-${item.id}`)
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
        a.download = `QR_Inventory_${item.code}.png`
        a.href = canvas.toDataURL("image/png")
        a.click()
      }
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    showToast(`QR Code Inventory "${item.name}" diunduh`)
  }

  const inputClass = "w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
  const selectClass = "w-full bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all"

  // Calculate Inventory stats
  const invStats = useMemo(() => {
    const total = inventories.length
    const baik = inventories.filter(i => i.status === "Baik").length
    const rusak = inventories.filter(i => i.status === "Rusak").length
    const repair = inventories.filter(i => i.status === "Dalam Perbaikan").length
    const digunakan = inventories.filter(i => i.status === "Digunakan").length
    return { total, baik, rusak, repair, digunakan }
  }, [inventories])

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Kelola QR</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manajemen kode QR digital untuk VCard Kontak dan Inventory Barang Perusahaan.
          </p>
        </div>

        {activeTab === "vcard" ? (
          <Button
            onClick={() => { setShowAddContact(true); setContactForm(EMPTY_CONTACT_FORM) }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl text-xs px-4 h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Kontak QR
          </Button>
        ) : (
          <Button
            onClick={() => { setShowAddInventory(true); setInventoryForm(EMPTY_INVENTORY_FORM) }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl text-xs px-4 h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Barang QR
          </Button>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("vcard")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === "vcard"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCircle2 className="w-4 h-4" />
          <span>VCard Kontak</span>
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${
            activeTab === "inventory"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>QR Inventory</span>
        </button>
      </div>

      {/* ── VCARD TAB CONTENT ───────────────────────────────────────────────── */}
      {activeTab === "vcard" && (
        <div className="space-y-6">
          {/* Stats bar */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-xl text-xs font-semibold">
              <QrCode className="w-4 h-4 text-primary" />
              <span>{contacts.length} Kontak Terdaftar</span>
            </div>
            {contactsSearch && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl text-xs font-semibold text-primary">
                <Search className="w-3.5 h-3.5" />
                {filteredContacts.length} hasil ditemukan
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              type="text"
              value={contactsSearch}
              onChange={(e) => { setContactsSearch(e.target.value); setContactsPage(1) }}
              placeholder="Cari nama, email, posisi..."
              className={inputClass}
            />
          </div>

          {/* Grid */}
          {isContactsLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs">Memuat data kontak...</span>
            </div>
          ) : paginatedContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-2xl gap-3 text-muted-foreground">
              <UserCircle2 className="w-10 h-10 opacity-25" />
              <p className="text-xs">{contactsSearch ? "Tidak ada kontak yang cocok" : "Belum ada kontak terdaftar"}</p>
              {!contactsSearch && (
                <Button onClick={() => setShowAddContact(true)} variant="outline" className="text-xs rounded-xl px-4 h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedContacts.map(c => (
                <QRContactCard key={c.id} contact={c} onDelete={setDeleteContactTarget} onDownload={handleDownloadContact} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredContacts.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-3">
              <p className="text-xs text-muted-foreground">
                Halaman <span className="font-semibold text-foreground">{contactsPage}</span> dari{" "}
                <span className="font-semibold text-foreground">{totalContactPages}</span> · {filteredContacts.length} kontak
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setContactsPage(p => Math.max(p - 1, 1))}
                  disabled={contactsPage === 1}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalContactPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setContactsPage(n)}
                    className={`w-8 h-8 rounded-xl border text-xs font-bold transition-colors ${
                      n === contactsPage
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setContactsPage(p => Math.min(p + 1, totalContactPages))}
                  disabled={contactsPage === totalContactPages}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── INVENTORY TAB CONTENT ───────────────────────────────────────────── */}
      {activeTab === "inventory" && (
        <div className="space-y-6">
          {/* Stats cards for assets */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Barang</span>
              <span className="text-2xl font-extrabold text-foreground mt-2">{invStats.total}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kondisi Baik</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{invStats.baik}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sedang Digunakan</span>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{invStats.digunakan}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dalam Perbaikan</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{invStats.repair}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kondisi Rusak</span>
              <span className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-2">{invStats.rusak}</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative max-w-xs flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => { setInventorySearch(e.target.value); setInventoryPage(1) }}
                placeholder="Cari barang, kode, kategori, lokasi..."
                className={inputClass}
              />
            </div>
            {inventorySearch && (
              <span className="text-xs text-primary font-semibold">
                Ditemukan {filteredInventory.length} barang
              </span>
            )}
          </div>

          {/* Grid */}
          {isInventoryLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs">Memuat data inventory...</span>
            </div>
          ) : paginatedInventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-2xl gap-3 text-muted-foreground">
              <Box className="w-10 h-10 opacity-25" />
              <p className="text-xs">{inventorySearch ? "Tidak ada barang yang cocok" : "Belum ada barang di inventory"}</p>
              {!inventorySearch && (
                <Button onClick={() => setShowAddInventory(true)} variant="outline" className="text-xs rounded-xl px-4 h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Barang Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedInventory.map(item => (
                <QRInventoryCard key={item.id} item={item} onDelete={setDeleteInventoryTarget} onDownload={handleDownloadInventory} getInventoryScanUrl={getInventoryScanUrl} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredInventory.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-3">
              <p className="text-xs text-muted-foreground">
                Halaman <span className="font-semibold text-foreground">{inventoryPage}</span> dari{" "}
                <span className="font-semibold text-foreground">{totalInventoryPages}</span> · {filteredInventory.length} barang
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInventoryPage(p => Math.max(p - 1, 1))}
                  disabled={inventoryPage === 1}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalInventoryPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setInventoryPage(n)}
                    className={`w-8 h-8 rounded-xl border text-xs font-bold transition-colors ${
                      n === inventoryPage
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setInventoryPage(p => Math.min(p + 1, totalInventoryPages))}
                  disabled={inventoryPage === totalInventoryPages}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Add Contact Modal ── */}
      {showAddContact && (
        <Modal title="Tambah Kontak QR Baru" onClose={() => setShowAddContact(false)}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Depan *</label>
                <div className="relative">
                  <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <input type="text" required value={contactForm.firstName} onChange={e => setContactForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Nama depan" className={inputClass} />
                </div>
              </div>
              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Belakang *</label>
                <div className="relative">
                  <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <input type="text" required value={contactForm.lastName} onChange={e => setContactForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Nama belakang" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">No. Telepon *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="text" inputMode="numeric" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value.replace(/[^0-9]/g, "") }))} placeholder="0812XXXXXXXX" className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} placeholder="nama@dea-corp.co.id" className={inputClass} />
              </div>
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jabatan *</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="text" value={contactForm.position} onChange={e => setContactForm(f => ({ ...f, position: e.target.value }))} placeholder="Contoh: Manager Operasional" className={inputClass} />
              </div>
            </div>

            {/* Live QR Preview */}
            {isContactFormValid && (
              <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pratinjau QR Code</p>
                <div className="bg-white p-3 rounded-xl border shadow-sm">
                  <QRCodeSVG value={generateVCard(contactForm)} size={140} />
                </div>
                <p className="text-[10px] text-muted-foreground text-center">
                  Scan untuk simpan sebagai kontak di ponsel
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setShowAddContact(false)} className="rounded-xl text-xs px-4">Batal</Button>
              <Button
                onClick={handleSaveContact}
                disabled={!isContactFormValid || isSaving}
                className="px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-xl text-xs"
              >
                {isSaving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Menyimpan...</> : <><QrCode className="w-3.5 h-3.5 mr-1.5" />Simpan & Buat QR</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Add Inventory Modal ── */}
      {showAddInventory && (
        <Modal title="Tambah Barang QR Baru" onClose={() => setShowAddInventory(false)}>
          <div className="p-6 space-y-4">
            {/* Nama Barang */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Barang *</label>
              <div className="relative">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="text" value={inventoryForm.name} onChange={e => setInventoryForm(i => ({ ...i, name: e.target.value }))} placeholder="Contoh: MacBook Pro M3" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Kode Inventory */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kode Inventory *</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <input type="text" value={inventoryForm.code} onChange={e => setInventoryForm(i => ({ ...i, code: e.target.value.toUpperCase() }))} placeholder="INV-001" className={inputClass} />
                </div>
              </div>

              {/* Jumlah */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Jumlah (Unit) *</label>
                <div className="relative">
                  <Sliders className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <input type="number" min={1} value={inventoryForm.quantity} onChange={e => setInventoryForm(i => ({ ...i, quantity: Math.max(1, parseInt(e.target.value) || 1) }))} className={inputClass} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Kategori */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kategori *</label>
                <select value={inventoryForm.category} onChange={e => setInventoryForm(i => ({ ...i, category: e.target.value }))} className={selectClass}>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Furnitur">Furnitur</option>
                  <option value="Alat Kantor">Alat Kantor</option>
                  <option value="Kendaraan">Kendaraan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status Awal *</label>
                <select value={inventoryForm.status} onChange={e => setInventoryForm(i => ({ ...i, status: e.target.value }))} className={selectClass}>
                  <option value="Baik">Baik (Good)</option>
                  <option value="Digunakan">Digunakan (In Use)</option>
                  <option value="Rusak">Rusak (Broken)</option>
                  <option value="Dalam Perbaikan">Dalam Perbaikan (Repair)</option>
                  <option value="Dipinjam">Dipinjam (Borrowed)</option>
                </select>
              </div>
            </div>

            {/* Lokasi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lokasi Penempatan *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="text" value={inventoryForm.location} onChange={e => setInventoryForm(i => ({ ...i, location: e.target.value }))} placeholder="Contoh: Gudang Utama / Ruang Kerja Lantai 2" className={inputClass} />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deskripsi / Keterangan</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground/60" />
                <textarea rows={3} value={inventoryForm.description} onChange={e => setInventoryForm(i => ({ ...i, description: e.target.value }))} placeholder="Catatan tambahan spesifikasi barang..." className={`${inputClass} pl-9 h-auto py-2.5`} />
              </div>
            </div>

            {/* Live QR Preview */}
            {inventoryForm.code.trim() && (
              <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pratinjau QR Code Inventory</p>
                <div className="bg-white p-3 rounded-xl border shadow-sm">
                  <QRCodeSVG value={getInventoryScanUrl(inventoryForm)} size={140} />
                </div>
                <p className="text-[10px] text-muted-foreground font-semibold">
                  Mendata Kode: {inventoryForm.code}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <Button variant="outline" onClick={() => setShowAddInventory(false)} className="rounded-xl text-xs px-4">Batal</Button>
              <Button
                onClick={handleSaveInventory}
                disabled={!isInventoryFormValid || isSaving}
                className="px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-xl text-xs"
              >
                {isSaving ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Menyimpan...</> : <><QrCode className="w-3.5 h-3.5 mr-1.5" />Simpan & Buat QR</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Contact Modal ── */}
      {deleteContactTarget && (
        <Modal title="Hapus Kontak QR" onClose={() => setDeleteContactTarget(null)}>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700 dark:text-red-300">Tindakan ini tidak dapat dibatalkan</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                  Kontak <span className="font-bold">{deleteContactTarget.firstName} {deleteContactTarget.lastName}</span> akan dihapus permanen beserta QR Code-nya.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteContactTarget(null)} className="px-4 rounded-xl text-xs">Batal</Button>
              <Button
                disabled={isDeleting}
                onClick={handleDeleteContact}
                className="px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Trash2 className="w-3.5 h-3.5 mr-1.5" />Hapus</>}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Inventory Modal ── */}
      {deleteInventoryTarget && (
        <Modal title="Hapus Barang QR" onClose={() => setDeleteInventoryTarget(null)}>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700 dark:text-red-300">Tindakan ini tidak dapat dibatalkan</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                  Barang <span className="font-bold">{deleteInventoryTarget.name}</span> ({deleteInventoryTarget.code}) akan dihapus permanen beserta QR Code-nya.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteInventoryTarget(null)} className="px-4 rounded-xl text-xs">Batal</Button>
              <Button
                disabled={isDeleting}
                onClick={handleDeleteInventory}
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
