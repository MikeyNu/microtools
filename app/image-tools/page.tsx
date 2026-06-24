import type { Metadata } from "next"
import { Minimize2, Scale, FileImage, ArrowRight, Crop, Palette } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Image Tools - Free Online Image Utilities | Micro Tools",
  description:
    "Free online image tools including image compressor, resizer, format converter, and WebP converter. Optimize and edit images easily.",
}

const tools = [
  {
    title: "Image Compressor",
    description: "Reduce image file size while maintaining quality",
    icon: Minimize2,
    href: "/image-tools/compress",
  },
  {
    title: "Image Resizer",
    description: "Resize images to specific dimensions or percentages with aspect ratio lock",
    icon: Scale,
    href: "/image-tools/resize",
  },
  {
    title: "WebP Converter",
    description: "Convert images to modern WebP format for faster loading and smaller files",
    icon: FileImage,
    href: "/image-tools/webp-converter",
  },
  {
    title: "Format Converter",
    description: "Convert between JPG, PNG, GIF, BMP, and other image formats",
    icon: ArrowRight,
    href: "/image-tools/format-converter",
  },
  {
    title: "Image Cropper",
    description: "Crop images to focus on specific areas with custom aspect ratios",
    icon: Crop,
    href: "/image-tools/crop",
  },
  {
    title: "Background Remover",
    description: "Remove backgrounds from images automatically with one click",
    icon: Palette,
    href: "/image-tools/background-remover",
  },
]

export default function ImageToolsPage() {
  return (
    <CategoryLayout
      title="Image Tools"
      description="Compress, resize, convert, and edit images. All processing happens locally — your files never leave your device."
      icon={FileImage}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
