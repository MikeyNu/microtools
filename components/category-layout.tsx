import type React from "react"
import Link from "next/link"
import { AdSensePlaceholder } from "./adsense-placeholder"
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from "@/lib/adsense-config"

interface CategoryTool {
  title: string
  description: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  comingSoon?: boolean
}

interface CategoryLayoutProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  toolCount: number
  tools: CategoryTool[]
}

export function CategoryLayout({
  title,
  description,
  icon: Icon,
  toolCount,
  tools,
}: CategoryLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <section className="border-b border-border py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="text-xs font-mono text-muted-foreground tabular-nums">
              {toolCount} tools
            </span>
          </div>
          <h1 className="font-mono font-bold text-2xl sm:text-3xl text-foreground tracking-tight mb-2">
            {title}
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">{description}</p>
        </div>
      </section>

      {/* Top ad */}
      {shouldDisplayAds() && (
        <div className="border-b border-border py-4 bg-card/20">
          <div className="container mx-auto px-4 sm:px-6 flex justify-center">
            <AdSensePlaceholder
              size="leaderboard"
              adClient={ADSENSE_CONFIG.publisherId}
              adSlot={getAdUnitId("categoryInline")}
              responsive={true}
            />
          </div>
        </div>
      )}

      {/* Tools grid */}
      <section className="py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {tools.map((tool) => {
              const ToolIcon = tool.icon
              const card = (
                <div
                  className={`h-full rounded-lg border border-border bg-card p-5 transition-all duration-200 ${
                    tool.comingSoon
                      ? "opacity-50"
                      : "group-hover:border-accent/50 group-hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
                      <ToolIcon className="h-4 w-4 text-accent-foreground" />
                    </div>
                    {tool.comingSoon && (
                      <span className="text-xs font-mono text-muted-foreground border border-border rounded-sm px-1.5 py-0.5">
                        soon
                      </span>
                    )}
                  </div>
                  <p className="font-mono font-semibold text-sm text-foreground mb-1.5 tracking-tight group-hover:text-accent transition-colors duration-200">
                    {tool.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              )

              if (tool.comingSoon) {
                return (
                  <div key={tool.title} className="group">
                    {card}
                  </div>
                )
              }
              return (
                <Link key={tool.title} href={tool.href} className="group block">
                  {card}
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer ad */}
      {shouldDisplayAds() && (
        <div className="border-t border-border py-6 bg-card/20">
          <div className="container mx-auto px-4 sm:px-6 flex justify-center">
            <AdSensePlaceholder
              size="large-rectangle"
              adClient={ADSENSE_CONFIG.publisherId}
              adSlot={getAdUnitId("categoryFooter")}
              responsive={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}
