'use client'

import { useState, useEffect } from 'react'
import { Calculator, Scale, Heart, TrendingUp, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface BMIResult {
  bmi: number
  category: string
  color: string
  healthRisk: string
  idealWeightRange: { min: number; max: number }
  recommendations: string[]
  progress: number
}

export default function BMICalculatorPage() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('male')
  const [unit, setUnit] = useState('metric')
  const [results, setResults] = useState<BMIResult | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('BMI Calculator', 'calculators')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'bmi-calculator',
    name: 'BMI Calculator',
    description: 'Calculate Body Mass Index with health insights and recommendations',
    category: 'calculators',
    url: '/calculators/bmi'
  }
  
  useEffect(() => {
    trackToolStart()
  }, [])

  const validateInputs = () => {
    const newErrors: string[] = []
    
    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      newErrors.push('Please enter a valid height')
    }
    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      newErrors.push('Please enter a valid weight')
    }
    if (age && (isNaN(Number(age)) || Number(age) < 2 || Number(age) > 120)) {
      newErrors.push('Please enter a valid age (2-120 years)')
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }
  
  const getIdealWeightRange = (heightInMeters: number): { min: number; max: number } => {
    const minBMI = 18.5
    const maxBMI = 24.9
    return {
      min: Math.round(minBMI * heightInMeters * heightInMeters * 10) / 10,
      max: Math.round(maxBMI * heightInMeters * heightInMeters * 10) / 10
    }
  }
  
  const getRecommendations = (bmi: number, category: string): string[] => {
    const recommendations: string[] = []
    
    if (bmi < 18.5) {
      recommendations.push('Consider consulting a healthcare provider about healthy weight gain')
      recommendations.push('Focus on nutrient-dense foods and strength training')
      recommendations.push('Ensure adequate caloric intake for your activity level')
    } else if (bmi >= 18.5 && bmi < 25) {
      recommendations.push('Maintain your current healthy weight through balanced diet')
      recommendations.push('Continue regular physical activity (150 min/week)')
      recommendations.push('Focus on overall health and wellness habits')
    } else if (bmi >= 25 && bmi < 30) {
      recommendations.push('Consider gradual weight loss through diet and exercise')
      recommendations.push('Aim for 1-2 pounds of weight loss per week')
      recommendations.push('Increase physical activity and reduce caloric intake')
    } else {
      recommendations.push('Consult healthcare provider for weight management plan')
      recommendations.push('Focus on sustainable lifestyle changes')
      recommendations.push('Consider professional nutritional counseling')
    }
    
    return recommendations
  }

  const calculateBMI = () => {
    if (!validateInputs()) {
      trackToolError()
      return
    }
    
    try {
      let heightInMeters: number
      let weightInKg: number

      if (unit === 'metric') {
        heightInMeters = Number.parseFloat(height) / 100
        weightInKg = Number.parseFloat(weight)
      } else {
        heightInMeters = Number.parseFloat(height) * 0.0254
        weightInKg = Number.parseFloat(weight) * 0.453592
      }

      const bmi = weightInKg / (heightInMeters * heightInMeters)
      let category = ''
      let color = ''
      let healthRisk = ''
      let progress = 0

      if (bmi < 18.5) {
        category = 'Underweight'
        color = 'text-blue-600'
        healthRisk = 'Increased risk of nutritional deficiency and osteoporosis'
        progress = (bmi / 18.5) * 25
      } else if (bmi < 25) {
        category = 'Normal weight'
        color = 'text-green-600'
        healthRisk = 'Lowest risk of weight-related health problems'
        progress = 25 + ((bmi - 18.5) / (25 - 18.5)) * 50
      } else if (bmi < 30) {
        category = 'Overweight'
        color = 'text-yellow-600'
        healthRisk = 'Increased risk of cardiovascular disease and diabetes'
        progress = 75 + ((bmi - 25) / (30 - 25)) * 20
      } else {
        category = 'Obese'
        color = 'text-red-600'
        healthRisk = 'High risk of serious health complications'
        progress = Math.min(95 + ((bmi - 30) / 10) * 5, 100)
      }
      
      const idealWeightRange = getIdealWeightRange(heightInMeters)
      const recommendations = getRecommendations(bmi, category)
      
      const result: BMIResult = {
        bmi: Math.round(bmi * 10) / 10,
        category,
        color,
        healthRisk,
        idealWeightRange,
        recommendations,
        progress
      }
      
      setResults(result)
      trackToolComplete()
    } catch (error) {
      trackToolError()
      setErrors(['An error occurred during calculation'])
    }
  }

  const relatedTools = [
    { name: "Basic Calculator", href: "/calculators/basic" },
    { name: "Loan Calculator", href: "/calculators/loan" },
    { name: "Percentage Calculator", href: "/calculators/percentage" },
    { name: "Tip Calculator", href: "/calculators/tip" },
  ]

  return (
    <ToolLayout
      title="BMI Calculator"
      description="Calculate your Body Mass Index with comprehensive health insights and personalized recommendations"
      category="Calculators"
      categoryHref="/calculators"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">BMI Calculator</h1>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertDescription>
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                BMI Calculator
              </CardTitle>
              <CardDescription>
                Enter your measurements to calculate your Body Mass Index
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Unit System</Label>
                <RadioGroup value={unit} onValueChange={setUnit}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="metric" id="metric" />
                    <Label htmlFor="metric">Metric (cm, kg)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="imperial" id="imperial" />
                    <Label htmlFor="imperial">Imperial (inches, lbs)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">
                    Height ({unit === 'metric' ? 'cm' : 'inches'})
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder={unit === 'metric' ? '170' : '67'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">
                    Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={unit === 'metric' ? '70' : '154'}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (optional)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender (optional)</Label>
                  <RadioGroup value={gender} onValueChange={setGender}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Button onClick={calculateBMI} className="w-full" size="lg">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate BMI
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Your BMI Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* BMI Score */}
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{results.bmi}</div>
                  <Badge variant="outline" className={`text-lg px-4 py-2 ${results.color}`}>
                    {results.category}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>BMI Progress</span>
                    <span>{Math.round(results.progress)}%</span>
                  </div>
                  <Progress value={results.progress} className="h-3" />
                </div>

                {/* Health Risk */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Health Risk:</strong> {results.healthRisk}
                  </AlertDescription>
                </Alert>

                {/* Ideal Weight Range */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Ideal Weight Range
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {results.idealWeightRange.min} - {results.idealWeightRange.max} {unit === 'metric' ? 'kg' : 'lbs'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Health Recommendations</CardTitle>
              <CardDescription>
                Personalized recommendations based on your BMI category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {results.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* BMI Categories Reference */}
        <Card>
          <CardHeader>
            <CardTitle>BMI Categories</CardTitle>
            <CardDescription>
              Understanding BMI ranges and their health implications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-blue-600 font-semibold">Underweight</div>
                <div className="text-sm text-muted-foreground">&lt; 18.5</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-green-600 font-semibold">Normal</div>
                <div className="text-sm text-muted-foreground">18.5 - 24.9</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-yellow-600 font-semibold">Overweight</div>
                <div className="text-sm text-muted-foreground">25 - 29.9</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-red-600 font-semibold">Obese</div>
                <div className="text-sm text-muted-foreground">≥ 30</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
