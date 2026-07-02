"use client"

import React, { useState, useMemo, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  Plus,
  GraduationCap,
  Award,
  FileText,
  UploadCloud,
  CheckCircle2,
  X,
  ArrowLeft,
  AlertCircle,
  Building2,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

type JobVacancy = {
  id: string
  title: string
  department: string
  type: "Full-time" | "Contract" | "Internship" | "Part-time"
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

// ── Constants & Style Configs ───────────────────────────────────────────────

const TYPE_STYLE: Record<JobVacancy["type"], string> = {
  "Full-time": "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200",
  "Contract": "bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300 border-purple-200",
  "Internship": "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200",
  "Part-time": "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-300 border-pink-200",
}

const DEPARTMENTS = [
  "Semua Departemen",
  "Procurement",
  "IT & Digital",
  "Operation",
  "Legal",
  "HR & Admin",
  "Finance & Tax"
]

const JOB_TYPES = [
  "Semua Tipe",
  "Full-time",
  "Contract",
  "Internship",
  "Part-time"
]



// ── Main Component ───────────────────────────────────────────────────────────

export default function KarirPelamarPage() {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDept, setSelectedDept] = useState("Semua Departemen")
  const [selectedType, setSelectedType] = useState("Semua Tipe")

  // Modal Dialog flow states
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"view" | "apply" | "success">("view")

  // Form Application State
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015"

  // Form Application State
  const [applyForm, setApplyForm] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    experience: "",
    cvFileName: "",
    cvFile: null as File | null
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load from API with localStorage fallback
  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/career/vacancies`)
        if (!res.ok) throw new Error("Gagal mengambil data lowongan kerja")
        const data = await res.json()
        const mapped = data.map((v: any) => ({
          ...v,
          applicants: Array.isArray(v.applicants) ? v.applicants.length : (v.applicants || 0)
        }))
        setVacancies(mapped)
      } catch (error) {
        console.error("Gagal memuat lowongan dari database, menggunakan fallback localStorage:", error)
        // 1. Applicants
        const savedApps = localStorage.getItem("procurement_applicants")
        let currentApps = []
        if (savedApps) {
          try {
            currentApps = JSON.parse(savedApps)
          } catch (e) {
            console.error("Gagal parse applicants", e)
          }
        }
        setApplicants(currentApps)

        // 2. Vacancies
        const savedVac = localStorage.getItem("procurement_vacancies")
        if (savedVac) {
          try {
            const parsedVac = JSON.parse(savedVac)
            // Sync applicant count
            const synced = parsedVac.map((v: JobVacancy) => {
              const count = currentApps.filter((a: Applicant) => a.vacancyId === v.id).length
              return { ...v, applicants: count }
            })
            setVacancies(synced)
          } catch (e) {
            console.error("Gagal parse vacancies", e)
            setVacancies([])
          }
        } else {
          setVacancies([])
        }
      }
    }
    fetchVacancies()
  }, [])

  // Filter out non-active jobs
  const activeVacancies = useMemo(() => {
    return vacancies.filter(v => v.status === "Aktif")
  }, [vacancies])

  // Filtered vacancies for display
  const filteredVacancies = useMemo(() => {
    return activeVacancies.filter(v => {
      const matchSearch =
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.department.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchDept =
        selectedDept === "Semua Departemen" ||
        v.department === selectedDept

      const matchType =
        selectedType === "Semua Tipe" ||
        v.type === selectedType

      return matchSearch && matchDept && matchType
    })
  }, [activeVacancies, searchQuery, selectedDept, selectedType])

  // Form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setApplyForm(prev => ({ ...prev, [id]: value }))
  }

  // File CV Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setApplyForm(prev => ({ ...prev, cvFileName: file.name, cvFile: file }))
      setSubmitError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setApplyForm(prev => ({ ...prev, cvFileName: file.name, cvFile: file }))
      setSubmitError(null)
    }
  }

  const isFormValid = useMemo(() => {
    return Boolean(
      applyForm.name.trim() &&
      applyForm.email.trim() &&
      applyForm.phone.trim() &&
      applyForm.education.trim() &&
      applyForm.experience.trim() &&
      applyForm.cvFileName.trim() &&
      applyForm.cvFile
    )
  }, [applyForm])

  // Submit Application Action
  const handleSubmitApplication = async () => {
    if (!selectedJob || !isFormValid || !applyForm.cvFile) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Construct multipart form data
      const formData = new FormData()
      formData.append("name", applyForm.name.trim())
      formData.append("email", applyForm.email.trim())
      formData.append("phone", applyForm.phone.trim())
      formData.append("education", applyForm.education.trim())
      formData.append("experience", applyForm.experience.trim())
      formData.append("cv", applyForm.cvFile)

      const res = await fetch(`${apiUrl}/api/career/vacancies/${selectedJob.id}/apply`, {
        method: "POST",
        body: formData
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Gagal mengirimkan lamaran pekerjaan")
      }

      // Transition modal to success screen
      setModalMode("success")
    } catch (error: any) {
      console.error("Gagal melamar pekerjaan:", error)
      setSubmitError(error.message || "Terjadi kesalahan sistem saat mengirim lamaran. Silakan coba kembali.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open modal flow
  const handleOpenJobDetails = (job: JobVacancy) => {
    setSelectedJob(job)
    setModalMode("view")
    setIsDetailOpen(true)
    setSubmitError(null)
    // Clear form
    setApplyForm({
      name: "",
      email: "",
      phone: "",
      education: "",
      experience: "",
      cvFileName: "",
      cvFile: null
    })
  }

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-neutral-900/10 flex flex-col">
      {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-background py-16 md:py-24 border-b border-border/40">
        <div className="absolute inset-0 opacity-20 bg-[url('/dea-bg-lines.png')] bg-cover bg-center" />
        <div className="container mx-auto px-4 md:px-8 max-w-6xl relative z-10 space-y-4 text-center">
          <Badge variant="outline" className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/5 text-primary border-primary/20 shadow-xs animate-bounce">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Karir Terbuka DEA
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-tight">
            Bergabunglah Bersama Kami
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Bangun karir cemerlang Anda bersama <span className="font-bold text-foreground">PT Duta Esa Adiperkasa</span>. Jelajahi berbagai posisi strategis dan ambil bagian dalam inovasi pengadaan masa depan.
          </p>
        </div>
      </section>

      {/* ── JOB BOARD & FILTERS ──────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 max-w-6xl py-12 flex-1 flex flex-col gap-8">
        
        {/* Filters Toolbar */}
        <div className="bg-background border rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center">
          
          {/* Search bar */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari berdasarkan posisi atau keahlian..."
              className="pl-9 h-9 w-full bg-muted/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Department filter */}
          <div className="w-full md:w-48 shrink-0">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs focus:border-ring focus:ring-1 outline-hidden cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Job type filter */}
          <div className="w-full md:w-40 shrink-0">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-xs shadow-xs focus:border-ring focus:ring-1 outline-hidden cursor-pointer"
            >
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vacancies Display */}
        {filteredVacancies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacancies.map((job) => (
              <Card
                key={job.id}
                className="flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 border border-border/80 transition-all duration-200 bg-background"
              >
                {/* Header */}
                <CardHeader className="p-5 pb-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/10">
                      {job.department}
                    </span>
                    <Badge variant="outline" className={cn("px-2 py-0.5 text-[9px] font-bold rounded-full border shadow-2xs", TYPE_STYLE[job.type])}>
                      {job.type}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold text-foreground mt-3 line-clamp-1">
                    {job.title}
                  </CardTitle>
                </CardHeader>

                {/* Content */}
                <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                      <span>Batas Waktu: {new Date(job.deadline).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOpenJobDetails(job)}
                    className="w-full text-xs h-8 font-semibold shadow-xs"
                    variant="outline"
                  >
                    Lihat Detail / Lamar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border rounded-2xl border-dashed bg-background shadow-xs max-w-lg mx-auto w-full px-6">
            <Briefcase className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
            <h3 className="text-base font-bold text-foreground">Lowongan Kerja Tidak Ditemukan</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Kami belum menemukan posisi yang cocok dengan kata kunci atau saringan pencarian Anda. Silakan cari posisi lain atau periksa saringan filter Anda.
            </p>
          </div>
        )}
      </section>

      {/* ── MODAL DIALOG: DETAIL & LAMAR PEKERJAAN ───────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={(o) => !o && setIsDetailOpen(false)}>
        <DialogContent className="max-w-2xl md:max-w-3xl max-h-[92vh] flex flex-col rounded-xl [&>button:first-of-type]:hidden p-0 gap-0 border overflow-hidden">
          {selectedJob && (
            <>
              {/* MODAL MODE: VIEW DETAILS */}
              {modalMode === "view" && (
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
                              {selectedJob.title}
                            </DialogTitle>
                            <DialogDescription className="text-xs mt-0.5 font-medium text-muted-foreground">
                              PT Duta Esa Adiperkasa · Batas Waktu: {new Date(selectedJob.deadline).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                            </DialogDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 border shadow-xs", TYPE_STYLE[selectedJob.type])}>
                          {selectedJob.type}
                        </Badge>
                      </div>
                    </DialogHeader>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {/* Meta Cards Grid */}
                    <div className="grid grid-cols-3 gap-3 bg-muted/20 p-3.5 rounded-xl border border-border/30 text-xs">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Departemen</p>
                        <p className="font-bold text-foreground">{selectedJob.department}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Lokasi Kerja</p>
                        <p className="font-bold text-foreground">{selectedJob.location}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Status Posisi</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">Aktif & Terbuka</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary" /> Deskripsi Pekerjaan
                      </h4>
                      <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line bg-muted/5 p-3 rounded-lg border border-border/10">
                        {selectedJob.description}
                      </p>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-primary" /> Kualifikasi & Persyaratan
                      </h4>
                      <ul className="space-y-2 pl-1 bg-muted/5 p-3 rounded-lg border border-border/10">
                        {selectedJob.requirements.split("\n").filter(r => r.trim()).map((req, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                            <span className="leading-relaxed">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="shrink-0 border-t bg-muted/30 px-6 py-4 flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsDetailOpen(false)}>
                      Tutup
                    </Button>
                    <Button size="sm" onClick={() => setModalMode("apply")} className="shadow-xs font-bold px-4">
                      Lamar Sekarang <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </>
              )}

              {/* MODAL MODE: APPLICATION FORM */}
              {modalMode === "apply" && (
                <>
                  {/* Sticky Header */}
                  <div className="shrink-0 px-6 pt-6 pb-4 border-b bg-background">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md hover:bg-muted"
                        onClick={() => setModalMode("view")}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold">
                          Formulir Lamaran: {selectedJob.title}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground">
                          Lengkapi detail diri dan unggah CV Anda untuk mengajukan lamaran.
                        </DialogDescription>
                      </DialogHeader>
                    </div>
                  </div>

                  {/* Scrollable Form Content */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    
                    {/* Full Name */}
                    <div className="grid gap-1">
                      <Label htmlFor="name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Nama Lengkap</Label>
                      <Input
                        id="name"
                        placeholder="Masukkan nama lengkap Anda"
                        value={applyForm.name}
                        onChange={handleInputChange}
                        className="h-9 text-xs"
                      />
                    </div>

                    {/* Email & Phone Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-1">
                        <Label htmlFor="email" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Alamat Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="contoh@email.com"
                          value={applyForm.email}
                          onChange={handleInputChange}
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="grid gap-1">
                        <Label htmlFor="phone" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Nomor WhatsApp / HP</Label>
                        <Input
                          id="phone"
                          placeholder="08XXXXXXXXXX"
                          value={applyForm.phone}
                          onChange={handleInputChange}
                          className="h-9 text-xs"
                        />
                      </div>
                    </div>

                    {/* Last Education */}
                    <div className="grid gap-1">
                      <Label htmlFor="education" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Pendidikan Terakhir & Universitas</Label>
                      <Input
                        id="education"
                        placeholder="Contoh: S1 Teknik Industri, Universitas Indonesia"
                        value={applyForm.education}
                        onChange={handleInputChange}
                        className="h-9 text-xs"
                      />
                    </div>

                    {/* Work Experience */}
                    <div className="grid gap-1">
                      <Label htmlFor="experience" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Ringkasan Pengalaman Kerja</Label>
                      <textarea
                        id="experience"
                        placeholder="Tulis ringkasan singkat mengenai riwayat pekerjaan atau portofolio relevan Anda..."
                        rows={3}
                        value={applyForm.experience}
                        onChange={handleInputChange}
                        className="flex min-h-[70px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs shadow-xs placeholder:text-muted-foreground outline-hidden focus:border-ring focus:ring-1"
                      />
                    </div>

                    {/* Upload CV Drag & Drop */}
                    <div className="grid gap-1">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Unggah Curriculum Vitae (CV) / Resume</Label>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-2",
                          applyForm.cvFileName
                            ? "border-primary bg-primary/5/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/10"
                        )}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf"
                          className="hidden"
                        />
                        {applyForm.cvFileName ? (
                          <>
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                              <FileText className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-foreground truncate max-w-[300px]">
                              {applyForm.cvFileName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              CV terunggah · Klik untuk mengganti berkas PDF
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-muted rounded-full text-muted-foreground">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-foreground">
                              Klik untuk Unggah atau Seret File ke Sini
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Format berkas yang diterima hanya PDF (Maks. 5 MB)
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {submitError && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-xs border border-red-200/30">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{submitError}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="shrink-0 border-t bg-muted/30 px-6 py-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setModalMode("view")} disabled={isSubmitting}>
                      Kembali
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmitApplication}
                      disabled={!isFormValid || isSubmitting}
                      className="shadow-xs font-bold px-4 flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
                          Mengirim...
                        </>
                      ) : (
                        "Kirim Lamaran Pekerjaan"
                      )}
                    </Button>
                  </div>
                </>
              )}

              {/* MODAL MODE: SUCCESS SCREEN */}
              {modalMode === "success" && (
                <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-6">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-foreground">Lamaran Kerja Berhasil Terkirim!</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Terima kasih telah melamar posisi <span className="font-bold text-foreground">{selectedJob.title}</span> di PT Duta Esa Adiperkasa. Berkas lamaran Anda saat ini telah diterima oleh tim HR kami dan sedang dalam proses peninjauan awal.
                    </p>
                  </div>

                  <div className="bg-muted/30 border p-4 rounded-xl text-left max-w-md w-full space-y-2 text-[11px] leading-relaxed text-muted-foreground">
                    <p className="font-bold text-foreground text-xs border-b pb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" /> Detail Lamaran Terdaftar:
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">Nama:</span>
                      <span className="col-span-2 text-foreground font-medium break-words">{applyForm.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">Email:</span>
                      <span className="col-span-2 text-foreground font-medium break-all">{applyForm.email}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">Resume / CV:</span>
                      <span className="col-span-2 text-primary font-bold flex items-center gap-1 min-w-0">
                        <FileText className="w-3 h-3 shrink-0" />
                        <span className="truncate" title={applyForm.cvFileName}>{applyForm.cvFileName}</span>
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setIsDetailOpen(false)}
                    className="w-full sm:w-40 font-bold shadow-xs h-9"
                  >
                    Selesai & Tutup
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}