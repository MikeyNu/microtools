import React from 'react';
import Link from 'next/link';
import { Palette, Droplets, Sparkles, Eye, Shuffle, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Color Tools - Color Picker, Gradient Generator & Palette Creator',
  description: 'Professional color tools including advanced color picker, gradient generator, color palette creator, and color conversion utilities for designers and developers.',
  keywords: 'color picker, gradient generator, color palette, hex colors, rgb, hsl, color converter, design tools'
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Color Tools & Utilities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional color tools for designers and developers. Create palettes, generate gradients, 
            check accessibility, and work with colors in multiple formats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colorTools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <Link key={index} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                        <IconComponent className="h-6 w-6 text-purple-600" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Color Tool
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-purple-600 transition-colors">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Features:</h4>
                      <div className="grid grid-cols-1 gap-1">
                        {tool.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Color Theory Section */}
        <div className="mt-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Color Theory & Design</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Color Harmony</h3>
              <p className="text-sm">
                Create visually pleasing color combinations using complementary, triadic, 
                analogous, and monochromatic color schemes based on color wheel relationships.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Accessibility</h3>
              <p className="text-sm">
                Ensure your color choices meet WCAG guidelines for contrast ratios. 
                Our tools help create inclusive designs that work for users with visual impairments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Color Formats</h3>
              <p className="text-sm">
                Work with multiple color formats including HEX, RGB, HSL, HSV, and CMYK. 
                Perfect for web development, print design, and digital art workflows.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Professional Tools</h3>
              <p className="text-sm">
                Industry-standard color tools with features like gradient generation, 
                palette extraction from images, and color blindness simulation for comprehensive design testing.
              </p>
            </div>
          </div>
        </div>

        {/* Popular Color Palettes Preview */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Color Palettes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-medium text-gray-800 mb-2">Modern Blues</h3>
              <div className="flex h-12 rounded-lg overflow-hidden shadow-sm">
                <div className="flex-1 bg-blue-900"></div>
                <div className="flex-1 bg-blue-700"></div>
                <div className="flex-1 bg-blue-500"></div>
                <div className="flex-1 bg-blue-300"></div>
                <div className="flex-1 bg-blue-100"></div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-gray-800 mb-2">Sunset Gradient</h3>
              <div className="flex h-12 rounded-lg overflow-hidden shadow-sm">
                <div className="flex-1 bg-orange-600"></div>
                <div className="flex-1 bg-orange-500"></div>
                <div className="flex-1 bg-yellow-400"></div>
                <div className="flex-1 bg-pink-400"></div>
                <div className="flex-1 bg-purple-500"></div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-gray-800 mb-2">Nature Greens</h3>
              <div className="flex h-12 rounded-lg overflow-hidden shadow-sm">
                <div className="flex-1 bg-green-900"></div>
                <div className="flex-1 bg-green-700"></div>
                <div className="flex-1 bg-green-500"></div>
                <div className="flex-1 bg-green-300"></div>
                <div className="flex-1 bg-green-100"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Color Design Tips</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">60-30-10 Rule</h3>
              <p className="text-sm mb-4">
                Use 60% dominant color, 30% secondary color, and 10% accent color for balanced designs.
              </p>
              
              <h3 className="font-semibold text-gray-800 mb-2">Color Psychology</h3>
              <p className="text-sm">
                Consider the emotional impact of colors: blue for trust, green for growth, 
                red for urgency, and purple for creativity.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Contrast & Readability</h3>
              <p className="text-sm mb-4">
                Ensure sufficient contrast between text and background colors. 
                Aim for at least 4.5:1 ratio for normal text and 3:1 for large text.
              </p>
              
              <h3 className="font-semibold text-gray-800 mb-2">Cultural Considerations</h3>
              <p className="text-sm">
                Remember that color meanings vary across cultures. 
                Test your color choices with your target audience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}