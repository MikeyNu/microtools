"use client"

import { useState, useEffect } from "react"
import { Receipt, ArrowLeft, Calculator, Users, DollarSign, Percent, Share2, Heart, Info, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { FavoriteButton, ShareButton } from "@/components/user-engagement"
import { useToolTracker } from "@/hooks/use-tool-tracker"

interface TipResult {
  tipAmount: number
  totalAmount: number
  perPerson: number
  tipPerPerson: number
  billPerPerson: number
  serviceQuality: string
}

interface TipBreakdown {
  person: number
  billAmount: number
  tipAmount: number
  totalAmount: number
}

export default function TipCalculatorPage() {
  const [billAmount, setBillAmount] = useState("")
  const [tipPercent, setTipPercent] = useState([18])
  const [people, setPeople] = useState("1")
  const [serviceQuality, setServiceQuality] = useState("good")
  const [splitMethod, setSplitMethod] = useState("equal")
  const [customAmounts, setCustomAmounts] = useState<string[]>([])
  const [results, setResults] = useState<TipResult | null>(null)
  const [breakdown, setBreakdown] = useState<TipBreakdown[]>([])
  const [errors, setErrors] = useState<string[]>([])
  
  const { trackToolStart, trackToolComplete } = useToolTracker()
  
  const tool = {
    id: 'tip-calculator',
    name: "Tip Calculator",
    category: "calculators",
    description: "Calculate tips and split bills with multiple options",
    url: '/calculators/tip'
  }
  
  useEffect(() => {
    trackToolStart()
  }, [])

  const validateInputs = () => {
    const newErrors: string[] = []
    const bill = Number.parseFloat(billAmount)
    const numPeople = Number.parseInt(people)
    
    if (!billAmount || bill <= 0) {
      newErrors.push("Please enter a valid bill amount")
    }
    if (!people || numPeople <= 0) {
      newErrors.push("Number of people must be at least 1")
    }
    if (splitMethod === "custom" && customAmounts.length !== numPeople) {
      newErrors.push("Please enter custom amounts for all people")
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }
  
  const getServiceQualityTip = (quality: string) => {
    const qualityMap: Record<string, number> = {
      poor: 10,
      fair: 15,
      good: 18,
      great: 20,
      excellent: 25
    }
    return qualityMap[quality] || 18
  }
  
  const calculateTip = () => {
    if (!validateInputs()) return
    
    const bill = Number.parseFloat(billAmount)
    const tip = tipPercent[0]
    const numPeople = Number.parseInt(people)
    
    const tipAmount = (bill * tip) / 100
    const totalAmount = bill + tipAmount
    
    let perPerson: number
    let tipPerPerson: number
    let billPerPerson: number
    let newBreakdown: TipBreakdown[] = []
    
    if (splitMethod === "equal") {
      perPerson = totalAmount / numPeople
      tipPerPerson = tipAmount / numPeople
      billPerPerson = bill / numPeople
      
      for (let i = 1; i <= numPeople; i++) {
        newBreakdown.push({
          person: i,
          billAmount: Math.round(billPerPerson * 100) / 100,
          tipAmount: Math.round(tipPerPerson * 100) / 100,
          totalAmount: Math.round(perPerson * 100) / 100
        })
      }
    } else {
      // Custom split logic would go here
      perPerson = totalAmount / numPeople
      tipPerPerson = tipAmount / numPeople
      billPerPerson = bill / numPeople
    }
    
    const result: TipResult = {
      tipAmount: Math.round(tipAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      perPerson: Math.round(perPerson * 100) / 100,
      tipPerPerson: Math.round(tipPerPerson * 100) / 100,
      billPerPerson: Math.round(billPerPerson * 100) / 100,
      serviceQuality
    }
    
    setResults(result)
    setBreakdown(newBreakdown)
    trackToolComplete()
  }
  
  const handleServiceQualityChange = (quality: string) => {
    setServiceQuality(quality)
    const suggestedTip = getServiceQualityTip(quality)
    setTipPercent([suggestedTip])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Receipt className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <FavoriteButton toolId={tool.id} />
              <ShareButton tool={tool} />
              <Link
                href="/calculators"
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Calculators
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Receipt className="h-8 w-8 text-primary" />
                <CardTitle className="font-serif text-3xl">Tip Calculator</CardTitle>
              </div>
              <CardDescription className="text-lg">
                Calculate tips and split bills with advanced options
              </CardDescription>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge variant="secondary">Service Quality</Badge>
                <Badge variant="secondary">Bill Splitting</Badge>
                <Badge variant="secondary">Analytics</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {errors.length > 0 && (
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="calculator" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="calculator">Calculator</TabsTrigger>
                  <TabsTrigger value="results">Results & Breakdown</TabsTrigger>
                </TabsList>

                <TabsContent value="calculator" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="billAmount" className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Bill Amount ($)</span>
                        </Label>
                        <Input
                          id="billAmount"
                          type="number"
                          placeholder="50.00"
                          value={billAmount}
                          onChange={(e) => setBillAmount(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Number of People</span>
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={people}
                          onChange={(e) => setPeople(e.target.value)}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label>Service Quality</Label>
                        <Select value={serviceQuality} onValueChange={handleServiceQualityChange}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="poor">Poor (10%)</SelectItem>
                            <SelectItem value="fair">Fair (15%)</SelectItem>
                            <SelectItem value="good">Good (18%)</SelectItem>
                            <SelectItem value="great">Great (20%)</SelectItem>
                            <SelectItem value="excellent">Excellent (25%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label className="flex items-center space-x-2">
                          <Percent className="h-4 w-4" />
                          <span>Tip Percentage: {tipPercent[0]}%</span>
                        </Label>
                        <div className="mt-2">
                          <Slider
                            value={tipPercent}
                            onValueChange={setTipPercent}
                            max={30}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <span>0%</span>
                          <span>30%</span>
                        </div>
                      </div>

                      <div>
                        <Label>Split Method</Label>
                        <Select value={splitMethod} onValueChange={setSplitMethod}>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equal">Equal Split</SelectItem>
                            <SelectItem value="custom">Custom Amounts</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={calculateTip} className="w-full" size="lg">
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Tip
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="results" className="space-y-6">
                  {results ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-6 text-center">
                            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-600">${results.tipAmount}</div>
                            <div className="text-sm text-muted-foreground">Tip Amount</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6 text-center">
                            <Receipt className="h-8 w-8 text-primary mx-auto mb-2" />
                            <div className="text-2xl font-bold text-primary">${results.totalAmount}</div>
                            <div className="text-sm text-muted-foreground">Total Amount</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6 text-center">
                            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-600">${results.perPerson}</div>
                            <div className="text-sm text-muted-foreground">Per Person</div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <Info className="h-5 w-5" />
                            <span>Bill Breakdown</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span>Bill Amount:</span>
                              <span className="font-semibold">${Number.parseFloat(billAmount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Tip ({tipPercent[0]}%):</span>
                              <span className="font-semibold text-green-600">${results.tipAmount}</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-primary">${results.totalAmount}</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                <span>Bill</span>
                                <span>Tip</span>
                              </div>
                              <Progress 
                                value={(Number.parseFloat(billAmount) / results.totalAmount) * 100} 
                                className="h-3"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {Number.parseInt(people) > 1 && breakdown.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                              <Users className="h-5 w-5" />
                              <span>Per Person Breakdown</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {breakdown.map((person) => (
                                <div key={person.person} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                  <span className="font-medium">Person {person.person}</span>
                                  <div className="text-right">
                                    <div className="font-semibold">${person.totalAmount}</div>
                                    <div className="text-sm text-muted-foreground">
                                      Bill: ${person.billAmount} + Tip: ${person.tipAmount}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Calculate your tip to see detailed results</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Related Tools */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Related Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/calculators/percentage" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div className="text-sm font-medium">Percentage Calculator</div>
                </Link>
                <Link href="/calculators/basic" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div className="text-sm font-medium">Basic Calculator</div>
                </Link>
                <Link href="/calculators/loan" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div className="text-sm font-medium">Loan Calculator</div>
                </Link>
                <Link href="/calculators/mortgage" className="p-3 border rounded-lg hover:bg-muted transition-colors">
                  <div className="text-sm font-medium">Mortgage Calculator</div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
