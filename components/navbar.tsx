'use client'

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SearchComponent } from "@/components/search-functionality"
import { useRef, useState, useEffect } from "react"

export function Navbar() {
  const searchRef = useRef<{ setQuery: (query: string) => void }>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 8)

    updateScrollState()
    window.addEventListener("scroll", updateScrollState, { passive: true })

    return () => window.removeEventListener("scroll", updateScrollState)
  }, [])

  return (
    <>
      <header
      className={`sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-200 ${
        isScrolled
          ? "bg-background/92 backdrop-blur-md shadow-[0_1px_0_rgba(23,19,16,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
          aria-label="Micro Tools home"
        >
          <svg
            viewBox="0 0 316.653 340.008"
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-auto flex-shrink-0 text-accent"
            aria-hidden="true"
          >
            <polygon
              fill="currentColor"
              points="0 114.848 159.404 203.960 316.653 116.662 316.653 265.181 185.253 340.008 185.253 299.194 282.301 244.321 282.301 175.843 159.404 246.135 36.280 176.070 36.280 244.094 132.874 298.740 132.874 340.008 0 264.274 0 114.848"
            />
            <path
              fill="currentColor"
              d="M159.290,0 L2.154,90.699 l157.249,87.525 157.250,-87.525 L159.290,0 Z M188.541,105.721 v-26.303 h-58.954 v26.303 h-19.727 v-30.157 c0-9.330,7.563-16.893,16.893-16.893 h65.757 c9.330,0,16.893,7.563,16.893,16.893 v30.157 h-20.861 Z"
            />
          </svg>
          <span className="font-serif font-bold text-base text-foreground leading-none">
            Micro <span className="text-accent">Tools</span>
          </span>
        </Link>

        {/* Search — grows to fill available space */}
        <div className="flex-1 min-w-0 max-w-xl">
          <SearchComponent ref={searchRef} className="w-full" />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 flex-shrink-0">
          {[
            { href: "/", label: "Home" },
            { href: "/tools", label: "All Tools" },
            { href: "/about", label: "About" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm transition-colors ${
                pathname === href
                  ? "text-accent font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-1.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      </header>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile nav sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 z-[70] w-1/2 bg-background shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col border-l border-border ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b border-border">
          <span className="font-serif font-bold text-base text-foreground">Menu</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {[
            { href: "/", label: "Home" },
            { href: "/tools", label: "All Tools" },
            { href: "/about", label: "About" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-3 text-sm rounded-md transition-colors ${
                pathname === href
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
