'use client'
import { Wrench, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SearchComponent } from "@/components/search-functionality"
import { useRef, useState, useEffect } from "react"

export function Navbar() {
  const searchRef = useRef<{ setQuery: (query: string) => void }>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="border-b border-border/10 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Logo - Always visible */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -inset-1 bg-accent/20 rounded-lg blur-sm opacity-75"></div>
            </div>
            <h1 className="text-lg sm:text-xl font-sans font-bold text-foreground tracking-tight">ToolHub</h1>
          </Link>

          {/* Search Bar - Responsive width */}
          <div className="flex-1 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
            <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
              <SearchComponent ref={searchRef} className="w-full" />
            </div>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 flex-shrink-0">
            <Link href="/" className="text-sm lg:text-base text-foreground/70 hover:text-foreground transition-colors font-medium whitespace-nowrap">
              Home
            </Link>
            <Link
              href="/tools"
              className="text-sm lg:text-base text-foreground/70 hover:text-foreground transition-colors font-medium whitespace-nowrap"
            >
              All Tools
            </Link>
            <Link
              href="/about"
              className="text-sm lg:text-base text-foreground/70 hover:text-foreground transition-colors font-medium whitespace-nowrap"
            >
              About
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground/70 hover:text-foreground transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/10">
            <nav className="flex flex-col space-y-3 pt-4">
              <Link 
                href="/" 
                className="text-foreground/70 hover:text-foreground transition-colors font-medium px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/tools"
                className="text-foreground/70 hover:text-foreground transition-colors font-medium px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Tools
              </Link>
              <Link
                href="/about"
                className="text-foreground/70 hover:text-foreground transition-colors font-medium px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}