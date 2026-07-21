"use client"

import React, { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  Tag,
  MapPin,
  Sliders,
  Activity,
  FileText,
  Loader2,
  Building2,
  Calendar,
  Sun,
  Moon,
  AlertTriangle,
  User,
} from "lucide-react"

type QRAsset = {
  id: string | number
  name: string
  code: string
  category: string
  location: string
  status: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

function ScanContent() {
  const searchParams = useSearchParams()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [item, setItem] = useState<QRAsset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const token = searchParams.get("token")
  const id = searchParams.get("id")

  useEffect(() => {
    if (!token && !id) {
      // Fallback for legacy QR codes that contain all data parameters
      const nameParam = searchParams.get("name")
      if (nameParam) {
        setItem({
          id: "legacy",
          name: nameParam,
          code: searchParams.get("code") || "—",
          category: searchParams.get("category") || "—",
          location: searchParams.get("location") || "—",
          status: searchParams.get("status") || "—",
          description: searchParams.get("description") || ""
        })
        setIsLoading(false)
      } else {
        setError("Parameter scan QR tidak valid.")
        setIsLoading(false)
      }
      return
    }

    if (token === "preview" || id === "preview") {
      // Mock data for preview scans
      setItem({
        id: "preview",
        name: "Contoh Nama Barang Aset",
        code: "INV-PREVIEW-001",
        category: "Elektronik",
        location: "Gudang Utama",
        status: "Baik",
        description: "Ini adalah pratinjau layout hasil scan barang."
      })
      setIsLoading(false)
      return
    }

    // Fetch the data from backend dynamically
    const fetchItem = async () => {
      setIsLoading(true)
      try {
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015"
        if (typeof window !== "undefined") {
          const hostname = window.location.hostname
          if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
            if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) {
              apiUrl = `http://${hostname}:8015`
            }
          }
        }

        const fetchUrl = token
          ? `${apiUrl}/api/qrasset/token/${token}`
          : `${apiUrl}/api/qrasset/${id}`

        const res = await fetch(fetchUrl)
        if (res.ok) {
          const data = await res.json()
          setItem(data)
        } else {
          setError("Data aset tidak ditemukan atau telah dihapus.")
        }
      } catch {
        setError("Gagal terhubung ke server untuk memuat data.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchItem()
  }, [token, id, searchParams])

  // Status badge styling
  let statusBadgeClass = ""
  if (item) {
    switch (item.status) {
      case "Disimpan":
        statusBadgeClass = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
        break
      case "Rusak":
        statusBadgeClass = "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20"
        break
      case "Dalam Perbaikan":
        statusBadgeClass = "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
        break
      case "Dipinjam":
        statusBadgeClass = "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
        break
      case "Digunakan":
        statusBadgeClass = "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20"
        break
      default:
        statusBadgeClass = "bg-slate-100 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-500/20"
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 relative overflow-hidden transition-colors duration-300">

      {/* Floating Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full w-9 h-9 border-slate-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xs text-slate-700 dark:text-neutral-300 shadow-xs hover:bg-slate-100 dark:hover:bg-neutral-800/80 transition-all cursor-pointer"
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 dark:text-neutral-300" />
          )}
        </Button>
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white/85 dark:bg-neutral-900/60 backdrop-blur-xl border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl z-10 flex flex-col space-y-6 transition-colors duration-300">

        {/* Header branding */}
        <div className="text-center pb-4 border-b border-slate-200 dark:border-neutral-800/80">
          <div className="inline-flex items-center justify-center p-2.5 bg-white dark:bg-neutral-950 border border-slate-200/60 dark:border-neutral-800 rounded-2xl mb-2 shadow-xs">
            <img src="/dea-logo.png" alt="DEA Logo" className="h-8 w-auto object-contain" />
          </div>
          <h1 className="text-base font-extrabold tracking-tight text-[#3c58b9] dark:text-[#5271e8]">PT DUTA ESA ADIPERKASA</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Spesifikasi Aset</p>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Memuat informasi aset...</span>
          </div>
        ) : error ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
          </div>
        ) : item ? (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Aset</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">{item.name}</h2>
              <p className="text-xs text-primary font-bold mt-1 tracking-wide">{item.code}</p>
            </div>

            <div className="border-t border-slate-200 dark:border-neutral-800/60 pt-4 space-y-3">
              {/* Category */}
              <div className="flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-primary">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Kategori</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{item.category}</p>
                </div>
              </div>



              {/* Location */}
              {(() => {
                const isLaptop = item.category?.toLowerCase() === "laptop"
                return (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-primary">
                      {isLaptop ? <User className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                        {isLaptop ? "Nama Pemakai Laptop" : "Lokasi Penempatan"}
                      </p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{item.location}</p>
                    </div>
                  </div>
                )
              })()}

              {/* Status */}
              <div className="flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-primary">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Status Aset</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeClass}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-slate-200 dark:border-neutral-800/60 pt-4">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">Deskripsi / Keterangan</span>
              <div className="bg-slate-50 dark:bg-neutral-950/40 border border-slate-200 dark:border-neutral-800/80 rounded-xl p-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[60px]">
                {item.description || "Tidak ada keterangan tambahan."}
              </div>
            </div>

            {/* Timestamp context */}
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground pt-4 border-t border-slate-200 dark:border-neutral-800/60">
              <Calendar className="w-3.5 h-3.5" />
              <span>Terverifikasi Melalui Pindai Kode QR Aset</span>
            </div>
          </div>
        ) : null}

        {/* Brand footer */}
        <p className="text-center text-[9px] text-muted-foreground pt-2">
          &copy; {new Date().getFullYear()} PT Duta Esa Adiperkasa. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default function PublicScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    }>
      <ScanContent />
    </Suspense>
  )
}
