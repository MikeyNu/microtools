import type React from "react"
import { BreadcrumbNav } from "./breadcrumb-nav"
import { AdSensePlaceholder } from "./adsense-placeholder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Share2, Bookmark, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface ToolLayoutProps {
  title: string
  description: string
  category: string
  categoryHref: string
  children: React.ReactNode
  relatedTools?: Array<{ name: string; href: string }>
}

export function ToolLayout({
  title,
  description,
  category,
  categoryHref,
  children,
  relatedTools = [],
}: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with navigation */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content - moved to left for better visibility */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <BreadcrumbNav items={[{ label: category, href: categoryHref }, { label: title }]} />

            <div className="mb-6">
              <h1 className="text-3xl font-serif font-bold text-foreground mb-2">{title}</h1>
              <p className="text-muted-foreground text-lg">{description}</p>
            </div>

            {/* Tool content */}
            <div className="mb-8">{children}</div>

            <div className="mb-8 flex justify-center">
              <AdSensePlaceholder size="rectangle" />
            </div>
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              <AdSensePlaceholder size="rectangle" />

              {relatedTools.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {relatedTools.map((tool, index) => (
                      <Link
                        key={index}
                        href={tool.href}
                        className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
