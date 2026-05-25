"use client"

import React, { useState, useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Eye, Building2, User, MapPin, Scale, BadgeCheck, FileCheck2,
  Trash2, CheckCircle2, XCircle, ArrowUpDown,
} from "lucide-react"

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
  status: "Pending" | "Disetujui" | "Ditolak"
}

// ── Dummy Data ────────────────────────────────────────────────────────────────

const DUMMY: Mitra[] = [
  {
    id: 1,
    namaPerusahaan: "PT Maju Bersama Sejahtera",
    npwp: "01.234.567.8-901.000",
    sppkp: "PEM-01234/WPJ.06/2022",
    pjNama: "Budi Santoso",
    pjJabatan: "Direktur Utama",
    telpPerusahaan: "021-5551234",
    telpPj: "081234567890",
    alamat1: "Jl. Sudirman No. 12, RT 03/RW 05",
    alamat2: "Gedung Menara Utama Lt. 8",
    kota: "Jakarta Selatan, DKI Jakarta",
    kodepos: "12190",
    aktaPendirian: "No. 05, 15 Mar 2015",
    aktaPerubahan: "No. 12, 20 Jan 2022",
    nib: "1234567890123, 01 Feb 2022",
    siup: "503/SIUP-B/2022",
    statusModal: "PMDN",
    nibTanggal: "1234567890123, 01 Feb 2022",
    sertifikat1: { nama: "SBU Konstruksi", no: "SBU-KI-0001, 10 Mar 2022", masa: "10 Mar 2025", instansi: "LPJK" },
    sertifikat2: { nama: "ISO 9001:2015", no: "ISO-9001-2022", masa: "15 Apr 2025", instansi: "SGS Indonesia" },
    createdAt: "2025-04-01T08:30:00Z",
    status: "Disetujui",
  },
  {
    id: 2,
    namaPerusahaan: "CV Teknindo Solusi Prima",
    npwp: "02.345.678.9-012.000",
    sppkp: "N/A",
    pjNama: "Rina Wulandari",
    pjJabatan: "Direktur",
    telpPerusahaan: "022-4445678",
    telpPj: "082345678901",
    alamat1: "Jl. Asia Afrika No. 55",
    alamat2: "",
    kota: "Bandung, Jawa Barat",
    kodepos: "40111",
    aktaPendirian: "No. 08, 10 Jun 2018",
    aktaPerubahan: "",
    nib: "9876543210987, 05 Aug 2020",
    siup: "503/SIUP-K/2020",
    statusModal: "PMDN",
    nibTanggal: "9876543210987, 05 Aug 2020",
    sertifikat1: { nama: "SBU Instalasi Listrik", no: "SBU-EL-0045, 01 Jan 2023", masa: "01 Jan 2026", instansi: "LPJK" },
    sertifikat2: { nama: "", no: "", masa: "", instansi: "" },
    createdAt: "2025-04-05T10:15:00Z",
    status: "Pending",
  },
  {
    id: 3,
    namaPerusahaan: "PT Global Infrastruktur Nusantara",
    npwp: "03.456.789.0-123.000",
    sppkp: "PEM-09876/WPJ.09/2021",
    pjNama: "Ahmad Fauzi",
    pjJabatan: "Manajer Operasional",
    telpPerusahaan: "031-7778901",
    telpPj: "083456789012",
    alamat1: "Jl. Pemuda No. 101, RT 01/RW 02",
    alamat2: "Ruko Pemuda Square Blok B-5",
    kota: "Surabaya, Jawa Timur",
    kodepos: "60271",
    aktaPendirian: "No. 22, 30 Sep 2010",
    aktaPerubahan: "No. 07, 12 Dec 2020",
    nib: "1122334455667, 20 Nov 2020",
    siup: "503/SIUP-B/2020",
    statusModal: "PMA",
    nibTanggal: "1122334455667, 20 Nov 2020",
    sertifikat1: { nama: "ISO 14001:2015", no: "ISO-14001-GIN", masa: "20 Jun 2025", instansi: "Bureau Veritas" },
    sertifikat2: { nama: "SMK3", no: "SMK3-0098/2021", masa: "30 Oct 2024", instansi: "Kemnaker RI" },
    createdAt: "2025-04-10T14:00:00Z",
    status: "Pending",
  },
  {
    id: 4,
    namaPerusahaan: "PT Karya Mandiri Digital",
    npwp: "04.567.890.1-234.000",
    sppkp: "PEM-55501/WPJ.04/2023",
    pjNama: "Dewi Kusuma",
    pjJabatan: "CEO",
    telpPerusahaan: "024-3334567",
    telpPj: "084567890123",
    alamat1: "Jl. Diponegoro No. 77",
    alamat2: "",
    kota: "Semarang, Jawa Tengah",
    kodepos: "50131",
    aktaPendirian: "No. 15, 22 Feb 2019",
    aktaPerubahan: "No. 03, 08 Mar 2023",
    nib: "5566778899001, 10 Apr 2023",
    siup: "503/SIUP-K/2023",
    statusModal: "PMDN",
    nibTanggal: "5566778899001, 10 Apr 2023",
    sertifikat1: { nama: "ISO 27001:2013", no: "ISO-27001-KMD", masa: "08 Mar 2026", instansi: "BSI Group" },
    sertifikat2: { nama: "", no: "", masa: "", instansi: "" },
    createdAt: "2025-04-18T09:00:00Z",
    status: "Ditolak",
  },
  {
    id: 5,
    namaPerusahaan: "CV Sarana Teknik Andalan",
    npwp: "05.678.901.2-345.000",
    sppkp: "N/A",
    pjNama: "Hendra Wijaya",
    pjJabatan: "Direktur",
    telpPerusahaan: "0741-223344",
    telpPj: "085678901234",
    alamat1: "Jl. Sisingamangaraja No. 8",
    alamat2: "",
    kota: "Jambi, Jambi",
    kodepos: "36123",
    aktaPendirian: "No. 02, 14 Jul 2016",
    aktaPerubahan: "",
    nib: "6677889900112, 25 Aug 2021",
    siup: "503/SIUP-B/2021",
    statusModal: "PMDN",
    nibTanggal: "6677889900112, 25 Aug 2021",
    sertifikat1: { nama: "SBU Mekanikal", no: "SBU-ME-0077, 05 Sep 2022", masa: "05 Sep 2025", instansi: "LPJK" },
    sertifikat2: { nama: "", no: "", masa: "", instansi: "" },
    createdAt: "2025-04-22T11:30:00Z",
    status: "Pending",
  },
  {
    id: 6,
    namaPerusahaan: "PT Nusantara Energi Utama",
    npwp: "06.789.012.3-456.000",
    sppkp: "PEM-77601/WPJ.07/2022",
    pjNama: "Rudi Hermawan",
    pjJabatan: "Presiden Direktur",
    telpPerusahaan: "0411-334455",
    telpPj: "086789012345",
    alamat1: "Jl. Cendrawasih No. 45, RT 02/RW 08",
    alamat2: "Gedung Graha Energi Lt. 3",
    kota: "Makassar, Sulawesi Selatan",
    kodepos: "90111",
    aktaPendirian: "No. 09, 05 Apr 2012",
    aktaPerubahan: "No. 04, 11 Jul 2021",
    nib: "7788990011223, 15 Sep 2021",
    siup: "503/SIUP-B/2021",
    statusModal: "PMDN",
    nibTanggal: "7788990011223, 15 Sep 2021",
    sertifikat1: { nama: "SBU Mekanikal & Elektrikal", no: "SBU-ME-0099, 15 Sep 2021", masa: "15 Sep 2024", instansi: "LPJK" },
    sertifikat2: { nama: "ISO 9001:2015", no: "ISO-9001-NEU", masa: "20 Nov 2025", instansi: "TÜV Rheinland" },
    createdAt: "2025-05-01T09:00:00Z",
    status: "Disetujui",
  },
  {
    id: 7,
    namaPerusahaan: "CV Prima Konstruksi Raya",
    npwp: "07.890.123.4-567.000",
    sppkp: "N/A",
    pjNama: "Siti Rahayu",
    pjJabatan: "Direktur",
    telpPerusahaan: "0561-445566",
    telpPj: "087890123456",
    alamat1: "Jl. Ahmad Yani No. 100",
    alamat2: "",
    kota: "Pontianak, Kalimantan Barat",
    kodepos: "78111",
    aktaPendirian: "No. 11, 20 Mar 2017",
    aktaPerubahan: "",
    nib: "8899001122334, 10 Jun 2022",
    siup: "503/SIUP-K/2022",
    statusModal: "PMDN",
    nibTanggal: "8899001122334, 10 Jun 2022",
    sertifikat1: { nama: "SBU Konstruksi Gedung", no: "SBU-KG-0033, 10 Jun 2022", masa: "10 Jun 2025", instansi: "LPJK" },
    sertifikat2: { nama: "", no: "", masa: "", instansi: "" },
    createdAt: "2025-05-03T14:30:00Z",
    status: "Pending",
  },
  {
    id: 8,
    namaPerusahaan: "PT Sigma Teknologi Indonesia",
    npwp: "08.901.234.5-678.000",
    sppkp: "PEM-33201/WPJ.11/2020",
    pjNama: "Agus Prayitno",
    pjJabatan: "CEO",
    telpPerusahaan: "0651-556677",
    telpPj: "088901234567",
    alamat1: "Jl. T. Nyak Arief No. 25",
    alamat2: "Kompleks Perkantoran Banda Raya Blok C",
    kota: "Banda Aceh, Aceh",
    kodepos: "23111",
    aktaPendirian: "No. 03, 08 Jan 2014",
    aktaPerubahan: "No. 06, 15 Aug 2022",
    nib: "9900112233445, 20 Sep 2022",
    siup: "503/SIUP-B/2022",
    statusModal: "PMDN",
    nibTanggal: "9900112233445, 20 Sep 2022",
    sertifikat1: { nama: "ISO 27001:2013", no: "ISO-27001-STI", masa: "15 Aug 2025", instansi: "BSI Group" },
    sertifikat2: { nama: "SMK3", no: "SMK3-0112/2022", masa: "20 Sep 2025", instansi: "Kemnaker RI" },
    createdAt: "2025-05-06T08:00:00Z",
    status: "Disetujui",
  },
  {
    id: 9,
    namaPerusahaan: "PT Buana Jaya Perkasa",
    npwp: "09.012.345.6-789.000",
    sppkp: "PEM-44401/WPJ.02/2021",
    pjNama: "Wahyu Santoso",
    pjJabatan: "Direktur Operasional",
    telpPerusahaan: "0721-667788",
    telpPj: "089012345678",
    alamat1: "Jl. Wolter Monginsidi No. 62",
    alamat2: "",
    kota: "Bandar Lampung, Lampung",
    kodepos: "35111",
    aktaPendirian: "No. 07, 30 May 2011",
    aktaPerubahan: "No. 02, 05 Jan 2020",
    nib: "0011223344556, 25 Feb 2020",
    siup: "503/SIUP-B/2020",
    statusModal: "PMDN",
    nibTanggal: "0011223344556, 25 Feb 2020",
    sertifikat1: { nama: "SBU Sipil", no: "SBU-SI-0055, 25 Feb 2020", masa: "25 Feb 2023", instansi: "LPJK" },
    sertifikat2: { nama: "ISO 14001:2015", no: "ISO-14001-BJP", masa: "10 Mar 2026", instansi: "Bureau Veritas" },
    createdAt: "2025-05-08T10:00:00Z",
    status: "Ditolak",
  },
  {
    id: 10,
    namaPerusahaan: "CV Cahaya Timur Mandiri",
    npwp: "10.123.456.7-890.000",
    sppkp: "N/A",
    pjNama: "Nurul Hidayah",
    pjJabatan: "Direktur",
    telpPerusahaan: "0401-778899",
    telpPj: "081023456789",
    alamat1: "Jl. Haluoleo No. 18",
    alamat2: "",
    kota: "Kendari, Sulawesi Tenggara",
    kodepos: "93111",
    aktaPendirian: "No. 14, 12 Aug 2019",
    aktaPerubahan: "",
    nib: "1122334455678, 30 Oct 2022",
    siup: "503/SIUP-K/2022",
    statusModal: "PMDN",
    nibTanggal: "1122334455678, 30 Oct 2022",
    sertifikat1: { nama: "SBU Instalasi Mekanikal", no: "SBU-IM-0021, 30 Oct 2022", masa: "30 Oct 2025", instansi: "LPJK" },
    sertifikat2: { nama: "", no: "", masa: "", instansi: "" },
    createdAt: "2025-05-10T13:00:00Z",
    status: "Pending",
  },
  {
    id: 11,
    namaPerusahaan: "PT Rimba Raya Lestari",
    npwp: "11.234.567.8-901.000",
    sppkp: "PEM-55502/WPJ.15/2021",
    pjNama: "Bambang Sugiarto",
    pjJabatan: "Direktur Utama",
    telpPerusahaan: "0511-889900",
    telpPj: "082134567890",
    alamat1: "Jl. P. Antasari No. 88",
    alamat2: "Gedung Borneo Tower Lt. 5",
    kota: "Balikpapan, Kalimantan Timur",
    kodepos: "76111",
    aktaPendirian: "No. 06, 22 Jun 2009",
    aktaPerubahan: "No. 09, 03 Mar 2022",
    nib: "2233445566789, 15 Apr 2022",
    siup: "503/SIUP-B/2022",
    statusModal: "PMA",
    nibTanggal: "2233445566789, 15 Apr 2022",
    sertifikat1: { nama: "ISO 45001:2018", no: "ISO-45001-RRL", masa: "03 Mar 2025", instansi: "SGS Indonesia" },
    sertifikat2: { nama: "SBU Lingkungan", no: "SBU-LH-0011, 15 Apr 2022", masa: "15 Apr 2025", instansi: "LPJK" },
    createdAt: "2025-05-12T11:00:00Z",
    status: "Disetujui",
  },
  {
    id: 12,
    namaPerusahaan: "CV Mitra Solusi Teknindo",
    npwp: "12.345.678.9-012.000",
    sppkp: "N/A",
    pjNama: "Farida Yusuf",
    pjJabatan: "Direktur",
    telpPerusahaan: "0431-990011",
    telpPj: "083234567891",
    alamat1: "Jl. Sam Ratulangi No. 15",
    alamat2: "",
    kota: "Manado, Sulawesi Utara",
    kodepos: "95111",
    aktaPendirian: "No. 04, 19 Sep 2018",
    aktaPerubahan: "",
    nib: "3344556677890, 12 Jan 2023",
    siup: "503/SIUP-K/2023",
    statusModal: "PMDN",
    nibTanggal: "3344556677890, 12 Jan 2023",
    sertifikat1: { nama: "SBU Tata Lingkungan", no: "SBU-TL-0044, 12 Jan 2023", masa: "12 Jan 2026", instansi: "LPJK" },
    sertifikat2: { nama: "", no: "", masa: "", instansi: "" },
    createdAt: "2025-05-14T09:30:00Z",
    status: "Pending",
  },
  {
    id: 13,
    namaPerusahaan: "PT Garuda Konstruksi Nasional",
    npwp: "13.456.789.0-123.000",
    sppkp: "PEM-66603/WPJ.08/2020",
    pjNama: "Dedi Kurniawan",
    pjJabatan: "CEO",
    telpPerusahaan: "0361-001122",
    telpPj: "084345678912",
    alamat1: "Jl. Bypass Ngurah Rai No. 77",
    alamat2: "Kompleks Bali Business Park Unit B2",
    kota: "Denpasar, Bali",
    kodepos: "80111",
    aktaPendirian: "No. 13, 15 Nov 2007",
    aktaPerubahan: "No. 08, 22 Sep 2023",
    nib: "4455667788901, 30 Nov 2023",
    siup: "503/SIUP-B/2023",
    statusModal: "PMA",
    nibTanggal: "4455667788901, 30 Nov 2023",
    sertifikat1: { nama: "ISO 9001:2015", no: "ISO-9001-GKN", masa: "22 Sep 2026", instansi: "Bureau Veritas" },
    sertifikat2: { nama: "SMK3", no: "SMK3-0155/2023", masa: "30 Nov 2026", instansi: "Kemnaker RI" },
    createdAt: "2025-05-16T15:00:00Z",
    status: "Disetujui",
  },
  {
    id: 14,
    namaPerusahaan: "PT Andika Putra Sejahtera",
    npwp: "14.567.890.1-234.000",
    sppkp: "PEM-77704/WPJ.12/2022",
    pjNama: "Andika Pratama",
    pjJabatan: "Direktur Utama",
    telpPerusahaan: "0711-112233",
    telpPj: "085456789123",
    alamat1: "Jl. Jend. Sudirman No. 33",
    alamat2: "",
    kota: "Palembang, Sumatera Selatan",
    kodepos: "30111",
    aktaPendirian: "No. 01, 07 Feb 2015",
    aktaPerubahan: "No. 05, 14 Dec 2022",
    nib: "5566778899012, 20 Jan 2023",
    siup: "503/SIUP-B/2023",
    statusModal: "PMDN",
    nibTanggal: "5566778899012, 20 Jan 2023",
    sertifikat1: { nama: "SBU Konstruksi Khusus", no: "SBU-KK-0067, 20 Jan 2023", masa: "20 Jan 2026", instansi: "LPJK" },
    sertifikat2: { nama: "ISO 14001:2015", no: "ISO-14001-APS", masa: "14 Dec 2025", instansi: "SGS Indonesia" },
    createdAt: "2025-05-18T08:30:00Z",
    status: "Ditolak",
  },
  {
    id: 15,
    namaPerusahaan: "CV Lintas Borneo Teknik",
    npwp: "15.678.901.2-345.000",
    sppkp: "N/A",
    pjNama: "Yulia Permatasari",
    pjJabatan: "Direktur",
    telpPerusahaan: "0541-223344",
    telpPj: "086567891234",
    alamat1: "Jl. Mulawarman No. 50",
    alamat2: "",
    kota: "Samarinda, Kalimantan Timur",
    kodepos: "75111",
    aktaPendirian: "No. 08, 25 Oct 2020",
    aktaPerubahan: "",
    nib: "6677889900123, 05 Mar 2023",
    siup: "503/SIUP-K/2023",
    statusModal: "PMDN",
    nibTanggal: "6677889900123, 05 Mar 2023",
    sertifikat1: { nama: "SBU Mekanikal", no: "SBU-ME-0088, 05 Mar 2023", masa: "05 Mar 2026", instansi: "LPJK" },
    sertifikat2: { nama: "", no: "", masa: "", instansi: "" },
    createdAt: "2025-05-20T10:00:00Z",
    status: "Pending",
  },
]

