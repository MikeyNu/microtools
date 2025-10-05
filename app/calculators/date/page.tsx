"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToolLayout } from "@/components/tool-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Plus, Minus, CalendarDays } from "lucide-react"

export default function DateCalculatorPage() {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState("")
  const [daysToAdd, setDaysToAdd] = useState(0)
  const [weeksToAdd, setWeeksToAdd] = useState(0)
  const [monthsToAdd, setMonthsToAdd] = useState(0)
  const [yearsToAdd, setYearsToAdd] = useState(0)
  const [difference, setDifference] = useState<string>("")
  const [newDate, setNewDate] = useState<string>("")

  const calculateDifference = () => {
    if (!startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30.44)
    const diffYears = Math.floor(diffDays / 365.25)

    // Calculate exact difference
    let years = end.getFullYear() - start.getFullYear()
    let months = end.getMonth() - start.getMonth()
    let days = end.getDate() - start.getDate()

    if (days < 0) {
      months--
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
      days += prevMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    setDifference(`
      Exact: ${Math.abs(years)} years, ${Math.abs(months)} months, ${Math.abs(days)} days
      
      Total: ${diffDays.toLocaleString()} days
      Or: ${diffWeeks.toLocaleString()} weeks
      Or: ${diffMonths.toLocaleString()} months
      Or: ${Math.round(diffDays / 365.25 * 10) / 10} years
      
      Business days (approx): ${Math.floor(diffDays * 5/7).toLocaleString()}
      Hours: ${(diffDays * 24).toLocaleString()}
      Minutes: ${(diffDays * 24 * 60).toLocaleString()}
    `)
  }

  const calculateNewDate = () => {
    const start = new Date(startDate)
    
    // Add years
    start.setFullYear(start.getFullYear() + parseInt(yearsToAdd.toString() || '0'))
    
    // Add months
    start.setMonth(start.getMonth() + parseInt(monthsToAdd.toString() || '0'))
    
    // Add weeks (as days)
    start.setDate(start.getDate() + (parseInt(weeksToAdd.toString() || '0') * 7))
    
    // Add days
    start.setDate(start.getDate() + parseInt(daysToAdd.toString() || '0'))

    const formattedDate = start.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    setNewDate(formattedDate)
  }

  const relatedTools = [
    { name: "Age Calculator", href: "/calculators/age" },
    { name: "Unix Converter", href: "/timestamp-tools/unix-converter" },
    { name: "Timezone Converter", href: "/timestamp-tools/timezone-converter" },
  ]

  return (
    <ToolLayout
      title="Date Calculator"
      description="Calculate the difference between two dates or add/subtract time from a date."
      category="Calculators"
      categoryHref="/calculators"
      relatedTools={relatedTools}
    >
      <div className="max-w-2xl mx-auto">
        <Tabs defaultValue="difference" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="difference">Date Difference</TabsTrigger>
            <TabsTrigger value="add">Add/Subtract Time</TabsTrigger>
          </TabsList>

          <TabsContent value="difference" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Calculate Difference Between Dates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate1">Start Date</Label>
                  <Input
                    id="startDate1"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <Button onClick={calculateDifference} className="w-full" size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calculate Difference
                </Button>

                {difference && (
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {difference}
                      </pre>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add or Subtract Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate2">Start Date</Label>
                  <Input
                    id="startDate2"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="years">Years</Label>
                    <Input
                      id="years"
                      type="number"
                      value={yearsToAdd}
                      onChange={(e) => setYearsToAdd(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="months">Months</Label>
                    <Input
                      id="months"
                      type="number"
                      value={monthsToAdd}
                      onChange={(e) => setMonthsToAdd(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weeks">Weeks</Label>
                    <Input
                      id="weeks"
                      type="number"
                      value={weeksToAdd}
                      onChange={(e) => setWeeksToAdd(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="days">Days</Label>
                    <Input
                      id="days"
                      type="number"
                      value={daysToAdd}
                      onChange={(e) => setDaysToAdd(Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  Use negative numbers to subtract time
                </div>

                <Button onClick={calculateNewDate} className="w-full" size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calculate New Date
                </Button>

                {newDate && (
                  <Card className="bg-accent text-accent-foreground">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-sm opacity-80 mb-1">Result:</div>
                        <div className="text-xl font-bold">{newDate}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>About Date Calculator</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>
              Calculate the exact difference between two dates or add/subtract time from a specific date.
              Perfect for planning events, tracking deadlines, or calculating durations.
            </p>
            <h3>Features:</h3>
            <ul>
              <li>Calculate difference in years, months, days, weeks, hours, and minutes</li>
              <li>Add or subtract years, months, weeks, or days from any date</li>
              <li>Approximate business days calculation</li>
              <li>Easy-to-read results with multiple units</li>
              <li>Support for negative values to subtract time</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}

