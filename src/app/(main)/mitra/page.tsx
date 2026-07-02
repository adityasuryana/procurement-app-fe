"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Building2, MapPin, User, Scale, FileCheck2, UploadCloud, BadgeCheck, SendHorizontal, Loader2 } from 'lucide-react'

const SectionHeader = ({ icon: Icon, title, description }: any) => (
  <div className="flex items-start gap-4 pb-6">
    <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 text-primary">
      <Icon className="w-5 h-5 flex-shrink-0" />
    </div>
    <div className="flex-1 space-y-1">
      <h3 className="text-lg font-semibold leading-none tracking-tight text-neutral-900 dark:text-white">{title}</h3>
      {description && <p className="text-sm text-neutral-500 dark:text-neutral-400">{description}</p>}
    </div>
  </div>
)

const FileUploadField = ({ label, id, name, required = false }: any) => {
  const [fileName, setFileName] = useState<string>("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name)
    } else {
      setFileName("")
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-medium text-neutral-700 dark:text-neutral-300">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <label htmlFor={id} className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-neutral-50 dark:bg-neutral-900 border-2 border-dashed rounded-xl appearance-none cursor-pointer hover:border-primary/50 hover:bg-primary/5 border-neutral-300 dark:border-neutral-700 group focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
        <span className="flex flex-col items-center space-y-2 text-center">
          <div className="p-2 bg-white dark:bg-neutral-800 rounded-full shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700 group-hover:scale-110 transition-transform">
            <UploadCloud className={`w-5 h-5 ${fileName ? "text-primary" : "text-neutral-500"} group-hover:text-primary transition-colors`} />
          </div>
          <span className="font-medium text-sm text-neutral-500 dark:text-neutral-400 group-hover:text-primary transition-colors max-w-xs truncate">
            {fileName ? fileName : "Mencari File atau Drop File di sini"}
          </span>
          {fileName && (
            <span className="text-xs text-muted-foreground">
              File terpilih (siap dikirim)
            </span>
          )}
        </span>
        <input type="file" id={id} name={name || id} className="hidden" onChange={handleFileChange} required={required} />
      </label>
    </div>
  )
}

const InputField = ({ label, id, name, placeholder, required = false, type = "text" }: any) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="font-medium text-neutral-700 dark:text-neutral-300">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    <Input id={id} name={name || id} type={type} placeholder={placeholder} required={required} className="bg-white/50 focus:bg-white dark:bg-neutral-950/50 dark:focus:bg-neutral-950 transition-colors" />
  </div>
)

