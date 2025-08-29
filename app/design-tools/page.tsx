import React from 'react';
import Link from 'next/link';
import { Palette, Droplets, Sparkles, Eye, Shuffle, Zap, Shield, ArrowRight, Clock, QrCode, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import { AdSensePlaceholder } from "@/components/adsense-placeholder";
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from "@/lib/adsense-config";

export const metadata: Metadata = {
  title: 'Free Design Tools - Color Picker, QR Generator, Favicon Creator & More | ToolHub',
  description: 'Professional design tools including color picker, gradient generator, QR code generator, favicon creator, and design utilities for designers and developers.',
};

const designTools = [
  {
    title: 'Advanced Color Picker',
    description: 'Professional color picker with multiple formats and accessibility features',
    href: '/design-tools/color-picker',
    icon: Droplets,
    features: ['HEX, RGB, HSL, HSV', 'Color Blindness Simulation', 'Contrast Checker', 'Color History']
  },
  {
    title: 'Gradient Generator',
    description: 'Create beautiful CSS gradients with live preview and export options',
    href: '/design-tools/gradient-generator',
    icon: Sparkles,
    features: ['Linear & Radial', 'Multiple Color Stops', 'CSS Export', 'Preset Gradients']
  },
  {
    title: 'Color Palette Generator',
    description: 'Generate harmonious color palettes using color theory principles',
    href: '/design-tools/palette-generator',
    icon: Palette,
    features: ['Complementary', 'Triadic', 'Analogous', 'Monochromatic']
  },
  {
    title: 'QR Code Generator',
    description: 'Generate customizable QR codes for URLs, text, and more',
    href: '/design-tools/qr-generator',
    icon: QrCode,
    features: ['Custom URLs', 'Text Encoding', 'Logo Embedding', 'Multiple Formats']
  },
  {
    title: 'Favicon Generator',
    description: 'Create favicons and app icons from images or text',
    href: '/design-tools/favicon-generator',
    icon: Image,
    features: ['Multiple Sizes', 'ICO Format', 'PNG Export', 'Browser Compatible']
  },
  {
    title: 'Color Contrast Checker',
    description: 'Check color contrast ratios for WCAG accessibility compliance',
    href: '/design-tools/contrast-checker',
    icon: Eye,
    features: ['WCAG AA/AAA', 'Text & Background', 'Accessibility Score', 'Suggestions']
  }
];

export default function DesignToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/10 bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-accent/20 rounded-lg blur-sm opacity-75"></div>
              </div>
              <h1 className="text-2xl font-sans font-bold text-foreground tracking-tight">ToolHub</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
                Home
              </Link>
              <Link href="/tools" className="text-foreground/70 hover:text-foreground transition-colors text-sm font-medium">
                All Tools
              </Link>
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
            <span>Professional Design Tools</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              Design Tools
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Create stunning designs with our comprehensive toolkit. From color palettes and gradients to QR codes and favicons. 
            Perfect for designers, developers, and creative professionals.
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
            <h2 className="text-3xl font-serif font-bold mb-4">Choose Your Design Tool</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional design tools for creating stunning visuals, branding assets, and digital content
            </p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {designTools.map((tool, index) => {
                const IconComponent = tool.icon;
                return (
                  <React.Fragment key={index}>
                    <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-card/80">
                    <CardHeader className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                          <IconComponent className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <Badge variant="secondary" className="text-xs font-medium">
                          Design Tool
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
                  
                  {/* Strategic ad placement after every 3rd tool */}
                  {shouldDisplayAds() && (index + 1) % 3 === 0 && index < designTools.length - 1 && (
                    <div className="md:col-span-2 lg:col-span-3 flex justify-center py-8">
                      <AdSensePlaceholder 
                        size="banner" 
                        adClient={ADSENSE_CONFIG.publisherId}
                        adSlot={getAdUnitId('categoryInline')}
                        responsive={true}
                      />
                    </div>
                  )}
                </React.Fragment>
                );
              })}
        </div>

          </div>
        </div>
      </section>

      {/* Design Fundamentals Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Design Fundamentals & Best Practices</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Master the fundamentals of design with our comprehensive tools and professional resources.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-300">
                <CardHeader className="space-y-2">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg w-fit">
                    <Palette className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-serif">Color & Branding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Create cohesive brand identities with harmonious color palettes, custom QR codes, 
                    and professional favicons that work across all platforms and devices.
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
                  <CardTitle className="text-lg font-serif">Professional Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Generate professional design assets including custom QR codes with logo embedding, 
                    multi-format favicons, and stunning gradients for modern web and print design.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Design Inspiration Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Design Inspiration</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore trending color palettes and design elements for your next creative project.
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
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Design Best Practices</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Master professional design with these essential tips and industry best practices.
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
                    <h3 className="font-semibold text-foreground mb-2">Brand Consistency</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Maintain consistent visual identity across all touchpoints: use matching colors, 
                      standardized favicons, and cohesive QR code designs.
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

      {/* Footer Ad Section */}
      {shouldDisplayAds() && (
        <section className="py-12 bg-muted/20">
          <div className="container mx-auto px-4 text-center">
            <AdSensePlaceholder 
              size="large-rectangle" 
              adClient={ADSENSE_CONFIG.publisherId}
              adSlot={getAdUnitId('categoryFooter')}
              responsive={true}
            />
          </div>
        </section>
      )}
    </div>
  );
}