// ── Styles ────────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<Mitra["status"], string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardMitraPage() {
  const [mitras, setMitras] = useState<Mitra[]>([])
  const [selected, setSelected] = useState<Mitra | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Mitra | null>(null)

  React.useEffect(() => {
    const fetchMitras = async () => {
      try {
        const res = await fetch("http://localhost:8015/api/partner")
        if (res.ok) {
          const data = await res.json()
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
            status: item.status
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
          status: newStatus
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
            label: "Pending", value: mitras.filter(m => m.status === "Pending").length,
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

      {/* DataTable */}
      <DataTable columns={columns} data={mitras} searchKey="namaPerusahaan" />

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
                <div className="grid grid-cols-2 gap-2 mt-1 pb-2">
                  {[
                    "Dokumen NPWP & SPPKP", "Akta Domisili", "Dokumen Akta Hukum",
                    "Dokumen Sertifikat Badan Usaha", "Struktur Organisasi",
                    "Daftar Alat Kerja & APD", "List Pengalaman & BAST",
                    "Laporan Audit Keuangan", "Rekening Koran", "Surat Permohonan Mitra",
                  ].map((doc) => (
                    <div key={doc} className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                      <FileCheck2 className="w-3 h-3 shrink-0 text-primary/60" />
                      <span>{doc}</span>
                    </div>
                  ))}
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
                    onClick={() => handleSetStatus(selected.id, "Ditolak")}
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
    </div>
  )
}