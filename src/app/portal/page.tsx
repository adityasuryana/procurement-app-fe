"use client"

import React, { useState, useEffect } from "react"
import { User, Lock, Eye, EyeOff, Loader2, ArrowRight, Sun, Moon, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export default function PortalPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotUsername, setForgotUsername] = useState("")

  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8015"

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: username.trim(), password })
      })

      if (res.ok) {
        const data = await res.json()
        // Set cookie for middleware (session expires in 1 hour matching backend JWT expiry)
        document.cookie = "isLoggedIn=true; path=/; max-age=3600; SameSite=Lax"
        localStorage.setItem("user_session", JSON.stringify({
          ...data.user,
          token: data.token,
          loggedAt: new Date().toISOString()
        }))

        // Redirect to dashboard
        window.location.href = "/dashboard"
      } else {
        const errData = await res.json().catch(() => ({}))
        setIsLoading(false)
        setError(errData.message || "Username atau password salah. Silakan coba lagi.")
      }
    } catch (err) {
      console.error("Gagal login:", err)
      setIsLoading(false)
      setError("Gagal terhubung ke server. Silakan periksa koneksi Anda.")
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-radial dark:from-slate-900 dark:via-neutral-950 dark:to-black overflow-hidden px-4 transition-colors duration-300">
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

      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none opacity-70 dark:opacity-100" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none opacity-50 dark:opacity-100" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl border border-slate-200 dark:border-neutral-800/80 rounded-2xl p-8 shadow-2xl flex flex-col space-y-6 z-10 animate-in fade-in zoom-in-95 duration-350 transition-colors">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-primary/15 text-primary rounded-2xl mb-2 ring-1 ring-primary/20">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Duta Esa Adiperkasa</h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400">Sistem Manajemen Informasi</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold text-center animate-in shake duration-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Username</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
                className="w-full bg-white dark:bg-neutral-950/60 border border-slate-200 dark:border-neutral-800 focus:border-primary/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-hidden transition-all focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-neutral-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="w-full bg-white dark:bg-neutral-950/60 border border-slate-200 dark:border-neutral-800 focus:border-primary/80 rounded-xl py-2.5 pl-10 pr-10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-hidden transition-all focus:ring-2 focus:ring-primary/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Lupa Password Link */}
          <div className="flex justify-end -mt-2">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
            >
              Lupa Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg transition-all hover:shadow-primary/10 disabled:opacity-50 disabled:cursor-not-allowed group mt-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses Masuk...
              </>
            ) : (
              <>
                Masuk Portal
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 shadow-2xl w-full max-w-sm flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold">Lupa Password</h3>
              <button
                onClick={() => { setShowForgotModal(false); setForgotUsername("") }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-neutral-400 leading-relaxed">
              Untuk mereset password, silakan kirim email permohonan ke tim IT Support di <span className="font-bold text-primary">it@dea-corp.co.id</span>.
            </p>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Username / Nama Anda</label>
              <input
                type="text"
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                placeholder="Masukkan username atau nama lengkap"
                className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 focus:border-primary/80 rounded-xl py-2 px-3 text-xs outline-hidden focus:ring-2 focus:ring-primary/10 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
            
            <div className="flex gap-2.5 justify-end pt-1">
              <button
                onClick={() => { setShowForgotModal(false); setForgotUsername("") }}
                className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-800 border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const subject = encodeURIComponent("Permohonan Reset Password Akun Portal DEA")
                  const body = encodeURIComponent(`Halo IT Support PT Duta Esa Adiperkasa,\n\nSaya ingin mengajukan permohonan reset password untuk akun saya.\n\nUsername/Nama: ${forgotUsername || "—"}\n\nTerima kasih.`)
                  window.location.href = `mailto:it@dea-corp.co.id?subject=${subject}&body=${body}`
                  setShowForgotModal(false)
                  setForgotUsername("")
                }}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
              >
                Kirim Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}