export default function MitraFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const [submittedCompany, setSubmittedCompany] = useState("")
  const [submittedNpwp, setSubmittedNpwp] = useState("")
  const [submittedPj, setSubmittedPj] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg("")
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015"

    const formData = new FormData(e.currentTarget)
    const payload: Record<string, any> = {}

    // Text inputs mapping
    const textFields = [
      'companyName', 'npwpNumber', 'sppkpNumber', 'pjName', 'pjPosition',
      'companyPhone', 'pjPhone', 'address1', 'address2', 'city', 'postalCode',
      'establishmentDeed', 'latestAmendmentDeed', 'nibNumber', 'siupNumber',
      'investmentStatus', 'nibAmendmentDetails', 'nibDateNumber',
      'certificate1Name', 'certificate1Number', 'certificate1Validity', 'certificate1Issuer',
      'certificate2Name', 'certificate2Number', 'certificate2Validity', 'certificate2Issuer'
    ]

    textFields.forEach(field => {
      payload[field] = (formData.get(field) as string) || ''
    })

    // File fields mapping - upload files to Cloudinary dynamically
    const fileFields = [
      'fileNpwpSppkp', 'fileDomicile', 'fileDeed', 'fileCertificates',
      'fileOrgStructure', 'fileEquipmentList', 'fileExperienceList',
      'fileFinancialAudit', 'fileBankStatement', 'fileApplicationLetter'
    ]

    try {
      for (const field of fileFields) {
        const file = formData.get(field) as File | null
        if (file && file.name && file.size > 0) {
          const uploadData = new FormData()
          uploadData.append('file', file)
          
          const uploadRes = await fetch(`${apiUrl}/api/upload`, {
            method: "POST",
            body: uploadData
          })
          
          if (uploadRes.ok) {
            const uploadResult = await uploadRes.json()
            payload[field] = uploadResult.url // Store the actual Cloudinary URL!
          } else {
            const errResult = await uploadRes.json().catch(() => ({}))
            throw new Error(errResult.error || `Gagal mengunggah berkas ${field}`)
          }
        } else {
          payload[field] = ''
        }
      }

      // Set default status to Pending
      payload['status'] = 'Pending'

      const res = await fetch(`${apiUrl}/api/partner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        setSubmittedCompany(payload.companyName)
        setSubmittedNpwp(payload.npwpNumber)
        setSubmittedPj(payload.pjName)
        setSubmitSuccess(true)
      } else {
        const errData = await res.json()
        setErrorMsg(errData.error || "Gagal mengirim formulir pendaftaran mitra.")
      }
    } catch (error: any) {
      console.error("Error submitting mitra:", error)
      setErrorMsg(error.message || "Terjadi kesalahan jaringan. Silakan hubungkan server backend Anda atau coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
        <Card className="max-w-xl w-full border shadow-xl bg-white/60 dark:bg-neutral-900/60 backdrop-blur-md overflow-hidden rounded-2xl">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
              <BadgeCheck className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                Pendaftaran Berhasil Dikirim!
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Terima kasih telah mendaftar sebagai mitra PT Duta Esa Adiperkasa. Pendaftaran Anda telah kami terima dan masuk ke dalam antrean review.
              </p>
            </div>

            <div className="w-full bg-neutral-50 dark:bg-neutral-950/50 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 text-left space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Status Pengajuan</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  Diproses
                </span>
              </div>
              <Separator className="bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Perusahaan</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[200px]">
                  {submittedCompany}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">NPWP</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {submittedNpwp}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">Penanggung Jawab</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {submittedPj}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Proses verifikasi berkas umumnya memakan waktu 2-3 hari kerja. Anda akan dihubungi melalui kontak penanggung jawab yang terdaftar.
            </p>
          </CardContent>
          <CardFooter className="p-6 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 flex justify-center rounded-b-2xl">
            <Button 
              className="w-full max-w-xs h-11 bg-primary hover:bg-primary/90 shadow-md transition-all text-white"
              onClick={() => window.location.href = "/"}
            >
              Kembali ke Beranda
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Formulir Mitra
            <span className="block mt-1 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              PT Duta Esa Adiperkasa
            </span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl text-base">
            Silakan lengkapi informasi rekanan di bawah ini dengan data yang valid dan terbaru untuk keperluan pendaftaran mitra di PT Duta Esa Adiperkasa.
          </p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          
          <Card className="border shadow-sm bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-10">
              
              {/* Section 1: Informasi Perusahaan */}
              <div className="space-y-6">
                <SectionHeader 
                  icon={Building2} 
                  title="Informasi Perusahaan" 
                  description="Data profil dan identitas pajak perusahaan Anda." 
                />
                
                <div className="grid grid-cols-1 gap-6">
                  <InputField label="Nama Perusahaan" id="nama-perusahaan" name="companyName" placeholder="PT / CV Nama Perusahaan" required />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Nomor NPWP" id="npwp" name="npwpNumber" placeholder="00.000.000.0-000.000" required />
                  <InputField label="Nomor SPPKP" id="sppkp" name="sppkpNumber" placeholder="Nomor SPPKP / N/A" required />
                </div>
                
                <FileUploadField label="Dokumen NPWP dan SPPKP" id="file-npwp-sppkp" name="fileNpwpSppkp" />
              </div>

              <Separator className="bg-neutral-200 dark:bg-neutral-800" />

              {/* Section 2: Penanggung Jawab */}
              <div className="space-y-6">
                <SectionHeader 
                  icon={User} 
                  title="Penanggung Jawab Perusahaan" 
                  description="Informasi kontak direktur atau perwakilan resmi perusahaan." 
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Nama Lengkap" id="pj-nama" name="pjName" placeholder="Nama lengkap sesuai KTP" required />
                  <InputField label="Jabatan" id="pj-jabatan" name="pjPosition" placeholder="Direktur Utama / Manajer" required />
                </div>
              </div>

              <Separator className="bg-neutral-200 dark:bg-neutral-800" />

              {/* Section 3: Kontak & Alamat */}
              <div className="space-y-6">
                <SectionHeader 
                  icon={MapPin} 
                  title="Kontak & Alamat" 
                  description="Nomor telepon dan alamat lengkap domisili kantor." 
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Nomor Telp Perusahaan" id="telp-perusahaan" name="companyPhone" placeholder="021-XXXXXXX" required />
                  <InputField label="Nomor Telp Penanggung Jawab" id="telp-pj" name="pjPhone" placeholder="08XXXXXXXXXX" required />
                </div>
                
                <div className="space-y-6 bg-neutral-50 dark:bg-neutral-900/50 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800 mt-4">
                  <InputField label="Alamat Jalan" id="alamat-1" name="address1" placeholder="Nama gedung, jalan, RT/RW" required />
                  <InputField label="Baris Alamat Jalan 2" id="alamat-2" name="address2" placeholder="Detail tambahan (Lantai, Blok)" />
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <InputField label="Kota / Provinsi" id="kota" name="city" placeholder="Kota, Provinsi" required />
                    </div>
                    <div className="md:col-span-1">
                      <InputField label="Kode Pos" id="kodepos" name="postalCode" placeholder="Kode Pos" required />
                    </div>
                  </div>
                </div>

                <FileUploadField label="Akta Domisili / Keterangan Domisili" id="file-domisili" name="fileDomicile" />
              </div>

              <Separator className="bg-neutral-200 dark:bg-neutral-800" />

              {/* Section 4: Landasan Hukum */}
              <div className="space-y-6">
                <SectionHeader 
                  icon={Scale} 
                  title="Landasan Hukum & Pendirian" 
                  description="Informasi perizinan dan akta pendirian perusahaan." 
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Nomor dan Tanggal Akta Pendirian" id="akta-pendirian" name="establishmentDeed" placeholder="Contoh: No. 12, 01 Jan 2020" required />
                  <InputField label="Nomor dan Tanggal Akta Perubahan Terakhir" id="akta-perubahan" name="latestAmendmentDeed" placeholder="Opsional jika ada" />
                  <InputField label="Nomor dan Tanggal NIB" id="nib-pendirian" name="nibNumber" placeholder="NIB beserta tanggal rilis" required />
                  <InputField label="Nomor dan Tanggal SIUP" id="siup" name="siupNumber" placeholder="Nomor SIUP" required />
                </div>

                <FileUploadField label="Dokumen Akta Landasan Hukum Perusahaan" id="file-akta" name="fileDeed" />
              </div>

              <Separator className="bg-neutral-200 dark:bg-neutral-800" />

              {/* Section 5: NIB & Sertifikat */}
              <div className="space-y-6">
                <SectionHeader 
                  icon={BadgeCheck} 
                  title="NIB & Sertifikat Badan Usaha" 
                  description="Detail perizinan berusaha dan lisensi lainnya." 
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <InputField label="Status Penanaman Modal" id="status-modal" name="investmentStatus" placeholder="PMA / PMDN" required />
                  <InputField label="Perubahan Ke dan Tanggal" id="perubahan-tanggal" name="nibAmendmentDetails" placeholder="Detail perubahan NIB" />
                  <InputField label="Nomor Tanggal NIB" id="nib-tanggal" name="nibDateNumber" placeholder="Data NIB" required />
                </div>

                <div className="mt-8 space-y-4">
                  <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Sertifikat Badan Lainnya
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-950 shadow-sm">
                    <InputField label="Nama Sertifikat" id="sertif-1-nama" name="certificate1Name" placeholder="SBU / ISO / dsb" />
                    <InputField label="No dan Tgl Sertifikat" id="sertif-1-no" name="certificate1Number" placeholder="Nomor berserta tanggal" />
                    <InputField label="Masa Berlaku" id="sertif-1-masa" name="certificate1Validity" placeholder="Tanggal validitas" />
                    <InputField label="Instansi Penerbit" id="sertif-1-instansi" name="certificate1Issuer" placeholder="Penerbit" />
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm uppercase tracking-wider flex items-center gap-2">
                    <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    Sertifikat Badan Lainnya (Tambahan)
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-950 shadow-sm">
                    <InputField label="Nama Sertifikat" id="sertif-2-nama" name="certificate2Name" placeholder="SBU / ISO / dsb" />
                    <InputField label="No dan Tgl Sertifikat" id="sertif-2-no" name="certificate2Number" placeholder="Nomor berserta tanggal" />
                    <InputField label="Masa Berlaku" id="sertif-2-masa" name="certificate2Validity" placeholder="Tanggal validitas" />
                    <InputField label="Instansi Penerbit" id="sertif-2-instansi" name="certificate2Issuer" placeholder="Penerbit" />
                  </div>
                </div>

                <div className="mt-6">
                  <FileUploadField label="Dokumen Sertifikat Badan Usaha (Gabung jika > 3 sertifikat)" id="file-sertifikat" name="fileCertificates" />
                </div>
              </div>

              <Separator className="bg-neutral-200 dark:bg-neutral-800" />

              {/* Section 6: Upload Dokumen Lainnya */}
              <div className="space-y-6">
                <SectionHeader 
                  icon={FileCheck2} 
                  title="Dokumen Persyaratan Administrasi" 
                  description="Lampirkan berkas operasional, keuangan, dan pengajuan." 
                />
                
                <div className="grid md:grid-cols-2 gap-8">
                  <FileUploadField label="Struktur Organisasi Perusahaan" id="file-struktur" name="fileOrgStructure" />
                  <FileUploadField label="Daftar Alat Kerja dan APD" id="file-alat" name="fileEquipmentList" />
                  <FileUploadField label="List Pengalaman & BAST (3 Tahun Terakhir)" id="file-pengalaman" name="fileExperienceList" />
                  <FileUploadField label="Laporan Audit Keuangan (2 Tahun Terakhir)" id="file-audit" name="fileFinancialAudit" />
                  <FileUploadField label="Rekening Koran (3 Bulan Terakhir)" id="file-rekening" name="fileBankStatement" />
                  <FileUploadField label="Surat Permohonan Mitra PT DEA" id="file-permohonan" name="fileApplicationLetter" />
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 text-sm text-red-700 bg-red-100 dark:bg-red-950/50 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900 animate-in fade-in duration-350">
                  {errorMsg}
                </div>
              )}

            </CardContent>
            
            <CardFooter className="p-6 md:p-8 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-end gap-3 rounded-b-xl">
              <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto h-12" onClick={() => window.location.href = "/"}>
                Batal
              </Button>
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto h-12 px-8 shadow-md hover:shadow-lg transition-all bg-primary hover:bg-primary/95 text-white">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Pengajuan
                    <SendHorizontal className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

        </form>
      </div>
    </div>
  )
}