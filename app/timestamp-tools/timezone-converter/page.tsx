'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Clock, Copy, Plus, Minus, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeZoneInfo {
  name: string;
  label: string;
  offset: string;
  city: string;
  country: string;
}

const popularTimezones: TimeZoneInfo[] = [
  { name: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: '+00:00', city: 'UTC', country: 'Universal' },
  { name: 'America/New_York', label: 'Eastern Time (New York)', offset: '', city: 'New York', country: 'USA' },
  { name: 'America/Chicago', label: 'Central Time (Chicago)', offset: '', city: 'Chicago', country: 'USA' },
  { name: 'America/Denver', label: 'Mountain Time (Denver)', offset: '', city: 'Denver', country: 'USA' },
  { name: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)', offset: '', city: 'Los Angeles', country: 'USA' },
  { name: 'Europe/London', label: 'Greenwich Mean Time (London)', offset: '', city: 'London', country: 'UK' },
  { name: 'Europe/Paris', label: 'Central European Time (Paris)', offset: '', city: 'Paris', country: 'France' },
  { name: 'Europe/Berlin', label: 'Central European Time (Berlin)', offset: '', city: 'Berlin', country: 'Germany' },
  { name: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)', offset: '', city: 'Tokyo', country: 'Japan' },
  { name: 'Asia/Shanghai', label: 'China Standard Time (Shanghai)', offset: '', city: 'Shanghai', country: 'China' },
  { name: 'Asia/Kolkata', label: 'India Standard Time (Mumbai)', offset: '', city: 'Mumbai', country: 'India' },
  { name: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)', offset: '', city: 'Sydney', country: 'Australia' },
  { name: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)', offset: '', city: 'Auckland', country: 'New Zealand' },
  { name: 'America/Sao_Paulo', label: 'Brasília Time (São Paulo)', offset: '', city: 'São Paulo', country: 'Brazil' },
  { name: 'Africa/Cairo', label: 'Eastern European Time (Cairo)', offset: '', city: 'Cairo', country: 'Egypt' },
  { name: 'Asia/Dubai', label: 'Gulf Standard Time (Dubai)', offset: '', city: 'Dubai', country: 'UAE' }
];

interface WorldClock {
  id: string;
  timezone: string;
  label: string;
}

