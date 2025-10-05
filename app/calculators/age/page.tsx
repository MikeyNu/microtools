"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToolLayout } from "@/components/tool-layout"
import { Calendar, Cake, Clock, Heart } from "lucide-react"

export default function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState("")
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0])
  const [result, setResult] = useState<{
    years: number
    months: number
    days: number
    totalDays: number
    totalWeeks: number
    totalMonths: number
    nextBirthday: string
    dayOfWeek: string
  } | null>(null)

  const calculateAge = () => {
    if (!birthDate) return

    const birth = new Date(birthDate)
    const target = new Date(targetDate)
    
    if (birth > target) {
      alert("Birth date cannot be after target date!")
      return
    }

    // Calculate age
    let years = target.getFullYear() - birth.getFullYear()
    let months = target.getMonth() - birth.getMonth()
    let days = target.getDate() - birth.getDate()

    // Adjust for negative months
    if (months < 0) {
      years--
      months += 12
    }

    // Adjust for negative days
    if (days < 0) {
      months--
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0)
      days += prevMonth.getDate()
    }

    // Calculate totals
    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))
    const totalWeeks = Math.floor(totalDays / 7)
    const totalMonths = years * 12 + months

    // Calculate next birthday
    let nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate())
    if (nextBirthday < target) {
      nextBirthday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate())
    }
    const daysToNextBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24))

    // Day of week born
    const dayOfWeek = birth.toLocaleDateString('en-US', { weekday: 'long' })

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      nextBirthday: `${daysToNextBirthday} days`,
      dayOfWeek
    })
  }

  const relatedTools = [
    { name: "Date Calculator", href: "/calculators/date" },
    { name: "BMI Calculator", href: "/calculators/bmi" },
    { name: "Basic Calculator", href: "/calculators/basic" },
  ]

  return (
    <ToolLayout
      title="Age Calculator"
      description="Calculate your exact age in years, months, days, and more. Find out when your next birthday is!"
      category="Calculators"
      categoryHref="/calculators"
      relatedTools={relatedTools}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cake className="h-5 w-5" />
              Calculate Your Age
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Calculate Age On (Optional)</Label>
              <Input
                id="targetDate"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <Button onClick={calculateAge} className="w-full" size="lg">
              <Calendar className="mr-2 h-4 w-4" />
              Calculate Age
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-4">
            <Card className="border-accent">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  {result.years} Years, {result.months} Months, {result.days} Days
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-accent">{result.years}</div>
                  <div className="text-sm text-muted-foreground">Years</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-accent">{result.totalMonths}</div>
                  <div className="text-sm text-muted-foreground">Total Months</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-accent">{result.totalWeeks}</div>
                  <div className="text-sm text-muted-foreground">Total Weeks</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-accent">{result.totalDays}</div>
                  <div className="text-sm text-muted-foreground">Total Days</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Born on:</span>
                  <span className="font-semibold">{result.dayOfWeek}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Next birthday in:</span>
                  <span className="font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {result.nextBirthday}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Total hours lived:</span>
                  <span className="font-semibold">{(result.totalDays * 24).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Total minutes lived:</span>
                  <span className="font-semibold">{(result.totalDays * 24 * 60).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>About Age Calculator</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Calculate your exact age in years, months, and days. This tool also provides additional information
              like the day of the week you were born on, total days lived, and when your next birthday will be.
            </p>
            <h3>Features:</h3>
            <ul>
              <li>Calculate age from birth date to any date</li>
              <li>See age breakdown in years, months, and days</li>
              <li>View total months, weeks, and days lived</li>
              <li>Find out what day of the week you were born</li>
              <li>See countdown to next birthday</li>
              <li>Calculate total hours and minutes lived</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}

