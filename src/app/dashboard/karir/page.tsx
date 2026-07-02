"use client"

import React, { useState, useMemo, useEffect } from "react"
import XLSX from "xlsx-js-style"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Plus,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  Eye,
  ArrowUpDown,
  Briefcase,
  AlertCircle,
  EyeOff,
  Sparkles,
  Mail,
  Phone,
  GraduationCap,
  Award,
  FileText,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

type JobVacancy = {
  id: string
  title: string
  department: string
  type: "Full-time" | "Internship"
  location: string
  status: "Aktif" | "Nonaktif" | "Draft"
  createdAt: string
  deadline: string
  applicants: number
  description: string
  requirements: string
}

type Applicant = {
  id: string
  vacancyId: string
  name: string
  email: string
  phone: string
  status: "Review" | "Interview" | "Diterima" | "Ditolak"
  appliedAt: string
  education: string
  experience: string
  cv: string
}


// ── Status Style Configurations ──────────────────────────────────────────────

const STATUS_STYLE: Record<JobVacancy["status"], string> = {
  Aktif: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200",
  Nonaktif: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200",
  Draft: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200",
}

const TYPE_STYLE: Record<JobVacancy["type"], string> = {
  "Full-time": "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200",
  "Internship": "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200",
}

const APPLICANT_STATUS_STYLE: Record<Applicant["status"], string> = {
  Review: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-200",
  Interview: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200",
  Diterima: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200",
  Ditolak: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200",
}

// ── Detail Helpers ────────────────────────────────────────────────────────────

const SectionTitle = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <div className="flex items-center gap-2 mt-5 mb-3">
    <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
      <Icon className="w-3.5 h-3.5" />
    </div>
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
    const cleanFilename = filename.split(".")[0].replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
    const cleanFilenameUnderscores = cleanFilename.replace(/\s+/g, "_");
    const attachmentFlag = `fl_attachment:${cleanFilenameUnderscores}`;
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

// ── Main Page Component ────────────────────────────────────────────────────────

