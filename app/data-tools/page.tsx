import { Metadata } from 'next'
import Link from 'next/link'
import { Database, FileText, Code, CheckCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Data Tools - Free Online Data Processing & Conversion Tools',
  description: 'Free online data tools for converting, formatting, and validating data. CSV to JSON converter, XML formatter, SQL formatter, and more.',
  keywords: 'data tools, CSV to JSON, XML formatter, SQL formatter, data validator, data conversion, data processing',
  openGraph: {
    title: 'Data Tools - Free Online Data Processing Tools',
    description: 'Convert, format, and validate data with our free online tools',
    type: 'website',
  },
}

const dataTools = [
  {
    title: 'CSV to JSON Converter',
    description: 'Convert CSV files to JSON format with customizable options',
    href: '/data-tools/csv-to-json',
    icon: FileText,
    badge: 'Popular',
    features: ['Batch conversion', 'Custom delimiters', 'Header options', 'Download results']
  },
  {
    title: 'XML Formatter',
    description: 'Format and beautify XML documents with proper indentation',
    href: '/data-tools/xml-formatter',
    icon: Code,
    badge: 'Essential',
    features: ['Pretty print', 'Minify XML', 'Syntax validation', 'Error highlighting']
  },
  {
    title: 'SQL Formatter',
    description: 'Format and beautify SQL queries for better readability',
    href: '/data-tools/sql-formatter',
    icon: Database,
    badge: 'Developer',
    features: ['Multiple SQL dialects', 'Keyword highlighting', 'Indentation options', 'Query optimization']
  },
  {
    title: 'Data Validator',
    description: 'Validate JSON, XML, CSV and other data formats',
    href: '/data-tools/data-validator',
    icon: CheckCircle,
    badge: 'Utility',
    features: ['Multiple formats', 'Schema validation', 'Error reporting', 'Batch validation']
  },
  {
    title: 'JSON Formatter',
    description: 'Format, validate and minify JSON data',
    href: '/data-tools/json-formatter',
    icon: Code,
    badge: 'Popular',
    features: ['Pretty print', 'Minify JSON', 'Syntax validation', 'Tree view']
  },
  {
    title: 'YAML Converter',
    description: 'Convert between YAML and JSON formats',
    href: '/data-tools/yaml-converter',
    icon: FileText,
    badge: 'Converter',
    features: ['YAML to JSON', 'JSON to YAML', 'Syntax validation', 'Format preservation']
  }
]

const relatedCategories = [
  { name: 'Developer Tools', href: '/developer-tools', description: 'Code formatting and development utilities' },
  { name: 'Text Tools', href: '/text-tools', description: 'Text processing and manipulation tools' },
  { name: 'Converters', href: '/converters', description: 'File and format conversion tools' },
  { name: 'Web Tools', href: '/web-tools', description: 'Web development and testing tools' }
]

export default function DataToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-purple-500 text-white rounded-xl">
            <Database className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold">Data Tools</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Professional data processing tools for converting, formatting, and validating various data formats. 
          Perfect for developers, analysts, and data professionals.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {dataTools.map((tool, index) => {
          const IconComponent = tool.icon
          return (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                        {tool.title}
                      </CardTitle>
                    </div>
                  </div>
                  {tool.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {tool.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {tool.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={tool.href}>
                    <Button className="w-full group-hover:bg-purple-600 transition-colors">
                      Use Tool
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Features Section */}
      <div className="bg-muted/50 rounded-xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Why Choose Our Data Tools?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-3 bg-purple-500 text-white rounded-lg w-fit mx-auto mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Multiple Formats</h3>
            <p className="text-sm text-muted-foreground">
              Support for JSON, XML, CSV, YAML, SQL and more data formats
            </p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-purple-500 text-white rounded-lg w-fit mx-auto mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Validation & Error Detection</h3>
            <p className="text-sm text-muted-foreground">
              Built-in validation with detailed error reporting and suggestions
            </p>
          </div>
          <div className="text-center">
            <div className="p-3 bg-purple-500 text-white rounded-lg w-fit mx-auto mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Batch Processing</h3>
            <p className="text-sm text-muted-foreground">
              Process multiple files and large datasets efficiently
            </p>
          </div>
        </div>
      </div>

      {/* Related Categories */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Related Tool Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedCategories.map((category, index) => (
            <Link key={index} href={category.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* SEO Content */}
      <div className="mt-16 prose prose-gray max-w-4xl mx-auto">
        <h2>Professional Data Processing Tools</h2>
        <p>
          Our comprehensive suite of data tools helps developers, analysts, and data professionals 
          work with various data formats efficiently. Whether you need to convert CSV to JSON, 
          format XML documents, or validate data structures, our tools provide the functionality 
          you need with a user-friendly interface.
        </p>
        
        <h3>Key Features</h3>
        <ul>
          <li><strong>Format Conversion:</strong> Convert between popular data formats like CSV, JSON, XML, and YAML</li>
          <li><strong>Data Validation:</strong> Validate data structure and syntax with detailed error reporting</li>
          <li><strong>Formatting & Beautification:</strong> Clean up and format data for better readability</li>
          <li><strong>Batch Processing:</strong> Handle multiple files and large datasets efficiently</li>
          <li><strong>Developer-Friendly:</strong> Tools designed with developers and data professionals in mind</li>
        </ul>
        
        <h3>Popular Use Cases</h3>
        <ul>
          <li>Converting CSV exports to JSON for web applications</li>
          <li>Formatting SQL queries for better code readability</li>
          <li>Validating API responses and data structures</li>
          <li>Cleaning up XML documents and configuration files</li>
          <li>Converting between YAML and JSON for configuration management</li>
        </ul>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Data Tools - Free Online Data Processing Tools",
            "description": "Free online data tools for converting, formatting, and validating data formats like CSV, JSON, XML, SQL, and YAML.",
            "url": "https://microtools.dev/data-tools",
            "mainEntity": {
              "@type": "SoftwareApplication",
              "name": "Data Processing Tools",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web Browser",
              "permissions": "browser",
              "isAccessibleForFree": true,
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            }
          })
        }}
      />
    </div>
  )
}