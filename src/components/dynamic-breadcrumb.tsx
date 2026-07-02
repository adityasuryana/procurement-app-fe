"use client"

import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export function DynamicBreadcrumb() {
  const pathname = usePathname()

  let title = "Dashboard"
  if (pathname.includes("/qr-contact") || pathname.includes("/kontak-qr")) title = "Kontak QR"
  else if (pathname.includes("/mitra")) title = "Mitra"
  else if (pathname.includes("/karir")) title = "Karir"
  else if (pathname.includes("/removable-tower")) title = "Removable Tower"
  else if (pathname.includes("/kelola-akun")) title = "Kelola Akun"
  else if (pathname.includes("/akun")) title = "Pengaturan Akun"

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage className="font-semibold text-base">{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