export default function DashboardKarirPage() {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("Semua")
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<string>("Semua")
  const [activeTab, setActiveTab] = useState<string>("vacancies")

  // Selected States for modals
  const [selectedVacancy, setSelectedVacancy] = useState<JobVacancy | null>(null)
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)

  // Dialog open states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isApplicantDetailOpen, setIsApplicantDetailOpen] = useState(false)
  const [isDeleteApplicantOpen, setIsDeleteApplicantOpen] = useState(false)
  const [applicantToDelete, setApplicantToDelete] = useState<Applicant | null>(null)

  // Form State for job vacancies
  const [formData, setFormData] = useState({
    title: "",
    department: "Procurement",
    type: "Full-time" as JobVacancy["type"],
    location: "",
    status: "Draft" as JobVacancy["status"],
    deadline: "",
    applicants: 0,
    description: "",
    requirements: ""
  })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015"

  // Load from database on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vacRes, appRes] = await Promise.all([
          fetch(`${apiUrl}/api/career/vacancies`),
          fetch(`${apiUrl}/api/career/applicants`)
        ])
        if (!vacRes.ok || !appRes.ok) throw new Error("Gagal mengambil data dari database")

        const vacanciesData = await vacRes.json()
        const applicantsData = await appRes.json()

        // Sync and map vacancies
        const mappedVacancies = vacanciesData.map((v: any) => ({
          ...v,
          applicants: Array.isArray(v.applicants) ? v.applicants.length : (v.applicants || 0)
        }))

        // Sync and map applicants
        const mappedApplicants = applicantsData.map((a: any) => ({
          ...a,
          appliedAt: a.createdAt ? a.createdAt.split('T')[0] : a.appliedAt
        }))

        setVacancies(mappedVacancies)
        setApplicants(mappedApplicants)
      } catch (error) {
        console.error("Gagal mengambil data dari database, menggunakan fallback localStorage:", error)
        // Load applicants fallback
        const savedApplicants = localStorage.getItem("procurement_applicants")
        let currentApps: Applicant[] = []
        if (savedApplicants) {
          try {
            currentApps = JSON.parse(savedApplicants)
          } catch (e) {
            console.error("Gagal membaca applicants dari localStorage", e)
          }
        }
        setApplicants(currentApps)

        // Load vacancies fallback
        const savedVacancies = localStorage.getItem("procurement_vacancies")
        if (savedVacancies) {
          try {
            const parsedVac = JSON.parse(savedVacancies)
            const syncedVac = parsedVac.map((v: JobVacancy) => {
              const count = currentApps.filter(a => a.vacancyId === v.id).length
              return { ...v, applicants: count }
            })
            setVacancies(syncedVac)
          } catch (e) {
            console.error("Gagal membaca vacancies dari localStorage", e)
            setVacancies([])
          }
        } else {
          setVacancies([])
        }
      }
    }
    fetchData()
  }, [])

  const handleExportApplicantsXLSX = () => {
    const rows = filteredApplicants.map(app => {
      const job = vacancies.find(v => v.id === app.vacancyId)
      return {
        "ID Pelamar": app.id,
        "Nama Lengkap": app.name,
        "Email": app.email,
        "Nomor HP": app.phone,
        "Pendidikan Terakhir": app.education,
        "Pengalaman Kerja": app.experience,
        "Posisi Dilamar": job ? job.title : "Posisi Dihapus",
        "Departemen": job ? job.department : "—",
        "Status Rekrutmen": app.status,
        "Tanggal Melamar": new Date(app.appliedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        "Link CV / Resume": app.cv || "Belum diunggah"
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(rows)

    // Calculate dynamic column widths
    const cols = Object.keys(rows[0] || {})
    const max_widths = cols.map(col => {
      let maxLen = col.length
      rows.forEach(row => {
        const val = row[col as keyof typeof row]
        if (val !== null && val !== undefined && val !== "") {
          const strVal = String(val)
          if (strVal.length > maxLen) {
            maxLen = strVal.length
          }
        }
      })
      // Clip extremely long fields like experience or links to max 40 characters for sheet columns
      return { wch: Math.min(maxLen + 6, 40) }
    })
    worksheet["!cols"] = max_widths

    // Add Autofilter
    if (worksheet["!ref"]) {
      worksheet["!autofilter"] = { ref: worksheet["!ref"] }
    }

    // Style table headers with DEA Royal Blue background (#0052CC) and white bold text
    const totalCols = cols.length
    for (let colIdx = 0; colIdx < totalCols; ++colIdx) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx })
      const cell = worksheet[cellRef]
      if (cell) {
        cell.s = {
          fill: {
            patternType: "solid",
            fgColor: { rgb: "0052CC" }
          },
          font: {
            name: "Segoe UI",
            sz: 10,
            bold: true,
            color: { rgb: "FFFFFF" }
          },
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: true
          },
          border: {
            bottom: { style: "medium", color: { rgb: "003399" } },
            top: { style: "thin", color: { rgb: "CCCCCC" } },
            left: { style: "thin", color: { rgb: "CCCCCC" } },
            right: { style: "thin", color: { rgb: "CCCCCC" } }
          }
        }
      }
    }

    // 3. Make CV links clickable with blue underline styling
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')
    const cvColIdx = cols.indexOf("Link CV / Resume")
    if (cvColIdx !== -1) {
      for (let r = range.s.r + 1; r <= range.e.r; ++r) {
        const cellRef = XLSX.utils.encode_cell({ r, c: cvColIdx })
        const cell = worksheet[cellRef]
        if (cell && cell.v && typeof cell.v === 'string' && cell.v.startsWith('http')) {
          cell.l = {
            Target: cell.v,
            Tooltip: "Buka Curriculum Vitae"
          }
          cell.s = {
            font: {
              name: "Segoe UI",
              sz: 10,
              color: { rgb: "0066CC" },
              underline: true
            }
          }
        }
      }
    }

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daftar Pelamar")
    XLSX.writeFile(workbook, `Daftar_Pelamar_Karir_DEA_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  // Handle Input Changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const isFormValid = useMemo(() => {
    return Boolean(
      formData.title.trim() &&
      formData.department.trim() &&
      formData.location.trim() &&
      formData.deadline.trim() &&
      formData.description.trim() &&
      formData.requirements.trim()
    )
  }, [formData])

  // CRUD Vacancy Actions
  const handleCreateVacancy = async () => {
    if (!isFormValid) return
    try {
      const res = await fetch(`${apiUrl}/api/career/vacancies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          department: formData.department,
          type: formData.type,
          location: formData.location.trim(),
          status: formData.status,
          deadline: formData.deadline,
          description: formData.description.trim(),
          requirements: formData.requirements.trim()
        })
      })
      if (!res.ok) throw new Error("Gagal menyimpan lowongan")
      const newVacancy = await res.json()

      const mappedVacancy = {
        ...newVacancy,
        applicants: 0
      }
      setVacancies(prev => [mappedVacancy, ...prev])
      setIsAddOpen(false)
      resetForm()
    } catch (error) {
      console.error("Gagal menambah lowongan:", error)
      alert("Gagal menambahkan lowongan ke database")
    }
  }

  const handleUpdateVacancy = async () => {
    if (!selectedVacancy || !isFormValid) return
    try {
      const res = await fetch(`${apiUrl}/api/career/vacancies/${selectedVacancy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title.trim(),
          department: formData.department,
          type: formData.type,
          location: formData.location.trim(),
          status: formData.status,
          deadline: formData.deadline,
          description: formData.description.trim(),
          requirements: formData.requirements.trim()
        })
      })
      if (!res.ok) throw new Error("Gagal memperbarui lowongan")
      const updatedVacancy = await res.json()

      setVacancies(prev => prev.map(v => {
        if (v.id === selectedVacancy.id) {
          return {
            ...updatedVacancy,
            applicants: v.applicants
          }
        }
        return v
      }))
      setIsEditOpen(false)
      setSelectedVacancy(null)
      resetForm()
    } catch (error) {
      console.error("Gagal memperbarui lowongan:", error)
      alert("Gagal memperbarui lowongan di database")
    }
  }

  const handleDeleteVacancy = async () => {
    if (!selectedVacancy) return
    try {
      const res = await fetch(`${apiUrl}/api/career/vacancies/${selectedVacancy.id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Gagal menghapus lowongan")

      setVacancies(prev => prev.filter(v => v.id !== selectedVacancy.id))
      setApplicants(prev => prev.filter(a => a.vacancyId !== selectedVacancy.id))

      setIsDeleteOpen(false)
      setSelectedVacancy(null)
    } catch (error) {
      console.error("Gagal menghapus lowongan:", error)
      alert("Gagal menghapus lowongan dari database")
    }
  }

  const handleToggleStatus = async (vacancy: JobVacancy) => {
    const nextStatus: JobVacancy["status"] = vacancy.status === "Aktif" ? "Nonaktif" : "Aktif"
    try {
      const res = await fetch(`${apiUrl}/api/career/vacancies/${vacancy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      })
      if (!res.ok) throw new Error("Gagal mengubah status lowongan")
      const updatedVacancy = await res.json()

      setVacancies(prev => prev.map(v => {
        if (v.id === vacancy.id) {
          return {
            ...updatedVacancy,
            applicants: v.applicants
          }
        }
        return v
      }))
    } catch (error) {
      console.error("Gagal mengubah status lowongan:", error)
      alert("Gagal mengubah status lowongan")
    }
  }

  // CRUD Applicant Actions
  const handleUpdateApplicantStatus = async (appId: string, newStatus: Applicant["status"]) => {
    try {
      const res = await fetch(`${apiUrl}/api/career/applicants/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok && res.status !== 404) throw new Error("Gagal mengubah status pelamar")

      setApplicants(prev => prev.map(a => {
        if (a.id === appId) {
          return {
            ...a,
            status: newStatus
          }
        }
        return a
      }))
    } catch (error) {
      console.error("Gagal memperbarui status pelamar:", error)
      alert("Gagal memperbarui status pelamar")
    }
  }

  const handleDeleteApplicantConfirm = async () => {
    if (!applicantToDelete) return
    try {
      const res = await fetch(`${apiUrl}/api/career/applicants/${applicantToDelete.id}`, {
        method: "DELETE"
      })
      if (!res.ok && res.status !== 404) throw new Error("Gagal menghapus data pelamar")

      const vacancyId = applicantToDelete.vacancyId

      setApplicants(prev => prev.filter(a => a.id !== applicantToDelete.id))

      if (vacancyId) {
        setVacancies(prev => prev.map(v => {
          if (v.id === vacancyId) {
            const newCount = Math.max(0, v.applicants - 1)
            if (selectedVacancy && selectedVacancy.id === vacancyId) {
              setSelectedVacancy({ ...selectedVacancy, applicants: newCount })
            }
            return { ...v, applicants: newCount }
          }
          return v
        }))
      }
      setIsDeleteApplicantOpen(false)
      setApplicantToDelete(null)
    } catch (error) {
      console.error("Gagal menghapus pelamar:", error)
      alert("Gagal menghapus pelamar dari database")
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      department: "Procurement",
      type: "Full-time",
      location: "",
      status: "Draft",
      deadline: "",
      applicants: 0,
      description: "",
      requirements: ""
    })
  }

  const triggerAddModal = () => {
    resetForm()
    setIsAddOpen(true)
  }

  // Filtering data for vacancies table
  const filteredData = useMemo(() => {
    return vacancies.filter(v => {
      if (statusFilter === "Semua") return true
      return v.status === statusFilter
    })
  }, [vacancies, statusFilter])

  // Filtering data for all applicants table
  const filteredApplicants = useMemo(() => {
    return applicants.filter(a => {
      if (applicantStatusFilter === "Semua") return true
      return a.status === applicantStatusFilter
    })
  }, [applicants, applicantStatusFilter])

  // Get applicants for selected vacancy
  const currentApplicants = useMemo(() => {
    if (!selectedVacancy) return []
    return applicants.filter(a => a.vacancyId === selectedVacancy.id)
  }, [applicants, selectedVacancy])

  // Stat computations for vacancies
  const vacancyStats = useMemo(() => {
    const total = vacancies.length
    const active = vacancies.filter(v => v.status === "Aktif").length
    const draft = vacancies.filter(v => v.status === "Draft").length
    const applicantsCount = applicants.length
    return { total, active, draft, applicantsCount }
  }, [vacancies, applicants])

  // Stat computations for all applicants
  const applicantStats = useMemo(() => {
    const total = applicants.length
    const review = applicants.filter(a => a.status === "Review").length
    const interview = applicants.filter(a => a.status === "Interview").length
    const accepted = applicants.filter(a => a.status === "Diterima").length
    return { total, review, interview, accepted }
  }, [applicants])

  // ── Columns Definition for Job Vacancies ─────────────────────────────────────

  const vacancyColumns: ColumnDef<JobVacancy>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-foreground text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Posisi Pekerjaan <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.original.title}</span>
          <span className="text-[11px] text-muted-foreground font-medium">{row.original.department}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipe",
      cell: ({ row }) => {
        const type = row.original.type
        return (
          <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-semibold rounded-full border", TYPE_STYLE[type])}>
            {type}
          </Badge>
        )
      },
    },
    {
      accessorKey: "location",
      header: "Lokasi",
      cell: ({ row }) => (
        <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
          <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
          <span>{row.original.location}</span>
        </div>
      ),
    },
    {
      accessorKey: "applicants",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pelamar <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center font-semibold text-xs text-foreground gap-1.5 whitespace-nowrap">
          <Users className="h-3.5 w-3.5 text-primary/60" />
          <span>{row.original.applicants} Pelamar</span>
        </div>
      ),
    },
    {
      accessorKey: "deadline",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Batas Waktu <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.deadline)
        const formatted = date.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        const isPast = date < new Date()
        return (
          <span
            className={cn(
              "text-xs font-medium flex items-center gap-1.5 whitespace-nowrap",
              isPast ? "text-red-500 font-semibold" : "text-muted-foreground"
            )}
          >
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {formatted}
            {isPast && (
              <span className="text-[9px] bg-red-100 dark:bg-red-950/60 px-1 py-0.2 rounded font-semibold text-red-600 dark:text-red-400">
                Tutup
              </span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
              STATUS_STYLE[status]
            )}
          >
            {status}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-lg"
            title="Lihat Detail & Pelamar"
            onClick={() => {
              setSelectedVacancy(row.original)
              setIsDetailOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7 hover:bg-amber-500/10 hover:text-amber-600 rounded-lg"
            title="Edit Lowongan"
            onClick={() => {
              setSelectedVacancy(row.original)
              setFormData({
                title: row.original.title,
                department: row.original.department,
                type: row.original.type,
                location: row.original.location,
                status: row.original.status,
                deadline: row.original.deadline,
                applicants: row.original.applicants,
                description: row.original.description,
                requirements: row.original.requirements
              })
              setIsEditOpen(true)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn(
              "h-7 w-7 rounded-lg",
              row.original.status === "Aktif"
                ? "hover:bg-red-500/10 hover:text-red-500"
                : "hover:bg-emerald-500/10 hover:text-emerald-600"
            )}
            title={row.original.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
            onClick={() => handleToggleStatus(row.original)}
          >
            {row.original.status === "Aktif" ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive rounded-lg"
            title="Hapus Lowongan"
            onClick={() => {
              setSelectedVacancy(row.original)
              setIsDeleteOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ], [vacancies])

  // ── Columns Definition for All Applicants Table ─────────────────────────────

  const applicantColumns: ColumnDef<Applicant>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-foreground text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Pelamar <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "vacancyId",
      header: "Posisi yang Dilamar",
      cell: ({ row }) => {
        const vacancy = vacancies.find(v => v.id === row.original.vacancyId)
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-foreground">{vacancy ? vacancy.title : "Posisi Dihapus"}</span>
            <span className="text-[10px] text-muted-foreground">{vacancy ? vacancy.department : "—"}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "email",
      header: "Kontak",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <span>{row.original.email}</span>
          <span>{row.original.phone}</span>
        </div>
      )
    },
    {
      accessorKey: "cv",
      header: "CV / Resume",
      cell: ({ row }) => (
        row.original.cv ? (
          <div className="flex items-center gap-1.5">
            <Button
              size="xs"
              variant="outline"
              className="bg-primary/5 hover:bg-primary text-primary hover:text-white border-primary/15 h-6 px-2 rounded text-[10px] font-bold shadow-xs transition-all shrink-0"
              onClick={() => {
                if (row.original.cv) {
                  window.open(row.original.cv, "_blank");
                }
              }}
            >
              <FileText className="w-3 h-3 mr-0.5 shrink-0" />
              Lihat CV
            </Button>
            <Button
              size="xs"
              variant="outline"
              className="bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-600 text-emerald-600 hover:text-white border-emerald-500/15 h-6 px-2 rounded text-[10px] font-bold shadow-xs transition-all shrink-0"
              onClick={() => {
                if (!row.original.cv) return;
                const job = vacancies.find(v => v.id === row.original.vacancyId);
                const jobTitle = job ? job.title : "Posisi";
                const cleanName = row.original.name.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                const cleanJobTitle = jobTitle.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                const fileExtension = row.original.cv.split(".").pop()?.split("?")[0] || "pdf";
                const fileName = `${cleanName} - CV - ${cleanJobTitle}.${fileExtension}`;
                handleDownload(row.original.cv, fileName);
              }}
            >
              <Download className="w-3 h-3 mr-0.5 shrink-0" />
              Unduh
            </Button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50 italic">Tidak ada</span>
        )
      )
    },
    {
      accessorKey: "appliedAt",
      header: ({ column }) => (
        <button
          className="flex items-center gap-1 font-semibold hover:text-foreground text-left"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tgl Melamar <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(row.original.appliedAt).toLocaleDateString("id-ID", {
            day: "2-digit", month: "short", year: "numeric"
          })}
        </span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <select
          value={row.original.status}
          onChange={(e) => handleUpdateApplicantStatus(row.original.id, e.target.value as Applicant["status"])}
          className={cn(
            "text-[10px] font-semibold border rounded-full px-2.5 py-0.5 shadow-xs outline-hidden focus:ring-1 focus:ring-primary cursor-pointer transition-all",
            APPLICANT_STATUS_STYLE[row.original.status]
          )}
        >
          <option value="Review">Review</option>
          <option value="Interview">Interview</option>
          <option value="Diterima">Diterima</option>
          <option value="Ditolak">Ditolak</option>
        </select>
      )
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7 hover:bg-primary/10 hover:text-primary rounded-lg"
            title="Lihat Profil Pelamar"
            onClick={() => {
              setSelectedApplicant(row.original)
              setIsApplicantDetailOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive rounded-lg"
            title="Hapus Pelamar"
            onClick={() => {
              setSelectedVacancy(null) // No vacancy contextual trigger
              setApplicantToDelete(row.original)
              setIsDeleteApplicantOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    }
  ], [vacancies, applicants])

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Manajemen Karir & Lowongan</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola data lowongan pekerjaan, pantau pelamar, dan perbarui status rekrutmen.
          </p>
        </div>
        {activeTab === "vacancies" && (
          <Button
            onClick={triggerAddModal}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl text-xs px-4 h-9 shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah Lowongan
          </Button>
        )}
      </div>

      {/* Tabs Container */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col gap-6 min-h-0">
        <div className="shrink-0 border-b pb-1">
          <TabsList variant="line" className="h-9">
            <TabsTrigger value="vacancies" className="flex items-center gap-1.5 font-bold">
              <Briefcase className="w-4 h-4" /> Daftar Lowongan
            </TabsTrigger>
            <TabsTrigger value="all-applicants" className="flex items-center gap-1.5 font-bold">
              <Users className="w-4 h-4" /> Semua Pelamar
              <Badge variant="outline" className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-primary/10 text-primary border-primary/20">
                {applicants.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── TAB: VACANCIES (LOWONGAN KERJA) ─────────────────────────────────── */}
        <TabsContent value="vacancies" className="flex-1 flex flex-col gap-6 outline-none">
          {/* Stats Cards Section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Lowongan",
                value: vacancyStats.total,
                color: "from-primary/20 to-primary/5",
                text: "text-primary",
                icon: Briefcase,
              },
              {
                label: "Lowongan Aktif",
                value: vacancyStats.active,
                color: "from-emerald-500/20 to-emerald-500/5",
                text: "text-emerald-600 dark:text-emerald-400",
                icon: CheckCircle2,
              },
              {
                label: "Draf Lowongan",
                value: vacancyStats.draft,
                color: "from-amber-500/20 to-amber-500/5",
                text: "text-amber-600 dark:text-amber-400",
                icon: Sparkles,
              },
              {
                label: "Total Pelamar",
                value: vacancyStats.applicantsCount,
                color: "from-blue-500/20 to-blue-500/5",
                text: "text-blue-600 dark:text-blue-400",
                icon: Users,
              },
            ].map(({ label, value, color, text, icon: Icon }) => (
              <div
                key={label}
                className={`group relative overflow-hidden rounded-2xl border bg-card bg-gradient-to-br ${color} p-5 shadow-xs hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                    <p className={`mt-1 text-3xl font-extrabold tracking-tight ${text}`}>{value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${text} bg-background/60`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar / Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            {/* Status Filters */}
            <div className="flex flex-wrap items-center gap-1.5 border p-1 rounded-lg bg-muted/20 w-fit">
              {["Semua", "Aktif", "Nonaktif", "Draft"].map((status) => (
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

          {/* Main DataTable Card */}
          <Card className="rounded-xl overflow-hidden shadow-xs border">
            <CardContent className="p-4">
              <DataTable columns={vacancyColumns} data={filteredData} searchKey="title" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB: ALL APPLICANTS (SEMUA PELAMAR) ──────────────────────────────── */}
        <TabsContent value="all-applicants" className="flex-1 flex flex-col gap-6 outline-none">
          {/* Stats Cards Section for Applicants */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Total Pelamar",
                value: applicantStats.total,
                color: "from-primary/20 to-primary/5",
                text: "text-primary",
                icon: Users,
              },
              {
                label: "Belum Ditinjau (Review)",
                value: applicantStats.review,
                color: "from-amber-500/20 to-amber-500/5",
                text: "text-amber-600 dark:text-amber-400",
                icon: AlertCircle,
              },
              {
                label: "Sesi Interview",
                value: applicantStats.interview,
                color: "from-blue-500/20 to-blue-500/5",
                text: "text-blue-600 dark:text-blue-400",
                icon: Clock,
              },
              {
                label: "Diterima / Lolos",
                value: applicantStats.accepted,
                color: "from-emerald-500/20 to-emerald-500/5",
                text: "text-emerald-600 dark:text-emerald-400",
                icon: CheckCircle2,
              },
            ].map(({ label, value, color, text, icon: Icon }) => (
              <div
                key={label}
                className={`group relative overflow-hidden rounded-2xl border bg-card bg-gradient-to-br ${color} p-5 shadow-xs hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                    <p className={`mt-1 text-3xl font-extrabold tracking-tight ${text}`}>{value}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${text} bg-background/60`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar / Filters for Applicants */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div className="flex flex-wrap items-center gap-1.5 border p-1 rounded-lg bg-muted/20 w-fit">
              {["Semua", "Review", "Interview", "Diterima", "Ditolak"].map((status) => (
                <button
                  key={status}
                  onClick={() => setApplicantStatusFilter(status)}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                    applicantStatusFilter === status
                      ? "bg-background text-foreground shadow-sm font-bold border border-border/50"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportApplicantsXLSX}
              className="h-9 px-4 rounded-xl text-xs font-bold border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex items-center gap-1.5 hover:bg-neutral-50 shadow-xs"
            >
              <Download className="w-4 h-4 text-neutral-500" />
              Ekspor ke Excel
            </Button>
          </div>

          {/* All Applicants DataTable Card */}
          <Card className="rounded-xl overflow-hidden shadow-xs border">
            <CardContent className="p-4">
              <DataTable columns={applicantColumns} data={filteredApplicants} searchKey="name" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── MODAL DIALOG: DETAIL LOWONGAN & PELAMAR KONTELSTUAL ─────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={(o) => !o && setIsDetailOpen(false)}>
        <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col rounded-xl [&>button:first-of-type]:hidden p-0 gap-0 border overflow-hidden">
          {selectedVacancy && (
            <>
              {/* Sticky Header */}
              <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-background">
                <DialogHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2.5 rounded-xl text-primary shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <DialogTitle className="text-lg leading-tight font-bold">
                          {selectedVacancy.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs mt-0.5 font-medium text-muted-foreground">
                          ID: {selectedVacancy.id} · Dibuat: {selectedVacancy.createdAt}
                        </DialogDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 border shadow-xs", STATUS_STYLE[selectedVacancy.status])}>
                      {selectedVacancy.status}
                    </Badge>
                  </div>
                </DialogHeader>
              </div>

              {/* TABS CONTAINER */}
              <Tabs defaultValue="detail" className="w-full flex-1 flex flex-col min-h-0">
                <div className="shrink-0 px-6 bg-background border-b">
                  <TabsList variant="line" className="h-10">
                    <TabsTrigger value="detail">Detail Lowongan</TabsTrigger>
                    <TabsTrigger value="applicants">
                      Daftar Pelamar
                      <Badge variant="outline" className="ml-1.5 px-2 py-0.2 text-[10px] rounded-full bg-primary/10 text-primary border-primary/20">
                        {currentApplicants.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 bg-background">
                  {/* TAB: DETAIL */}
                  <TabsContent value="detail" className="px-6 py-4 space-y-4 outline-none">
                    {/* Meta Cards Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/30">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Departemen</p>
                        <p className="text-xs font-bold text-foreground">{selectedVacancy.department}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Tipe</p>
                        <p className="text-xs font-bold text-foreground">{selectedVacancy.type}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Lokasi</p>
                        <p className="text-xs font-bold text-foreground">{selectedVacancy.location}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Batas Waktu</p>
                        <p className="text-xs font-bold text-foreground">{selectedVacancy.deadline}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <SectionTitle icon={Briefcase} title="Deskripsi Pekerjaan" />
                      <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line bg-muted/5 p-3 rounded-lg border border-border/10">
                        {selectedVacancy.description}
                      </p>
                    </div>

                    {/* Requirements */}
                    <div>
                      <SectionTitle icon={AlertCircle} title="Persyaratan & Kualifikasi" />
                      <ul className="space-y-2 pl-1 bg-muted/5 p-3 rounded-lg border border-border/10">
                        {selectedVacancy.requirements.split("\n").filter(r => r.trim()).map((req, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                            <span className="leading-relaxed">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                  {/* TAB: APPLICANTS */}
                  <TabsContent value="applicants" className="px-6 py-4 outline-none space-y-4">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pelamar Terdaftar ({currentApplicants.length})</h3>
                    </div>

                    {/* Applicants List */}
                    {currentApplicants.length > 0 ? (
                      <div className="space-y-3">
                        {currentApplicants.map((app) => (
                          <div key={app.id} className="border border-border/60 hover:border-border rounded-xl p-4 bg-muted/5 hover:shadow-xs transition-all duration-200 space-y-3">
                            {/* Top info and actions */}
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <h4 className="text-sm font-bold text-foreground">{app.name}</h4>
                                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                  Melamar pada {new Date(app.appliedAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Status update selector */}
                                <select
                                  value={app.status}
                                  onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value as Applicant["status"])}
                                  className={cn(
                                    "text-[10px] font-semibold border rounded-full px-2.5 py-0.5 shadow-xs outline-hidden focus:ring-1 focus:ring-primary cursor-pointer transition-all",
                                    APPLICANT_STATUS_STYLE[app.status]
                                  )}
                                >
                                  <option value="Review">Review</option>
                                  <option value="Interview">Interview</option>
                                  <option value="Diterima">Diterima</option>
                                  <option value="Ditolak">Ditolak</option>
                                </select>
                                <Button
                                  variant="ghost"
                                  size="icon-xs"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                                  title="Hapus Pelamar"
                                  onClick={() => {
                                    setApplicantToDelete(app)
                                    setIsDeleteApplicantOpen(true)
                                  }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>

                            <Separator className="opacity-50" />

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                                  <a href={`mailto:${app.email}`} className="hover:underline hover:text-primary truncate">{app.email}</a>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Phone className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                                  <a href={`tel:${app.phone}`} className="hover:underline hover:text-primary">{app.phone}</a>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                                  <FileText className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                                  {app.cv ? (
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        className="bg-primary/5 hover:bg-primary text-primary hover:text-white border-primary/15 h-6 px-2 rounded text-[10px] font-bold shadow-xs transition-all shrink-0"
                                        onClick={() => {
                                          if (app.cv) {
                                            window.open(app.cv, "_blank");
                                          }
                                        }}
                                      >
                                        <FileText className="w-3 h-3 mr-0.5 shrink-0" /> Lihat CV
                                      </Button>
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        className="bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-600 text-emerald-600 hover:text-white border-emerald-500/15 h-6 px-2 rounded text-[10px] font-bold shadow-xs transition-all shrink-0"
                                        onClick={() => {
                                          if (!app.cv) return;
                                          const job = vacancies.find(v => v.id === app.vacancyId);
                                          const jobTitle = job ? job.title : "Posisi";
                                          const cleanName = app.name.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                                          const cleanJobTitle = jobTitle.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                                          const fileExtension = app.cv.split(".").pop()?.split("?")[0] || "pdf";
                                          const fileName = `${cleanName} - CV - ${cleanJobTitle}.${fileExtension}`;
                                          handleDownload(app.cv, fileName);
                                        }}
                                      >
                                        <Download className="w-3 h-3 mr-0.5 shrink-0" /> Unduh
                                      </Button>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-muted-foreground/50 italic">Belum mengunggah CV</span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-border/60 pt-2 md:pt-0 md:pl-4">
                                <div className="flex items-start gap-2 text-muted-foreground">
                                  <GraduationCap className="w-3.5 h-3.5 text-primary/60 shrink-0 mt-0.5" />
                                  <span className="text-foreground/90 leading-tight font-medium" title={app.education}>{app.education}</span>
                                </div>
                                <div className="flex items-start gap-2 text-muted-foreground">
                                  <Award className="w-3.5 h-3.5 text-primary/60 shrink-0 mt-0.5" />
                                  <span className="leading-tight line-clamp-2" title={app.experience}>{app.experience}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center border border-dashed rounded-xl bg-muted/10">
                        <Users className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                        <h3 className="text-sm font-semibold text-foreground">Belum Ada Pelamar</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[280px] mx-auto">
                          Belum ada berkas lamaran masuk untuk posisi ini.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>

              {/* Footer */}
              <div className="shrink-0 border-t bg-muted/30 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center text-xs font-semibold text-foreground">
                  <Users className="mr-2 h-4 w-4 text-primary animate-pulse" />
                  <span>{selectedVacancy.applicants} orang sudah melamar</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsDetailOpen(false)
                      setFormData({
                        title: selectedVacancy.title,
                        department: selectedVacancy.department,
                        type: selectedVacancy.type,
                        location: selectedVacancy.location,
                        status: selectedVacancy.status,
                        deadline: selectedVacancy.deadline,
                        applicants: selectedVacancy.applicants,
                        description: selectedVacancy.description,
                        requirements: selectedVacancy.requirements
                      })
                      setIsEditOpen(true)
                    }}
                  >
                    <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setIsDetailOpen(false)
                      setIsDeleteOpen(true)
                    }}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL DIALOG: TAMBAH LOWONGAN ────────────────────────────────────── */}
      <Dialog open={isAddOpen} onOpenChange={(o) => !o && setIsAddOpen(false)}>
        <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl [&>button:first-of-type]:hidden  max-h-[92vh] flex flex-col rounded-xl p-0 gap-0 overflow-hidden border">
          <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-background">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Tambah Lowongan Kerja Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail lowongan pekerjaan baru yang ingin dipublikasikan.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid gap-1">
              <Label htmlFor="title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Nama Posisi</Label>
              <Input id="title" placeholder="Contoh: Senior Frontend Developer" value={formData.title} onChange={handleFormChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="department" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Departemen</Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="Procurement">Procurement</option>
                  <option value="IT & Digital">IT & Digital</option>
                  <option value="Operation">Operation</option>
                  <option value="Legal">Legal</option>
                  <option value="HR & Admin">HR & Admin</option>
                  <option value="Finance & Tax">Finance & Tax</option>
                </select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="type" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Tipe Pekerjaan</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="location" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Lokasi & Sistem</Label>
                <Input id="location" placeholder="Contoh: Jakarta (Hybrid)" value={formData.location} onChange={handleFormChange} />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="deadline" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Batas Waktu Lamaran</Label>
                <Input id="deadline" type="date" value={formData.deadline} onChange={handleFormChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="status" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Status Awal</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="Draft">Draft</option>
                  <option value="Aktif">Aktif (Langsung Buka)</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="applicants" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Jumlah Pelamar Awal</Label>
                <Input id="applicants" type="number" min="0" placeholder="0" disabled value={formData.applicants} onChange={handleFormChange} className="bg-muted" />
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Deskripsi Pekerjaan</Label>
              <textarea
                id="description"
                placeholder="Tulis deskripsi detail mengenai peran, tanggung jawab sehari-hari, dan misi utama posisi ini..."
                rows={4}
                value={formData.description}
                onChange={handleFormChange}
                className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
            </div>

            <div className="grid gap-1">
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="requirements" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Persyaratan & Kualifikasi</Label>
                <span className="text-[10px] text-muted-foreground italic font-semibold">Gunakan baris baru (Enter) untuk memisah</span>
              </div>
              <textarea
                id="requirements"
                placeholder="Contoh:&#10;Minimal 3 tahun pengalaman kerja&#10;Menguasai TypeScript dan React&#10;Memiliki sertifikat kompetensi terkait"
                rows={4}
                value={formData.requirements}
                onChange={handleFormChange}
                className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
            </div>
          </div>

          <div className="shrink-0 border-t bg-muted/30 px-6 py-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button type="button" onClick={handleCreateVacancy} disabled={!isFormValid}>Simpan & Terbitkan</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL DIALOG: EDIT LOWONGAN ──────────────────────────────────────── */}
      <Dialog open={isEditOpen} onOpenChange={(o) => !o && setIsEditOpen(false)}>
        <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl max-h-[92vh] flex flex-col rounded-xl p-0 gap-0 overflow-hidden border">
          <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-background">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Ubah Lowongan Kerja</DialogTitle>
              <DialogDescription>
                Sesuaikan informasi lowongan pekerjaan terpilih di bawah ini.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid gap-1">
              <Label htmlFor="title" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Nama Posisi</Label>
              <Input id="title" placeholder="Contoh: Senior Frontend Developer" value={formData.title} onChange={handleFormChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="department" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Departemen</Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="Procurement">Procurement</option>
                  <option value="IT & Digital">IT & Digital</option>
                  <option value="Operation">Operation</option>
                  <option value="Legal">Legal</option>
                  <option value="HR & Admin">HR & Admin</option>
                  <option value="Finance & Tax">Finance & Tax</option>
                </select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="type" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Tipe Pekerjaan</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="location" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Lokasi & Sistem</Label>
                <Input id="location" placeholder="Contoh: Jakarta (Hybrid)" value={formData.location} onChange={handleFormChange} />
              </div>

              <div className="grid gap-1">
                <Label htmlFor="deadline" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Batas Waktu Lamaran</Label>
                <Input id="deadline" type="date" value={formData.deadline} onChange={handleFormChange} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <Label htmlFor="status" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Status Lowongan</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="Draft">Draft</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="applicants" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Jumlah Pelamar</Label>
                <Input id="applicants" type="number" min="0" disabled value={formData.applicants} onChange={handleFormChange} className="bg-muted" />
              </div>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="description" className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Deskripsi Pekerjaan</Label>
              <textarea
                id="description"
                placeholder="Tulis deskripsi detail mengenai peran..."
                rows={4}
                value={formData.description}
                onChange={handleFormChange}
                className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
            </div>

            <div className="grid gap-1">
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="requirements" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Persyaratan & Kualifikasi</Label>
                <span className="text-[10px] text-muted-foreground italic font-semibold">Gunakan baris baru (Enter) untuk memisah</span>
              </div>
              <textarea
                id="requirements"
                placeholder="Tulis setiap syarat pada baris baru..."
                rows={4}
                value={formData.requirements}
                onChange={handleFormChange}
                className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground outline-hidden focus:border-ring focus:ring-3 focus:ring-ring/50"
              />
            </div>
          </div>

          <div className="shrink-0 border-t bg-muted/30 px-6 py-4 flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Batal</Button>
            <Button type="button" onClick={handleUpdateVacancy} disabled={!isFormValid}>Simpan Perubahan</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── MODAL DIALOG: HAPUS LOWONGAN (KONFIRMASI) ────────────────────────── */}
      <Dialog open={isDeleteOpen} onOpenChange={(o) => !o && setIsDeleteOpen(false)}>
        <DialogContent className="sm:max-w-[420px] rounded-xl border">
          <div className="flex items-start gap-3 p-4">
            <div className="bg-red-100 text-red-600 p-2.5 rounded-full shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground">Hapus Lowongan Kerja?</DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
                  Apakah Anda yakin ingin menghapus lowongan posisi{" "}
                  <span className="font-bold text-foreground">
                    {selectedVacancy?.title}
                  </span>
                  ? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
          <DialogFooter className="px-4 py-3 bg-muted/30 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsDeleteOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" type="button" onClick={handleDeleteVacancy}>
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL DIALOG: DETAIL PROFIL PELAMAR KONTELSTUAL ───────────────────── */}
      <Dialog open={isApplicantDetailOpen} onOpenChange={(o) => !o && setIsApplicantDetailOpen(false)}>
        <DialogContent className="max-w-xl md:max-w-2xl max-h-[92vh] flex flex-col rounded-xl p-0 gap-0 overflow-hidden border [&>button:first-of-type]:hidden">
          {selectedApplicant && (
            <>
              {/* Header */}
              <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-background">
                <DialogHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2.5 rounded-xl text-primary shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <DialogTitle className="text-lg leading-tight font-bold">
                          {selectedApplicant.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs mt-0.5 font-medium text-muted-foreground">
                          ID Pelamar: {selectedApplicant.id} · Terdaftar pada{" "}
                          {new Date(selectedApplicant.appliedAt).toLocaleDateString("id-ID", {
                            day: "2-digit", month: "long", year: "numeric"
                          })}
                        </DialogDescription>
                      </div>
                    </div>
                    {/* Status switcher inside detail */}
                    <select
                      value={selectedApplicant.status}
                      onChange={(e) => {
                        handleUpdateApplicantStatus(selectedApplicant.id, e.target.value as Applicant["status"])
                        setSelectedApplicant({ ...selectedApplicant, status: e.target.value as Applicant["status"] })
                      }}
                      className={cn(
                        "text-xs font-semibold border rounded-full px-3 py-1 shadow-xs outline-hidden focus:ring-1 focus:ring-primary cursor-pointer transition-all",
                        APPLICANT_STATUS_STYLE[selectedApplicant.status]
                      )}
                    >
                      <option value="Review">Review</option>
                      <option value="Interview">Interview</option>
                      <option value="Diterima">Diterima</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </div>
                </DialogHeader>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

                {/* Meta details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/30 text-xs">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Posisi Dilamar</p>
                    <p className="font-bold text-foreground">
                      {vacancies.find(v => v.id === selectedApplicant.vacancyId)?.title || "Posisi Dihapus"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Departemen</p>
                    <p className="font-bold text-foreground">
                      {vacancies.find(v => v.id === selectedApplicant.vacancyId)?.department || "—"}
                    </p>
                  </div>
                  <div className="space-y-0.5 col-span-2 md:col-span-1">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">CV Pelamar</p>
                    {selectedApplicant.cv ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-primary/5 hover:bg-primary text-primary hover:text-white border-primary/15 h-7 px-2.5 rounded-lg text-[10px] font-bold shadow-xs transition-all shrink-0"
                          onClick={() => {
                            if (selectedApplicant.cv) {
                              window.open(selectedApplicant.cv, "_blank");
                            }
                          }}
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" /> Lihat CV
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-600 text-emerald-600 hover:text-white border-emerald-500/15 h-7 px-2.5 rounded-lg text-[10px] font-bold shadow-xs transition-all shrink-0"
                          onClick={() => {
                            if (!selectedApplicant.cv) return;
                            const jobTitle = vacancies.find(v => v.id === selectedApplicant.vacancyId)?.title || "Posisi";
                            const cleanName = selectedApplicant.name.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                            const cleanJobTitle = jobTitle.replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
                            const fileExtension = selectedApplicant.cv.split(".").pop()?.split("?")[0] || "pdf";
                            const fileName = `${cleanName} - CV - ${cleanJobTitle}.${fileExtension}`;
                            handleDownload(selectedApplicant.cv, fileName);
                          }}
                        >
                          <Download className="w-3.5 h-3.5 mr-1" /> Unduh
                        </Button>
                      </div>
                    ) : (
                      <p className="font-semibold text-muted-foreground italic">Belum diunggah</p>
                    )}
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-2">
                  <SectionTitle icon={Mail} title="Informasi Kontak" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-muted/5 p-3 rounded-lg border border-border/10">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary/60" />
                      <a href={`mailto:${selectedApplicant.email}`} className="hover:underline text-foreground font-semibold">{selectedApplicant.email}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary/60" />
                      <a href={`tel:${selectedApplicant.phone}`} className="hover:underline text-foreground font-semibold">{selectedApplicant.phone}</a>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <SectionTitle icon={GraduationCap} title="Pendidikan Terakhir" />
                  <div className="flex gap-2 text-xs bg-muted/5 p-3 rounded-lg border border-border/10">
                    <GraduationCap className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
                    <p className="text-foreground leading-relaxed font-semibold">{selectedApplicant.education}</p>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <SectionTitle icon={Award} title="Pengalaman Kerja" />
                  <div className="flex gap-2 text-xs bg-muted/5 p-3 rounded-lg border border-border/10">
                    <Award className="w-4 h-4 text-primary/60 shrink-0 mt-0.5" />
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{selectedApplicant.experience}</p>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="shrink-0 border-t bg-muted/30 px-6 py-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsApplicantDetailOpen(false)}>
                  Tutup Profil
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setIsApplicantDetailOpen(false)
                    setApplicantToDelete(selectedApplicant)
                    setIsDeleteApplicantOpen(true)
                  }}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus Pelamar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL DIALOG: HAPUS PELAMAR (KONFIRMASI) ────────────────────────── */}
      <Dialog open={isDeleteApplicantOpen} onOpenChange={(o) => !o && setIsDeleteApplicantOpen(false)}>
        <DialogContent className="sm:max-w-[420px] rounded-xl border">
          <div className="flex items-start gap-3 p-4">
            <div className="bg-red-100 text-red-600 p-2.5 rounded-full shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground">Hapus Data Pelamar?</DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
                  Apakah Anda yakin ingin menghapus lamaran kerja dari{" "}
                  <span className="font-bold text-foreground">
                    {applicantToDelete?.name}
                  </span>
                  ? Tindakan ini bersifat permanen, menghapus berkas resume, dan tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
          <DialogFooter className="px-4 py-3 bg-muted/30 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsDeleteApplicantOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" size="sm" type="button" onClick={handleDeleteApplicantConfirm}>
              Ya, Hapus Pelamar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}