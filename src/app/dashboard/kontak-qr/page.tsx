"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Search, Phone, Mail, Building2, Calendar, Download, Loader2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

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

const ITEMS_PER_PAGE = 6;

export default function KontakQRPage() {
  const [contacts, setContacts] = useState<QRContact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch data
  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("http://localhost:8015/api/qrcontact")
      if (res.ok) {
        const data = await res.json()
        // Urutkan dari yang terbaru
        const sortedData = data.sort((a: any, b: any) => {
          return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime()
        })
        setContacts(sortedData)
      } else {
        setContacts([])
      }
    } catch (error) {
      console.error("Failed to fetch contacts", error)
      setContacts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    position: ""
  })

  // Pagination & Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Derived Data
  const filteredContacts = React.useMemo(() => {
    return contacts.filter(c =>
      c.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(c.id).toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [contacts, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / ITEMS_PER_PAGE))
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    if (id === "phone") {
      setFormData(prev => ({ ...prev, [id]: value.replace(/[^0-9]/g, '') }))
    } else {
      setFormData(prev => ({ ...prev, [id]: value }))
    }
  }

  // Generate QR VCard string
  const generateVCardDataString = (contact: Pick<QRContact, 'firstName' | 'lastName' | 'email' | 'phone' | 'position'>) => {
    return `BEGIN:VCARD\nVERSION:3.0\nN:${contact.lastName};${contact.firstName};;;\nFN:${contact.firstName} ${contact.lastName}\nORG:PT Duta Esa Adiperkasa\nEMAIL;type=WORK:${contact.email}\nTEL;type=WORK:${contact.phone}\nTITLE:${contact.position}\nURL:https://dea-corp.co.id\nEND:VCARD`;
  }

  const isFormValid = Boolean(
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.phone.trim() &&
    formData.email.trim() &&
    formData.position.trim()
  )

  const handleSave = async () => {
    if (!isFormValid) return

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        position: formData.position,
        company: "PT Duta Esa Adiperkasa",
        website: "https://dea-corp.com/"
      }

      const res = await fetch("http://localhost:8015/api/qrcontact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const newContact = await res.json()
        setContacts([newContact, ...contacts])
        setIsDialogOpen(false)
        setFormData({ firstName: "", lastName: "", phone: "", email: "", position: "" })
        setCurrentPage(1) // Push back to page 1 to see the new data
      } else {
        alert("Gagal menyimpan kontak")
      }
    } catch (error) {
      console.error("Failed to save contact", error)
      alert("Terjadi kesalahan jaringan")
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kontak ini?")) return
    try {
      const res = await fetch(`http://localhost:8015/api/qrcontact/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        setContacts(contacts.filter(c => c.id !== id))
      } else {
        alert("Gagal menghapus kontak")
      }
    } catch (error) {
      console.error("Failed to delete contact", error)
      alert("Terjadi kesalahan jaringan")
    }
  }

  const handleDownloadQR = (contactId: string | number, firstName: string, lastName: string) => {
    const svg = document.getElementById(`qr-${contactId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 4;
      canvas.height = img.height * 4;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `QR_${firstName}_${lastName}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Daftar Kontak QR</h2>
          <p className="text-muted-foreground">Kelola data kontak beserta pratinjau VCard.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah QR
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Kontak QR Baru</DialogTitle>
              <DialogDescription>
                Masukkan detail kontak untuk membuat QR Code VCard baru.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="firstName" className="text-left">
                  Nama Depan
                </Label>
                <Input id="firstName" placeholder="Nama Depan" value={formData.firstName} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lastName" className="text-left">
                  Nama Belakang
                </Label>
                <Input id="lastName" placeholder="Nama Belakang" value={formData.lastName} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-left">
                  No. Telepon
                </Label>
                <Input
                  id="phone"
                  placeholder="0812XXXX"
                  type="text"
                  inputMode="numeric"
                  value={formData.phone}
                  onChange={handleChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-left">
                  Email
                </Label>
                <Input id="email" placeholder="nama@dea-corp.co.id" type="email" value={formData.email} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-left">
                  Posisi
                </Label>
                <Input id="position" placeholder="Contoh: Manager" value={formData.position} onChange={handleChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-left">
                  Perusahaan
                </Label>
                <Input id="company" value="PT Duta Esa Adiperkasa" disabled className="col-span-3 bg-muted" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="website" className="text-left">
                  Website
                </Label>
                <Input id="website" value="https://dea-corp.com/" disabled className="col-span-3 bg-muted" />
              </div>
            </div>

            {isFormValid ? (
              <div className="flex flex-col items-center justify-center p-4 border rounded-md mt-2 bg-muted/20">
                <p className="text-xs font-semibold mb-3">VCard Preview</p>
                <div className="bg-white p-2 rounded">
                  <QRCodeSVG value={generateVCardDataString(formData)} size={150} />
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button type="button" onClick={handleSave} disabled={!isFormValid}>Simpan & Buat QR</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbox: Search */}
      <div className="flex items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari berdasarkan nama, email, posisi..."
            className="w-full pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset page on query
            }}
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Memuat data kontak...</p>
          </div>
        ) : paginatedContacts.length > 0 ? (
          paginatedContacts.map((contact) => (
            <Card key={contact.id} className="flex flex-col overflow-hidden hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-0">
                <div className="grid gap-1">
                  <CardTitle className="text-lg font-bold">
                    {contact.firstName} {contact.lastName}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-primary">
                    {contact.position}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" className="h-8 w-8 p-0 -mr-2">
                        <span className="sr-only">Aksi</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Aksi {contact.id}</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(contact.id))}>
                        Salin Kode ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Bagikan QR</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-destructive focus:bg-destructive/10">Hapus kontak</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between p-4 pt-4 mt-2 border-t bg-muted/10">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="space-y-3 text-sm text-muted-foreground flex-1 min-w-[200px] pr-2">
                    <div className="flex items-center min-w-0">
                      <Phone className="mr-2.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="font-medium text-foreground truncate">{contact.phone}</span>
                    </div>
                    <div className="flex items-center group min-w-0">
                      <Mail className="mr-2.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate" title={contact.email}>{contact.email}</span>
                    </div>
                    <div className="flex items-center min-w-0">
                      <Building2 className="mr-2.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="truncate">PT Duta Esa Adiperkasa</span>
                    </div>
                  </div>

                  {/* Miniature Dynamic QR Code */}
                  <div className="flex flex-col gap-3 shrink-0 mx-auto w-48 xl:w-[120px]">
                    <div className="p-2 sm:p-2 bg-white border border-border/50 rounded-xl shadow-sm flex items-center justify-center">
                      <QRCodeSVG id={`qr-${contact.id}`} value={generateVCardDataString(contact)} className="w-full h-auto" size={256} />
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => handleDownloadQR(contact.id, contact.firstName, contact.lastName)}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Unduh PNG
                    </Button>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground/70 mt-5 flex items-center">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" /> Dibuat pada {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : contact.date}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-16 text-center border rounded-xl border-dashed bg-muted/10">
            <Search className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-medium text-foreground">Tidak Ditemukan</h3>
            <p className="text-sm text-muted-foreground mt-1">Tidak ada data kontak yang sesuai dengan pencarian Anda.</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {filteredContacts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-2 pt-4 border-t gap-4">
          <p className="text-sm text-muted-foreground">
            Menampilkan <span className="font-medium text-foreground">{paginatedContacts.length}</span> dari <span className="font-medium text-foreground">{filteredContacts.length}</span> kontak
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </Button>
            <div className="flex items-center px-4 text-sm font-medium">
              Hal {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}