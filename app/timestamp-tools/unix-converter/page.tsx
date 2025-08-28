'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Copy, RefreshCw, Calendar, ArrowRightLeft, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UnixConverterPage() {
  const [timestamp, setTimestamp] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [batchInput, setBatchInput] = useState('');
  const [batchResults, setBatchResults] = useState<Array<{input: string, output: string, valid: boolean}>>([]);
  const [timezone, setTimezone] = useState('UTC');
  const [format, setFormat] = useState('iso');

  const timezones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
  ];

  const formats = {
    iso: 'ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)',
    readable: 'Human Readable (MMM DD, YYYY HH:mm:ss)',
    full: 'Full Date (Day, Month DD, YYYY HH:mm:ss GMT)',
    short: 'Short (MM/DD/YYYY HH:mm:ss)'
  };

  useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    };
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date, formatType: string, tz: string) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: tz === 'UTC' ? 'UTC' : tz
    };

    switch (formatType) {
      case 'iso':
        return date.toISOString();
      case 'readable':
        return date.toLocaleString('en-US', {
          ...options,
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      case 'full':
        return date.toLocaleString('en-US', {
          ...options,
          weekday: 'long',
          month: 'long',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short'
        });
      case 'short':
        return date.toLocaleString('en-US', {
          ...options,
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      default:
        return date.toISOString();
    }
  };

  const convertTimestampToDate = (ts: string) => {
    try {
      const timestamp = parseInt(ts);
      if (isNaN(timestamp)) return 'Invalid timestamp';
      
      // Handle both seconds and milliseconds
      const date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
      return formatDate(date, format, timezone);
    } catch (error) {
      return 'Invalid timestamp';
    }
  };

  const convertDateToTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid date';
      return Math.floor(date.getTime() / 1000).toString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleBatchConvert = () => {
    const lines = batchInput.split('\n').filter(line => line.trim());
    const results = lines.map(line => {
      const trimmed = line.trim();
      let output = '';
      let valid = true;
      
      // Try to determine if it's a timestamp or date
      if (/^\d+$/.test(trimmed)) {
        // It's a timestamp
        output = convertTimestampToDate(trimmed);
        valid = !output.includes('Invalid');
      } else {
        // It's a date
        output = convertDateToTimestamp(trimmed);
        valid = !output.includes('Invalid');
      }
      
      return { input: trimmed, output, valid };
    });
    setBatchResults(results);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResults = () => {
    const content = batchResults.map(result => 
      `${result.input} -> ${result.output}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timestamp-conversion-results.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Unix Timestamp Converter
          </h1>
          <p className="text-gray-600">
            Convert between Unix timestamps and human-readable dates with timezone support
          </p>
        </div>

        {/* Current Timestamp Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Current Unix Timestamp</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="text-2xl font-mono font-bold text-blue-600">
                  {currentTimestamp}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(new Date(), format, timezone)}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(currentTimestamp.toString())}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="single" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Conversion</TabsTrigger>
            <TabsTrigger value="batch">Batch Conversion</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Settings</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="format">Date Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(formats).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Timestamp to Date */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowRightLeft className="h-5 w-5" />
                  <span>Timestamp to Date</span>
                </CardTitle>
                <CardDescription>
                  Enter a Unix timestamp (seconds or milliseconds)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="timestamp">Unix Timestamp</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="timestamp"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      placeholder="1640995200"
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setTimestamp(currentTimestamp.toString())}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {timestamp && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium">Converted Date:</Label>
                    <div className="mt-1 font-mono text-lg">
                      {convertTimestampToDate(timestamp)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(convertTimestampToDate(timestamp))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Date to Timestamp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Date to Timestamp</span>
                </CardTitle>
                <CardDescription>
                  Enter a date in any standard format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="datetime">Date and Time</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="datetime"
                      type="datetime-local"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setDateTime(getCurrentDateTime())}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {dateTime && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium">Unix Timestamp:</Label>
                    <div className="mt-1 font-mono text-lg">
                      {convertDateToTimestamp(dateTime)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(convertDateToTimestamp(dateTime))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Batch Conversion</CardTitle>
                <CardDescription>
                  Enter multiple timestamps or dates (one per line) for batch conversion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="batch-input">Input (one per line)</Label>
                  <Textarea
                    id="batch-input"
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder="1640995200\n2023-01-01T00:00:00Z\n1672531200\nJan 1, 2023"
                    rows={8}
                    className="font-mono"
                  />
                </div>
                <Button onClick={handleBatchConvert} className="w-full">
                  Convert All
                </Button>
                
                {batchResults.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Results ({batchResults.length} items)</h3>
                      <Button variant="outline" size="sm" onClick={downloadResults}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      {batchResults.map((result, index) => (
                        <div key={index} className="p-3 border-b last:border-b-0 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-mono text-sm text-gray-600">
                              {result.input}
                            </div>
                            <div className={`font-mono text-sm ${
                              result.valid ? 'text-gray-900' : 'text-red-600'
                            }`}>
                              {result.output}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={result.valid ? 'default' : 'destructive'}>
                              {result.valid ? 'Valid' : 'Error'}
                            </Badge>
                            {result.valid && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(result.output)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Unix Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-1">What is a Unix Timestamp?</h4>
              <p>
                A Unix timestamp is the number of seconds that have elapsed since January 1, 1970, 00:00:00 UTC. 
                It's a standard way to represent time in computing systems.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Seconds vs Milliseconds</h4>
              <p>
                Traditional Unix timestamps use seconds, but some systems use milliseconds. 
                Our converter automatically detects and handles both formats.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-1">Timezone Support</h4>
              <p>
                While Unix timestamps are always in UTC, our converter can display the equivalent 
                local time in any timezone for better readability.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}