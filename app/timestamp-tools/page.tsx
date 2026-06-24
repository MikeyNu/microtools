import type { Metadata } from "next"
import { Clock, Timer, Globe, Calendar, ArrowRightLeft, Zap } from "lucide-react"
import { CategoryLayout } from "@/components/category-layout"

export const metadata: Metadata = {
  title: "Timestamp Tools - Unix Time, Epoch Converter & Timezone Tools | Micro Tools",
  description:
    "Professional timestamp conversion tools for developers. Convert Unix timestamps, handle timezones, work with date formats, and calculate time differences with precision.",
}

const tools = [
  {
    title: "Unix Timestamp Converter",
    description: "Convert Unix timestamps to human-readable dates and vice versa",
    icon: Clock,
    href: "/timestamp-tools/unix-converter",
  },
  {
    title: "Epoch Time Converter",
    description: "Convert epoch time with milliseconds precision and various programming formats",
    icon: Timer,
    href: "/timestamp-tools/epoch-converter",
  },
  {
    title: "Timezone Converter",
    description: "Convert time between different timezones with automatic DST handling",
    icon: Globe,
    href: "/timestamp-tools/timezone-converter",
  },
  {
    title: "Date Format Converter",
    description: "Convert dates between ISO 8601, RFC 2822, and custom formats",
    icon: Calendar,
    href: "/timestamp-tools/date-format",
  },
  {
    title: "Time Calculator",
    description: "Calculate time differences, add/subtract intervals, and handle business days",
    icon: ArrowRightLeft,
    href: "/timestamp-tools/time-calculator",
  },
  {
    title: "Current Time Display",
    description: "Display live current time in multiple formats and timezones",
    icon: Zap,
    href: "/timestamp-tools/current-time",
  },
]

export default function TimestampToolsPage() {
  return (
    <CategoryLayout
      title="Timestamp Tools"
      description="Unix timestamps, epoch conversion, timezone handling, and date formatting for developers."
      icon={Clock}
      toolCount={tools.length}
      tools={tools}
    />
  )
}
