import type { Metadata } from "next"
import { DollarSign, Ruler, Thermometer, Palette, Image, HardDrive, Zap } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Free Online Converters - Currency, Unit, Temperature & More | Micro Tools",
  description:
    "Convert units, currencies, colors, and file formats instantly. Free online converters for currency, temperature, length, weight, and more.",
}

const tools = [
  {
    title: "Currency Converter",
    description: "Convert between world currencies with live exchange rates and historical data",
    icon: DollarSign,
    href: "/converters/currency",
  },
  {
    title: "Unit Converter",
    description: "Convert length, weight, volume, area, and many other units",
    icon: Ruler,
    href: "/converters/unit",
  },
  {
    title: "Temperature Converter",
    description: "Convert between Celsius, Fahrenheit, Kelvin, and Rankine",
    icon: Thermometer,
    href: "/converters/temperature",
  },
  {
    title: "Color Converter",
    description: "Convert HEX, RGB, HSL, CMYK and other color formats",
    icon: Palette,
    href: "/converters/color",
  },
  {
    title: "Image Converter",
    description: "Resize, compress and convert image formats (JPG, PNG, WebP)",
    icon: Image,
    href: "/converters/image",
  },
  {
    title: "File Size Converter",
    description: "Convert between bytes, KB, MB, GB, TB and other storage units",
    icon: HardDrive,
    href: "/converters/file-size",
  },
  {
    title: "Binary Converter",
    description: "Convert between binary, decimal, hexadecimal, and text formats",
    icon: Zap,
    href: "/converters/binary",
  },
]

export default function ConvertersPage() {
  return (
    <CategoryLayout
      title="Converters"
      description="Units, currencies, colors, and file formats. Instant conversion with no server calls."
      icon={Zap}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
