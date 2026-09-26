import React from "react"
import type { Metadata } from 'next'
import './globals.css'
import { WorkfolioProvider } from '@/lib/workfolio-store'
import { CommandPalette } from '@/components/command-palette'

export const metadata: Metadata = {
  title: 'WORKFOLIO | Trace the Task',
  description: 'WORKFOLIO — Turn your work into proof. A living archive of projects, evidence, capabilities and explore ecosystem.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#f3eee4] text-[#111318]">
        <WorkfolioProvider>
          {children}
          <CommandPalette />
        </WorkfolioProvider>
      </body>
    </html>
  )
}
