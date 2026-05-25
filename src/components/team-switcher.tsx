"use client"

import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType | string
  }[]
}) {
  const activeTeam = teams[0]

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex aspect-square size-10 shrink-0 items-center justify-center rounded-lg bg-white overflow-hidden border transition-all duration-200 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:rounded-md">
            {typeof activeTeam.logo === "string" ? (
              <img src={activeTeam.logo} alt={activeTeam.name} className="size-full object-contain" />
            ) : (
              <activeTeam.logo className="size-5 text-black group-data-[collapsible=icon]:size-4" />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{activeTeam.name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
