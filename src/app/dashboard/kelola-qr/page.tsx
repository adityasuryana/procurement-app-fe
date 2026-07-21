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
  Pencil,
  Wifi,
  WifiOff,
  Key,
  Eye,
  EyeOff,
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

export type QRAsset = {
  id: string | number
  name: string
  code: string
  category: string
  location: string
  status: string
  description?: string
  token?: string
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

function generateAssetText(item: Pick<QRAsset, "name" | "code" | "category" | "location" | "status" | "description">) {
  return `[INFORMASI ASET]\nNama Barang : ${item.name}\nKode Asset  : ${item.code}\nKategori    : ${item.category}\nStatus      : ${item.status}\nLokasi      : ${item.location}\nDeskripsi   : ${item.description || '-'}`
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
    <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl text-xs font-semibold shadow-xl border animate-in slide-in-from-top-2 duration-300 flex items-center gap-2 ${type === "success"
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

function QRAssetCard({ item, onEdit, onDelete, onDownload, getAssetScanUrl }: { item: QRAsset; onEdit: (i: QRAsset) => void; onDelete: (i: QRAsset) => void; onDownload: (i: QRAsset) => void; getAssetScanUrl: (item: any) => string }) {
  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    : "—"

  // Dynamic style based on status
  let statusBadgeClass = ""
  switch (item.status) {
    case "Disimpan":
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
          <div className="pt-1">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeClass}`}>
              <Activity className="w-3 h-3" />
              {item.status}
            </span>
          </div>
        </div>

        {/* QR Code */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="bg-white border border-border rounded-xl p-2.5 shadow-xs flex flex-col items-center gap-1.5">
            <div className="relative w-[88px] h-[88px] flex items-center justify-center">
              <img
                src="/dea-logo.png"
                alt="DEA Logo"
                className="absolute w-[70px] h-[70px] object-contain opacity-20 pointer-events-none select-none"
              />
              <QRCodeSVG
                id={`qr-asset-${item.id}`}
                value={getAssetScanUrl(item)}
                size={88}
                bgColor="transparent"
              />
            </div>
            <span className="text-[9px] font-extrabold text-muted-foreground font-mono tracking-wider uppercase select-all">
              {item.code}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t flex">
        <button
          onClick={() => onEdit(item)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <div className="w-px bg-border" />
        <button
          onClick={() => onDownload(item)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Unduh
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
const EMPTY_ASSET_FORM = { name: "", code: "", category: "Elektronik", location: "", status: "Disimpan", description: "" }

export default function KelolaQRPage() {
  const [activeTab, setActiveTab] = useState<"vcard" | "asset" | "wifi">("vcard")
  const [serverIp, setServerIp] = useState("127.0.0.1")

  const getAssetScanUrl = (item: QRAsset | typeof EMPTY_ASSET_FORM) => {
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

    // Dynamic routing by token (clean URL) if saved
    if ("token" in item && item.token) {
      return `${baseOrigin}/public/scan/${item.token}`
    }

    // Fallback dynamic routing by ID if token is not available
    if ("id" in item && item.id) {
      return `${baseOrigin}/public/scan?id=${item.id}`
    }

    // Unsaved preview fallback containing all parameters
    const params = new URLSearchParams({
      name: item.name,
      code: item.code,
      category: item.category,
      location: item.location,
      status: item.status,
      description: item.description || ""
    })
    return `${baseOrigin}/public/scan?${params.toString()}`
  }

  // Contacts data state
  const [contacts, setContacts] = useState<QRContact[]>([])
  const [isContactsLoading, setIsContactsLoading] = useState(true)
  const [contactsSearch, setContactsSearch] = useState("")
  const [contactsPage, setContactsPage] = useState(1)

  // Asset data state
  const [assets, setAssets] = useState<QRAsset[]>([])
  const [isAssetLoading, setIsAssetLoading] = useState(true)
  const [assetSearch, setAssetSearch] = useState("")
  const [assetPage, setAssetPage] = useState(1)

  // Modals
  const [showAddContact, setShowAddContact] = useState(false)
  const [showAddAsset, setShowAddAsset] = useState(false)
  const [deleteContactTarget, setDeleteContactTarget] = useState<QRContact | null>(null)
  const [deleteAssetTarget, setDeleteAssetTarget] = useState<QRAsset | null>(null)
  const [editAssetTarget, setEditAssetTarget] = useState<QRAsset | null>(null)

  // Forms
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT_FORM)
  const [assetForm, setAssetForm] = useState(EMPTY_ASSET_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // WiFi states & handlers
  const [wifiForm, setWifiForm] = useState({ ssid: "", password: "", encryption: "WPA" as "WPA" | "WEP" | "nopass", hidden: false })
  const [showWifiPassword, setShowWifiPassword] = useState(false)
  const [wifiHistory, setWifiHistory] = useState<Array<typeof wifiForm>>([])

  // Load WiFi history on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHistory = localStorage.getItem("wifi_qr_history")
      if (savedHistory) {
        try {
          setWifiHistory(JSON.parse(savedHistory))
        } catch (e) {
          console.error("Gagal memuat riwayat WiFi:", e)
        }
      }
    }
  }, [])

  const generateWifiString = (form: typeof wifiForm) => {
    const ssid = form.ssid || "NAMA SSID"
    const pass = form.password || ""
    const enc = form.encryption || "WPA"
    const isHidden = form.hidden ? "true" : "false"

    if (enc === "nopass") {
      return `WIFI:S:${ssid};T:nopass;H:${isHidden};;`
    }
    return `WIFI:S:${ssid};T:${enc};P:${pass};H:${isHidden};;`
  }

  const handleSaveWifiToHistory = () => {
    if (!wifiForm.ssid.trim()) return
    const index = wifiHistory.findIndex(w => w.ssid.toLowerCase() === wifiForm.ssid.toLowerCase())
    let newHistory = [...wifiHistory]
    if (index !== -1) {
      newHistory[index] = wifiForm
    } else {
      newHistory = [wifiForm, ...newHistory]
    }
    setWifiHistory(newHistory)
    localStorage.setItem("wifi_qr_history", JSON.stringify(newHistory))
    showToast(`WiFi "${wifiForm.ssid}" disimpan ke riwayat`)
  }

  const handleDeleteWifiHistory = (index: number) => {
    const newHistory = wifiHistory.filter((_, i) => i !== index)
    setWifiHistory(newHistory)
    localStorage.setItem("wifi_qr_history", JSON.stringify(newHistory))
    showToast("Riwayat WiFi dihapus")
  }

  const loadWifiFromHistory = (w: typeof wifiForm) => {
    setWifiForm(w)
    showToast(`Memuat Jaringan "${w.ssid}"`)
  }

  const handleDownloadWifiQr = () => {
    const svg = document.getElementById("wifi-qr-code")
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const logoImg = new Image()
    const bgImg = new Image()
    const qrImg = new Image()

    let loadedCount = 0
    const checkAllLoaded = () => {
      loadedCount++
      if (loadedCount === 3) {
        drawCanvas()
      }
    }

    logoImg.onload = checkAllLoaded
    logoImg.onerror = checkAllLoaded

    bgImg.onload = checkAllLoaded
    bgImg.onerror = checkAllLoaded

    qrImg.onload = checkAllLoaded
    qrImg.onerror = checkAllLoaded

    const drawCanvas = () => {
      // A5 Size in pixels at high resolution (1200 x 1697)
      const width = 1200
      const height = 1697
      canvas.width = width
      canvas.height = height

      if (ctx) {
        // 1. Background Fill
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)

        // 2. Draw Telecom Tower Background Image (Watermark style)
        ctx.save()
        ctx.globalAlpha = 0.06 // Soft watermark opacity

        const bgAspect = bgImg.width / bgImg.height
        const canvasAspect = width / height
        let drawW = width
        let drawH = height
        let drawX = 0
        let drawY = 0

        if (bgAspect > canvasAspect) {
          drawW = height * bgAspect
          drawX = (width - drawW) / 2
        } else {
          drawH = width / bgAspect
          drawY = (height - drawH) / 2
        }
        ctx.drawImage(bgImg, drawX, drawY, drawW, drawH)
        ctx.restore()

        // Draw subtle background grid (Telecom/Tech network theme)
        ctx.strokeStyle = "rgba(67, 100, 247, 0.03)"
        ctx.lineWidth = 1.5
        const gridSize = 48
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath()
          ctx.moveTo(x, 0)
          ctx.lineTo(x, height)
          ctx.stroke()
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
          ctx.stroke()
        }

        // 3. Telecom Gradient Accent at the top (clean bar)
        const topGradHeight = 20
        const topGrad = ctx.createLinearGradient(0, 0, width, 0)
        topGrad.addColorStop(0, "#0052D4")
        topGrad.addColorStop(0.5, "#4364F7")
        topGrad.addColorStop(1, "#00c6ff")
        ctx.fillStyle = topGrad
        ctx.fillRect(0, 0, width, topGradHeight)

        // 4. Logo & Brand Name Header
        const logoHeight = 110
        const logoAspect = logoImg.width / logoImg.height
        const logoWidth = logoHeight * logoAspect
        const logoX = (width - logoWidth) / 2
        const logoY = 130
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight)

        ctx.fillStyle = "#0f172a" // Slate-900
        ctx.font = "bold 34px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("PT DUTA ESA ADIPERKASA", width / 2, 280)

        ctx.fillStyle = "#4364F7" // Corporate Blue
        ctx.font = "bold 13px sans-serif"
        ctx.fillText("TELECOMMUNICATION, ELECTRICAL AND MECHANICAL", width / 2, 310)

        // 5. Drawing the main QR Code with background shadow
        const qrSize = 620
        const qrX = (width - qrSize) / 2
        const qrY = 370

        // Draw QR card shadow / light blue background glow
        ctx.fillStyle = "#ffffff"
        ctx.strokeStyle = "rgba(67, 100, 247, 0.12)"
        ctx.lineWidth = 2
        ctx.save()
        ctx.shadowColor = "rgba(15, 23, 42, 0.06)"
        ctx.shadowBlur = 30
        ctx.shadowOffsetY = 12
        ctx.beginPath()
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(qrX - 40, qrY - 40, qrSize + 80, qrSize + 80, 28)
        } else {
          ctx.rect(qrX - 40, qrY - 40, qrSize + 80, qrSize + 80)
        }
        ctx.fill()
        ctx.stroke()
        ctx.restore()

        // Draw logo in the background behind the QR code, preserving aspect ratio (like in asset)
        ctx.save()
        ctx.globalAlpha = 0.28
        const qrBgAspect = logoImg.width / logoImg.height
        const bgTargetW = qrSize * 0.8
        const bgTargetH = bgTargetW / qrBgAspect
        const bgLogoX = (width - bgTargetW) / 2
        const bgLogoY = qrY + (qrSize - bgTargetH) / 2
        ctx.drawImage(logoImg, bgLogoX, bgLogoY, bgTargetW, bgTargetH)
        ctx.restore()

        // Draw QR Image SVG
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

        // 6. WiFi credentials section (SSID & Password)
        const credY = 1130
        const credWidth = width - 360

        // Draw credentials container
        ctx.fillStyle = "#f8fafc" // slate-50
        ctx.strokeStyle = "rgba(67, 100, 247, 0.12)"
        ctx.lineWidth = 2
        ctx.beginPath()
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(180, credY, credWidth, 270, 24)
        } else {
          ctx.rect(180, credY, credWidth, 270)
        }
        ctx.fill()
        ctx.stroke()

        // Credentials Details
        ctx.textAlign = "left"

        // SSID Jaringan (Network Name)
        ctx.font = "bold 16px sans-serif"
        ctx.fillStyle = "#64748b" // slate-500
        ctx.fillText("SSID", 230, credY + 68)

        ctx.font = "bold 34px sans-serif"
        ctx.fillStyle = "#0f172a" // slate-900
        ctx.fillText(wifiForm.ssid, 230, credY + 115)

        // Kata Sandi (Password)
        ctx.font = "bold 16px sans-serif"
        ctx.fillStyle = "#64748b"
        ctx.fillText("KATA SANDI / PASSWORD", 230, credY + 183)

        ctx.font = "bold 34px sans-serif"
        if (wifiForm.encryption === "nopass") {
          ctx.fillStyle = "#059669" // Emerald green for open wifi
          ctx.fillText("Jaringan Terbuka (Tanpa Sandi)", 230, credY + 230)
        } else {
          ctx.fillStyle = "#0f172a"
          ctx.fillText(wifiForm.password, 230, credY + 230)
        }

        // Draw WiFi Wave Icon on the right side of the credentials box
        ctx.save()
        ctx.strokeStyle = "#4364F7"
        ctx.lineWidth = 8
        ctx.lineCap = "round"
        const sigX = width - 290
        const sigY = credY + 140

        // Signal waves
        ctx.fillStyle = "#4364F7"
        ctx.beginPath()
        ctx.arc(sigX, sigY + 20, 6, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(sigX, sigY + 20, 32, -Math.PI * 0.75, -Math.PI * 0.25)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(sigX, sigY + 20, 64, -Math.PI * 0.75, -Math.PI * 0.25)
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(sigX, sigY + 20, 96, -Math.PI * 0.75, -Math.PI * 0.25)
        ctx.stroke()
        ctx.restore()

        // 7. Footer text
        ctx.textAlign = "center"
        ctx.fillStyle = "#94a3b8" // slate-400
        ctx.font = "bold 15px sans-serif"
        ctx.fillText("Infrastruktur Jaringan Terverifikasi PT Duta Esa Adiperkasa", width / 2, height - 100)
        ctx.font = "medium 14px sans-serif"

        // Trigger download
        const a = document.createElement("a")
        a.download = `WIFI_A5_${wifiForm.ssid.replace(/\s+/g, "_")}.png`
        a.href = canvas.toDataURL("image/png")
        a.click()
      }
    }

    // Set src to trigger loading
    logoImg.src = "/dea-logo.png"
    bgImg.src = "/telecom_tower_bg.png"
    qrImg.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
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

  // ── Fetch Assets ─────────────────────────────────────────────────────
  const fetchAssets = async () => {
    setIsAssetLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/qrasset`)
      const data = res.ok ? await res.json() : []
      setAssets([...data].sort((a: QRAsset, b: QRAsset) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      ))
    } catch {
      setAssets([])
    } finally {
      setIsAssetLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
    fetchAssets()

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

  // ── Filter & Paginate Asset ──────────────────────────────────────────
  const filteredAsset = useMemo(() => {
    const q = assetSearch.toLowerCase()
    return assets.filter(i =>
      i.name?.toLowerCase().includes(q) ||
      i.code?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q) ||
      i.location?.toLowerCase().includes(q) ||
      i.status?.toLowerCase().includes(q)
    )
  }, [assets, assetSearch])

  const totalAssetPages = Math.max(1, Math.ceil(filteredAsset.length / ITEMS_PER_PAGE))
  const paginatedAsset = filteredAsset.slice((assetPage - 1) * ITEMS_PER_PAGE, assetPage * ITEMS_PER_PAGE)

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

  // ── Asset Handlers ───────────────────────────────────────────────────
  const isAssetFormValid = Boolean(
    assetForm.name.trim() &&
    assetForm.code.trim() &&
    assetForm.category.trim() &&
    assetForm.location.trim() &&
    assetForm.status.trim()
  )

  const handleSaveAsset = async () => {
    if (!isAssetFormValid) return
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/qrasset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetForm),
      })
      const data = await res.json()
      if (res.ok) {
        setAssets(prev => [data, ...prev])
        setShowAddAsset(false)
        setAssetForm(EMPTY_ASSET_FORM)
        setAssetPage(1)
        showToast(`QR Aset "${assetForm.name}" berhasil dibuat`)
      } else {
        showToast(data.error || "Gagal menyimpan item aset", "error")
      }
    } catch {
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditAssetClick = (item: QRAsset) => {
    setEditAssetTarget(item)
    setAssetForm({
      name: item.name,
      code: item.code,
      category: item.category,
      location: item.location,
      status: item.status,
      description: item.description || ""
    })
  }

  const handleUpdateAsset = async () => {
    if (!editAssetTarget || !isAssetFormValid) return
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/qrasset/${editAssetTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assetForm),
      })
      const data = await res.json()
      if (res.ok) {
        setAssets(prev => prev.map(a => a.id === editAssetTarget.id ? data : a))
        setEditAssetTarget(null)
        setAssetForm(EMPTY_ASSET_FORM)
        showToast(`QR Aset "${assetForm.name}" berhasil diperbarui`)
      } else {
        showToast(data.error || "Gagal memperbarui item aset", "error")
      }
    } catch {
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAsset = async () => {
    if (!deleteAssetTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_URL}/api/qrasset/${deleteAssetTarget.id}`, { method: "DELETE" })
      if (res.ok) {
        setAssets(prev => prev.filter(i => i.id !== deleteAssetTarget.id))
        showToast(`Barang "${deleteAssetTarget.name}" berhasil dihapus`)
      } else {
        showToast("Gagal menghapus barang", "error")
      }
    } catch {
      showToast("Gagal terhubung ke server", "error")
    } finally {
      setIsDeleting(false)
      setDeleteAssetTarget(null)
    }
  }

  const handleDownloadAsset = (item: QRAsset) => {
    const svg = document.getElementById(`qr-asset-${item.id}`)
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    const logoImg = new Image()
    logoImg.src = "/dea-logo.png"

    const qrImg = new Image()

    logoImg.onload = () => {
      qrImg.onload = () => {
        const qrSize = qrImg.width * 4 // 352 px
        const padding = 32
        const headerHeight = 70
        const footerHeight = 60

        canvas.width = qrSize + padding * 2 // 416 px
        canvas.height = qrSize + padding * 2 + headerHeight + footerHeight // 548 px

        if (ctx) {
          // Fill background with white
          ctx.fillStyle = "white"
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          // Draw clean rounded border around card
          ctx.strokeStyle = "#cbd5e1" // slate-300
          ctx.lineWidth = 3
          ctx.beginPath()
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(12, 12, canvas.width - 24, canvas.height - 24, 20)
          } else {
            ctx.rect(12, 12, canvas.width - 24, canvas.height - 24)
          }
          ctx.stroke()

          // Draw Corporate Header at the top
          ctx.fillStyle = "#0f172a" // slate-900
          ctx.font = "bold 16px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("PT DUTA ESA ADIPERKASA", canvas.width / 2, 42)

          ctx.fillStyle = "#64748b" // slate-500
          ctx.font = "bold 9px sans-serif"
          ctx.fillText("ASET TERVERIFIKASI", canvas.width / 2, 58)

          // Draw logo in the background, preserving aspect ratio (no stretching/gepeng)
          ctx.save()
          ctx.globalAlpha = 0.28
          const aspect = logoImg.width / logoImg.height
          const targetW = qrSize * 0.8
          const targetH = targetW / aspect
          const logoX = (canvas.width - targetW) / 2
          const logoY = headerHeight + padding + (qrSize - targetH) / 2
          ctx.drawImage(logoImg, logoX, logoY, targetW, targetH)
          ctx.restore()

          // Draw QR Code SVG on top
          ctx.drawImage(qrImg, padding, headerHeight + padding, qrSize, qrSize)

          // Draw Asset Code text centered below the QR code
          ctx.fillStyle = "#3c58b9" // Corporate blue color matching DEA logo
          ctx.font = "bold 26px monospace"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          const textY = headerHeight + padding * 2 + qrSize + footerHeight / 2
          ctx.fillText(item.code.toUpperCase(), canvas.width / 2, textY)

          const a = document.createElement("a")
          a.download = `QR_Aset_${item.code}.png`
          a.href = canvas.toDataURL("image/png")
          a.click()
        }
      }
      qrImg.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
    }
    showToast(`QR Code Aset "${item.name}" diunduh`)
  }

  const inputClass = "w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
  const selectClass = "w-full bg-background border border-input rounded-xl py-2 px-3 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all"

  // Calculate Asset stats
  const assetStats = useMemo(() => {
    const total = assets.length
    const disimpan = assets.filter(i => i.status === "Disimpan").length
    const rusak = assets.filter(i => i.status === "Rusak").length
    const repair = assets.filter(i => i.status === "Dalam Perbaikan").length
    const digunakan = assets.filter(i => i.status === "Digunakan").length
    return { total, disimpan, rusak, repair, digunakan }
  }, [assets])

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
            Manajemen kode QR.
          </p>
        </div>

        {activeTab === "vcard" && (
          <Button
            onClick={() => { setShowAddContact(true); setContactForm(EMPTY_CONTACT_FORM) }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl text-xs px-4 h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Kontak QR
          </Button>
        )}
        {activeTab === "asset" && (
          <Button
            onClick={() => { setShowAddAsset(true); setAssetForm(EMPTY_ASSET_FORM) }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl text-xs px-4 h-9"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Aset QR
          </Button>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-border gap-2">
        <button
          onClick={() => setActiveTab("vcard")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeTab === "vcard"
            ? "border-primary text-primary font-bold"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <UserCircle2 className="w-4 h-4" />
          <span>VCard Kontak</span>
        </button>
        <button
          onClick={() => setActiveTab("asset")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeTab === "asset"
            ? "border-primary text-primary font-bold"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <Package className="w-4 h-4" />
          <span>QR Aset</span>
        </button>
        <button
          onClick={() => setActiveTab("wifi")}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-px ${activeTab === "wifi"
            ? "border-primary text-primary font-bold"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <Wifi className="w-4 h-4" />
          <span>QR WiFi</span>
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
                    className={`w-8 h-8 rounded-xl border text-xs font-bold transition-colors ${n === contactsPage
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

      {/* ── ASSET TAB CONTENT ───────────────────────────────────────────── */}
      {activeTab === "asset" && (
        <div className="space-y-6">
          {/* Stats cards for assets */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Barang</span>
              <span className="text-2xl font-extrabold text-foreground mt-2">{assetStats.total}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Disimpan</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{assetStats.disimpan}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sedang Digunakan</span>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">{assetStats.digunakan}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Dalam Perbaikan</span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{assetStats.repair}</span>
            </div>
            <div className="bg-card border border-border p-4 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kondisi Rusak</span>
              <span className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-2">{assetStats.rusak}</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative max-w-xs flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                value={assetSearch}
                onChange={(e) => { setAssetSearch(e.target.value); setAssetPage(1) }}
                placeholder="Cari barang, kode, kategori, lokasi..."
                className={inputClass}
              />
            </div>
            {assetSearch && (
              <span className="text-xs text-primary font-semibold">
                Ditemukan {filteredAsset.length} barang
              </span>
            )}
          </div>

          {/* Grid */}
          {isAssetLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs">Memuat data aset...</span>
            </div>
          ) : paginatedAsset.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-2xl gap-3 text-muted-foreground">
              <Box className="w-10 h-10 opacity-25" />
              <p className="text-xs">{assetSearch ? "Tidak ada barang yang cocok" : "Belum ada barang di aset"}</p>
              {!assetSearch && (
                <Button onClick={() => setShowAddAsset(true)} variant="outline" className="text-xs rounded-xl px-4 h-8">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Barang Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedAsset.map(item => (
                <QRAssetCard key={item.id} item={item} onEdit={handleEditAssetClick} onDelete={setDeleteAssetTarget} onDownload={handleDownloadAsset} getAssetScanUrl={getAssetScanUrl} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredAsset.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between pt-2 border-t flex-wrap gap-3">
              <p className="text-xs text-muted-foreground">
                Halaman <span className="font-semibold text-foreground">{assetPage}</span> dari{" "}
                <span className="font-semibold text-foreground">{totalAssetPages}</span> · {filteredAsset.length} barang
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAssetPage(p => Math.max(p - 1, 1))}
                  disabled={assetPage === 1}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalAssetPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setAssetPage(n)}
                    className={`w-8 h-8 rounded-xl border text-xs font-bold transition-colors ${n === assetPage
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setAssetPage(p => Math.min(p + 1, totalAssetPages))}
                  disabled={assetPage === totalAssetPages}
                  className="w-8 h-8 rounded-xl border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── WIFI TAB CONTENT ───────────────────────────────────────────── */}
      {activeTab === "wifi" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
          {/* Form - Left Column */}
          <div className="lg:col-span-7 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-foreground">Generator QR Code WiFi</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Buat kode QR agar karyawan atau tamu dapat terhubung ke jaringan WiFi kantor secara instan tanpa mengetik password.
              </p>
            </div>

            <div className="space-y-4">
              {/* SSID Jaringan */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Jaringan (SSID) *</label>
                <div className="relative">
                  <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={wifiForm.ssid}
                    onChange={e => setWifiForm(w => ({ ...w, ssid: e.target.value }))}
                    placeholder="Nama WiFi Kantor / Tamu"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Encryption & Hidden */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Keamanan Jaringan</label>
                  <select
                    value={wifiForm.encryption}
                    onChange={e => setWifiForm(w => ({ ...w, encryption: e.target.value as any }))}
                    className={selectClass}
                  >
                    <option value="WPA">WPA / WPA2 (Umum)</option>
                    <option value="WEP">WEP (Jaringan Lama)</option>
                    <option value="nopass">Tanpa Sandi (Terbuka)</option>
                  </select>
                </div>

                {wifiForm.encryption !== "nopass" && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kata Sandi (Password) *</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                      <input
                        type={showWifiPassword ? "text" : "password"}
                        value={wifiForm.password}
                        onChange={e => setWifiForm(w => ({ ...w, password: e.target.value }))}
                        placeholder="Minimal 8 karakter"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setShowWifiPassword(!showWifiPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showWifiPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Hidden SSID Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="hidden-ssid"
                  checked={wifiForm.hidden}
                  onChange={e => setWifiForm(w => ({ ...w, hidden: e.target.checked }))}
                  className="w-4 h-4 rounded-md border-input bg-background accent-primary cursor-pointer"
                />
                <label htmlFor="hidden-ssid" className="text-xs text-muted-foreground select-none cursor-pointer">
                  Jaringan tersembunyi (Hidden SSID)
                </label>
              </div>
            </div>

            {/* Save to History / Clear buttons */}
            <div className="flex gap-3 justify-end pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => setWifiForm({ ssid: "", password: "", encryption: "WPA", hidden: false })}
                className="rounded-xl text-xs px-4"
              >
                Reset Form
              </Button>
              <Button
                onClick={handleSaveWifiToHistory}
                disabled={!wifiForm.ssid.trim() || (wifiForm.encryption !== "nopass" && !wifiForm.password.trim())}
                className="px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-xl text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Simpan ke Riwayat
              </Button>
            </div>
          </div>

          {/* Card Preview - Right Column */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Live WiFi Card Preview */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-md flex flex-col">
              <div className="p-5 flex flex-col items-center bg-gradient-to-br from-blue-500/10 via-primary/5 to-purple-500/10 border-b border-border">
                {/* Visual Header */}
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md mb-3">
                  <Wifi className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-foreground">KONEKSI WIFI</h4>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">PT DUTA ESA ADIPERKASA</p>
              </div>

              <div className="p-6 flex flex-col items-center gap-4 bg-card">
                {/* QR Code Container */}
                <div className="bg-white border border-border p-4 rounded-2xl shadow-sm relative flex flex-col items-center gap-2">
                  <div className="relative w-[150px] h-[150px] flex items-center justify-center">
                    <img
                      src="/dea-logo.png"
                      alt="DEA Logo"
                      className="absolute w-[110px] h-[110px] object-contain opacity-20 pointer-events-none select-none"
                    />
                    <QRCodeSVG
                      id="wifi-qr-code"
                      value={generateWifiString(wifiForm)}
                      size={150}
                      bgColor="transparent"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground font-mono tracking-wider">
                    {wifiForm.ssid || "NAMA SSID"}
                  </span>
                </div>

                {/* Connection Instructions */}
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-foreground">Pindai kode QR untuk terhubung</p>
                  <p className="text-[10px] text-muted-foreground leading-normal max-w-xs mx-auto">
                    Buka kamera ponsel Anda (iOS/Android) atau aplikasi scan QR untuk menyambung langsung ke jaringan WiFi.
                  </p>
                </div>
              </div>

              {/* Action bar */}
              <div className="border-t flex">
                <button
                  onClick={handleDownloadWifiQr}
                  disabled={!wifiForm.ssid.trim()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="w-4 h-4" /> Unduh QR Code
                </button>
              </div>
            </div>

            {/* Riwayat (Local History) */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Riwayat WiFi Tersimpan</h4>

              {wifiHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">Belum ada jaringan yang disimpan ke riwayat.</p>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {wifiHistory.map((w, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted/40 hover:bg-muted/80 border rounded-xl transition-all group cursor-pointer"
                      onClick={() => loadWifiFromHistory(w)}
                    >
                      <div className="min-w-0 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-foreground truncate">{w.ssid}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">
                            {w.encryption === "nopass" ? "Terbuka" : w.encryption}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); loadWifiFromHistory(w); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-background border transition-all"
                          title="Gunakan"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteWifiHistory(idx); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border transition-all"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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

      {/* ── Add / Edit Asset Modal ── */}
      {(showAddAsset || editAssetTarget) && (
        <Modal
          title={editAssetTarget ? `Edit Aset QR: ${editAssetTarget.code}` : "Tambah Aset QR Baru"}
          onClose={() => {
            setShowAddAsset(false)
            setEditAssetTarget(null)
            setAssetForm(EMPTY_ASSET_FORM)
          }}
        >
          <div className="p-6 space-y-4">
            {/* Nama Barang */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Barang *</label>
              <div className="relative">
                <Box className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="text" value={assetForm.name} onChange={e => setAssetForm(i => ({ ...i, name: e.target.value }))} placeholder="Contoh: MacBook Pro M3" className={inputClass} />
              </div>
            </div>

            {/* Kode Aset */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kode Aset *</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                <input type="text" value={assetForm.code} onChange={e => setAssetForm(i => ({ ...i, code: e.target.value.toUpperCase() }))} placeholder="INV-001" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Kategori */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Kategori *</label>
                <select value={assetForm.category} onChange={e => setAssetForm(i => ({ ...i, category: e.target.value }))} className={selectClass}>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Printer">Printer</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Furnitur">Furnitur</option>
                  <option value="Alat Kantor">Alat Kantor</option>
                  <option value="Kendaraan">Kendaraan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {editAssetTarget ? "Status Aset *" : "Status Awal *"}
                </label>
                <select value={assetForm.status} onChange={e => setAssetForm(i => ({ ...i, status: e.target.value }))} className={selectClass}>
                  <option value="Disimpan">Disimpan</option>
                  <option value="Digunakan">Digunakan (In Use)</option>
                  <option value="Rusak">Rusak (Broken)</option>
                  <option value="Dalam Perbaikan">Dalam Perbaikan (Repair)</option>
                  <option value="Dipinjam">Dipinjam (Borrowed)</option>
                </select>
              </div>
            </div>

            {/* Lokasi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {assetForm.category.toLowerCase() === "laptop" ? "Nama Pemakai Laptop *" : "Lokasi Penempatan *"}
              </label>
              <div className="relative">
                {assetForm.category.toLowerCase() === "laptop" ? (
                  <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                ) : (
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                )}
                <input
                  type="text"
                  value={assetForm.location}
                  onChange={e => setAssetForm(i => ({ ...i, location: e.target.value }))}
                  placeholder={assetForm.category.toLowerCase() === "laptop" ? "Contoh: Aditya Suryana - IT" : "Contoh: Gudang Utama / Ruang Kerja Lantai 2"}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Deskripsi / Keterangan</label>
              <div className="relative">
                <FileText className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground/60" />
                <textarea rows={3} value={assetForm.description} onChange={e => setAssetForm(i => ({ ...i, description: e.target.value }))} placeholder="Catatan tambahan spesifikasi barang..." className={`${inputClass} pl-9 h-auto py-2.5`} />
              </div>
            </div>

            {/* Live QR Preview */}
            {assetForm.code.trim() && (
              <div className="flex flex-col items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pratinjau QR Code Aset</p>
                <div className="bg-white p-3.5 rounded-xl border shadow-sm flex flex-col items-center gap-2">
                  <div className="relative w-[140px] h-[140px] flex items-center justify-center">
                    <img
                      src="/dea-logo.png"
                      alt="DEA Logo"
                      className="absolute w-[110px] h-[110px] object-contain opacity-60 pointer-events-none select-none"
                    />
                    <QRCodeSVG
                      value={getAssetScanUrl(editAssetTarget ? { ...editAssetTarget, ...assetForm } : assetForm)}
                      size={140}
                      bgColor="transparent"
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-muted-foreground font-mono tracking-wider uppercase">
                    {assetForm.code}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-1">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddAsset(false)
                  setEditAssetTarget(null)
                  setAssetForm(EMPTY_ASSET_FORM)
                }}
                className="rounded-xl text-xs px-4"
              >
                Batal
              </Button>
              <Button
                onClick={editAssetTarget ? handleUpdateAsset : handleSaveAsset}
                disabled={!isAssetFormValid || isSaving}
                className="px-5 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-xl text-xs"
              >
                {isSaving ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Menyimpan...</>
                ) : editAssetTarget ? (
                  <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Simpan Perubahan</>
                ) : (
                  <><QrCode className="w-3.5 h-3.5 mr-1.5" />Simpan & Buat QR</>
                )}
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

      {/* ── Delete Asset Modal ── */}
      {deleteAssetTarget && (
        <Modal title="Hapus Barang QR" onClose={() => setDeleteAssetTarget(null)}>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-700 dark:text-red-300">Tindakan ini tidak dapat dibatalkan</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                  Barang <span className="font-bold">{deleteAssetTarget.name}</span> ({deleteAssetTarget.code}) akan dihapus permanen beserta QR Code-nya.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setDeleteAssetTarget(null)} className="px-4 rounded-xl text-xs">Batal</Button>
              <Button
                disabled={isDeleting}
                onClick={handleDeleteAsset}
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
