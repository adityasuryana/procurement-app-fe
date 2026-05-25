"use client"

import * as React from "react"
import {
  Briefcase,
  GalleryVerticalEnd,
  LayoutDashboard,
  QrCode,
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
  navMain: [
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
