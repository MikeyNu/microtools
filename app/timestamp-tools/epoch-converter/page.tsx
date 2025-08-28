'use client';

import React, { useState, useEffect } from 'react';
import { Timer, Copy, RefreshCw, Calendar, Clock, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface EpochResult {
  seconds: number;
  milliseconds: number;
  microseconds: number;
  nanoseconds: number;
  iso8601: string;
  rfc2822: string;
  humanReadable: string;
  relative: string;
}

export default function EpochConverterPage() {
  const [epochInput, setEpochInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [precision, setPrecision] = useState<'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds'>('seconds');
  const [timezone, setTimezone] = useState('UTC');
  const [includeMilliseconds, setIncludeMilliseconds] = useState(true);
  const [currentEpoch, setCurrentEpoch] = useState<EpochResult | null>(null);
  const [convertedResult, setConvertedResult] = useState<EpochResult | null>(null);
  const [dateToEpochResult, setDateToEpochResult] = useState<EpochResult | null>(null);

  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland'
  ];

  const precisionMultipliers = {
    seconds: 1,
    milliseconds: 1000,
    microseconds: 1000000,
    nanoseconds: 1000000000
  };

  useEffect(() => {
    const updateCurrentEpoch = () => {
      const now = new Date();
      setCurrentEpoch(createEpochResult(now));
    };
    
    updateCurrentEpoch();
    const interval = setInterval(updateCurrentEpoch, includeMilliseconds ? 100 : 1000);
    return () => clearInterval(interval);
  }, [includeMilliseconds, timezone]);

  useEffect(() => {
    if (epochInput) {
      convertEpochToDate();
    } else {
      setConvertedResult(null);
    }
  }, [epochInput, precision, timezone]);

  useEffect(() => {
    if (dateInput) {
      convertDateToEpoch();
    } else {
      setDateToEpochResult(null);
    }
  }, [dateInput, timezone]);

  const createEpochResult = (date: Date): EpochResult => {
    const timestamp = date.getTime();
    const seconds = Math.floor(timestamp / 1000);
    const milliseconds = timestamp;
    const microseconds = timestamp * 1000;
    const nanoseconds = timestamp * 1000000;

    const formatOptions: Intl.DateTimeFormatOptions = {
      timeZone: timezone === 'UTC' ? 'UTC' : timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    };

    return {
      seconds,
      milliseconds,
      microseconds,
      nanoseconds,
      iso8601: date.toISOString(),
      rfc2822: date.toUTCString(),
      humanReadable: date.toLocaleString('en-US', formatOptions),
      relative: getRelativeTime(date)
    };
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.abs(diffMs / 1000);
    const diffMinutes = diffSeconds / 60;
    const diffHours = diffMinutes / 60;
    const diffDays = diffHours / 24;
    const diffWeeks = diffDays / 7;
    const diffMonths = diffDays / 30;
    const diffYears = diffDays / 365;

    const isFuture = diffMs < 0;
    const prefix = isFuture ? 'in ' : '';
    const suffix = isFuture ? '' : ' ago';

    if (diffSeconds < 60) {
      return `${prefix}${Math.floor(diffSeconds)} second${Math.floor(diffSeconds) !== 1 ? 's' : ''}${suffix}`;
    } else if (diffMinutes < 60) {
      return `${prefix}${Math.floor(diffMinutes)} minute${Math.floor(diffMinutes) !== 1 ? 's' : ''}${suffix}`;
    } else if (diffHours < 24) {
      return `${prefix}${Math.floor(diffHours)} hour${Math.floor(diffHours) !== 1 ? 's' : ''}${suffix}`;
    } else if (diffDays < 7) {
      return `${prefix}${Math.floor(diffDays)} day${Math.floor(diffDays) !== 1 ? 's' : ''}${suffix}`;
    } else if (diffWeeks < 4) {
      return `${prefix}${Math.floor(diffWeeks)} week${Math.floor(diffWeeks) !== 1 ? 's' : ''}${suffix}`;
    } else if (diffMonths < 12) {
      return `${prefix}${Math.floor(diffMonths)} month${Math.floor(diffMonths) !== 1 ? 's' : ''}${suffix}`;
    } else {
      return `${prefix}${Math.floor(diffYears)} year${Math.floor(diffYears) !== 1 ? 's' : ''}${suffix}`;
    }
  };

  const convertEpochToDate = () => {
    try {
      let timestamp = parseFloat(epochInput);
      if (isNaN(timestamp)) {
        setConvertedResult(null);
        return;
      }

      // Convert based on precision
      const multiplier = precisionMultipliers[precision];
      const milliseconds = timestamp * 1000 / multiplier;
      
      const date = new Date(milliseconds);
      if (isNaN(date.getTime())) {
        setConvertedResult(null);
        return;
      }

      setConvertedResult(createEpochResult(date));
    } catch (error) {
      setConvertedResult(null);
    }
  };

  const convertDateToEpoch = () => {
    try {
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        setDateToEpochResult(null);
        return;
      }

      setDateToEpochResult(createEpochResult(date));
    } catch (error) {
      setDateToEpochResult(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const downloadResults = (result: EpochResult, filename: string) => {
    const content = `Epoch Conversion Results\n` +
      `========================\n\n` +
      `Seconds: ${result.seconds}\n` +
      `Milliseconds: ${result.milliseconds}\n` +
      `Microseconds: ${result.microseconds}\n` +
      `Nanoseconds: ${result.nanoseconds}\n\n` +
      `ISO 8601: ${result.iso8601}\n` +
      `RFC 2822: ${result.rfc2822}\n` +
      `Human Readable: ${result.humanReadable}\n` +
      `Relative Time: ${result.relative}\n`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ResultCard = ({ result, title }: { result: EpochResult; title: string }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadResults(result, `${title.toLowerCase().replace(' ', '-')}-conversion.txt`)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">Seconds</Label>
              <div className="flex items-center space-x-2">
                <div className="font-mono text-lg bg-gray-50 p-2 rounded flex-1">
                  {result.seconds}
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.seconds.toString())}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-600">Milliseconds</Label>
              <div className="flex items-center space-x-2">
                <div className="font-mono text-lg bg-gray-50 p-2 rounded flex-1">
                  {result.milliseconds}
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.milliseconds.toString())}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Microseconds</Label>
              <div className="flex items-center space-x-2">
                <div className="font-mono text-sm bg-gray-50 p-2 rounded flex-1">
                  {result.microseconds}
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.microseconds.toString())}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Nanoseconds</Label>
              <div className="flex items-center space-x-2">
                <div className="font-mono text-sm bg-gray-50 p-2 rounded flex-1">
                  {result.nanoseconds}
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.nanoseconds.toString())}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium text-gray-600">ISO 8601</Label>
              <div className="flex items-center space-x-2">
                <div className="font-mono text-sm bg-gray-50 p-2 rounded flex-1">
                  {result.iso8601}
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.iso8601)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">RFC 2822</Label>
              <div className="flex items-center space-x-2">
                <div className="font-mono text-sm bg-gray-50 p-2 rounded flex-1">
                  {result.rfc2822}
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.rfc2822)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Human Readable</Label>
              <div className="flex items-center space-x-2">
                <div className="text-sm bg-gray-50 p-2 rounded flex-1">
                  {result.humanReadable}
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.humanReadable)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Relative Time</Label>
              <div className="flex items-center space-x-2">
                <div className="text-sm bg-blue-50 p-2 rounded flex-1 text-blue-800">
                  {result.relative}
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.relative)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Epoch Time Converter
          </h1>
          <p className="text-gray-600">
            Convert epoch timestamps with millisecond precision and multiple format support
          </p>
        </div>

        {/* Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conversion Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="timezone">Display Timezone</Label>
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
              <Label htmlFor="precision">Input Precision</Label>
              <Select value={precision} onValueChange={(value: any) => setPrecision(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Seconds</SelectItem>
                  <SelectItem value="milliseconds">Milliseconds</SelectItem>
                  <SelectItem value="microseconds">Microseconds</SelectItem>
                  <SelectItem value="nanoseconds">Nanoseconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="include-ms"
                checked={includeMilliseconds}
                onCheckedChange={setIncludeMilliseconds}
              />
              <Label htmlFor="include-ms">Live Updates (100ms)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Current Epoch Time */}
        {currentEpoch && (
          <div className="mb-6">
            <ResultCard result={currentEpoch} title="Current Epoch Time" />
          </div>
        )}

        <Tabs defaultValue="epoch-to-date" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="epoch-to-date">Epoch to Date</TabsTrigger>
            <TabsTrigger value="date-to-epoch">Date to Epoch</TabsTrigger>
          </TabsList>

          <TabsContent value="epoch-to-date" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Timer className="h-5 w-5" />
                  <span>Convert Epoch to Date</span>
                </CardTitle>
                <CardDescription>
                  Enter an epoch timestamp in the selected precision
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="epoch-input">Epoch Timestamp ({precision})</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="epoch-input"
                      value={epochInput}
                      onChange={(e) => setEpochInput(e.target.value)}
                      placeholder={`e.g., ${currentEpoch ? Math.floor(currentEpoch.milliseconds / precisionMultipliers[precision] * 1000) : '1640995200'}`}
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setEpochInput(currentEpoch ? Math.floor(currentEpoch.milliseconds / precisionMultipliers[precision] * 1000).toString() : '')}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Precision: {precision} (1 {precision.slice(0, -1)} = {precisionMultipliers[precision]} milliseconds)
                  </div>
                </div>
              </CardContent>
            </Card>

            {convertedResult && (
              <ResultCard result={convertedResult} title="Converted Date" />
            )}
          </TabsContent>

          <TabsContent value="date-to-epoch" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Convert Date to Epoch</span>
                </CardTitle>
                <CardDescription>
                  Enter a date and time to convert to epoch timestamp
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="date-input">Date and Time</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="date-input"
                      type="datetime-local"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      step="1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setDateInput(getCurrentDateTime())}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {dateToEpochResult && (
              <ResultCard result={dateToEpochResult} title="Converted Epoch" />
            )}
          </TabsContent>
        </Tabs>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Epoch Time</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Precision Levels</h4>
              <ul className="space-y-1">
                <li><strong>Seconds:</strong> Standard Unix timestamp (10 digits)</li>
                <li><strong>Milliseconds:</strong> JavaScript Date.now() format (13 digits)</li>
                <li><strong>Microseconds:</strong> High-precision timing (16 digits)</li>
                <li><strong>Nanoseconds:</strong> Ultra-high precision (19 digits)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Format Standards</h4>
              <ul className="space-y-1">
                <li><strong>ISO 8601:</strong> International standard (YYYY-MM-DDTHH:mm:ss.sssZ)</li>
                <li><strong>RFC 2822:</strong> Email/HTTP standard (Day, DD Mon YYYY HH:mm:ss GMT)</li>
                <li><strong>Human Readable:</strong> Localized format with timezone</li>
                <li><strong>Relative Time:</strong> Time difference from now</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}