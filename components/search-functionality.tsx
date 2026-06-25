'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, X, Calculator, Wrench, Type, Palette, Globe,
  BarChart3, FileText, Image, Code2, QrCode,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchTracker } from '@/components/analytics-provider';
import { VictorianGlyph } from '@/components/victorian-glyph';

const TOOLS_DATABASE = [
  // Calculators
  { id: 'basic-calculator', name: 'Basic Calculator', description: 'Simple arithmetic calculator for everyday calculations', category: 'Calculators', href: '/calculators/basic', icon: Calculator, keywords: ['math', 'arithmetic', 'add', 'subtract', 'multiply', 'divide'] },
  { id: 'loan-calculator', name: 'Loan Calculator', description: 'Calculate loan payments and interest rates', category: 'Calculators', href: '/calculators/loan', icon: Calculator, keywords: ['loan', 'mortgage', 'payment', 'interest', 'finance'] },
  { id: 'bmi-calculator', name: 'BMI Calculator', description: 'Calculate your Body Mass Index', category: 'Calculators', href: '/calculators/bmi', icon: Calculator, keywords: ['bmi', 'body', 'mass', 'index', 'health', 'weight'] },
  { id: 'percentage-calculator', name: 'Percentage Calculator', description: 'Calculate percentages and percentage changes', category: 'Calculators', href: '/calculators/percentage', icon: Calculator, keywords: ['percentage', 'percent', 'ratio'] },
  { id: 'tip-calculator', name: 'Tip Calculator', description: 'Calculate tips and split bills', category: 'Calculators', href: '/calculators/tip', icon: Calculator, keywords: ['tip', 'bill', 'restaurant', 'split'] },
  { id: 'mortgage-calculator', name: 'Mortgage Calculator', description: 'Calculate mortgage payments and amortization', category: 'Calculators', href: '/calculators/mortgage', icon: Calculator, keywords: ['mortgage', 'home', 'loan', 'payment'] },
  { id: 'age-calculator', name: 'Age Calculator', description: 'Calculate exact age in years, months, and days', category: 'Calculators', href: '/calculators/age', icon: Calculator, keywords: ['age', 'birthday', 'born', 'years'] },
  { id: 'date-calculator', name: 'Date Calculator', description: 'Calculate differences between dates', category: 'Calculators', href: '/calculators/date', icon: Calculator, keywords: ['date', 'difference', 'days', 'calendar'] },
  // Converters
  { id: 'temperature-converter', name: 'Temperature Converter', description: 'Convert between Celsius, Fahrenheit, and Kelvin', category: 'Converters', href: '/converters/temperature', icon: Wrench, keywords: ['temperature', 'celsius', 'fahrenheit', 'kelvin'] },
  { id: 'currency-converter', name: 'Currency Converter', description: 'Convert between different currencies', category: 'Converters', href: '/converters/currency', icon: Wrench, keywords: ['currency', 'money', 'exchange', 'rate'] },
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert between different units of measurement', category: 'Converters', href: '/converters/unit', icon: Wrench, keywords: ['unit', 'length', 'weight', 'volume', 'convert'] },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB, HSL and other color formats', category: 'Converters', href: '/converters/color', icon: Wrench, keywords: ['color', 'hex', 'rgb', 'hsl', 'convert'] },
  { id: 'binary-converter', name: 'Binary Converter', description: 'Convert text, decimal, and hex to binary', category: 'Converters', href: '/converters/binary', icon: Wrench, keywords: ['binary', 'decimal', 'hex', 'convert'] },
  { id: 'hex-converter', name: 'Hex Converter', description: 'Convert hexadecimal, decimal, binary, and UTF-8 text', category: 'Converters', href: '/converters/hex', icon: Wrench, keywords: ['hex', 'hexadecimal', 'decimal', 'binary', 'utf-8', 'convert'] },
  { id: 'file-size-converter', name: 'File Size Converter', description: 'Convert between bytes, KB, MB, GB', category: 'Converters', href: '/converters/file-size', icon: Wrench, keywords: ['file', 'size', 'bytes', 'kilobyte', 'megabyte', 'gigabyte'] },
  // Text Tools
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, and paragraphs', category: 'Text Tools', href: '/text-tools/word-counter', icon: Type, keywords: ['word', 'count', 'character', 'paragraph'] },
  { id: 'case-converter', name: 'Case Converter', description: 'Convert text between different cases', category: 'Text Tools', href: '/text-tools/case-converter', icon: Type, keywords: ['case', 'uppercase', 'lowercase', 'title'] },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text', category: 'Text Tools', href: '/text-tools/lorem-ipsum', icon: Type, keywords: ['lorem', 'ipsum', 'placeholder', 'dummy'] },
  { id: 'password-generator', name: 'Password Generator', description: 'Generate secure, random passwords', category: 'Text Tools', href: '/text-tools/password-generator', icon: Type, keywords: ['password', 'generate', 'random', 'secure'] },
  { id: 'text-reverser', name: 'Text Reverser', description: 'Reverse text, words, or sentences', category: 'Text Tools', href: '/text-tools/text-reverser', icon: Type, keywords: ['reverse', 'text', 'mirror'] },
  { id: 'hash-generator-text', name: 'Hash Generator', description: 'Generate MD5, SHA256, and other hashes', category: 'Text Tools', href: '/text-tools/hash-generator', icon: Type, keywords: ['hash', 'md5', 'sha256', 'checksum'] },
  // Text Utilities
  { id: 'markdown-editor', name: 'Markdown Editor', description: 'Rich markdown editor with live preview', category: 'Text Utilities', href: '/text-utilities/markdown-editor', icon: Type, keywords: ['markdown', 'editor', 'preview'] },
  { id: 'text-diff', name: 'Text Diff Tool', description: 'Compare two texts side by side', category: 'Text Utilities', href: '/text-utilities/text-diff', icon: Type, keywords: ['diff', 'compare', 'text'] },
  { id: 'url-encoder', name: 'URL Encoder/Decoder', description: 'Encode and decode URLs', category: 'Text Utilities', href: '/text-utilities/url-encoder', icon: Type, keywords: ['url', 'encode', 'decode', 'percent'] },
  { id: 'html-encoder', name: 'HTML Encoder/Decoder', description: 'Encode and decode HTML entities', category: 'Text Utilities', href: '/text-utilities/html-encoder', icon: Type, keywords: ['html', 'encode', 'decode', 'entities'] },
  // Developer Tools
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, and beautify JSON', category: 'Developer Tools', href: '/developer-tools/json-formatter', icon: Code2, keywords: ['json', 'format', 'validate', 'beautify'] },
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test and debug regular expressions', category: 'Developer Tools', href: '/developer-tools/regex-tester', icon: Code2, keywords: ['regex', 'regular', 'expression', 'test', 'pattern'] },
  { id: 'base64', name: 'Base64 Encoder/Decoder', description: 'Encode and decode Base64 strings', category: 'Developer Tools', href: '/developer-tools/base64', icon: Code2, keywords: ['base64', 'encode', 'decode'] },
  { id: 'hash-generator-dev', name: 'Hash Generator', description: 'Generate MD5, SHA256, and other hashes', category: 'Developer Tools', href: '/developer-tools/hash-generator', icon: Code2, keywords: ['hash', 'md5', 'sha256', 'crypto'] },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens', category: 'Developer Tools', href: '/developer-tools/jwt-decoder', icon: Code2, keywords: ['jwt', 'token', 'decode', 'auth'] },
  { id: 'css-minifier', name: 'CSS Minifier', description: 'Minify and beautify CSS code', category: 'Developer Tools', href: '/developer-tools/css-minifier', icon: Code2, keywords: ['css', 'minify', 'minifier', 'compress'] },
  // Design Tools
  { id: 'color-picker', name: 'Color Picker', description: 'Advanced color picker with format conversion', category: 'Design Tools', href: '/design-tools/color-picker', icon: Palette, keywords: ['color', 'picker', 'hex', 'rgb', 'hsl'] },
  { id: 'gradient-generator', name: 'Gradient Generator', description: 'Create CSS gradients with live preview', category: 'Design Tools', href: '/design-tools/gradient-generator', icon: Palette, keywords: ['gradient', 'css', 'linear', 'radial'] },
  { id: 'palette-generator', name: 'Color Palette Generator', description: 'Generate harmonious color palettes', category: 'Design Tools', href: '/design-tools/palette-generator', icon: Palette, keywords: ['palette', 'color', 'harmony', 'complementary'] },
  // Web Tools
  { id: 'qr-generator', name: 'QR Code Generator', description: 'Generate QR codes for URLs and text', category: 'Web Tools', href: '/web-tools/qr-generator', icon: QrCode, keywords: ['qr', 'code', 'generator', 'url', 'barcode'] },
  { id: 'url-shortener', name: 'URL Shortener', description: 'Shorten long URLs', category: 'Web Tools', href: '/web-tools/url-shortener', icon: Globe, keywords: ['url', 'shorten', 'link', 'short'] },
  { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate universally unique identifiers', category: 'Web Tools', href: '/web-tools/uuid-generator', icon: Globe, keywords: ['uuid', 'guid', 'unique', 'identifier'] },
  { id: 'base64-web', name: 'Base64 Encoder', description: 'Encode and decode Base64 strings', category: 'Web Tools', href: '/web-tools/base64', icon: Globe, keywords: ['base64', 'encode', 'decode'] },
  { id: 'json-formatter-web', name: 'JSON Formatter', description: 'Format and validate JSON data', category: 'Web Tools', href: '/web-tools/json-formatter', icon: Globe, keywords: ['json', 'format', 'validate'] },
  // SEO Tools
  { id: 'meta-generator', name: 'Meta Tag Generator', description: 'Generate HTML meta tags for SEO', category: 'SEO Tools', href: '/seo-tools/meta-generator', icon: BarChart3, keywords: ['meta', 'tags', 'seo', 'html'] },
  { id: 'keyword-density', name: 'Keyword Density Checker', description: 'Analyze keyword density in text', category: 'SEO Tools', href: '/seo-tools/keyword-density', icon: BarChart3, keywords: ['keyword', 'density', 'seo'] },
  { id: 'robots-generator', name: 'Robots.txt Generator', description: 'Generate robots.txt files', category: 'SEO Tools', href: '/seo-tools/robots-generator', icon: BarChart3, keywords: ['robots', 'txt', 'seo', 'crawl'] },
  { id: 'open-graph', name: 'Open Graph Generator', description: 'Generate Open Graph meta tags', category: 'SEO Tools', href: '/seo-tools/open-graph', icon: BarChart3, keywords: ['open', 'graph', 'meta', 'social'] },
  { id: 'schema-generator', name: 'Schema Markup Generator', description: 'Generate structured data markup', category: 'SEO Tools', href: '/seo-tools/schema-generator', icon: BarChart3, keywords: ['schema', 'structured', 'data', 'seo'] },
  // Timestamp Tools
  { id: 'unix-converter', name: 'Unix Timestamp Converter', description: 'Convert Unix timestamps to readable dates', category: 'Timestamp Tools', href: '/timestamp-tools/unix-converter', icon: Globe, keywords: ['unix', 'timestamp', 'epoch', 'date', 'time'] },
  { id: 'timezone-converter', name: 'Timezone Converter', description: 'Convert time between timezones', category: 'Timestamp Tools', href: '/timestamp-tools/timezone-converter', icon: Globe, keywords: ['timezone', 'time', 'world', 'utc'] },
  { id: 'epoch-converter', name: 'Epoch Time Converter', description: 'Convert epoch timestamps', category: 'Timestamp Tools', href: '/timestamp-tools/epoch-converter', icon: Globe, keywords: ['epoch', 'timestamp', 'milliseconds'] },
  // Image Tools
  { id: 'image-compressor', name: 'Image Compressor', description: 'Compress images to reduce file size', category: 'Image Tools', href: '/image-tools/compress', icon: Image, keywords: ['image', 'compress', 'reduce', 'size'] },
  { id: 'image-resizer', name: 'Image Resizer', description: 'Resize images to specific dimensions', category: 'Image Tools', href: '/image-tools/resize', icon: Image, keywords: ['image', 'resize', 'dimensions', 'scale'] },
  { id: 'webp-converter', name: 'WebP Converter', description: 'Convert images to WebP format', category: 'Image Tools', href: '/image-tools/webp-converter', icon: Image, keywords: ['webp', 'convert', 'image', 'format'] },
  { id: 'image-format-converter', name: 'Image Format Converter', description: 'Convert between image formats', category: 'Image Tools', href: '/image-tools/format-converter', icon: Image, keywords: ['image', 'format', 'convert', 'jpg', 'png'] },
  // PDF Tools
  { id: 'pdf-compressor', name: 'PDF Compressor', description: 'Compress PDF files', category: 'PDF Tools', href: '/pdf-tools/compress', icon: FileText, keywords: ['pdf', 'compress', 'reduce', 'file'] },
  { id: 'pdf-to-word', name: 'PDF to Word', description: 'Convert PDF to Word documents', category: 'PDF Tools', href: '/pdf-tools/pdf-to-word', icon: FileText, keywords: ['pdf', 'word', 'convert', 'docx'] },
  // Data Tools
  { id: 'csv-to-json', name: 'CSV to JSON', description: 'Convert CSV files to JSON format', category: 'Data Tools', href: '/data-tools/csv-to-json', icon: Code2, keywords: ['csv', 'json', 'convert', 'data'] },
  { id: 'json-formatter-data', name: 'JSON Formatter', description: 'Format and beautify JSON data', category: 'Data Tools', href: '/data-tools/json-formatter', icon: Code2, keywords: ['json', 'format', 'data'] },
  { id: 'yaml-converter', name: 'YAML Converter', description: 'Convert between YAML and JSON', category: 'Data Tools', href: '/data-tools/yaml-converter', icon: Code2, keywords: ['yaml', 'json', 'convert'] },
  // Security Tools
  { id: 'password-checker', name: 'Password Strength Checker', description: 'Check password strength', category: 'Security Tools', href: '/security-tools/password-checker', icon: Globe, keywords: ['password', 'strength', 'security', 'check'] },
  { id: 'security-password-generator', name: 'Password Generator', description: 'Generate high-entropy passwords locally', category: 'Security Tools', href: '/security-tools/password-generator', icon: Globe, keywords: ['password', 'generator', 'secure', 'random', 'entropy'] },
  { id: '2fa-generator', name: '2FA Generator', description: 'Generate TOTP codes for two-factor auth', category: 'Security Tools', href: '/security-tools/2fa-generator', icon: Globe, keywords: ['2fa', 'totp', 'authentication', 'otp'] },
  { id: 'ssl-checker', name: 'SSL Certificate Checker', description: 'Check SSL certificate details', category: 'Security Tools', href: '/security-tools/ssl-checker', icon: Globe, keywords: ['ssl', 'certificate', 'https', 'tls'] },
  { id: 'hash-generator-sec', name: 'Hash Generator', description: 'Generate MD5, SHA256, SHA512 hashes', category: 'Security Tools', href: '/security-tools/hash-generator', icon: Globe, keywords: ['hash', 'md5', 'sha256', 'sha512'] },
  // Math Tools
  { id: 'scientific-calculator', name: 'Scientific Calculator', description: 'Advanced calculator with scientific functions', category: 'Math Tools', href: '/math-tools/scientific-calculator', icon: Calculator, keywords: ['scientific', 'calculator', 'math', 'trigonometry'] },
  { id: 'equation-solver', name: 'Equation Solver', description: 'Solve linear and quadratic equations', category: 'Math Tools', href: '/math-tools/equation-solver', icon: Calculator, keywords: ['equation', 'solver', 'algebra', 'quadratic'] },
  { id: 'matrix-calculator', name: 'Matrix Calculator', description: 'Perform matrix operations', category: 'Math Tools', href: '/math-tools/matrix-calculator', icon: Calculator, keywords: ['matrix', 'linear', 'algebra', 'determinant'] },
  { id: 'statistics-calculator', name: 'Statistics Calculator', description: 'Calculate descriptive statistics', category: 'Math Tools', href: '/math-tools/statistics-calculator', icon: BarChart3, keywords: ['statistics', 'mean', 'median', 'regression'] },
  { id: 'graphing-calculator', name: 'Graphing Calculator', description: 'Plot mathematical functions', category: 'Math Tools', href: '/math-tools/graphing-calculator', icon: BarChart3, keywords: ['graphing', 'plot', 'function', 'chart'] },
  { id: 'math-unit-converter', name: 'Unit Converter', description: 'Convert between various measurement units', category: 'Math Tools', href: '/math-tools/unit-converter', icon: Wrench, keywords: ['unit', 'convert', 'measurement'] },
  // Crypto Tools
  { id: 'bitcoin-validator', name: 'Bitcoin Address Validator', description: 'Validate Bitcoin wallet addresses', category: 'Crypto Tools', href: '/crypto-tools/bitcoin-validator', icon: Globe, keywords: ['bitcoin', 'address', 'validate', 'crypto', 'btc'] },
  { id: 'crypto-price-converter', name: 'Crypto Price Converter', description: 'Convert between cryptocurrencies and fiat', category: 'Crypto Tools', href: '/crypto-tools/price-converter', icon: Globe, keywords: ['crypto', 'price', 'convert', 'bitcoin', 'ethereum'] },
  // Network Tools
  { id: 'ip-lookup', name: 'IP Address Lookup', description: 'Get information about an IP address', category: 'Network Tools', href: '/network-tools/ip-lookup', icon: Globe, keywords: ['ip', 'address', 'lookup', 'geolocation'] },
  { id: 'dns-lookup', name: 'DNS Lookup', description: 'Query DNS records for a domain', category: 'Network Tools', href: '/network-tools/dns-lookup', icon: Globe, keywords: ['dns', 'lookup', 'domain', 'records'] },
  { id: 'port-scanner', name: 'Port Scanner', description: 'Scan network ports', category: 'Network Tools', href: '/network-tools/port-scanner', icon: Globe, keywords: ['port', 'scanner', 'network', 'tcp'] },
  { id: 'ping-test', name: 'Ping Test', description: 'Measure HTTP latency to a host or URL', category: 'Network Tools', href: '/network-tools/ping-test', icon: Globe, keywords: ['ping', 'latency', 'http', 'network', 'uptime'] },
  { id: 'whois-lookup', name: 'Whois Lookup', description: 'Look up RDAP registration details for domains', category: 'Network Tools', href: '/network-tools/whois-lookup', icon: Globe, keywords: ['whois', 'rdap', 'domain', 'registrar', 'registration'] },
  // Finance Tools
  { id: 'compound-interest', name: 'Compound Interest Calculator', description: 'Calculate compound interest growth', category: 'Finance Tools', href: '/finance-tools/compound-interest', icon: Calculator, keywords: ['compound', 'interest', 'investment', 'savings'] },
  { id: 'investment-return', name: 'Investment Return Calculator', description: 'Calculate investment returns', category: 'Finance Tools', href: '/finance-tools/investment-return', icon: Calculator, keywords: ['investment', 'return', 'roi', 'profit'] },
  { id: 'finance-currency', name: 'Currency Converter', description: 'Convert between currencies with live rates', category: 'Finance Tools', href: '/finance-tools/currency-converter', icon: Calculator, keywords: ['currency', 'exchange', 'rate', 'money'] },
];

