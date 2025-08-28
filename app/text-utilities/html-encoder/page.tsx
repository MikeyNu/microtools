'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Code, 
  Copy, 
  Download, 
  RefreshCw, 
  FileText, 
  ArrowUpDown,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HTMLEntity {
  character: string;
  entity: string;
  decimal: string;
  hex: string;
  description: string;
}

export default function HTMLEncoderPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodingType, setEncodingType] = useState<'named' | 'decimal' | 'hex' | 'all'>('named');
  const [encodeAll, setEncodeAll] = useState(false);
  const [preserveWhitespace, setPreserveWhitespace] = useState(false);

  // Common HTML entities
  const htmlEntities: HTMLEntity[] = [
    { character: '&', entity: '&amp;', decimal: '&#38;', hex: '&#x26;', description: 'Ampersand' },
    { character: '<', entity: '&lt;', decimal: '&#60;', hex: '&#x3C;', description: 'Less than' },
    { character: '>', entity: '&gt;', decimal: '&#62;', hex: '&#x3E;', description: 'Greater than' },
    { character: '"', entity: '&quot;', decimal: '&#34;', hex: '&#x22;', description: 'Double quote' },
    { character: "'", entity: '&apos;', decimal: '&#39;', hex: '&#x27;', description: 'Single quote' },
    { character: ' ', entity: '&nbsp;', decimal: '&#160;', hex: '&#xA0;', description: 'Non-breaking space' },
    { character: '©', entity: '&copy;', decimal: '&#169;', hex: '&#xA9;', description: 'Copyright' },
    { character: '®', entity: '&reg;', decimal: '&#174;', hex: '&#xAE;', description: 'Registered trademark' },
    { character: '™', entity: '&trade;', decimal: '&#8482;', hex: '&#x2122;', description: 'Trademark' },
    { character: '€', entity: '&euro;', decimal: '&#8364;', hex: '&#x20AC;', description: 'Euro sign' },
    { character: '£', entity: '&pound;', decimal: '&#163;', hex: '&#xA3;', description: 'Pound sign' },
    { character: '¥', entity: '&yen;', decimal: '&#165;', hex: '&#xA5;', description: 'Yen sign' },
    { character: '§', entity: '&sect;', decimal: '&#167;', hex: '&#xA7;', description: 'Section sign' },
    { character: '¶', entity: '&para;', decimal: '&#182;', hex: '&#xB6;', description: 'Paragraph sign' },
    { character: '†', entity: '&dagger;', decimal: '&#8224;', hex: '&#x2020;', description: 'Dagger' },
    { character: '‡', entity: '&Dagger;', decimal: '&#8225;', hex: '&#x2021;', description: 'Double dagger' },
    { character: '•', entity: '&bull;', decimal: '&#8226;', hex: '&#x2022;', description: 'Bullet' },
    { character: '…', entity: '&hellip;', decimal: '&#8230;', hex: '&#x2026;', description: 'Horizontal ellipsis' },
    { character: '–', entity: '&ndash;', decimal: '&#8211;', hex: '&#x2013;', description: 'En dash' },
    { character: '—', entity: '&mdash;', decimal: '&#8212;', hex: '&#x2014;', description: 'Em dash' },
    { character: '\u2018', entity: '&lsquo;', decimal: '&#8216;', hex: '&#x2018;', description: 'Left single quote' },
    { character: '\u2019', entity: '&rsquo;', decimal: '&#8217;', hex: '&#x2019;', description: 'Right single quote' },
    { character: '\u201C', entity: '&ldquo;', decimal: '&#8220;', hex: '&#x201C;', description: 'Left double quote' },
    { character: '\u201D', entity: '&rdquo;', decimal: '&#8221;', hex: '&#x201D;', description: 'Right double quote' }
  ];

  // Encoding and decoding functions
  const encodeHTML = (text: string): string => {
    let result = text;
    
    if (encodingType === 'named' || encodingType === 'all') {
      htmlEntities.forEach(entity => {
        if (encodeAll || ['&', '<', '>', '"', "'"].includes(entity.character)) {
          result = result.replace(new RegExp(escapeRegExp(entity.character), 'g'), entity.entity);
        }
      });
    }
    
    if (encodingType === 'decimal' || encodingType === 'all') {
      result = result.replace(/[\u0000-\u007F]/g, (char) => {
        const code = char.charCodeAt(0);
        return code > 127 || (code < 32 && !preserveWhitespace) ? `&#${code};` : char;
      });
    }
    
    if (encodingType === 'hex' || encodingType === 'all') {
      result = result.replace(/[\u0000-\u007F]/g, (char) => {
        const code = char.charCodeAt(0);
        return code > 127 || (code < 32 && !preserveWhitespace) ? `&#x${code.toString(16).toUpperCase()};` : char;
      });
    }
    
    return result;
  };

  const decodeHTML = (text: string): string => {
    let result = text;
    
    // Decode named entities
    htmlEntities.forEach(entity => {
      result = result.replace(new RegExp(entity.entity, 'gi'), entity.character);
    });
    
    // Decode decimal entities
    result = result.replace(/&#(\d+);/g, (_, code) => {
      return String.fromCharCode(parseInt(code, 10));
    });
    
    // Decode hex entities
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => {
      return String.fromCharCode(parseInt(code, 16));
    });
    
    return result;
  };

  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  useEffect(() => {
    if (input.trim()) {
      const result = mode === 'encode' ? encodeHTML(input) : decodeHTML(input);
      setOutput(result);
    } else {
      setOutput('');
    }
  }, [input, mode, encodingType, encodeAll, preserveWhitespace]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${type} copied to clipboard`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Please copy manually',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
  };

  const loadSample = () => {
    const sampleText = '<div class="container">Hello World & Welcome!</div>';
    setInput(sampleText);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            HTML Encoder/Decoder
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Encode and decode HTML entities with support for named, decimal, and hex encoding formats.
          </p>
        </div>

        <div className="grid gap-6">
          {/* Main Tool */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                HTML Encoder/Decoder
              </CardTitle>
              <CardDescription>
                Convert special characters to HTML entities and vice versa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mode Selection */}
                <div className="flex flex-wrap gap-4">
                  <Tabs value={mode} onValueChange={(value) => setMode(value as 'encode' | 'decode')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="encode">Encode</TabsTrigger>
                      <TabsTrigger value="decode">Decode</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Encoding Options */}
                {mode === 'encode' && (
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Encoding Type</Label>
                      <Select value={encodingType} onValueChange={(value) => setEncodingType(value as any)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="named">Named Entities</SelectItem>
                          <SelectItem value="decimal">Decimal</SelectItem>
                          <SelectItem value="hex">Hexadecimal</SelectItem>
                          <SelectItem value="all">All Types</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={encodeAll}
                        onCheckedChange={setEncodeAll}
                      />
                      <Label>Encode All Characters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={preserveWhitespace}
                        onCheckedChange={setPreserveWhitespace}
                      />
                      <Label>Preserve Whitespace</Label>
                    </div>
                  </div>
                )}

                {/* Input/Output Areas */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Input</Label>
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter text to encode/decode..."
                      className="min-h-[200px] font-mono"
                    />
                  </div>
                  <div>
                    <Label>Output</Label>
                    <Textarea
                      value={output}
                      readOnly
                      className="min-h-[200px] font-mono bg-gray-50 dark:bg-gray-800"
                      placeholder="Result will appear here..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={loadSample} variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Load Sample
                  </Button>
                  <Button onClick={handleSwap} variant="outline">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Swap
                  </Button>
                  <Button onClick={clearAll} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  <Button onClick={() => handleCopy(input, 'Input')} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Input
                  </Button>
                  <Button onClick={() => handleCopy(output, 'Output')} variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Output
                  </Button>
                  <Button onClick={() => handleDownload(output, 'html-encoded.txt')} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Common Entities Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Common HTML Entities
              </CardTitle>
              <CardDescription>
                Reference for frequently used HTML entities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {htmlEntities.map((entity, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="font-mono text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">{entity.character}</span>
                      <span className="mx-2">→</span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{entity.entity}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {entity.description}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {entity.decimal} | {entity.hex}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
              <CardDescription>How to use the HTML encoder/decoder</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Encoding Examples:</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 font-mono text-sm">
                    <div>&lt;div&gt;Hello &amp; World!&lt;/div&gt;</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">→ &lt;div&gt;Hello &amp;amp; World!&lt;/div&gt;</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Decoding Examples:</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 font-mono text-sm">
                    <div>&amp;lt;div&amp;gt;Hello &amp;amp; World!&amp;lt;/div&amp;gt;</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">→ &lt;div&gt;Hello &amp; World!&lt;/div&gt;</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}