export default function TimezoneConverterPage() {
  const [sourceTime, setSourceTime] = useState('');
  const [sourceTimezone, setSourceTimezone] = useState('UTC');
  const [targetTimezone, setTargetTimezone] = useState('America/New_York');
  const [convertedTime, setConvertedTime] = useState('');
  const [worldClocks, setWorldClocks] = useState<WorldClock[]>([
    { id: '1', timezone: 'UTC', label: 'UTC' },
    { id: '2', timezone: 'America/New_York', label: 'New York' },
    { id: '3', timezone: 'Europe/London', label: 'London' },
    { id: '4', timezone: 'Asia/Tokyo', label: 'Tokyo' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTimes, setCurrentTimes] = useState<{[key: string]: string}>({});

  const filteredTimezones = popularTimezones.filter(tz => 
    tz.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tz.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const updateCurrentTimes = () => {
      const times: {[key: string]: string} = {};
      worldClocks.forEach(clock => {
        const now = new Date();
        times[clock.id] = now.toLocaleString('en-US', {
          timeZone: clock.timezone,
          weekday: 'short',
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
      });
      setCurrentTimes(times);
    };

    updateCurrentTimes();
    const interval = setInterval(updateCurrentTimes, 1000);
    return () => clearInterval(interval);
  }, [worldClocks]);

  useEffect(() => {
    if (sourceTime) {
      convertTime();
    }
  }, [sourceTime, sourceTimezone, targetTimezone]);

  const convertTime = () => {
    try {
      if (!sourceTime) {
        setConvertedTime('');
        return;
      }

      // Parse the input time
      const inputDate = new Date(sourceTime);
      if (isNaN(inputDate.getTime())) {
        setConvertedTime('Invalid date/time');
        return;
      }

      // Convert to target timezone
      const converted = inputDate.toLocaleString('en-US', {
        timeZone: targetTimezone,
        weekday: 'long',
        month: 'long',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });

      setConvertedTime(converted);
    } catch (error) {
      setConvertedTime('Conversion error');
    }
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

  const addWorldClock = (timezone: string) => {
    const timezoneInfo = popularTimezones.find(tz => tz.name === timezone);
    if (timezoneInfo && !worldClocks.find(clock => clock.timezone === timezone)) {
      const newClock: WorldClock = {
        id: Date.now().toString(),
        timezone: timezone,
        label: timezoneInfo.city
      };
      setWorldClocks([...worldClocks, newClock]);
    }
  };

  const removeWorldClock = (id: string) => {
    setWorldClocks(worldClocks.filter(clock => clock.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTimezoneOffset = (timezone: string) => {
    try {
      const now = new Date();
      const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
      const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
      const sign = offset >= 0 ? '+' : '-';
      const hours = Math.floor(Math.abs(offset));
      const minutes = Math.round((Math.abs(offset) - hours) * 60);
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Timezone Converter
          </h1>
          <p className="text-gray-600">
            Convert time between different timezones and manage world clocks
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Conversion */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Time Conversion</span>
                </CardTitle>
                <CardDescription>
                  Convert time from one timezone to another
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="source-time">Source Time</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="source-time"
                      type="datetime-local"
                      value={sourceTime}
                      onChange={(e) => setSourceTime(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => setSourceTime(getCurrentDateTime())}
                    >
                      Now
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="source-timezone">From Timezone</Label>
                  <Select value={sourceTimezone} onValueChange={setSourceTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {popularTimezones.map(tz => (
                        <SelectItem key={tz.name} value={tz.name}>
                          {tz.label} ({getTimezoneOffset(tz.name)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target-timezone">To Timezone</Label>
                  <Select value={targetTimezone} onValueChange={setTargetTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {popularTimezones.map(tz => (
                        <SelectItem key={tz.name} value={tz.name}>
                          {tz.label} ({getTimezoneOffset(tz.name)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {convertedTime && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Label className="text-sm font-medium text-blue-800">Converted Time:</Label>
                    <div className="mt-1 font-mono text-lg text-blue-900">
                      {convertedTime}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => copyToClipboard(convertedTime)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Timezone */}
            <Card>
              <CardHeader>
                <CardTitle>Add Timezone to World Clock</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="search-timezone">Search Timezones</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search-timezone"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by city, country, or timezone..."
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {filteredTimezones.map(tz => (
                    <div key={tz.name} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{tz.city}, {tz.country}</div>
                        <div className="text-xs text-gray-500">
                          {tz.name} ({getTimezoneOffset(tz.name)})
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addWorldClock(tz.name)}
                        disabled={worldClocks.some(clock => clock.timezone === tz.name)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* World Clock */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>World Clock</span>
                </CardTitle>
                <CardDescription>
                  Live time display for multiple timezones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {worldClocks.map(clock => {
                    const timezoneInfo = popularTimezones.find(tz => tz.name === clock.timezone);
                    return (
                      <div key={clock.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{clock.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {getTimezoneOffset(clock.timezone)}
                            </Badge>
                          </div>
                          <div className="font-mono text-lg text-blue-600">
                            {currentTimes[clock.id] || 'Loading...'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {timezoneInfo?.country || clock.timezone}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(currentTimes[clock.id] || '')}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeWorldClock(clock.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {worldClocks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No timezones added. Use the search above to add timezones to your world clock.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Timezone Conversion</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Daylight Saving Time</h4>
              <p>
                Our converter automatically handles Daylight Saving Time (DST) transitions. 
                The displayed times account for current DST rules in each timezone.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">UTC Offset</h4>
              <p>
                The UTC offset shows how many hours ahead (+) or behind (-) each timezone 
                is compared to Coordinated Universal Time (UTC).
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">World Clock</h4>
              <p>
                Add multiple timezones to your world clock for easy comparison. 
                Perfect for coordinating meetings across different time zones.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Accuracy</h4>
              <p>
                All conversions are performed using the browser's built-in timezone database, 
                ensuring accuracy and up-to-date DST information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}