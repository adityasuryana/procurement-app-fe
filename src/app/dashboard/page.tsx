import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Briefcase, QrCode } from "lucide-react"

export const dynamic = "force-dynamic";

export default async function Page() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015";
  let qrCount = 0;
  try {
    const res = await fetch(`${apiUrl}/api/qrcontact`, { cache: "no-store" })
    if (res.ok) {
      const data = await res.json()
      qrCount = data.length
    }
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("Gagal memuat jumlah QR dari database:", error)
  }

  let partnerCount = 0;
  let partners = [];
  try {
    const res = await fetch(`${apiUrl}/api/partner`, { cache: "no-store" })
    if (res.ok) {
      partners = await res.json()
      partnerCount = partners.length
    }
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("Gagal memuat data mitra dari database:", error)
  }

  const latestPartners = [...partners]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Mitra</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerCount}</div>
            <p className="text-xs text-muted-foreground">Mitra terdaftar di sistem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowongan Kerja</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Memuat data...</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Tercetak</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qrCount}</div>
            <p className="text-xs text-muted-foreground">Kontak QR Terdaftar</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Mitra Terbaru</CardTitle>
            <CardDescription>Daftar mitra yang mendaftar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestPartners.length > 0 ? (
                  latestPartners.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-xs truncate max-w-[150px] text-foreground">
                        {item.companyName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          item.status === "Disetujui"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200"
                            : item.status === "Ditolak"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200"
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                      Belum ada data mitra
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Lowongan Terpopuler</CardTitle>
            <CardDescription>Berdasarkan jumlah pelamar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posisi</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground h-24">
                    Belum ada data dinamis
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
