import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  GitCompare, 
  Link as LinkIcon, 
  Code, 
  Type, 
  Hash, 
  Scissors, 
  AlignLeft,
  ArrowRight,
  Zap,
  Shield
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Text Utilities - Micro SaaS Tools',
  description: 'Comprehensive text processing tools including markdown editor, text diff, URL encoder/decoder, HTML encoder/decoder, and more.',
  keywords: ['text tools', 'markdown editor', 'text diff', 'url encoder', 'html encoder', 'text processing'],
};

const textTools = [
  {
    title: 'Markdown Editor',
    description: 'Write and preview Markdown with live rendering, syntax highlighting, and export options',
    href: '/text-utilities/markdown-editor',
    icon: FileText,
    features: ['Live preview', 'Syntax highlighting', 'Export to HTML/PDF', 'Table support'],
    badge: 'Popular'
  },
  {
    title: 'Text Diff Tool',
    description: 'Compare two texts and highlight differences with side-by-side or unified view',
    href: '/text-utilities/text-diff',
    icon: GitCompare,
    features: ['Side-by-side view', 'Unified diff', 'Word-level diff', 'Export results'],
    badge: 'Essential'
  },
  {
    title: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs with support for various encoding formats',
    href: '/text-utilities/url-encoder',
    icon: LinkIcon,
    features: ['URL encoding', 'Component encoding', 'Batch processing', 'Validation'],
    badge: 'Utility'
  },
  {
    title: 'HTML Encoder/Decoder',
    description: 'Encode and decode HTML entities for safe web content display',
    href: '/text-utilities/html-encoder',
    icon: Code,
    features: ['HTML entities', 'Special characters', 'Batch processing', 'Preview'],
    badge: 'Security'
  },
  {
    title: 'Text Case Converter',
    description: 'Convert text between different cases: uppercase, lowercase, title case, and more',
    href: '/text-utilities/case-converter',
    icon: Type,
    features: ['Multiple cases', 'Bulk conversion', 'Custom rules', 'Copy results'],
    badge: 'Formatting'
  },
  {
    title: 'Text Counter',
    description: 'Count characters, words, paragraphs, and analyze text statistics',
    href: '/text-utilities/text-counter',
    icon: Hash,
    features: ['Character count', 'Word count', 'Reading time', 'Statistics'],
    badge: 'Analysis'
  }
];

const getBadgeVariant = (badge: string) => {
  switch (badge) {
    case 'Popular': return 'default';
    case 'Essential': return 'destructive';
    case 'Security': return 'secondary';
    default: return 'outline';
  }
};

export default function TextUtilitiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                ToolHub
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-500 hover:text-gray-900">
                Home
              </Link>
              <Link href="/calculators" className="text-gray-500 hover:text-gray-900">
                Calculators
              </Link>
              <Link href="/converters" className="text-gray-500 hover:text-gray-900">
                Converters
              </Link>
              <Link href="/text-utilities" className="text-gray-900 font-medium">
                Text Tools
              </Link>
              <Link href="/image-tools" className="text-gray-500 hover:text-gray-900">
                Image Tools
              </Link>
              <Link href="/pdf-tools" className="text-gray-500 hover:text-gray-900">
                PDF Tools
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Text Processing Tools
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comprehensive text utilities for developers, writers, and content creators. Process, analyze, and transform text with our powerful suite of tools.
          </p>
        </div>

        {/* Tools Grid */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {textTools.map((tool, index) => {
              const IconComponent = tool.icon;
              return (
                <Card key={index} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-300">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant={getBadgeVariant(tool.badge)} className="bg-gradient-to-r from-green-400 to-blue-500 text-white border-0">
                        {tool.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        {tool.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Link href={tool.href}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300">
                          Use Tool
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
      </div>

        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Text Tools?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional-grade text processing with advanced features and intuitive interfaces.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Scissors className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Processing</h3>
                <p className="text-gray-600 leading-relaxed">Sophisticated text manipulation tools with precision formatting, encoding, and transformation capabilities</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <GitCompare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Comparison</h3>
                <p className="text-gray-600 leading-relaxed">Intelligent text comparison with visual highlighting and detailed change tracking for better content management</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Results</h3>
                <p className="text-gray-600 leading-relaxed">Real-time processing and live preview capabilities for immediate feedback and seamless workflow</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">Common Use Cases</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Discover how our text utilities can streamline your workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-gray-900 flex items-center">
                    <Code className="h-5 w-5 mr-2 text-blue-600" />
                    For Developers
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">Encode/decode URLs and HTML for web development</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">Compare code changes and configuration files</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">Format and validate text data</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">Generate documentation with Markdown</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    For Content Creators
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">Write and preview Markdown content</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">Analyze text statistics and readability</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">Convert text cases for different formats</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">Compare document versions and revisions</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}