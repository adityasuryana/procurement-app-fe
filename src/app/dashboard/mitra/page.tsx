"use client"

import React, { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Eye, Building2, User, MapPin, Scale, BadgeCheck, FileCheck2,
  Trash2, CheckCircle2, XCircle, ArrowUpDown, Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

type Sertifikat = {
  nama: string; no: string; masa: string; instansi: string
}

type Mitra = {
  id: number
  namaPerusahaan: string
  npwp: string
  sppkp: string
  pjNama: string
  pjJabatan: string
  telpPerusahaan: string
  telpPj: string
  alamat1: string
  alamat2: string
  kota: string
  kodepos: string
  aktaPendirian: string
  aktaPerubahan: string
  nib: string
  siup: string
  statusModal: string
  nibTanggal: string
  sertifikat1: Sertifikat
  sertifikat2: Sertifikat
  createdAt: string
  status: "Diproses" | "Disetujui" | "Ditolak"
  alasanDitolak?: string
  fileDitolak?: string
  fileNpwpSppkp?: string
  fileDomicile?: string
  fileDeed?: string
  fileCertificates?: string
  fileOrgStructure?: string
  fileEquipmentList?: string
  fileExperienceList?: string
  fileFinancialAudit?: string
  fileBankStatement?: string
  fileApplicationLetter?: string
}

// ── Styles ────────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<Mitra["status"], string> = {
  Diproses: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Disetujui: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Ditolak: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
}

// ── Detail Helpers ────────────────────────────────────────────────────────────

const DetailRow = ({ label, value }: { label: string; value?: string }) =>
  value ? (
    <div className="grid grid-cols-5 gap-2 py-1.5">
      <span className="col-span-2 text-xs text-muted-foreground font-medium">{label}</span>
      <span className="col-span-3 text-xs font-semibold text-foreground">{value}</span>
    </div>
  ) : null

const SectionTitle = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mt-5 mb-2">
    <div className="bg-primary/10 p-1.5 rounded-lg text-primary"><Icon className="w-3.5 h-3.5" /></div>
    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
  </div>
)

