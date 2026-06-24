import type { Metadata } from "next"
import { Droplets, Sparkles, Palette, QrCode, Image, Eye } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Free Design Tools - Color Picker, QR Generator, Favicon Creator & More | Micro Tools",
  description:
    "Professional design tools including color picker, gradient generator, QR code generator, favicon creator, and design utilities for designers and developers.",
}

const tools = [
  {
    title: "Advanced Color Picker",
    description: "Professional color picker with multiple formats and accessibility features",
    icon: Droplets,
    href: "/design-tools/color-picker",
  },
  {
    title: "Gradient Generator",
    description: "Create beautiful CSS gradients with live preview and export options",
    icon: Sparkles,
    href: "/design-tools/gradient-generator",
  },
  {
    title: "Color Palette Generator",
    description: "Generate harmonious color palettes using color theory principles",
    icon: Palette,
    href: "/design-tools/palette-generator",
  },
  {
    title: "QR Code Generator",
    description: "Generate customizable QR codes for URLs, text, and more",
    icon: QrCode,
    href: "/design-tools/qr-generator",
  },
  {
    title: "Favicon Generator",
    description: "Create favicons and app icons from images or text",
    icon: Image,
    href: "/design-tools/favicon-generator",
  },
  {
    title: "Color Contrast Checker",
    description: "Check color contrast ratios for WCAG accessibility compliance",
    icon: Eye,
    href: "/design-tools/contrast-checker",
  },
]

export default function DesignToolsPage() {
  return (
    <CategoryLayout
      title="Design Tools"
      description="Color pickers, gradient generators, palette builders, and accessibility checkers for designers and developers."
      icon={Palette}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
