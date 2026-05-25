import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md shadow-sm">
        <div className="w-full px-4 md:px-8 lg:px-12 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image 
                src="/dea.png" 
                alt="Logo PT Duta Esa Adiperkasa" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
              PT Duta Esa Adiperkasa
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
