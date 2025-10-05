import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, Globe, ArrowRightLeft, Timer, Zap, ArrowRight, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import { AdSensePlaceholder } from "@/components/adsense-placeholder";
import { ADSENSE_CONFIG, getAdUnitId, shouldDisplayAds } from "@/lib/adsense-config";

const NextLink = Link;

export const metadata: Metadata = {
  title: 'Timestamp Tools - Unix Time, Epoch Converter & Timezone Tools | ToolHub',
  description: 'Professional timestamp conversion tools for developers. Convert Unix timestamps, handle timezones, work with date formats, and calculate time differences with precision.',
  keywords: 'timestamp tools, unix time converter, epoch converter, timezone converter, date formatter, time calculator, developer tools'
};

const timestampTools = [
  {
    title: 'Unix Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates and vice versa with precision and multiple format support',
    href: '/timestamp-tools/unix-converter',
    icon: Clock,
    color: 'bg-blue-500',
    popular: true,
    features: ['Unix to Date conversion', 'Date to Unix conversion', 'Current timestamp display']
  },
  {
    title: 'Epoch Time Converter',
    description: 'Convert epoch time with milliseconds precision and support for various programming formats',
    href: '/timestamp-tools/epoch-converter',
    icon: Timer,
    color: 'bg-green-500',
    popular: true,
    features: ['Milliseconds precision', 'Multiple output formats', 'Timezone awareness']
  },
  {
    title: 'Timezone Converter',
    description: 'Convert time between different timezones with automatic DST handling and city search',
    href: '/timestamp-tools/timezone-converter',
    icon: Globe,
    color: 'bg-purple-500',
    popular: true,
    features: ['World timezone support', 'DST automatic handling', 'City-based search']
  },
  {
    title: 'Date Format Converter',
    description: 'Convert dates between ISO 8601, RFC 2822, and custom formats with locale support',
    href: '/timestamp-tools/date-format',
    icon: Calendar,
    color: 'bg-orange-500',
    popular: false,
    features: ['ISO 8601 standard', 'RFC 2822 format', 'Custom format patterns']
  },
  {
    title: 'Time Calculator',
    description: 'Calculate time differences, add/subtract time intervals, and handle business day calculations',
    href: '/timestamp-tools/time-calculator',
    icon: ArrowRightLeft,
    color: 'bg-pink-500',
    popular: false,
    features: ['Time difference calculation', 'Add/subtract operations', 'Business day handling']
  },
  {
    title: 'Current Time Display',
    description: 'Display live current time in multiple formats and timezones with real-time updates',
    href: '/timestamp-tools/current-time',
    icon: Zap,
    color: 'bg-yellow-500',
    popular: false,
    features: ['Live clock display', 'Multiple timezone view', 'Real-time updates']
  }
];

export default function TimestampToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium mb-6">
            <Clock className="mr-2 h-4 w-4" />
            Time & Timestamp Tools
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6">
            Timestamp &
            <span className="text-primary"> Time Tools</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Professional timestamp conversion tools for developers and system administrators. 
            Convert Unix timestamps, handle timezones, and work with various date formats with precision.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Precision Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Real-time Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span>Global Timezone Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Choose Your Tool</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional-grade timestamp tools designed for developers and system administrators
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timestampTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <React.Fragment key={index}>
                  <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/30" />
                  <div className="relative">
                    {tool.popular && (
                      <Badge className="absolute -top-1 -right-1 z-10 bg-primary text-primary-foreground">
                        Popular
                      </Badge>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${tool.color} bg-opacity-10 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className={`h-8 w-8 ${tool.color.replace('bg-', 'text-')}`} />
                      </div>
                      <CardTitle className="font-serif text-xl mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-6">
                        {tool.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                            <div className={`w-1.5 h-1.5 rounded-full ${tool.color} mr-2`} />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <NextLink href={tool.href}>
                        <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Use Tool
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </NextLink>
                    </CardContent>
                  </div>
                </Card>
                
                {/* Strategic ad placement after every 3rd tool */}
                {shouldDisplayAds() && (index + 1) % 3 === 0 && index < timestampTools.length - 1 && (
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
      </section>

      {/* Why Choose Our Timestamp Tools */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Why Choose Our Timestamp Tools?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional-grade tools designed for developers and system administrators
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Precision & Accuracy</h3>
              <p className="text-muted-foreground leading-relaxed">
                High-precision calculations with support for microseconds and nanoseconds. Perfect for system logs and debugging.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Real-time Processing</h3>
              <p className="text-muted-foreground leading-relaxed">
                Instant conversions and calculations. No waiting, no delays - get your results immediately as you type.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Global Timezone Support</h3>
              <p className="text-muted-foreground leading-relaxed">
                Handle timezone conversions and daylight saving time transitions accurately across all global timezones.
              </p>
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