interface SearchComponentRef {
  setQuery: (query: string) => void;
}

export const SearchComponent = React.forwardRef<SearchComponentRef, { className?: string }>(
  ({ className }, ref) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const { trackSearch } = useSearchTracker();

    const handleQueryChange = (newQuery: string) => {
      setQuery(newQuery);
      setIsOpen(true);
      setSelectedIndex(-1);
    };

    React.useImperativeHandle(ref, () => ({
      setQuery: handleQueryChange,
    }));

    const searchResults = useMemo(() => {
      if (!query.trim()) return [];
      const q = query.toLowerCase();
      return TOOLS_DATABASE.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.includes(q)) ||
          t.category.toLowerCase().includes(q)
      )
        .sort((a, b) => {
          const aName = a.name.toLowerCase().includes(q);
          const bName = b.name.toLowerCase().includes(q);
          if (aName && !bName) return -1;
          if (!aName && bName) return 1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 8);
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
          setSelectedIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, -1));
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

    return (
      <div className={`relative ${className}`}>
        {/* Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => query.trim() && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-8 h-9 bg-card/90 border-border/80 text-sm placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:border-accent/50"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setQuery(''); setIsOpen(false); setSelectedIndex(-1); }}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Results dropdown */}
        {isOpen && query.trim() && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[min(680px,95vw)] bg-popover/95 border border-border/80 rounded-md shadow-[0_18px_42px_rgba(23,19,16,0.14)] z-[9999] overflow-hidden">
            {searchResults.length > 0 ? (
              <div className="p-2">
                <p className="text-xs text-muted-foreground px-2 py-1.5 font-mono">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {searchResults.map((tool, index) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <Link
                        key={tool.id}
                        href={tool.href}
                        className={`flex items-start gap-3 p-3 rounded-sm transition-colors ${
                          isSelected
                            ? 'bg-secondary text-foreground'
                            : 'hover:bg-secondary text-foreground'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <VictorianGlyph
                          label={tool.name}
                          category={tool.category}
                          size="md"
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <p className="font-serif text-sm font-medium leading-tight mb-0.5">{tool.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{tool.category}</p>
                          <p className="text-xs text-muted-foreground leading-snug mt-0.5 line-clamp-1">
                            {tool.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No tools found for &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try searching for calculators, converters, or JSON
                </p>
              </div>
            )}
          </div>
        )}

        {/* Backdrop */}
        {isOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        )}
      </div>
    );
  }
);

SearchComponent.displayName = 'SearchComponent';

export function PopularSearches({ onSearchSelect }: { onSearchSelect?: (q: string) => void }) {
  const queries = ['calculator', 'converter', 'color picker', 'word counter', 'json', 'base64'];
  return (
    <div className="flex flex-wrap gap-2">
      {queries.map((q) => (
        <button
          key={q}
          onClick={() => onSearchSelect?.(q)}
          className="text-xs px-2.5 py-1 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors font-mono"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
