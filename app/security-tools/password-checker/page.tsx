'use client'

import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, Shield, AlertTriangle, CheckCircle, Copy, RefreshCw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ToolLayout } from '@/components/tool-layout'
import { FavoriteButton, ShareButton } from '@/components/user-engagement'
import { useToolTracker } from '@/components/analytics-provider'

interface PasswordAnalysis {
  score: number
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'
  feedback: string[]
  suggestions: string[]
  timeToCrack: string
  entropy: number
  checks: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    numbers: boolean
    symbols: boolean
    commonPassword: boolean
    repeatedChars: boolean
    sequentialChars: boolean
  }
}

interface GeneratorOptions {
  length: number
  includeLowercase: boolean
  includeUppercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

export default function PasswordCheckerPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null)
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [generatorOptions, setGeneratorOptions] = useState<GeneratorOptions>({
    length: 16,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false
  })
  const { toast } = useToast()
  
  const { trackToolStart, trackToolComplete, trackToolError } = useToolTracker('Password Checker', 'security-tools')
  
  // Tool definition for user engagement components
  const tool = {
    id: 'password-checker',
    name: 'Password Strength Checker',
    description: 'Analyze password strength and get security recommendations with breach detection',
    category: 'security-tools',
    url: '/security-tools/password-checker'
  }

  // Common passwords list (simplified)
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon',
    'master', 'login', 'pass', 'hello', 'guest', 'test', 'user'
  ]

  const analyzePassword = (pwd: string): PasswordAnalysis => {
    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /\d/.test(pwd),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      commonPassword: !commonPasswords.includes(pwd.toLowerCase()),
      repeatedChars: !/(..).*\1/.test(pwd),
      sequentialChars: !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|890)/i.test(pwd)
    }

    // Calculate entropy
    let charsetSize = 0
    if (checks.lowercase) charsetSize += 26
    if (checks.uppercase) charsetSize += 26
    if (checks.numbers) charsetSize += 10
    if (checks.symbols) charsetSize += 32
    
    const entropy = pwd.length * Math.log2(charsetSize || 1)

    // Calculate score (0-100)
    let score = 0
    if (checks.length) score += 25
    if (checks.lowercase) score += 10
    if (checks.uppercase) score += 10
    if (checks.numbers) score += 10
    if (checks.symbols) score += 15
    if (checks.commonPassword) score += 10
    if (checks.repeatedChars) score += 10
    if (checks.sequentialChars) score += 10
    
    // Length bonus
    if (pwd.length >= 12) score += 10
    if (pwd.length >= 16) score += 10
    if (pwd.length >= 20) score += 10

    // Determine strength
    let strength: PasswordAnalysis['strength']
    if (score < 20) strength = 'Very Weak'
    else if (score < 40) strength = 'Weak'
    else if (score < 60) strength = 'Fair'
    else if (score < 80) strength = 'Good'
    else if (score < 95) strength = 'Strong'
    else strength = 'Very Strong'

    // Generate feedback
    const feedback: string[] = []
    const suggestions: string[] = []

    if (!checks.length) {
      feedback.push('Password is too short')
      suggestions.push('Use at least 8 characters (12+ recommended)')
    }
    if (!checks.lowercase) {
      feedback.push('Missing lowercase letters')
      suggestions.push('Add lowercase letters (a-z)')
    }
    if (!checks.uppercase) {
      feedback.push('Missing uppercase letters')
      suggestions.push('Add uppercase letters (A-Z)')
    }
    if (!checks.numbers) {
      feedback.push('Missing numbers')
      suggestions.push('Add numbers (0-9)')
    }
    if (!checks.symbols) {
      feedback.push('Missing special characters')
      suggestions.push('Add symbols (!@#$%^&*)')
    }
    if (!checks.commonPassword) {
      feedback.push('This is a common password')
      suggestions.push('Avoid dictionary words and common passwords')
    }
    if (!checks.repeatedChars) {
      feedback.push('Contains repeated character patterns')
      suggestions.push('Avoid repeating characters or patterns')
    }
    if (!checks.sequentialChars) {
      feedback.push('Contains sequential characters')
      suggestions.push('Avoid sequential characters (abc, 123)')
    }

    // Calculate time to crack
    const attemptsPerSecond = 1000000000 // 1 billion attempts per second
    const possibleCombinations = Math.pow(charsetSize || 1, pwd.length)
    const secondsToCrack = possibleCombinations / (2 * attemptsPerSecond)
    
    let timeToCrack: string
    if (secondsToCrack < 1) timeToCrack = 'Instantly'
    else if (secondsToCrack < 60) timeToCrack = `${Math.round(secondsToCrack)} seconds`
    else if (secondsToCrack < 3600) timeToCrack = `${Math.round(secondsToCrack / 60)} minutes`
    else if (secondsToCrack < 86400) timeToCrack = `${Math.round(secondsToCrack / 3600)} hours`
    else if (secondsToCrack < 31536000) timeToCrack = `${Math.round(secondsToCrack / 86400)} days`
    else if (secondsToCrack < 31536000000) timeToCrack = `${Math.round(secondsToCrack / 31536000)} years`
    else timeToCrack = 'Centuries'

    return {
      score: Math.min(100, score),
      strength,
      feedback,
      suggestions,
      timeToCrack,
      entropy: Math.round(entropy * 10) / 10,
      checks
    }
  }

  const generatePassword = (): string => {
    let charset = ''
    if (generatorOptions.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (generatorOptions.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (generatorOptions.includeNumbers) charset += '0123456789'
    if (generatorOptions.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    if (generatorOptions.excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '')
    }
    
    if (generatorOptions.excludeAmbiguous) {
      charset = charset.replace(/[{}\[\]()\/'"~,;.<>]/g, '')
    }
    
    if (!charset) return ''
    
    let password = ''
    for (let i = 0; i < generatorOptions.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    
    return password
  }

  const handleGeneratePassword = () => {
    trackToolStart()
    const newPassword = generatePassword()
    setGeneratedPassword(newPassword)
    trackToolComplete()
    
    toast({
      title: 'Password generated',
      description: `Generated ${generatorOptions.length}-character password`
    })
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied!',
      description: `${type} copied to clipboard`
    })
  }

  const useGeneratedPassword = () => {
    setPassword(generatedPassword)
    toast({
      title: 'Password applied',
      description: 'Generated password is now being analyzed'
    })
  }

  // Analyze password when it changes
  useEffect(() => {
    if (password) {
      const result = analyzePassword(password)
      setAnalysis(result)
    } else {
      setAnalysis(null)
    }
  }, [password])

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Weak': return 'text-red-600'
      case 'Weak': return 'text-red-500'
      case 'Fair': return 'text-yellow-500'
      case 'Good': return 'text-blue-500'
      case 'Strong': return 'text-green-500'
      case 'Very Strong': return 'text-green-600'
      default: return 'text-gray-500'
    }
  }

  const getProgressColor = (score: number) => {
    if (score < 20) return 'bg-red-500'
    if (score < 40) return 'bg-red-400'
    if (score < 60) return 'bg-yellow-500'
    if (score < 80) return 'bg-blue-500'
    if (score < 95) return 'bg-green-500'
    return 'bg-green-600'
  }

  const relatedTools = [
    { name: 'Two-Factor Auth Generator', href: '/security-tools/2fa-generator' },
    { name: 'SSL Certificate Checker', href: '/security-tools/ssl-checker' },
    { name: 'Hash Generator', href: '/security-tools/hash-generator' },
    { name: 'Password Generator', href: '/security-tools/password-generator' }
  ]

  return (
    <ToolLayout
      title="Password Strength Checker"
      description="Analyze password strength, get security recommendations, and generate secure passwords with advanced options."
      category="Security Tools"
      categoryHref="/security-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 text-white rounded-lg">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Password Strength Checker</h1>
              <p className="text-muted-foreground">Analyze password security and generate strong passwords</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton toolId={tool.id} />
            <ShareButton tool={tool} />
          </div>
        </div>

        <Tabs defaultValue="checker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="checker">Password Checker</TabsTrigger>
            <TabsTrigger value="generator">Password Generator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="checker">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Password Input */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Enter Password to Analyze</CardTitle>
                    <CardDescription>
                      Your password is analyzed locally and never sent to our servers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {analysis && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Strength:</span>
                            <Badge className={getStrengthColor(analysis.strength)}>
                              {analysis.strength}
                            </Badge>
                          </div>
                          <Progress 
                            value={analysis.score} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Score: {analysis.score}/100</span>
                            <span>Entropy: {analysis.entropy} bits</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="font-medium">Security Checks:</div>
                            <div className="space-y-1">
                              {Object.entries({
                                'Length (8+)': analysis.checks.length,
                                'Lowercase': analysis.checks.lowercase,
                                'Uppercase': analysis.checks.uppercase,
                                'Numbers': analysis.checks.numbers,
                                'Symbols': analysis.checks.symbols,
                                'Not Common': analysis.checks.commonPassword,
                                'No Repeats': analysis.checks.repeatedChars,
                                'No Sequence': analysis.checks.sequentialChars
                              }).map(([check, passed]) => (
                                <div key={check} className="flex items-center gap-2">
                                  {passed ? (
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                  ) : (
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                  )}
                                  <span className={passed ? 'text-green-600' : 'text-red-600'}>
                                    {check}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="font-medium">Time to Crack:</div>
                            <div className="text-lg font-bold text-red-600">
                              {analysis.timeToCrack}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Using modern hardware
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Results */}
              <div className="space-y-4">
                {analysis && analysis.feedback.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Issues Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {analysis.feedback.map((issue, index) => (
                          <li key={index} className="text-red-600">
                            • {issue}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                {analysis && analysis.suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-blue-600">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Security Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>• Use unique passwords for each account</p>
                    <p>• Enable two-factor authentication</p>
                    <p>• Consider using a password manager</p>
                    <p>• Update passwords regularly</p>
                    <p>• Avoid personal information in passwords</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="generator">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Generator Options */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Generator Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="length">Length: {generatorOptions.length}</Label>
                      <input
                        type="range"
                        id="length"
                        min="4"
                        max="128"
                        value={generatorOptions.length}
                        onChange={(e) => setGeneratorOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="lowercase"
                          checked={generatorOptions.includeLowercase}
                          onChange={(e) => setGeneratorOptions(prev => ({ ...prev, includeLowercase: e.target.checked }))}
                        />
                        <Label htmlFor="lowercase" className="text-sm">Lowercase (a-z)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="uppercase"
                          checked={generatorOptions.includeUppercase}
                          onChange={(e) => setGeneratorOptions(prev => ({ ...prev, includeUppercase: e.target.checked }))}
                        />
                        <Label htmlFor="uppercase" className="text-sm">Uppercase (A-Z)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="numbers"
                          checked={generatorOptions.includeNumbers}
                          onChange={(e) => setGeneratorOptions(prev => ({ ...prev, includeNumbers: e.target.checked }))}
                        />
                        <Label htmlFor="numbers" className="text-sm">Numbers (0-9)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="symbols"
                          checked={generatorOptions.includeSymbols}
                          onChange={(e) => setGeneratorOptions(prev => ({ ...prev, includeSymbols: e.target.checked }))}
                        />
                        <Label htmlFor="symbols" className="text-sm">Symbols (!@#$)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="exclude-similar"
                          checked={generatorOptions.excludeSimilar}
                          onChange={(e) => setGeneratorOptions(prev => ({ ...prev, excludeSimilar: e.target.checked }))}
                        />
                        <Label htmlFor="exclude-similar" className="text-sm">Exclude similar (il1Lo0O)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="exclude-ambiguous"
                          checked={generatorOptions.excludeAmbiguous}
                          onChange={(e) => setGeneratorOptions(prev => ({ ...prev, excludeAmbiguous: e.target.checked }))}
                        />
                        <Label htmlFor="exclude-ambiguous" className="text-sm">Exclude ambiguous</Label>
                      </div>
                    </div>
                    
                    <Button onClick={handleGeneratePassword} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate Password
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Generated Password */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Password</CardTitle>
                    <CardDescription>
                      Secure password generated based on your preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {generatedPassword && (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              value={generatedPassword}
                              readOnly
                              className="font-mono"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(generatedPassword, 'Password')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={useGeneratedPassword}
                            >
                              <Zap className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Show analysis for generated password */}
                        {(() => {
                          const genAnalysis = analyzePassword(generatedPassword)
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Strength:</span>
                                <Badge className={getStrengthColor(genAnalysis.strength)}>
                                  {genAnalysis.strength}
                                </Badge>
                              </div>
                              <Progress value={genAnalysis.score} className="h-2" />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Score: {genAnalysis.score}/100</span>
                                <span>Time to crack: {genAnalysis.timeToCrack}</span>
                              </div>
                            </div>
                          )
                        })()}
                      </>
                    )}
                    
                    {!generatedPassword && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Click "Generate Password" to create a secure password</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Privacy Notice:</strong> All password analysis is performed locally in your browser. 
            Your passwords are never transmitted to our servers or stored anywhere.
          </AlertDescription>
        </Alert>
      </div>
    </ToolLayout>
  )
}