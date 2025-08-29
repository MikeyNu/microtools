import React from 'react';
import Link from 'next/link';
import { Palette, Droplets, Sparkles, Eye, Shuffle, Zap, Shield, ArrowRight, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Color Tools - Color Picker, Gradient Generator & Palette Creator | ToolHub',
  description: 'Professional color tools including advanced color picker, gradient generator, color palette creator, and color conversion utilities for designers and developers.',
};

const colorTools = [
  {
    title: 'Advanced Color Picker',
    description: 'Professional color picker with multiple formats and accessibility features',
    href: '/color-tools/color-picker',
    icon: Droplets,
    features: ['HEX, RGB, HSL, HSV', 'Color Blindness Simulation', 'Contrast Checker', 'Color History']
  },
  {
    title: 'Gradient Generator',
    description: 'Create beautiful CSS gradients with live preview and export options',
    href: '/color-tools/gradient-generator',
    icon: Sparkles,
    features: ['Linear & Radial', 'Multiple Color Stops', 'CSS Export', 'Preset Gradients']
  },
  {
    title: 'Color Palette Generator',
    description: 'Generate harmonious color palettes using color theory principles',
    href: '/color-tools/palette-generator',
    icon: Palette,
    features: ['Complementary', 'Triadic', 'Analogous', 'Monochromatic']
  },
  {
    title: 'Color Contrast Checker',
    description: 'Check color contrast ratios for WCAG accessibility compliance',
    href: '/color-tools/contrast-checker',
    icon: Eye,
    features: ['WCAG AA/AAA', 'Text & Background', 'Accessibility Score', 'Suggestions']
  },
  {
    title: 'Color Converter',
    description: 'Convert colors between different formats and color spaces',
    href: '/color-tools/color-converter',
    icon: Shuffle,
    features: ['HEX ↔ RGB ↔ HSL', 'CMYK Support', 'Color Names', 'Batch Convert']
  },
  {
    title: 'Color Extractor',
    description: 'Extract dominant colors from images and create palettes',
    href: '/color-tools/color-extractor',
    icon: Zap,
    features: ['Image Upload', 'Dominant Colors', 'Palette Export', 'Color Analysis']
  }
];

export default function ColorToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <Palette className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h1 className="text-2xl font-serif font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                ToolHub
              </h1>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Home
              </Link>
              <Link href="/calculators" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Calculators
              </Link>
              <Link href="/converters" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Converters
              </Link>
              <span className="text-primary font-semibold px-3 py-1 bg-primary/10 rounded-full">
                Color Tools
              </span>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container mx-auto px-4 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6">
            <Palette className="h-4 w-4" />
            <span>Professional Color Tools</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Color Design
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Create stunning color palettes, generate gradients, check accessibility, and work with colors in multiple formats. 
            Perfect for designers and developers.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Instant Results</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">WCAG Compliant</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border">
              <Eye className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Accessibility Focused</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">Choose Your Color Tool</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional color tools for designers, developers, and creative professionals
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {colorTools.map((tool, index) => {
                const IconComponent = tool.icon;
                return (
                  <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                          <IconComponent className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <Badge variant="secondary" className="text-xs font-medium">
                          Color Tool
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-serif group-hover:text-primary transition-colors duration-300">
                          {tool.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground leading-relaxed">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-foreground">Key Features:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {tool.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2">
                        <Link href={tool.href}>
                          <Button className="w-full group/btn">
                            <span>Use Tool</span>
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

          </div>
        </div>
      </section>

      {/* Color Theory Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Color Theory & Design</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Master the fundamentals of color theory with our comprehensive tools and resources.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader className="space-y-2">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg w-fit">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-serif">Color Harmony</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Create visually pleasing color combinations using complementary, triadic, 
                    analogous, and monochromatic color schemes based on color wheel relationships.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader className="space-y-2">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg w-fit">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-serif">Accessibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ensure your color choices meet WCAG guidelines for contrast ratios. 
                    Our tools help create inclusive designs that work for users with visual impairments.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader className="space-y-2">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg w-fit">
                    <Shuffle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-serif">Color Formats</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Work with multiple color formats including HEX, RGB, HSL, HSV, and CMYK. 
                    Perfect for web development, print design, and digital art workflows.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader className="space-y-2">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg w-fit">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-serif">Professional Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Industry-standard color tools with features like gradient generation, 
                    palette extraction from images, and color blindness simulation for comprehensive design testing.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Color Palettes Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Popular Color Palettes</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore trending color combinations for your next design project.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-serif text-center">Modern Blues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-16 rounded-lg overflow-hidden shadow-sm mb-4">
                    <div className="flex-1 bg-blue-900"></div>
                    <div className="flex-1 bg-blue-700"></div>
                    <div className="flex-1 bg-blue-500"></div>
                    <div className="flex-1 bg-blue-300"></div>
                    <div className="flex-1 bg-blue-100"></div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Professional and trustworthy palette perfect for corporate designs.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-serif text-center">Sunset Gradient</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-16 rounded-lg overflow-hidden shadow-sm mb-4">
                    <div className="flex-1 bg-orange-600"></div>
                    <div className="flex-1 bg-orange-500"></div>
                    <div className="flex-1 bg-yellow-400"></div>
                    <div className="flex-1 bg-pink-400"></div>
                    <div className="flex-1 bg-purple-500"></div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Warm and energetic colors ideal for creative and lifestyle brands.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-serif text-center">Nature Greens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-16 rounded-lg overflow-hidden shadow-sm mb-4">
                    <div className="flex-1 bg-green-900"></div>
                    <div className="flex-1 bg-green-700"></div>
                    <div className="flex-1 bg-green-500"></div>
                    <div className="flex-1 bg-green-300"></div>
                    <div className="flex-1 bg-green-100"></div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Fresh and organic palette great for environmental and health brands.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Color Design Tips</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Master professional color design with these essential tips and best practices.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg w-fit mb-4">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-serif">Design Fundamentals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">60-30-10 Rule</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Use 60% dominant color, 30% secondary color, and 10% accent color for balanced designs.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Color Psychology</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Consider the emotional impact of colors: blue for trust, green for growth, 
                      red for urgency, and purple for creativity.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg w-fit mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-serif">Accessibility & Culture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Contrast & Readability</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ensure sufficient contrast between text and background colors. 
                      Aim for at least 4.5:1 ratio for normal text and 3:1 for large text.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cultural Considerations</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Remember that color meanings vary across cultures. 
                      Test your color choices with your target audience.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}