const handleDownload = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Gagal mendownload file, mengunduh via Cloudinary fl_attachment:", error);
    const cleanFilename = filename.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_");
    const extension = filename.split(".").pop() || "pdf";
    const attachmentFlag = `fl_attachment:${cleanFilename}`;
    let fallbackUrl = url;
    if (url.includes("/upload/")) {
      fallbackUrl = url.replace("/upload/", `/upload/${attachmentFlag}/`);
    } else {
      window.open(url, "_blank");
      return;
    }
    window.open(fallbackUrl, "_blank");
  }
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardMitraPage() {
  const [mitras, setMitras] = useState<Mitra[]>([])
  const [selected, setSelected] = useState<Mitra | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Mitra | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("Semua")
  const [activeTab, setActiveTab] = useState<string>("all-applications")

  // Rejection States
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [rejectionFileName, setRejectionFileName] = useState("")

  const filteredMitras = useMemo(() => {
    return mitras.filter(m => {
      if (statusFilter === "Semua") return true
      return m.status === statusFilter
    })
  }, [mitras, statusFilter])

  React.useEffect(() => {
    const fetchMitras = async () => {
      try {
        const res = await fetch("http://localhost:8015/api/partner")
        if (res.ok) {
          const data = await res.json()

          // Get saved rejections from localStorage
          const savedRejections = localStorage.getItem("mitra_rejections")
          const rejections = savedRejections ? JSON.parse(savedRejections) : {}

          const mappedData = data.map((item: any) => ({
            id: item.id,
            namaPerusahaan: item.companyName,
            npwp: item.npwpNumber,
            sppkp: item.sppkpNumber,
            pjNama: item.pjName,
            pjJabatan: item.pjPosition,
            telpPerusahaan: item.companyPhone,
            telpPj: item.pjPhone,
            alamat1: item.address1,
            alamat2: item.address2,
            kota: item.city,
            kodepos: item.postalCode,
            aktaPendirian: item.establishmentDeed,
            aktaPerubahan: item.latestAmendmentDeed,
            nib: item.nibNumber,
            siup: item.siupNumber,
            statusModal: item.investmentStatus,
            nibTanggal: item.nibDateNumber,
            sertifikat1: {
              nama: item.certificate1Name,
              no: item.certificate1Number,
              masa: item.certificate1Validity,
              instansi: item.certificate1Issuer
            },
            sertifikat2: {
              nama: item.certificate2Name,
              no: item.certificate2Number,
              masa: item.certificate2Validity,
              instansi: item.certificate2Issuer
            },
            createdAt: item.createdAt,
            status: item.status === "Pending" ? "Diproses" : item.status,
            alasanDitolak: rejections[item.id]?.alasanDitolak || "",
            fileDitolak: rejections[item.id]?.fileDitolak || "",
            fileNpwpSppkp: item.fileNpwpSppkp,
            fileDomicile: item.fileDomicile,
            fileDeed: item.fileDeed,
            fileCertificates: item.fileCertificates,
            fileOrgStructure: item.fileOrgStructure,
            fileEquipmentList: item.fileEquipmentList,
            fileExperienceList: item.fileExperienceList,
            fileFinancialAudit: item.fileFinancialAudit,
            fileBankStatement: item.fileBankStatement,
            fileApplicationLetter: item.fileApplicationLetter
          }))
          setMitras(mappedData)
        }
      } catch (error) {
        console.error("Gagal memuat data mitra:", error)
      }
    }
    fetchMitras()
  }, [])

  const handleSetStatus = async (id: number, newStatus: Mitra["status"]) => {
    const target = mitras.find(m => m.id === id)
    if (!target) return

    try {
      const res = await fetch(`http://localhost:8015/api/partner/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: target.namaPerusahaan,
          npwpNumber: target.npwp,
          sppkpNumber: target.sppkp,
          pjName: target.pjNama,
          pjPosition: target.pjJabatan,
          companyPhone: target.telpPerusahaan,
          pjPhone: target.telpPj,
          address1: target.alamat1,
          address2: target.alamat2,
          city: target.kota,
          postalCode: target.kodepos,
          establishmentDeed: target.aktaPendirian,
          latestAmendmentDeed: target.aktaPerubahan,
          nibNumber: target.nib,
          siupNumber: target.siup,
          investmentStatus: target.statusModal,
          nibDateNumber: target.nibTanggal,
          certificate1Name: target.sertifikat1.nama,
          certificate1Number: target.sertifikat1.no,
          certificate1Validity: target.sertifikat1.masa,
          certificate1Issuer: target.sertifikat1.instansi,
          certificate2Name: target.sertifikat2.nama,
          certificate2Number: target.sertifikat2.no,
          certificate2Validity: target.sertifikat2.masa,
          certificate2Issuer: target.sertifikat2.instansi,
          status: newStatus === "Diproses" ? "Pending" : newStatus
        })
      })

      if (res.ok) {
        setMitras((prev) => prev.map((m) => m.id === id ? { ...m, status: newStatus } : m))
        setSelected((prev) => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.error("Gagal memperbarui status mitra:", error)
    }
  }

  const handleRejectMitra = async () => {
    if (!selected || !rejectionReason.trim()) return

    const id = selected.id
    try {
      const res = await fetch(`http://localhost:8015/api/partner/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: selected.namaPerusahaan,
          npwpNumber: selected.npwp,
          sppkpNumber: selected.sppkp,
          pjName: selected.pjNama,
          pjJabatan: selected.pjJabatan,
          companyPhone: selected.telpPerusahaan,
          pjPhone: selected.telpPj,
          address1: selected.alamat1,
          address2: selected.alamat2,
          city: selected.kota,
          postalCode: selected.kodepos,
          establishmentDeed: selected.aktaPendirian,
          latestAmendmentDeed: selected.aktaPerubahan,
          nibNumber: selected.nib,
          siupNumber: selected.siup,
          investmentStatus: selected.statusModal,
          nibDateNumber: selected.nibTanggal,
          certificate1Name: selected.sertifikat1.nama,
          certificate1Number: selected.sertifikat1.no,
          certificate1Validity: selected.sertifikat1.masa,
          certificate1Issuer: selected.sertifikat1.instansi,
          certificate2Name: selected.sertifikat2.nama,
          certificate2Number: selected.sertifikat2.no,
          certificate2Validity: selected.sertifikat2.masa,
          certificate2Issuer: selected.sertifikat2.instansi,
          status: "Ditolak"
        })
      })

      if (res.ok) {
        const savedRejections = localStorage.getItem("mitra_rejections")
        const rejections = savedRejections ? JSON.parse(savedRejections) : {}
        rejections[id] = {
          alasanDitolak: rejectionReason.trim(),
          fileDitolak: rejectionFileName || ""
        }
        localStorage.setItem("mitra_rejections", JSON.stringify(rejections))

        setMitras((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: "Ditolak",
                  alasanDitolak: rejectionReason.trim(),
                  fileDitolak: rejectionFileName || ""
                }
              : m
          )
        )
        setSelected((prev) =>
          prev
            ? {
                ...prev,
                status: "Ditolak",
                alasanDitolak: rejectionReason.trim(),
                fileDitolak: rejectionFileName || ""
              }
            : null
        )

        setIsRejectOpen(false)
      }
    } catch (error) {
      console.error("Gagal memperbarui status penolakan mitra:", error)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`http://localhost:8015/api/partner/${deleteTarget.id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setMitras((prev) => prev.filter((m) => m.id !== deleteTarget.id))
        setDeleteTarget(null)
      }
    } catch (error) {
      console.error("Gagal menghapus mitra:", error)
    }
  }

  // ── Columns ─────────────────────────────────────────────────────────────────

  const columns: ColumnDef<Mitra>[] = useMemo(() => [
    {
      accessorKey: "namaPerusahaan",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Perusahaan <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">{row.original.namaPerusahaan}</span>
      ),
    },
    {
      accessorKey: "pjNama",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Penanggung Jawab <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground text-xs">{row.original.pjNama}</div>
          <div className="text-muted-foreground text-[11px]">{row.original.pjJabatan}</div>
        </div>
      ),
    },
    {
      accessorKey: "kota",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Kota <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.kota}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tgl Daftar <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.original.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric",
          })}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[row.original.status]}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
            onClick={() => setSelected(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [])

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Daftar Mitra</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Data perusahaan yang telah mengajukan formulir pendaftaran mitra.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Mitra", value: mitras.length,
            color: "from-primary/20 to-primary/5", text: "text-primary",
            icon: Building2,
          },
          {
            label: "Diproses", value: mitras.filter(m => m.status === "Diproses").length,
            color: "from-amber-500/20 to-amber-500/5", text: "text-amber-600 dark:text-amber-400",
            icon: BadgeCheck,
          },
          {
            label: "Disetujui", value: mitras.filter(m => m.status === "Disetujui").length,
            color: "from-emerald-500/20 to-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400",
            icon: CheckCircle2,
          },
          {
            label: "Ditolak", value: mitras.filter(m => m.status === "Ditolak").length,
            color: "from-red-500/20 to-red-500/5", text: "text-red-600 dark:text-red-400",
            icon: XCircle,
          },
        ].map(({ label, value, color, text, icon: Icon }) => (
          <div key={label} className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${color} p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <div className={`p-1.5 rounded-lg bg-background/60 ${text}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${text}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col gap-6 min-h-0">
        <div className="shrink-0 border-b pb-1">
          <TabsList variant="line" className="h-9">
            <TabsTrigger value="all-applications" className="flex items-center gap-1.5 font-bold">
              <Building2 className="w-4 h-4" /> Daftar Pengajuan
              <Badge variant="outline" className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-primary/10 text-primary border-primary/20">
                {mitras.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved-mitras" className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-pulse" /> Mitra Berjalan
              <Badge variant="outline" className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                {mitras.filter(m => m.status === "Disetujui").length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── TAB 1: ALL APPLICATIONS (DAFTAR PENGAJUAN) ─────────────────────────────────── */}
        <TabsContent value="all-applications" className="flex-1 flex flex-col gap-6 outline-none">
          {/* Status Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div className="flex flex-wrap items-center gap-1.5 border p-1 rounded-lg bg-muted/20 w-fit">
              {["Semua", "Diproses", "Disetujui", "Ditolak"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                    statusFilter === status
                      ? "bg-background text-foreground shadow-sm font-bold border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* DataTable */}
          <DataTable columns={columns} data={filteredMitras} searchKey="namaPerusahaan" />
        </TabsContent>

        {/* ── TAB 2: APPROVED MITRAS (MITRA BERJALAN) ───────────────────────────────────── */}
        <TabsContent value="approved-mitras" className="flex-1 flex flex-col gap-6 outline-none">
          {/* DataTable for only Disetujui status */}
          <DataTable columns={columns} data={mitras.filter(m => m.status === "Disetujui")} searchKey="namaPerusahaan" />
        </TabsContent>
      </Tabs>

      {/* ── Detail Modal ──────────────────────────────────────────────────────── */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col rounded-xl [&>button:first-of-type]:hidden p-0 gap-0">
          {selected && (
            <>
              {/* Sticky Header */}
              <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-background rounded-t-xl">
                <DialogHeader>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2.5 rounded-xl text-primary mt-0.5">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg leading-tight">{selected.namaPerusahaan}</DialogTitle>
                      <DialogDescription className="text-xs mt-0.5">
                        ID #{selected.id} · Didaftarkan{" "}
                        {new Date(selected.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                      </DialogDescription>
                    </div>
                    <span className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${STATUS_STYLE[selected.status]}`}>
                      {selected.status}
                    </span>
                  </div>
                </DialogHeader>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 pt-4 pb-2 [&::-webkit-scrollbar]:hidden">
                {selected.status === "Ditolak" && (
                  <div className="mb-4 p-4 border border-red-200 bg-red-50/60 dark:bg-red-950/40 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider">Kemitraan Ditolak</span>
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-300/90 leading-relaxed">
                      <p className="font-semibold">Alasan Penolakan:</p>
                      <p className="mt-1 bg-background/50 p-2.5 rounded-lg border border-red-100/50 whitespace-pre-line italic">
                        {selected.alasanDitolak || "Tidak ada alasan spesifik yang diberikan."}
                      </p>
                    </div>
                    {selected.fileDitolak && (
                      <div className="pt-1.5 flex items-center gap-1.5 text-xs">
                        <span className="text-red-500 font-medium">Lampiran Bukti:</span>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            alert(`Membuka lampiran penolakan: ${selected.fileDitolak}`)
                          }}
                          className="text-primary hover:underline font-bold inline-flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded border border-primary/10"
                        >
                          <FileCheck2 className="w-3 h-3" /> {selected.fileDitolak}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <SectionTitle icon={Building2} title="Informasi Perusahaan" />
                <DetailRow label="Nama Perusahaan" value={selected.namaPerusahaan} />
                <DetailRow label="Nomor NPWP" value={selected.npwp} />
                <DetailRow label="Nomor SPPKP" value={selected.sppkp} />

                <Separator className="mt-3" />

                <SectionTitle icon={User} title="Penanggung Jawab" />
                <DetailRow label="Nama Lengkap" value={selected.pjNama} />
                <DetailRow label="Jabatan" value={selected.pjJabatan} />

                <Separator className="mt-3" />

                <SectionTitle icon={MapPin} title="Kontak & Alamat" />
                <DetailRow label="Telp Perusahaan" value={selected.telpPerusahaan} />
                <DetailRow label="Telp Penanggung Jawab" value={selected.telpPj} />
                <DetailRow label="Alamat Jalan" value={selected.alamat1} />
                {selected.alamat2 && <DetailRow label="Alamat (lanjutan)" value={selected.alamat2} />}
                <DetailRow label="Kota / Provinsi" value={selected.kota} />
                <DetailRow label="Kode Pos" value={selected.kodepos} />

                <Separator className="mt-3" />

                <SectionTitle icon={Scale} title="Landasan Hukum & Pendirian" />
                <DetailRow label="Akta Pendirian" value={selected.aktaPendirian} />
                <DetailRow label="Akta Perubahan" value={selected.aktaPerubahan || "—"} />
                <DetailRow label="Nomor & Tanggal NIB" value={selected.nib} />
                <DetailRow label="Nomor SIUP" value={selected.siup} />

                <Separator className="mt-3" />

                <SectionTitle icon={BadgeCheck} title="NIB & Sertifikat Badan Usaha" />
                <DetailRow label="Status Penanaman Modal" value={selected.statusModal} />
                <DetailRow label="Nomor Tanggal NIB" value={selected.nibTanggal} />

                {selected.sertifikat1.nama && (
                  <div className="mt-3 p-3 border rounded-xl bg-muted/20 space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Sertifikat 1</p>
                    <DetailRow label="Nama Sertifikat" value={selected.sertifikat1.nama} />
                    <DetailRow label="No & Tgl" value={selected.sertifikat1.no} />
                    <DetailRow label="Masa Berlaku" value={selected.sertifikat1.masa} />
                    <DetailRow label="Instansi Penerbit" value={selected.sertifikat1.instansi} />
                  </div>
                )}
                {selected.sertifikat2.nama && (
                  <div className="mt-2 p-3 border rounded-xl bg-muted/20 space-y-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Sertifikat 2</p>
                    <DetailRow label="Nama Sertifikat" value={selected.sertifikat2.nama} />
                    <DetailRow label="No & Tgl" value={selected.sertifikat2.no} />
                    <DetailRow label="Masa Berlaku" value={selected.sertifikat2.masa} />
                    <DetailRow label="Instansi Penerbit" value={selected.sertifikat2.instansi} />
                  </div>
                )}

                <Separator className="mt-3" />

                <SectionTitle icon={FileCheck2} title="Dokumen Persyaratan Administrasi" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 pb-2">
                  {[
                    { label: "Dokumen NPWP & SPPKP", url: selected.fileNpwpSppkp },
                    { label: "Akta Domisili", url: selected.fileDomicile },
                    { label: "Dokumen Akta Hukum", url: selected.fileDeed },
                    { label: "Dokumen Sertifikat Badan Usaha", url: selected.fileCertificates },
                    { label: "Struktur Organisasi", url: selected.fileOrgStructure },
                    { label: "Daftar Alat Kerja & APD", url: selected.fileEquipmentList },
                    { label: "List Pengalaman & BAST", url: selected.fileExperienceList },
                    { label: "Laporan Audit Keuangan", url: selected.fileFinancialAudit },
                    { label: "Rekening Koran", url: selected.fileBankStatement },
                    { label: "Surat Permohonan Mitra", url: selected.fileApplicationLetter },
                  ].map((doc) => {
                    const hasFile = !!doc.url;
                    return (
                      <div key={doc.label} className={cn(
                        "flex items-center justify-between border rounded-xl p-3 shadow-xs transition-all",
                        hasFile 
                          ? "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-primary/40 hover:shadow-md" 
                          : "bg-neutral-50/50 dark:bg-neutral-950/20 border-dashed border-neutral-200 dark:border-neutral-800/80 opacity-60"
                      )}>
                        <div className="flex items-center gap-2.5 min-w-0 mr-2">
                          <div className={cn(
                            "p-1.5 rounded-lg shrink-0",
                            hasFile 
                              ? "bg-primary/10 text-primary" 
                              : "bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-400"
                          )}>
                            <FileCheck2 className="w-4 h-4" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 truncate">{doc.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                              {hasFile ? "Berkas terlampir (PDF/Gambar)" : "Belum diunggah"}
                            </p>
                          </div>
                        </div>
                        {hasFile ? (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-primary/5 hover:bg-primary text-primary hover:text-white border-primary/15 h-7 px-2.5 rounded-lg text-[10px] font-bold shadow-xs transition-all shrink-0"
                              onClick={() => window.open(doc.url, "_blank")}
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> Lihat
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-600 text-emerald-600 hover:text-white border-emerald-500/15 h-7 px-2.5 rounded-lg text-[10px] font-bold shadow-xs transition-all shrink-0"
                              onClick={() => {
                                const cleanCompanyName = selected.namaPerusahaan.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                                const cleanDocLabel = doc.label.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                                const fileExtension = doc.url.split(".").pop()?.split("?")[0] || "pdf";
                                const fileName = `${cleanCompanyName} - ${cleanDocLabel}.${fileExtension}`;
                                handleDownload(doc.url, fileName);
                              }}
                            >
                              <Download className="w-3.5 h-3.5 mr-1" /> Unduh
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-muted-foreground bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md shrink-0">
                            Kosong
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t bg-muted/30 rounded-b-xl">
                <p className="text-xs text-muted-foreground">
                  Status saat ini:{" "}
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLE[selected.status]}`}>
                    {selected.status}
                  </span>
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setRejectionReason("")
                      setRejectionFileName("")
                      setIsRejectOpen(true)
                    }}
                    disabled={selected.status === "Ditolak"}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" /> Tolak
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleSetStatus(selected.id, "Disetujui")}
                    disabled={selected.status === "Disetujui"}
                  >
                    <CheckCircle2 className="mr-1.5 h-4 w-4" /> Setujui
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelected(null)}>Tutup</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-md rounded-xl [&>button:first-of-type]:hidden p-0 gap-0 overflow-hidden">
          <div className="flex flex-col items-center text-center px-8 pt-8 pb-6">
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="w-7 h-7 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-bold mb-1">Hapus Mitra</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Anda akan menghapus data mitra berikut secara permanen:
            </DialogDescription>
            <div className="mt-3 px-4 py-3 bg-muted/50 rounded-xl border w-full">
              <p className="font-semibold text-sm text-foreground">{deleteTarget?.namaPerusahaan}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{deleteTarget?.pjNama} · {deleteTarget?.kota}</p>
            </div>
            <p className="text-xs text-destructive/80 mt-3 font-medium">
              Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex gap-2 px-8 pb-6">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button className="flex-1 bg-destructive hover:bg-destructive/90 text-white" onClick={confirmDelete}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Rejection Reason & Attachment Dialog ────────────────────────────────── */}
      <Dialog open={isRejectOpen} onOpenChange={(o) => !o && setIsRejectOpen(false)}>
        <DialogContent className="max-w-md rounded-xl [&>button:first-of-type]:hidden p-0 gap-0 overflow-hidden border">
          <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-background">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">Alasan & Lampiran Penolakan</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Silakan isi alasan penolakan dan lampirkan berkas bukti pendukung (PDF/Foto) untuk mitra ini.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 px-6 py-4 space-y-4 text-xs">
            {/* Rejection Reason */}
            <div className="grid gap-1">
              <label htmlFor="rejection-reason" className="font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Alasan Penolakan
              </label>
              <textarea
                id="rejection-reason"
                placeholder="Tulis alasan penolakan di sini..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="flex min-h-[90px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
            </div>

            {/* Rejection Attachment */}
            <div className="grid gap-1">
              <label className="font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Lampiran Bukti (PDF / Foto)
              </label>
              <div
                onClick={() => {
                  const input = document.getElementById("rejection-file-input")
                  input?.click()
                }}
                className={cn(
                  "border border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-1.5",
                  rejectionFileName
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/10"
                )}
              >
                <input
                  id="rejection-file-input"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setRejectionFileName(file.name)
                    }
                  }}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                {rejectionFileName ? (
                  <>
                    <FileCheck2 className="w-5 h-5 text-primary shrink-0 animate-bounce" />
                    <p className="font-bold text-foreground truncate max-w-[280px]">
                      {rejectionFileName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Lampiran terpilih · Klik untuk ganti berkas
                    </p>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-5 h-5 text-muted-foreground shrink-0" />
                    <p className="font-bold text-foreground">
                      Pilih Foto / Dokumen PDF Bukti
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Klik untuk mengunggah bukti pendukung
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t bg-muted/30 px-6 py-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={!rejectionReason.trim()}
              onClick={handleRejectMitra}
            >
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}