"use client"

import { useState } from "react"
import { Key, ArrowLeft, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState([12])
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(false)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [password, setPassword] = useState("")
  const [strength, setStrength] = useState("")
  const { toast } = useToast()

  const generatePassword = () => {
    let charset = ""
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (includeNumbers) charset += "0123456789"
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, "")
    }

    if (charset === "") {
      toast({
        title: "Error",
        description: "Please select at least one character type",
        variant: "destructive",
      })
      return
    }

    let result = ""
    for (let i = 0; i < length[0]; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    setPassword(result)
    calculateStrength(result)
  }

  const calculateStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score < 3) setStrength("Weak")
    else if (score < 5) setStrength("Medium")
    else setStrength("Strong")
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(password)
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    })
  }

  const getStrengthColor = () => {
    switch (strength) {
      case "Weak":
        return "text-red-600"
      case "Medium":
        return "text-yellow-600"
      case "Strong":
        return "text-green-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Key className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <Link
              href="/text-tools"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Text Tools
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">Password Generator</CardTitle>
              <p className="text-muted-foreground">Generate secure passwords with custom options</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Password Length: {length[0]}</Label>
                  <div className="mt-2">
                    <Slider value={length} onValueChange={setLength} max={50} min={4} step={1} className="w-full" />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>4</span>
                    <span>50</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uppercase"
                      checked={includeUppercase}
                      onCheckedChange={(checked) => setIncludeUppercase(checked as boolean)}
                    />
                    <Label htmlFor="uppercase">Include Uppercase Letters (A-Z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowercase"
                      checked={includeLowercase}
                      onCheckedChange={(checked) => setIncludeLowercase(checked as boolean)}
                    />
                    <Label htmlFor="lowercase">Include Lowercase Letters (a-z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={includeNumbers}
                      onCheckedChange={(checked) => setIncludeNumbers(checked as boolean)}
                    />
                    <Label htmlFor="numbers">Include Numbers (0-9)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="symbols"
                      checked={includeSymbols}
                      onCheckedChange={(checked) => setIncludeSymbols(checked as boolean)}
                    />
                    <Label htmlFor="symbols">Include Symbols (!@#$%^&*)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="exclude-similar"
                      checked={excludeSimilar}
                      onCheckedChange={(checked) => setExcludeSimilar(checked as boolean)}
                    />
                    <Label htmlFor="exclude-similar">Exclude Similar Characters (il1Lo0O)</Label>
                  </div>
                </div>

                <Button onClick={generatePassword} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Password
                </Button>
              </div>

              {password && (
                <div className="space-y-4">
                  <div>
                    <Label>Generated Password</Label>
                    <div className="flex space-x-2 mt-2">
                      <Input value={password} readOnly className="font-mono" />
                      <Button variant="outline" onClick={copyPassword}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Password Strength:</span>
                      <span className={`font-semibold ${getStrengthColor()}`}>{strength}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Password Security Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use at least 12 characters for better security</li>
                  <li>• Include a mix of uppercase, lowercase, numbers, and symbols</li>
                  <li>• Don't use personal information or common words</li>
                  <li>• Use a unique password for each account</li>
                  <li>• Consider using a password manager</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
