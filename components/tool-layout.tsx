import type React from "react"
import Link from "next/link"
import { BreadcrumbNav } from "./breadcrumb-nav"
import { AdSensePlaceholder } from "./adsense-placeholder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from "@/lib/adsense-config"

interface RelatedTool {
  name: string
  href: string
}

interface ToolLayoutProps {
  title: string
  description: string
  category: string
  categoryHref: string
  children: React.ReactNode
  relatedTools?: RelatedTool[]
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
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Main content */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <BreadcrumbNav
              items={[{ label: category, href: categoryHref }, { label: title }]}
            />

            <div className="mb-6">
              <h1 className="font-mono font-bold text-2xl sm:text-3xl text-foreground mb-2 tracking-tight">
                {title}
              </h1>
              <p className="text-muted-foreground">{description}</p>
            </div>

            <div className="mb-8">{children}</div>

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

          {/* Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-20 space-y-5">

              {shouldDisplayAds() && (
                <AdSensePlaceholder
                  size="rectangle"
                  adClient={ADSENSE_CONFIG.publisherId}
                  adSlot={getAdUnitId('toolSidebar')}
                  responsive={true}
                />
              )}

              {relatedTools.length > 0 && (
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3 pt-4 px-4">
                    <CardTitle className="font-mono text-sm font-semibold text-foreground">
                      Related Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0 space-y-1">
                    {relatedTools.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="block text-sm text-muted-foreground hover:text-accent transition-colors py-1"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}

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
