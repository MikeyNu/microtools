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
  ArrowRight
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Text Utilities</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Comprehensive text processing tools for developers, writers, and content creators. 
          Process, analyze, and transform text with our powerful utilities.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {textTools.map((tool, index) => {
          const IconComponent = tool.icon;
          return (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      <Badge variant={getBadgeVariant(tool.badge)} className="mt-1">
                        {tool.badge}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {tool.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Link href={tool.href}>
                    <Button className="w-full group/button">
                      Use Tool
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scissors className="h-5 w-5 text-primary" />
              <span>Text Processing</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Advanced text manipulation tools for formatting, encoding, and transforming content 
              with precision and efficiency.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitCompare className="h-5 w-5 text-primary" />
              <span>Comparison Tools</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Compare and analyze text differences with visual highlighting and 
              detailed change tracking for better content management.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlignLeft className="h-5 w-5 text-primary" />
              <span>Content Creation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create and edit content with markdown support, live preview, 
              and export capabilities for seamless workflow integration.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Use Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Common Use Cases</CardTitle>
          <CardDescription>
            Discover how our text utilities can streamline your workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">For Developers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Encode/decode URLs and HTML for web development</li>
                <li>• Compare code changes and configuration files</li>
                <li>• Format and validate text data</li>
                <li>• Generate documentation with Markdown</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Content Creators</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Write and preview Markdown content</li>
                <li>• Analyze text statistics and readability</li>
                <li>• Convert text cases for different formats</li>
                <li>• Compare document versions and revisions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}