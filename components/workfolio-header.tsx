'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  FileText,
  GraduationCap,
  Layers,
  Menu,
  Moon,
  Plus,
  Radio,
  Search,
  Sun,
  Tv,
  Waves,
  X
} from 'lucide-react'
import { QuickCaptureModal } from './quick-capture-modal'

export function WorkfolioHeader() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [proofDropdownOpen, setProofDropdownOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Sync dark mode class on html document
  useEffect(() => {
    const isDark = localStorage.getItem('workfolio_theme') === 'dark'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const nextDark = !darkMode
    setDarkMode(nextDark)
    localStorage.setItem('workfolio_theme', nextDark ? 'dark' : 'light')
    if (nextDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  useEffect(() => {
    const handleOpenModal = () => setShowLogModal(true)
    window.addEventListener('open-log-modal', handleOpenModal)
    return () => window.removeEventListener('open-log-modal', handleOpenModal)
  }, [])

  const handleOpenCommandPalette = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true
    })
    window.dispatchEvent(event)
  }

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname.startsWith(path)) return true
    return false
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#f3eee4]/15 bg-[#0c1612]/95 text-[#f3eee4] backdrop-blur-md px-5 py-3 md:px-10 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          
          {/* LOGO & BRAND */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-[#c1a05b]/50 shadow-md transition-transform group-hover:scale-105 shrink-0 bg-[#0c1612]">
              <Image
                src="/images/workfolio-logo.jpg"
                alt="Workfolio Emblem Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <span className="text-xs font-bold tracking-[.22em] text-[#f3eee4] block leading-none">
                WORKFOLIO
              </span>
              <span className="hidden text-[8px] font-bold uppercase tracking-[.18em] text-[#c1a05b] md:block mt-0.5">
                TRACE THE TASK
              </span>
            </div>
          </Link>

          {/* DESKTOP PRIMARY NAVIGATION (CLEAN, GROUPED, UNCLUTTERED) */}
          <nav className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#f3eee4] xl:flex">
            <Link
              href="/"
              className={`px-3 py-1.5 transition-all ${
                isActive('/') && pathname === '/'
                  ? 'bg-[#c1a05b] text-[#0c1612] font-bold'
                  : 'hover:bg-[#193b2c]/80 text-[#f3eee4]/80 hover:text-[#f3eee4]'
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/learning"
              className={`px-3 py-1.5 transition-all ${
                isActive('/learning') || isActive('/skills')
                  ? 'bg-[#c1a05b] text-[#0c1612] font-bold'
                  : 'hover:bg-[#193b2c]/80 text-[#f3eee4]/80 hover:text-[#f3eee4]'
              }`}
            >
              Learning & Goals
            </Link>

            <Link
              href="/projects"
              className={`px-3 py-1.5 transition-all ${
                isActive('/projects')
                  ? 'bg-[#c1a05b] text-[#0c1612] font-bold'
                  : 'hover:bg-[#193b2c]/80 text-[#f3eee4]/80 hover:text-[#f3eee4]'
              }`}
            >
              Projects
            </Link>

            {/* SPECIAL OCEAN BUTTON (DIGITAL WORKSPACE) */}
            <Link
              href="/ocean"
              className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all ${
                isActive('/ocean') || isActive('/digital-workspace')
                  ? 'border-[#c1a05b] bg-[#c1a05b] text-[#0c1612] font-bold shadow-sm'
                  : 'border-[#c1a05b]/40 bg-[#c1a05b]/10 text-[#c1a05b] hover:bg-[#c1a05b] hover:text-[#0c1612]'
              }`}
            >
              <Waves size={13} className="text-[#c1a05b] animate-pulse" />
              <span>OCEAN</span>
            </Link>

            {/* PROOF & VAULTS DROPDOWN (CONSOLIDATES EVIDENCE, CAPABILITIES & ADMIN) */}
            <div className="relative">
              <button
                onClick={() => setProofDropdownOpen(!proofDropdownOpen)}
                className={`flex items-center gap-1 px-3 py-1.5 transition-all ${
                  isActive('/evidence') || isActive('/capabilities') || isActive('/admin')
                    ? 'bg-[#c1a05b] text-[#0c1612] font-bold'
                    : 'hover:bg-[#193b2c]/80 text-[#f3eee4]/80 hover:text-[#f3eee4]'
                }`}
              >
                <span>Proof & Vaults</span>
                <ChevronDown size={12} className="opacity-70" />
              </button>

              {proofDropdownOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-48 border border-[#f3eee4]/20 bg-[#12241b] p-2 shadow-xl">
                  <Link
                    href="/evidence"
                    onClick={() => setProofDropdownOpen(false)}
                    className="block px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#f3eee4] hover:bg-[#193b2c]"
                  >
                    Evidence Vault
                  </Link>
                  <Link
                    href="/capabilities"
                    onClick={() => setProofDropdownOpen(false)}
                    className="block px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#f3eee4] hover:bg-[#193b2c]"
                  >
                    Capabilities
                  </Link>
                  <div className="my-1 border-t border-[#f3eee4]/10" />
                  <Link
                    href="/admin"
                    onClick={() => setProofDropdownOpen(false)}
                    className="block px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#f3eee4]/70 hover:bg-[#193b2c]"
                  >
                    Admin Console
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* ACTIONS & UTILITIES */}
          <div className="flex items-center gap-2.5">
            
            {/* GLOBAL SEARCH BUTTON */}
            <button
              onClick={handleOpenCommandPalette}
              className="hidden items-center gap-2 border border-[#f3eee4]/20 bg-[#12241b] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#f3eee4]/80 hover:border-[#c1a05b] hover:text-[#f3eee4] md:flex"
              title="Global Search (⌘K)"
            >
              <Search size={13} />
              <span>Search</span>
              <kbd className="border border-[#f3eee4]/20 bg-[#0c1612] px-1 py-0.5 text-[8px] text-[#f3eee4]">⌘K</kbd>
            </button>

            {/* PRIMARY + LOG ACTIVITY BUTTON */}
            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-2 bg-[#c1a05b] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#0c1612] font-bold shadow-sm transition-colors hover:bg-[#f3eee4]"
            >
              <Plus size={13} /> Log Activity
            </button>

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#f3eee4] xl:hidden"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        {mobileMenuOpen && (
          <div className="mt-3 border-t border-[#193b2c]/15 dark:border-[#f3eee4]/15 pt-3 pb-2 xl:hidden space-y-2 text-xs font-bold uppercase tracking-[.16em]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-[#193b2c] dark:text-[#f3eee4]"
            >
              Dashboard
            </Link>
            <Link
              href="/learning"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-[#193b2c] dark:text-[#f3eee4]"
            >
              Learning & Goals
            </Link>
            <Link
              href="/projects"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-[#193b2c] dark:text-[#f3eee4]"
            >
              Projects
            </Link>
            <Link
              href="/ocean"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-[#9b7b3b] dark:text-[#c1a05b]"
            >
              🌊 OCEAN (Digital Workspace)
            </Link>
            <Link
              href="/evidence"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-[#193b2c] dark:text-[#f3eee4]"
            >
              Evidence Vault
            </Link>
            <Link
              href="/capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-[#193b2c] dark:text-[#f3eee4]"
            >
              Capabilities
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-[#193b2c] dark:text-[#f3eee4]"
            >
              Admin Console
            </Link>
          </div>
        )}
      </header>

      {showLogModal && <QuickCaptureModal onClose={() => setShowLogModal(false)} />}
    </>
  )
}
