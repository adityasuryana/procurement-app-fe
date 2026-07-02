"use client"

import React, { useState, useEffect } from "react"
import { User, Mail, ShieldAlert, Key, Edit3, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AccountPage() {
  const [userId, setUserId] = useState<number | null>(null)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015"

  useEffect(() => {
    const session = localStorage.getItem("user_session")
    if (session) {
      try {
        const userData = JSON.parse(session)
        if (userData.id) {
          setUserId(userData.id)
          // Fetch current user details from database to ensure fresh data
          const token = userData.token || ""
          fetch(`${apiUrl}/api/users/${userData.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
            .then((res) => {
              if (res.ok) return res.json()
              throw new Error("Gagal mengambil data user")
            })
            .then((data) => {
              setUsername(data.username || "")
              setEmail(data.email || "")
              setFirstName(data.firstName || "")
              setLastName(data.lastName || "")
              setRole(data.role || "")
              setIsFetching(false)
            })
            .catch((err) => {
              console.error(err)
              // Fallback to local storage values if fetch fails
              setUsername(userData.username || "")
              setEmail(userData.email || "")
              setFirstName(userData.firstName || "")
              setLastName(userData.lastName || "")
              setRole(userData.role || "")
              setIsFetching(false)
            })
        } else {
          setIsFetching(false)
        }
      } catch (e) {
        console.error("Gagal membaca session:", e)
        setIsFetching(false)
      }
    } else {
      setIsFetching(false)
    }
  }, [apiUrl])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setIsLoading(true)
    setMessage("")
    setError("")

    try {
      // Only include password in payload if user typed a new one
      const payload: Record<string, string> = {
        username: username.trim(),
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
      }
      if (password.trim()) {
        payload.password = password.trim()
      }

      const token = (() => { try { const s = localStorage.getItem("user_session"); return s ? JSON.parse(s).token : "" } catch { return "" } })()

      const res = await fetch(`${apiUrl}/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const updatedData = await res.json()

        // Update user_session in localStorage (keeping the token and loggedAt)
        const session = localStorage.getItem("user_session")
        const currentSession = session ? JSON.parse(session) : {}

        localStorage.setItem("user_session", JSON.stringify({
          ...currentSession,
          username: updatedData.username,
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          email: updatedData.email,
          role: updatedData.role
        }))

        setMessage("Informasi akun berhasil diperbarui!")
        setPassword("") // Clear password field

        // Trigger event or dynamic reload of the page after small delay to let them see success
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        const errData = await res.json().catch(() => ({}))
        setError(errData.message || "Gagal memperbarui informasi akun. Silakan coba lagi.")
      }
    } catch (err) {
      console.error(err)
      setError("Gagal terhubung ke server. Silakan coba lagi nanti.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground mt-2">Memuat informasi akun...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Akun</h1>
        <p className="text-xs text-muted-foreground">Perbarui informasi profil dan kata sandi masuk Anda di sini.</p>
      </div>

      <div className="bg-card border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs">
        {/* User Card Header */}
        <div className="flex items-center gap-4 border-b pb-6 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
            <User className="h-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {firstName} {lastName}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border bg-primary/5 text-primary border-primary/15 uppercase tracking-wider">
                {role || "Pengguna"}
              </span>
              <span className="text-xs text-muted-foreground">{email}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="mb-6 p-4 border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 border border-red-200 bg-red-50/60 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Depan</label>
              <div className="relative">
                <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Nama Belakang</label>
              <div className="relative">
                <Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Alamat Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input
                  type="password"
                  value={password}
                  placeholder="Kosongkan jika tidak diganti"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-foreground outline-none focus:border-primary/80 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Role (Read Only) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Peran (Role)</label>
              <div className="relative">
                <ShieldAlert className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                <input
                  type="text"
                  disabled
                  value={role}
                  className="w-full bg-neutral-100 dark:bg-neutral-800/80 border border-input rounded-xl py-2 pl-9 pr-4 text-xs text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.location.href = "/dashboard"
              }}
              className="px-5 rounded-xl text-xs"
            >
              Kembali
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !firstName.trim() || !username.trim() || !email.trim()}
              className="px-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 rounded-xl text-xs shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
