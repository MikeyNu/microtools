import type React from "react"
import { BreadcrumbNav } from "./breadcrumb-nav"
import { AdSensePlaceholder } from "./adsense-placeholder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from "@/lib/adsense-config"

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

            {/* Content area ad - high engagement */}
            {shouldDisplayAds() && (
              <div className="mb-8 flex justify-center">
                <AdSensePlaceholder 
                  size="banner" 
                  adClient={ADSENSE_CONFIG.publisherId}
                  adSlot={getAdUnitId('toolContent')}
                  responsive={true}
                />
              </div>
            )}
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Sidebar ad - high visibility */}
              {shouldDisplayAds() && (
                <AdSensePlaceholder 
                  size="rectangle" 
                  adClient={ADSENSE_CONFIG.publisherId}
                  adSlot={getAdUnitId('toolSidebar')}
                  responsive={true}
                />
              )}

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
              
              {/* Additional sidebar ad for longer pages */}
              {shouldDisplayAds() && relatedTools.length > 0 && (
                <AdSensePlaceholder 
                  size="square" 
                  adClient={ADSENSE_CONFIG.publisherId}
                  adSlot={getAdUnitId('toolFooter')}
                  responsive={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
