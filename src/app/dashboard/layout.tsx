"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { Button } from "@/components/ui/button"
import { Bell, Sun, Moon, Briefcase, Users, MessageSquare, Clock, X, CheckCircle2 } from "lucide-react"
import { useTheme } from "next-themes"

interface NotificationItem {
  id: number
  title: string
  desc: string
  time: string
  icon: any
  iconColor: string
  bg: string
  unread: boolean
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [showNotif, setShowNotif] = React.useState(false)

  // State for mock notifications to allow marking as read / clearing
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([
    {
      id: 1,
      title: "Pendaftaran Mitra Baru",
      desc: "CV Duta Jaya Sentosa mengajukan kemitraan baru.",
      time: "2 jam yang lalu",
      icon: Users,
      iconColor: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-100 dark:bg-violet-950/40 border-violet-200 dark:border-violet-850/50",
      unread: true
    },
    {
      id: 2,
      title: "Lowongan Kerja Dipublikasikan",
      desc: "Posisi 'Frontend Developer Intern' telah tayang.",
      time: "1 hari yang lalu",
      icon: Briefcase,
      iconColor: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-950/40 border-blue-200 dark:border-blue-850/50",
      unread: true
    },
    {
      id: 3,
      title: "Sesi Interview Terjadwal",
      desc: "Interview pelamar Aditya Suryana (Manager) besok pukul 10:00 WIB.",
      time: "3 hari yang lalu",
      icon: Clock,
      iconColor: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-850/50",
      unread: false
    }
  ])

  // Count unread
  const unreadCount = notifications.filter(n => n.unread).length

  // Click outside behavior
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotif(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const removeNotif = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b bg-background/50 backdrop-blur-xs relative z-40">
          <div className="flex flex-1 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <DynamicBreadcrumb />
            </div>

            {/* Header Actions (Theme Toggle & Notifications) */}
            <div className="flex items-center gap-1.5 relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {!mounted ? (
                  <Sun className="h-4 w-4" />
                ) : theme === "dark" ? (
                  <Sun className="h-4 w-4 text-yellow-500 animate-in spin-in duration-300" />
                ) : (
                  <Moon className="h-4 w-4 text-blue-500 animate-in spin-in duration-300" />
                )}
              </Button>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg relative ${showNotif ? "bg-muted text-foreground" : ""
                    }`}
                  onClick={() => setShowNotif(!showNotif)}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </Button>

                {/* Dropdown Card */}
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-popover text-popover-foreground border rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                      <h4 className="text-xs font-bold uppercase tracking-wider">Notifikasi</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[10px] font-bold text-primary hover:underline"
                        >
                          Tandai sudah dibaca
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-border">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground gap-1.5">
                          <CheckCircle2 className="w-8 h-8 opacity-25 text-emerald-500" />
                          <p className="text-xs font-medium">Semua notifikasi bersih!</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const Icon = notif.icon
                          return (
                            <div
                              key={notif.id}
                              className={`flex gap-3 p-4 hover:bg-muted/40 transition-colors relative group ${notif.unread ? "bg-muted/15" : ""
                                }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${notif.bg} ${notif.iconColor}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-[11px] font-bold truncate">{notif.title}</p>
                                  {notif.unread && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground/90 mt-0.5 leading-normal">
                                  {notif.desc}
                                </p>
                                <p className="text-[9px] text-muted-foreground/60 mt-1 flex items-center gap-1">
                                  {notif.time}
                                </p>
                              </div>
                              <button
                                onClick={() => removeNotif(notif.id)}
                                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-md flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>

                    <div className="px-4 py-2 bg-muted/30 border-t text-center">
                      <p className="text-[9px] text-muted-foreground">
                        Duta Esa Adiperkasa
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
