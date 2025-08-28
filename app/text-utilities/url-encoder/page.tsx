'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Link, 
  Copy, 
  Download, 
  RefreshCw, 
  Globe, 
  Lock, 
  Unlock,
  ArrowUpDown,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface URLComponents {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  full: string;
}

export default function URLEncoderPage() {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [encodingType, setEncodingType] = useState<'full' | 'component' | 'form'>('component');
  const [urlComponents, setUrlComponents] = useState<URLComponents>({
    protocol: '',
    hostname: '',
    port: '',
    pathname: '',
    search: '',
    hash: '',
    full: ''
  });
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);

  // Sample URLs for demonstration
  const loadSampleUrl = () => {
    const samples = {
      encode: 'https://example.com/search?q=hello world&category=web development&sort=date#section-1',
      decode: 'https%3A//example.com/search%3Fq%3Dhello%20world%26category%3Dweb%20development%26sort%3Ddate%23section-1'
    };
    setInput(samples[mode]);
  };

  // URL encoding functions
  const encodeURL = (text: string, type: string): string => {
    try {
      switch (type) {
        case 'full':
          return encodeURI(text);
        case 'component':
          return encodeURIComponent(text);
        case 'form':
          return encodeURIComponent(text).replace(/%20/g, '+');
        default:
          return text;
      }
    } catch (error) {
      throw new Error('Invalid input for encoding');
    }
  };

  // URL decoding functions
  const decodeURL = (text: string, type: string): string => {
    try {
      switch (type) {
        case 'full':
          return decodeURI(text);
        case 'component':
          return decodeURIComponent(text);
        case 'form':
          return decodeURIComponent(text.replace(/\+/g, '%20'));
        default:
          return text;
      }
    } catch (error) {
      throw new Error('Invalid input for decoding');
    }
  };

  // Parse URL into components
  const parseURL = (urlString: string): URLComponents => {
    try {
      const url = new URL(urlString);
      return {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
        full: url.href
      };
    } catch (error) {
      return {
        protocol: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: '',
        full: ''
      };
    }
  };

  // Validate URL
  const validateURL = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Process input
  const processInput = () => {
    if (!input.trim()) {
      setOutput('');
      setUrlComponents({
        protocol: '',
        hostname: '',
        port: '',
        pathname: '',
        search: '',
        hash: '',
        full: ''
      });
      setIsValidUrl(null);
      return;
    }

    try {
      let result: string;
      
      if (mode === 'encode') {
        result = encodeURL(input, encodingType);
        // Check if input is a valid URL for component parsing
        if (encodingType === 'component' && validateURL(input)) {
          setUrlComponents(parseURL(input));
          setIsValidUrl(true);
        } else {
          setIsValidUrl(validateURL(input));
        }
      } else {
        result = decodeURL(input, encodingType);
        // Check if decoded result is a valid URL
        const isValid = validateURL(result);
        setIsValidUrl(isValid);
        if (isValid) {
          setUrlComponents(parseURL(result));
        }
      }
      
      setOutput(result);
    } catch (error) {
      setOutput('Error: ' + (error as Error).message);
      setIsValidUrl(false);
    }
  };

  const swapInputOutput = () => {
    const temp = input;
    setInput(output);
    setOutput(temp);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setUrlComponents({
      protocol: '',
      hostname: '',
      port: '',
      pathname: '',
      search: '',
      hash: '',
      full: ''
    });
    setIsValidUrl(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: 'Text copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const downloadResult = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `url-${mode}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-process when input changes
  useState(() => {
    processInput();
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">URL Encoder/Decoder</h1>
        <p className="text-lg text-muted-foreground">
          Encode and decode URLs and URL components with support for different encoding types.
        </p>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Encoding Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Select value={mode} onValueChange={(value: 'encode' | 'decode') => setMode(value)}>
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="encode">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Encode
                      </div>
                    </SelectItem>
                    <SelectItem value="decode">
                      <div className="flex items-center gap-2">
                        <Unlock className="h-4 w-4" />
                        Decode
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="encoding-type">Encoding Type</Label>
                <Select value={encodingType} onValueChange={(value: 'full' | 'component' | 'form') => setEncodingType(value)}>
                  <SelectTrigger id="encoding-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="component">URI Component</SelectItem>
                    <SelectItem value="full">Full URI</SelectItem>
                    <SelectItem value="form">Form Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 items-end">
                <Button onClick={loadSampleUrl} variant="outline">
                  Load Sample
                </Button>
                <Button onClick={swapInputOutput} variant="outline">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
                <Button onClick={clearAll} variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input/Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Input {mode === 'encode' ? '(Original)' : '(Encoded)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={processInput}
                placeholder={`Enter ${mode === 'encode' ? 'original' : 'encoded'} URL or text here...`}
                className="font-mono text-sm h-32 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {input.length} characters
                </span>
                <Button onClick={() => copyToClipboard(input)} size="sm" variant="ghost">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Output {mode === 'encode' ? '(Encoded)' : '(Decoded)'}
                {isValidUrl !== null && (
                  <Badge variant={isValidUrl ? 'default' : 'destructive'} className="ml-2">
                    {isValidUrl ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Valid URL</>
                    ) : (
                      <><AlertCircle className="h-3 w-3 mr-1" /> Invalid URL</>
                    )}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={output}
                readOnly
                placeholder="Result will appear here..."
                className="font-mono text-sm h-32 resize-none bg-muted"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {output.length} characters
                </span>
                <div className="flex gap-2">
                  <Button onClick={() => copyToClipboard(output)} size="sm" variant="ghost" disabled={!output}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button onClick={downloadResult} size="sm" variant="ghost" disabled={!output}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* URL Components */}
        {(urlComponents.full || isValidUrl) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                URL Components
              </CardTitle>
              <CardDescription>
                Breakdown of the URL into its individual components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="protocol">Protocol</Label>
                    <Input
                      id="protocol"
                      value={urlComponents.protocol}
                      readOnly
                      className="font-mono text-sm"
                      placeholder="https:"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hostname">Hostname</Label>
                    <Input
                      id="hostname"
                      value={urlComponents.hostname}
                      readOnly
                      className="font-mono text-sm"
                      placeholder="example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      value={urlComponents.port || '(default)'}
                      readOnly
                      className="font-mono text-sm"
                      placeholder="80, 443, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="pathname">Pathname</Label>
                    <Input
                      id="pathname"
                      value={urlComponents.pathname}
                      readOnly
                      className="font-mono text-sm"
                      placeholder="/path/to/page"
                    />
                  </div>
                  <div>
                    <Label htmlFor="search">Search/Query</Label>
                    <Input
                      id="search"
                      value={urlComponents.search}
                      readOnly
                      className="font-mono text-sm"
                      placeholder="?param=value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hash">Hash/Fragment</Label>
                    <Input
                      id="hash"
                      value={urlComponents.hash}
                      readOnly
                      className="font-mono text-sm"
                      placeholder="#section"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="full-url">Full URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="full-url"
                      value={urlComponents.full}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button onClick={() => copyToClipboard(urlComponents.full)} size="sm" variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Encoding Information */}
        <Card>
          <CardHeader>
            <CardTitle>Encoding Types</CardTitle>
            <CardDescription>
              Understanding different URL encoding methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">URI Component (encodeURIComponent)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Encodes all characters except: A-Z a-z 0-9 - _ . ! ~ * ' ( )
                </p>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  Input: hello world!<br />
                  Output: hello%20world!
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Full URI (encodeURI)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Encodes characters except those that have special meaning in URIs: ; , / ? : @ & = + $ #
                </p>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  Input: https://example.com/hello world<br />
                  Output: https://example.com/hello%20world
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Form Data</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Like URI Component but replaces spaces with + instead of %20
                </p>
                <div className="bg-muted p-3 rounded font-mono text-sm">
                  Input: hello world!<br />
                  Output: hello+world!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">When to Encode</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Building query parameters with special characters
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Passing URLs as parameters to other URLs
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Storing URLs in databases or configuration files
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    Creating safe filenames from URLs
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">When to Decode</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    Reading URLs from logs or analytics
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    Processing form submissions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    Debugging URL-related issues
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    Converting encoded URLs to human-readable format
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}