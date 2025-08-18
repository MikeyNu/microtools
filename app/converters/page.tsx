import { Zap, DollarSign, Ruler, Thermometer, Palette, HardDrive, ImageIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const converters = [
  {
    title: "Currency Converter",
    description: "Convert between world currencies with live rates",
    icon: DollarSign,
    href: "/converters/currency",
    popular: true,
  },
  {
    title: "Unit Converter",
    description: "Convert length, weight, volume, and more",
    icon: Ruler,
    href: "/converters/unit",
    popular: true,
  },
  {
    title: "Temperature Converter",
    description: "Convert Celsius, Fahrenheit, and Kelvin",
    icon: Thermometer,
    href: "/converters/temperature",
    popular: true,
  },
  {
    title: "Color Converter",
    description: "Convert HEX, RGB, HSL, and other color formats",
    icon: Palette,
    href: "/converters/color",
    popular: false,
  },
  {
    title: "Image Converter",
    description: "Resize and convert image formats",
    icon: ImageIcon,
    href: "/converters/image",
    popular: true,
  },
  {
    title: "File Size Converter",
    description: "Convert bytes, KB, MB, GB, and TB",
    icon: HardDrive,
    href: "/converters/file-size",
    popular: false,
  },
]

export default function ConvertersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <span className="text-primary font-medium">Converters</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">Free Online Converters</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Convert units, currencies, colors, and file formats instantly. All converters work offline and are
            completely free to use.
          </p>
        </div>
      </section>

      {/* Converters Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {converters.map((converter) => {
              const IconComponent = converter.icon
              return (
                <Link key={converter.title} href={converter.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group relative">
                    {converter.popular && (
                      <div className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium">
                        Popular
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <IconComponent className="h-12 w-12 text-accent mx-auto mb-4 group-hover:text-primary transition-colors" />
                      <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors">
                        {converter.title}
                      </CardTitle>
                      <CardDescription className="text-base">{converter.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-sm text-accent font-medium">Use Converter →</div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
