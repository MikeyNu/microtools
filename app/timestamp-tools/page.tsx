import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, Globe, ArrowRightLeft, Timer, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Timestamp Tools - Unix Time, Epoch Converter & Timezone Tools',
  description: 'Free online timestamp tools including Unix timestamp converter, epoch time converter, timezone converter, and date formatting utilities.',
  keywords: 'timestamp, unix time, epoch converter, timezone, date converter, time tools'
};

const timestampTools = [
  {
    title: 'Unix Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates and vice versa',
    href: '/timestamp-tools/unix-converter',
    icon: Clock,
    features: ['Unix to Date', 'Date to Unix', 'Current Timestamp', 'Batch Convert']
  },
  {
    title: 'Epoch Time Converter',
    description: 'Convert epoch time with milliseconds precision and multiple formats',
    href: '/timestamp-tools/epoch-converter',
    icon: Timer,
    features: ['Milliseconds Support', 'Multiple Formats', 'Time Zones', 'Precision Control']
  },
  {
    title: 'Timezone Converter',
    description: 'Convert time between different timezones around the world',
    href: '/timestamp-tools/timezone-converter',
    icon: Globe,
    features: ['World Timezones', 'DST Support', 'City Search', 'Time Comparison']
  },
  {
    title: 'Date Format Converter',
    description: 'Convert dates between different formats and standards',
    href: '/timestamp-tools/date-format',
    icon: Calendar,
    features: ['ISO 8601', 'RFC 2822', 'Custom Formats', 'Locale Support']
  },
  {
    title: 'Time Calculator',
    description: 'Calculate time differences, add/subtract time, and duration tools',
    href: '/timestamp-tools/time-calculator',
    icon: ArrowRightLeft,
    features: ['Time Difference', 'Add/Subtract', 'Duration Format', 'Business Days']
  },
  {
    title: 'Current Time Display',
    description: 'Display current time in multiple formats and timezones',
    href: '/timestamp-tools/current-time',
    icon: Zap,
    features: ['Live Clock', 'Multiple Zones', 'Unix Time', 'Formatted Display']
  }
];

export default function TimestampToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Timestamp & Time Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional timestamp conversion tools for developers and system administrators. 
            Convert Unix timestamps, handle timezones, and work with various date formats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {timestampTools.map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <Link key={index} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Time Tool
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Features:</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {tool.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
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

        <div className="mt-12 bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About Timestamp Tools</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Unix Timestamps</h3>
              <p className="text-sm">
                Unix timestamps represent the number of seconds since January 1, 1970 (Unix epoch). 
                They're widely used in programming and system administration for consistent time representation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Timezone Handling</h3>
              <p className="text-sm">
                Our tools support all major timezones with automatic daylight saving time adjustments. 
                Perfect for coordinating across global teams and systems.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Developer Friendly</h3>
              <p className="text-sm">
                Built for developers with features like batch conversion, API-ready formats, 
                and support for various programming language date formats.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Precision & Accuracy</h3>
              <p className="text-sm">
                Handle timestamps with millisecond precision and support for leap seconds. 
                Reliable for mission-critical applications and data analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}