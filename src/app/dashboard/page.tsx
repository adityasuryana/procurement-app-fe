import { Users, Briefcase, QrCode, Building2, TrendingUp, ArrowRight, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

// ─── Types ───────────────────────────────────────────────────────────────────

interface Partner {
  id: number
  companyName: string
  status: string
  createdAt: string
  businessField?: string
}

interface Career {
  id: number
  title: string
  status: string
  createdAt: string
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function getStatusStyle(status: string) {
  switch (status) {
    case "Disetujui":
      return {
        dot: "bg-emerald-500",
        badge: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50",
        icon: <CheckCircle2 className="w-3 h-3" />,
      }
    case "Ditolak":
      return {
        dot: "bg-red-500",
        badge: "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50",
        icon: <XCircle className="w-3 h-3" />,
      }
    default:
      return {
        dot: "bg-amber-500",
        badge: "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
        icon: <AlertCircle className="w-3 h-3" />,
      }
  }
}

function timeAgo(dateStr: string) {
  const now = new Date()
  const then = new Date(dateStr)
  const diffMs = now.getTime() - then.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Hari ini"
  if (diffDays === 1) return "Kemarin"
  if (diffDays < 30) return `${diffDays} hari lalu`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths} bulan lalu`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015"

  let partners: Partner[] = []
  let careers: Career[] = []
  let qrCount = 0
  let qrAssetCount = 0

  await Promise.allSettled([
    fetch(`${apiUrl}/api/partner`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { partners = d }),

    fetch(`${apiUrl}/api/career`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { careers = d }),

    fetch(`${apiUrl}/api/qrcontact`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { qrCount = Array.isArray(d) ? d.length : 0 }),

    fetch(`${apiUrl}/api/qrasset`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { qrAssetCount = Array.isArray(d) ? d.length : 0 }),
  ])

  // Compute stats
  const partnerCount = partners.length
  const careerCount = careers.length
  const approved = partners.filter((p) => p.status === "Disetujui").length
  const pending = partners.filter((p) => p.status !== "Disetujui" && p.status !== "Ditolak").length
  const rejected = partners.filter((p) => p.status === "Ditolak").length

  const approvalRate = partnerCount > 0 ? Math.round((approved / partnerCount) * 100) : 0

  const recentPartners = [...partners]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)

  const recentCareers = [...careers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  // ─── Stat cards config ──────────────────────────────────────────────────────
  const stats = [
    {
      label: "Total Mitra",
      value: partnerCount,
      sub: `${approved} disetujui`,
      icon: Users,
      gradient: "from-violet-500/20 to-violet-500/5",
      iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20",
      href: "/dashboard/mitra",
    },
    {
      label: "Mitra Disetujui",
      value: approved,
      sub: `${approvalRate}% approval rate`,
      icon: CheckCircle2,
      gradient: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      href: "/dashboard/mitra",
    },
    {
      label: "Lowongan Aktif",
      value: careerCount,
      sub: "Total posisi terdaftar",
      icon: Briefcase,
      gradient: "from-blue-500/20 to-blue-500/5",
      iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
      href: "/dashboard/karir",
    },
    {
      label: "Kelola QR",
      value: qrCount + qrAssetCount,
      sub: "Total QR code terdaftar",
      icon: QrCode,
      gradient: "from-orange-500/20 to-orange-500/5",
      iconBg: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20",
      href: "/dashboard/kelola-qr",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">

      {/* ── Welcome Banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute right-[-60px] top-[-60px] h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-40px] right-[100px] h-32 w-32 rounded-full bg-violet-500/10 blur-2xl" />

        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Duta Esa Adiperkasa</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Selamat Datang 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Pantau seluruh aktivitas kemitraan, karir, dan kontak QR perusahaan dari satu tempat.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/mitra"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              Kelola Mitra
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all duration-200"
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className="text-3xl font-extrabold text-foreground mt-1 tracking-tight">{s.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {s.sub}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${s.iconBg}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Middle Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Partner Status Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-foreground">Distribusi Status Mitra</h2>
              <p className="text-[11px] text-muted-foreground">Total {partnerCount} mitra terdaftar</p>
            </div>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="space-y-3">
            {[
              { label: "Disetujui", count: approved, total: partnerCount, color: "bg-emerald-500", light: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-300" },
              { label: "Menunggu", count: pending, total: partnerCount, color: "bg-amber-500", light: "bg-amber-100 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-300" },
              { label: "Ditolak", count: rejected, total: partnerCount, color: "bg-red-500", light: "bg-red-100 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300" },
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-foreground">{item.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.light} ${item.text}`}>
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {partnerCount === 0 && (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground gap-2">
              <Users className="w-6 h-6 opacity-30" />
              <p className="text-xs">Belum ada data mitra</p>
            </div>
          )}
        </div>

        {/* Recent Partners */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h2 className="text-sm font-bold text-foreground">Mitra Terbaru</h2>
              <p className="text-[11px] text-muted-foreground">Pendaftar mitra terkini</p>
            </div>
            <Link
              href="/dashboard/mitra"
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentPartners.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
              <Building2 className="w-6 h-6 opacity-30" />
              <p className="text-xs">Belum ada mitra terdaftar</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentPartners.map((p) => {
                const style = getStatusStyle(p.status)
                return (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{p.companyName}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {timeAgo(p.createdAt)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${style.badge}`}>
                      {style.icon}
                      {p.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Careers */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <div>
              <h2 className="text-sm font-bold text-foreground">Lowongan Terbaru</h2>
              <p className="text-[11px] text-muted-foreground">{careerCount} posisi terdaftar</p>
            </div>
            <Link
              href="/dashboard/karir"
              className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              Lihat semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentCareers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
              <Briefcase className="w-6 h-6 opacity-30" />
              <p className="text-xs">Belum ada lowongan terdaftar</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentCareers.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(c.createdAt)}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/50">
                    {c.status || "Aktif"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs">
          <h2 className="text-sm font-bold text-foreground mb-1">Aksi Cepat</h2>
          <p className="text-[11px] text-muted-foreground mb-4">Navigasi ke halaman yang sering digunakan</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Kelola Mitra", desc: "Lihat & setujui mitra", icon: Users, href: "/dashboard/mitra", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/20" },
              { label: "Kelola Karir", desc: "Atur lowongan kerja", icon: Briefcase, href: "/dashboard/karir", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20" },
              { label: "Kelola QR", desc: "Manajemen QR kontak & aset", icon: QrCode, href: "/dashboard/kelola-qr", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20" },
              { label: "Kelola Akun", desc: "Manajemen pengguna", icon: Building2, href: "/dashboard/kelola-akun", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors ${action.bg}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.color} bg-white/50 dark:bg-black/20`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${action.color}`}>{action.label}</p>
                  <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
