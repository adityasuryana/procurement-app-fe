"use client"

import * as React from "react"
import {
  Briefcase,
  GalleryVerticalEnd,
  LayoutDashboard,
  QrCode,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Administrator",
    email: "aditya.suryana@dea-corp.co.id",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Duta Esa Adiperkasa",
      logo: "/dea.png",
      plan: "Enterprise",
    },
  ],
}

const allNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Kontak QR",
      url: "/dashboard/kontak-qr",
      icon: QrCode,
    },
    {
      title: "Mitra",
      url: "/dashboard/mitra",
      icon: Users,
    },
    {
      title: "Karir",
      url: "/dashboard/karir",
      icon: Briefcase,
    },
    {
      title: "Removable Tower",
      url: "/dashboard/removable-tower",
      icon: Radio,
    },
    {
      title: "Kelola Akun",
      url: "/dashboard/kelola-akun",
      icon: ShieldCheck,
      adminOnly: true,
    },
  ]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState({
    name: "Administrator",
    role: "Admin",
    avatar: "/avatars/shadcn.jpg",
  })
  const [isAdmin, setIsAdmin] = React.useState(false)

  React.useEffect(() => {
    const session = localStorage.getItem("user_session")
    if (session) {
      try {
        const userData = JSON.parse(session)
        const fullName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.username
        const role = userData.role || ""
        setUser({
          name: fullName || "Administrator",
          role: role || "Staff",
          avatar: "/avatars/shadcn.jpg"
        })
        setIsAdmin(role.toLowerCase() === "admin")
      } catch (e) {
        console.error("Gagal memuat sesi user:", e)
      }
    }
  }, [])

  const navItems = allNavItems.filter((item) => !("adminOnly" in item && item.adminOnly && !isAdmin))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
