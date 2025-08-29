'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Calculator, Wrench, Type, Palette, Globe, BarChart3, FileText, Image, Code2, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useSearchTracker } from '@/components/analytics-provider';

// Comprehensive tool database for search
const TOOLS_DATABASE = [
  // Calculators
  { id: 'basic-calculator', name: 'Basic Calculator', description: 'Simple arithmetic calculator for everyday calculations', category: 'calculators', href: '/calculators/basic', icon: Calculator, keywords: ['math', 'arithmetic', 'add', 'subtract', 'multiply', 'divide', 'calculator'] },
  { id: 'loan-calculator', name: 'Loan Calculator', description: 'Calculate loan payments and interest rates', category: 'calculators', href: '/calculators/loan', icon: Calculator, keywords: ['loan', 'mortgage', 'payment', 'interest', 'finance', 'money'] },
  { id: 'bmi-calculator', name: 'BMI Calculator', description: 'Calculate your Body Mass Index', category: 'calculators', href: '/calculators/bmi', icon: Calculator, keywords: ['bmi', 'body', 'mass', 'index', 'health', 'weight', 'fitness'] },
  { id: 'percentage-calculator', name: 'Percentage Calculator', description: 'Calculate percentages and percentage changes', category: 'calculators', href: '/calculators/percentage', icon: Calculator, keywords: ['percentage', 'percent', 'ratio', 'proportion', 'math'] },
  { id: 'tip-calculator', name: 'Tip Calculator', description: 'Calculate tips and split bills', category: 'calculators', href: '/calculators/tip', icon: Calculator, keywords: ['tip', 'gratuity', 'bill', 'restaurant', 'service', 'split'] },
  { id: 'mortgage-calculator', name: 'Mortgage Calculator', description: 'Calculate mortgage payments and amortization', category: 'calculators', href: '/calculators/mortgage', icon: Calculator, keywords: ['mortgage', 'home', 'loan', 'payment', 'real estate', 'house'] },
  
  // Converters
  { id: 'length-converter', name: 'Length Converter', description: 'Convert between different length units', category: 'converters', href: '/converters/length', icon: Wrench, keywords: ['length', 'distance', 'meter', 'feet', 'inch', 'kilometer', 'mile', 'convert'] },
  { id: 'weight-converter', name: 'Weight Converter', description: 'Convert between different weight units', category: 'converters', href: '/converters/weight', icon: Wrench, keywords: ['weight', 'mass', 'kilogram', 'pound', 'ounce', 'gram', 'convert'] },
  { id: 'temperature-converter', name: 'Temperature Converter', description: 'Convert between Celsius, Fahrenheit, and Kelvin', category: 'converters', href: '/converters/temperature', icon: Wrench, keywords: ['temperature', 'celsius', 'fahrenheit', 'kelvin', 'convert', 'weather'] },
  { id: 'currency-converter', name: 'Currency Converter', description: 'Convert between different currencies', category: 'converters', href: '/converters/currency', icon: Wrench, keywords: ['currency', 'money', 'exchange', 'rate', 'dollar', 'euro', 'convert'] },
  { id: 'data-converter', name: 'Data Size Converter', description: 'Convert between different data storage units', category: 'converters', href: '/converters/data', icon: Wrench, keywords: ['data', 'storage', 'byte', 'kilobyte', 'megabyte', 'gigabyte', 'convert'] },
  
  // Text Tools
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, and paragraphs', category: 'text-tools', href: '/text-tools/word-counter', icon: Type, keywords: ['word', 'count', 'character', 'paragraph', 'text', 'writing'] },
  { id: 'case-converter', name: 'Case Converter', description: 'Convert text to different cases (UPPERCASE, lowercase, Title Case, etc.)', category: 'text-tools', href: '/text-tools/case-converter', icon: Type, keywords: ['case', 'uppercase', 'lowercase', 'title', 'camel', 'text', 'convert'] },
  { id: 'text-formatter', name: 'Text Formatter', description: 'Format and clean up text', category: 'text-tools', href: '/text-tools/formatter', icon: Type, keywords: ['format', 'clean', 'text', 'whitespace', 'trim', 'normalize'] },
  { id: 'markdown-converter', name: 'Markdown Converter', description: 'Convert Markdown to HTML and vice versa', category: 'text-tools', href: '/text-tools/markdown', icon: Type, keywords: ['markdown', 'html', 'convert', 'format', 'documentation'] },
  { id: 'lorem-generator', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text for design and development', category: 'text-tools', href: '/text-tools/lorem', icon: Type, keywords: ['lorem', 'ipsum', 'placeholder', 'text', 'dummy', 'generate'] },
  { id: 'markdown-editor', name: 'Markdown Editor', description: 'Rich markdown editor with live preview, syntax highlighting, and export options', category: 'text-tools', href: '/text-utilities/markdown-editor', icon: Type, keywords: ['markdown', 'editor', 'preview', 'syntax', 'export'] },
  { id: 'text-diff', name: 'Text Diff Tool', description: 'Compare two texts side-by-side with detailed diff analysis', category: 'text-tools', href: '/text-utilities/text-diff', icon: Type, keywords: ['diff', 'compare', 'text', 'analysis', 'git'] },
  { id: 'url-encoder', name: 'URL Encoder/Decoder', description: 'Encode and decode URLs with support for different encoding types', category: 'text-tools', href: '/text-utilities/url-encoder', icon: Type, keywords: ['url', 'encode', 'decode', 'web', 'percent-encoding'] },
  { id: 'html-encoder', name: 'HTML Encoder/Decoder', description: 'Encode and decode HTML entities with support for named, decimal, and hex formats', category: 'text-tools', href: '/text-utilities/html-encoder', icon: Type, keywords: ['html', 'encode', 'decode', 'entities', 'web'] },
  
  // Design Tools
  { id: 'color-picker', name: 'Color Picker', description: 'Advanced color picker with format conversion and harmony generation', category: 'design-tools', href: '/design-tools/color-picker', icon: Palette, keywords: ['color', 'picker', 'hex', 'rgb', 'hsl', 'harmony', 'palette'] },
  { id: 'gradient-generator', name: 'Gradient Generator', description: 'Create beautiful CSS gradients with live preview and code generation', category: 'design-tools', href: '/design-tools/gradient-generator', icon: Palette, keywords: ['gradient', 'css', 'linear', 'radial', 'conic', 'background'] },
  { id: 'palette-generator', name: 'Color Palette Generator', description: 'Generate harmonious color palettes using color theory principles', category: 'design-tools', href: '/design-tools/palette-generator', icon: Palette, keywords: ['palette', 'color', 'harmony', 'monochromatic', 'analogous', 'complementary', 'triadic'] },
  { id: 'qr-generator', name: 'QR Code Generator', description: 'Generate customizable QR codes for URLs, text, and more with logo embedding', category: 'design-tools', href: '/design-tools/qr-generator', icon: QrCode, keywords: ['qr', 'code', 'generator', 'url', 'text', 'logo', 'barcode'] },
  { id: 'favicon-generator', name: 'Favicon Generator', description: 'Create favicons and app icons from images or text in multiple formats', category: 'design-tools', href: '/design-tools/favicon-generator', icon: Image, keywords: ['favicon', 'icon', 'app', 'ico', 'png', 'browser', 'website'] },

  // Timestamp Tools
  { id: 'unix-converter', name: 'Unix Timestamp Converter', description: 'Convert between Unix timestamps and human-readable dates', category: 'timestamp-tools', href: '/timestamp-tools/unix-converter', icon: Globe, keywords: ['unix', 'timestamp', 'epoch', 'date', 'time', 'converter'] },
  { id: 'timezone-converter', name: 'Timezone Converter', description: 'Convert time between different timezones with world clock', category: 'timestamp-tools', href: '/timestamp-tools/timezone-converter', icon: Globe, keywords: ['timezone', 'time', 'world', 'clock', 'utc', 'dst'] },
  { id: 'epoch-converter', name: 'Epoch Time Converter', description: 'Convert epoch timestamps with support for various precisions', category: 'timestamp-tools', href: '/timestamp-tools/epoch-converter', icon: Globe, keywords: ['epoch', 'timestamp', 'milliseconds', 'microseconds', 'nanoseconds'] },

  // Design Tools
  { id: 'shadow-generator', name: 'Box Shadow Generator', description: 'Generate CSS box shadows', category: 'design-tools', href: '/design-tools/shadow', icon: Palette, keywords: ['shadow', 'box', 'css', 'design', 'effect'] },
  { id: 'border-radius', name: 'Border Radius Generator', description: 'Generate CSS border radius', category: 'design-tools', href: '/design-tools/border-radius', icon: Palette, keywords: ['border', 'radius', 'css', 'rounded', 'corner', 'design'] },
  { id: 'image-resizer', name: 'Image Resizer', description: 'Resize images online', category: 'design-tools', href: '/design-tools/image-resizer', icon: Palette, keywords: ['image', 'resize', 'scale', 'photo', 'picture', 'compress'] },
  
  // Web Tools
  { id: 'url-shortener', name: 'URL Shortener', description: 'Shorten long URLs', category: 'web-tools', href: '/web-tools/url-shortener', icon: Globe, keywords: ['url', 'shorten', 'link', 'short', 'redirect'] },
  { id: 'qr-generator', name: 'QR Code Generator', description: 'Generate QR codes for text and URLs', category: 'web-tools', href: '/web-tools/qr-generator', icon: Globe, keywords: ['qr', 'code', 'generate', 'barcode', 'scan'] },
  { id: 'base64-encoder', name: 'Base64 Encoder/Decoder', description: 'Encode and decode Base64 strings', category: 'web-tools', href: '/web-tools/base64', icon: Globe, keywords: ['base64', 'encode', 'decode', 'string', 'convert'] },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format and validate JSON', category: 'web-tools', href: '/web-tools/json-formatter', icon: Globe, keywords: ['json', 'format', 'validate', 'pretty', 'minify'] },
  { id: 'html-encoder', name: 'HTML Encoder/Decoder', description: 'Encode and decode HTML entities', category: 'web-tools', href: '/web-tools/html-encoder', icon: Globe, keywords: ['html', 'encode', 'decode', 'entities', 'escape'] },
  
  // SEO Tools
  { id: 'meta-generator', name: 'Meta Tag Generator', description: 'Generate HTML meta tags', category: 'seo-tools', href: '/seo-tools/meta-generator', icon: BarChart3, keywords: ['meta', 'tags', 'seo', 'html', 'description', 'keywords'] },
  { id: 'keyword-density', name: 'Keyword Density Checker', description: 'Check keyword density in text', category: 'seo-tools', href: '/seo-tools/keyword-density', icon: BarChart3, keywords: ['keyword', 'density', 'seo', 'analysis', 'text'] },
  { id: 'robots-generator', name: 'Robots.txt Generator', description: 'Generate robots.txt file', category: 'seo-tools', href: '/seo-tools/robots', icon: BarChart3, keywords: ['robots', 'txt', 'seo', 'crawl', 'search', 'engine'] },
  { id: 'sitemap-generator', name: 'Sitemap Generator', description: 'Generate XML sitemaps', category: 'seo-tools', href: '/seo-tools/sitemap', icon: BarChart3, keywords: ['sitemap', 'xml', 'seo', 'search', 'engine'] },
  { id: 'open-graph', name: 'Open Graph Generator', description: 'Generate Open Graph meta tags', category: 'seo-tools', href: '/seo-tools/open-graph', icon: BarChart3, keywords: ['open', 'graph', 'meta', 'social', 'facebook', 'twitter'] },

  // PDF Tools
  { id: 'pdf-compressor', name: 'PDF Compressor', description: 'Compress PDF files to reduce file size', category: 'pdf-tools', href: '/pdf-tools/compress', icon: FileText, keywords: ['pdf', 'compress', 'reduce', 'size', 'file', 'document'] },
  { id: 'pdf-to-word', name: 'PDF to Word Converter', description: 'Convert PDF files to Word documents', category: 'pdf-tools', href: '/pdf-tools/pdf-to-word', icon: FileText, keywords: ['pdf', 'word', 'convert', 'document', 'docx', 'file'] },
  { id: 'pdf-merger', name: 'PDF Merger', description: 'Merge multiple PDF files into one', category: 'pdf-tools', href: '/pdf-tools/merge', icon: FileText, keywords: ['pdf', 'merge', 'combine', 'join', 'document', 'file'] },
  { id: 'pdf-splitter', name: 'PDF Splitter', description: 'Split PDF files into separate pages', category: 'pdf-tools', href: '/pdf-tools/split', icon: FileText, keywords: ['pdf', 'split', 'separate', 'pages', 'document', 'file'] },

  // Image Tools
  { id: 'image-compressor', name: 'Image Compressor', description: 'Compress images to reduce file size', category: 'image-tools', href: '/image-tools/compress', icon: Image, keywords: ['image', 'compress', 'reduce', 'size', 'photo', 'picture', 'optimize'] },
  { id: 'image-resizer-tool', name: 'Image Resizer', description: 'Resize images to specific dimensions', category: 'image-tools', href: '/image-tools/resize', icon: Image, keywords: ['image', 'resize', 'dimensions', 'scale', 'photo', 'picture'] },
  { id: 'webp-converter', name: 'WebP Converter', description: 'Convert images to WebP format', category: 'image-tools', href: '/image-tools/webp-converter', icon: Image, keywords: ['webp', 'convert', 'image', 'format', 'photo', 'picture'] },
  { id: 'image-format-converter', name: 'Image Format Converter', description: 'Convert between different image formats', category: 'image-tools', href: '/image-tools/format-converter', icon: Image, keywords: ['image', 'format', 'convert', 'jpg', 'png', 'gif', 'photo'] },

  // Developer Tools
  { id: 'json-formatter-validator', name: 'JSON Formatter & Validator', description: 'Format, validate, and beautify JSON data', category: 'developer-tools', href: '/developer-tools/json-formatter', icon: Code2, keywords: ['json', 'format', 'validate', 'beautify', 'developer', 'api'] },
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test and debug regular expressions', category: 'developer-tools', href: '/developer-tools/regex-tester', icon: Code2, keywords: ['regex', 'regular', 'expression', 'test', 'pattern', 'developer'] },
  { id: 'base64-encoder-decoder', name: 'Base64 Encoder/Decoder', description: 'Encode and decode Base64 strings and files', category: 'developer-tools', href: '/developer-tools/base64', icon: Code2, keywords: ['base64', 'encode', 'decode', 'string', 'file', 'developer'] },
  { id: 'hash-generator', name: 'Hash Generator', description: 'Generate MD5, SHA256, and other hash values', category: 'developer-tools', href: '/developer-tools/hash-generator', icon: Code2, keywords: ['hash', 'md5', 'sha256', 'checksum', 'crypto', 'developer'] },

  // Data Tools
  { id: 'csv-to-json', name: 'CSV to JSON Converter', description: 'Convert CSV files to JSON format with customizable options', category: 'data-tools', href: '/data-tools/csv-to-json', icon: Code2, keywords: ['csv', 'json', 'convert', 'data', 'format', 'transform'] },
  { id: 'json-formatter-data', name: 'JSON Formatter', description: 'Format, validate, and beautify JSON data with syntax highlighting', category: 'data-tools', href: '/data-tools/json-formatter', icon: Code2, keywords: ['json', 'format', 'validate', 'beautify', 'syntax', 'data'] },
  { id: 'yaml-converter', name: 'YAML Converter', description: 'Convert between YAML and JSON formats with validation', category: 'data-tools', href: '/data-tools/yaml-converter', icon: Code2, keywords: ['yaml', 'json', 'convert', 'format', 'data', 'config'] },

  // Security Tools
  { id: 'password-checker', name: 'Password Strength Checker', description: 'Check password strength and generate secure passwords', category: 'security-tools', href: '/security-tools/password-checker', icon: Globe, keywords: ['password', 'strength', 'security', 'generator', 'check', 'safe'] },
  { id: '2fa-generator', name: 'Two-Factor Authentication Generator', description: 'Generate TOTP codes and manage 2FA accounts', category: 'security-tools', href: '/security-tools/2fa-generator', icon: Globe, keywords: ['2fa', 'totp', 'authentication', 'security', 'otp', 'generator'] },
  { id: 'ssl-checker', name: 'SSL Certificate Checker', description: 'Check SSL certificate details and security information', category: 'security-tools', href: '/security-tools/ssl-checker', icon: Globe, keywords: ['ssl', 'certificate', 'security', 'https', 'check', 'tls'] },
  { id: 'hash-generator-security', name: 'Hash Generator', description: 'Generate various hash types including MD5, SHA256, SHA512', category: 'security-tools', href: '/security-tools/hash-generator', icon: Globe, keywords: ['hash', 'md5', 'sha256', 'sha512', 'checksum', 'crypto'] },

  // Math Tools
  { id: 'scientific-calculator', name: 'Scientific Calculator', description: 'Advanced calculator with scientific functions and constants', category: 'math-tools', href: '/math-tools/scientific-calculator', icon: Calculator, keywords: ['scientific', 'calculator', 'math', 'trigonometry', 'logarithm', 'advanced'] },
  { id: 'equation-solver', name: 'Equation Solver', description: 'Solve linear, quadratic equations and systems with step-by-step solutions', category: 'math-tools', href: '/math-tools/equation-solver', icon: Calculator, keywords: ['equation', 'solver', 'linear', 'quadratic', 'math', 'algebra'] },
  { id: 'matrix-calculator', name: 'Matrix Calculator', description: 'Perform matrix operations including multiplication, determinant, inverse', category: 'math-tools', href: '/math-tools/matrix-calculator', icon: Calculator, keywords: ['matrix', 'calculator', 'linear', 'algebra', 'determinant', 'inverse'] },
  { id: 'statistics-calculator', name: 'Statistics Calculator', description: 'Calculate descriptive statistics, regression analysis, and confidence intervals', category: 'math-tools', href: '/math-tools/statistics-calculator', icon: BarChart3, keywords: ['statistics', 'mean', 'median', 'regression', 'analysis', 'data'] },
  { id: 'graphing-calculator', name: 'Graphing Calculator', description: 'Plot mathematical functions with interactive graphing capabilities', category: 'math-tools', href: '/math-tools/graphing-calculator', icon: BarChart3, keywords: ['graphing', 'plot', 'function', 'math', 'chart', 'visualization'] },
  { id: 'unit-converter-math', name: 'Unit Converter', description: 'Convert between various units including length, weight, temperature, and more', category: 'math-tools', href: '/math-tools/unit-converter', icon: Wrench, keywords: ['unit', 'convert', 'measurement', 'length', 'weight', 'temperature'] },

  // Crypto Tools
  { id: 'bitcoin-validator', name: 'Bitcoin Address Validator', description: 'Validate Bitcoin addresses and check address format', category: 'crypto-tools', href: '/crypto-tools/bitcoin-validator', icon: Globe, keywords: ['bitcoin', 'address', 'validate', 'crypto', 'blockchain', 'btc'] },
  { id: 'crypto-price-converter', name: 'Crypto Price Converter', description: 'Convert between cryptocurrencies and fiat currencies with live rates', category: 'crypto-tools', href: '/crypto-tools/price-converter', icon: Globe, keywords: ['crypto', 'price', 'convert', 'bitcoin', 'ethereum', 'currency'] },

  // Network Tools
  { id: 'ip-lookup', name: 'IP Address Lookup', description: 'Get detailed information about IP addresses including geolocation', category: 'network-tools', href: '/network-tools/ip-lookup', icon: Globe, keywords: ['ip', 'address', 'lookup', 'geolocation', 'network', 'internet'] },
  { id: 'dns-lookup', name: 'DNS Lookup', description: 'Perform DNS lookups and check various DNS records', category: 'network-tools', href: '/network-tools/dns-lookup', icon: Globe, keywords: ['dns', 'lookup', 'domain', 'records', 'network', 'server'] },
  { id: 'port-scanner', name: 'Port Scanner', description: 'Scan network ports and check port availability', category: 'network-tools', href: '/network-tools/port-scanner', icon: Globe, keywords: ['port', 'scanner', 'network', 'tcp', 'udp', 'security'] },

  // Finance Tools
  { id: 'compound-interest', name: 'Compound Interest Calculator', description: 'Calculate compound interest with various compounding frequencies', category: 'finance-tools', href: '/finance-tools/compound-interest', icon: Calculator, keywords: ['compound', 'interest', 'investment', 'finance', 'savings', 'money'] },
  { id: 'investment-return', name: 'Investment Return Calculator', description: 'Calculate investment returns and analyze portfolio performance', category: 'finance-tools', href: '/finance-tools/investment-return', icon: Calculator, keywords: ['investment', 'return', 'portfolio', 'finance', 'roi', 'profit'] },
  { id: 'currency-converter-finance', name: 'Currency Converter', description: 'Convert between different currencies with live exchange rates', category: 'finance-tools', href: '/finance-tools/currency-converter', icon: Calculator, keywords: ['currency', 'exchange', 'rate', 'convert', 'money', 'forex'] }
];

const CATEGORY_ICONS = {
  calculators: Calculator,
  converters: Wrench,
  'text-tools': Type,
  'timestamp-tools': Globe,
  'design-tools': Palette,
  'web-tools': Globe,
  'seo-tools': BarChart3,
  'pdf-tools': FileText,
  'image-tools': Image,
  'developer-tools': Code2,
  'data-tools': Code2,
  'security-tools': Globe,
  'math-tools': Calculator,
  'crypto-tools': Globe,
  'network-tools': Globe,
  'finance-tools': Calculator
};

const CATEGORY_COLORS = {
  calculators: 'bg-blue-100 text-blue-800',
  converters: 'bg-green-100 text-green-800',
  'text-tools': 'bg-purple-100 text-purple-800',
  'timestamp-tools': 'bg-yellow-100 text-yellow-800',
  'design-tools': 'bg-pink-100 text-pink-800',
  'web-tools': 'bg-orange-100 text-orange-800',
  'seo-tools': 'bg-red-100 text-red-800',
  'pdf-tools': 'bg-indigo-100 text-indigo-800',
  'image-tools': 'bg-cyan-100 text-cyan-800',
  'developer-tools': 'bg-gray-100 text-gray-800',
  'data-tools': 'bg-emerald-100 text-emerald-800',
  'security-tools': 'bg-rose-100 text-rose-800',
  'math-tools': 'bg-violet-100 text-violet-800',
  'crypto-tools': 'bg-amber-100 text-amber-800',
  'network-tools': 'bg-teal-100 text-teal-800',
  'finance-tools': 'bg-lime-100 text-lime-800'
};

// Search Component
interface SearchComponentRef {
  setQuery: (query: string) => void;
}

export const SearchComponent = React.forwardRef<SearchComponentRef, { className?: string }>(({ className }, ref) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  React.useImperativeHandle(ref, () => ({
    setQuery: handleQueryChange
  }));
  const { trackSearch } = useSearchTracker();

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const lowercaseQuery = query.toLowerCase();
    const results = TOOLS_DATABASE.filter(tool => {
      return (
        tool.name.toLowerCase().includes(lowercaseQuery) ||
        tool.description.toLowerCase().includes(lowercaseQuery) ||
        tool.keywords.some(keyword => keyword.includes(lowercaseQuery)) ||
        tool.category.replace('-', ' ').includes(lowercaseQuery)
      );
    });

    // Sort by relevance
    return results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(lowercaseQuery);
      const bNameMatch = b.name.toLowerCase().includes(lowercaseQuery);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return a.name.localeCompare(b.name);
    }).slice(0, 8); // Limit to 8 results
  }, [query]);

  useEffect(() => {
    if (query.trim() && searchResults.length > 0) {
      trackSearch(query, searchResults.length);
    }
  }, [query, searchResults.length, trackSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          window.location.href = searchResults[selectedIndex].href;
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search tools..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl z-50 max-h-[500px] overflow-y-auto before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/10 before:to-transparent before:pointer-events-none">
          {searchResults.length > 0 ? (
            <div className="p-4">
              <div className="text-xs text-muted-foreground mb-4 px-2">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map((tool, index) => {
                  const IconComponent = tool.icon;
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <Link
                      key={tool.id}
                      href={tool.href}
                      className={`block p-4 rounded-lg transition-all duration-200 ${
                        isSelected ? 'bg-white/30 dark:bg-gray-800/40 shadow-lg backdrop-blur-sm' : 'hover:bg-white/20 dark:hover:bg-gray-800/30 hover:shadow-md hover:backdrop-blur-sm'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg shadow-sm backdrop-blur-sm flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-primary drop-shadow-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-sm truncate">{tool.name}</h4>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${CATEGORY_COLORS[tool.category as keyof typeof CATEGORY_COLORS]}`}
                            >
                              {tool.category.replace('-', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              <div className="p-3 bg-gradient-to-br from-gray-100/50 to-gray-200/30 dark:from-gray-800/50 dark:to-gray-700/30 rounded-full w-fit mx-auto mb-3 backdrop-blur-sm">
                <Search className="h-8 w-8 opacity-60" />
              </div>
              <p className="text-sm font-medium">No tools found for "{query}"</p>
              <p className="text-xs mt-1 opacity-75">Try searching for calculators, converters, or text tools</p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close search */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
});

// Popular Searches Component
export function PopularSearches({ onSearchSelect }: { onSearchSelect?: (query: string) => void }) {
  const popularQueries = [
    'calculator', 'converter', 'color picker', 'word counter', 
    'qr generator', 'json formatter', 'percentage', 'bmi'
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <span className="text-sm text-muted-foreground">Popular:</span>
      {popularQueries.map((query) => (
        <Badge 
          key={query} 
          variant="outline" 
          className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-xs"
          onClick={() => {
            if (onSearchSelect) {
              onSearchSelect(query);
            }
          }}
        >
          {query}
        </Badge>
      ))}
    </div>
  );
}

// Search Stats Component (for admin/analytics)
export function SearchStats() {
  // This would typically fetch real search analytics data
  const stats = {
    totalSearches: 1250,
    topQueries: [
      { query: 'calculator', count: 156 },
      { query: 'color picker', count: 89 },
      { query: 'converter', count: 67 },
      { query: 'word counter', count: 45 },
      { query: 'qr code', count: 34 }
    ],
    noResultsQueries: [
      { query: 'advanced calculator', count: 12 },
      { query: 'pdf converter', count: 8 },
      { query: 'image editor', count: 6 }
    ]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Analytics</CardTitle>
        <CardDescription>Search performance and user behavior</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Total Searches: {stats.totalSearches}</h4>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Top Search Queries</h4>
            <div className="space-y-1">
              {stats.topQueries.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.query}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">No Results Queries</h4>
            <div className="space-y-1">
              {stats.noResultsQueries.map((item, index) => (
                <div key={index} className="flex justify-between text-sm text-orange-600">
                  <span>{item.query}</span>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}