import { Card } from "@/components/ui/card"

interface AdSensePlaceholderProps {
  size: "banner" | "rectangle" | "leaderboard" | "skyscraper" | "square"
  className?: string
}

export function AdSensePlaceholder({ size, className = "" }: AdSensePlaceholderProps) {
  const sizeClasses = {
    banner: "h-24 w-full", // 728x90
    rectangle: "h-64 w-80", // 300x250
    leaderboard: "h-24 w-full max-w-3xl", // 728x90
    skyscraper: "h-96 w-40", // 160x600
    square: "h-64 w-64", // 250x250
  }

  return (
    <Card
      className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-muted/10 to-muted/20 border border-border/50 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300 hover:border-border/80 backdrop-blur-sm`}
    >
      <div className="text-center text-muted-foreground/70">
        <div className="text-sm font-medium mb-1 text-foreground/60">Advertisement</div>
        <div className="text-xs opacity-60 uppercase tracking-wider font-mono">
          {size.replace(/([A-Z])/g, " $1").trim()}
        </div>
        <div className="text-xs mt-1 opacity-40">Sponsored Content</div>
      </div>
    </Card>
  )
}
