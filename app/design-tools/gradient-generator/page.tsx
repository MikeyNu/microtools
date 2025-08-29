'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Plus, Trash2, RefreshCw, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

interface GradientPreset {
  name: string;
  type: 'linear' | 'radial' | 'conic';
  direction: string;
  colors: ColorStop[];
}

type GradientType = 'linear' | 'radial' | 'conic';
type LinearDirection = 'to right' | 'to left' | 'to bottom' | 'to top' | 'to bottom right' | 'to bottom left' | 'to top right' | 'to top left';
type RadialShape = 'circle' | 'ellipse';
type RadialSize = 'closest-side' | 'closest-corner' | 'farthest-side' | 'farthest-corner';

export default function GradientGeneratorPage() {
  const { toast } = useToast();
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [linearDirection, setLinearDirection] = useState<LinearDirection>('to right');
  const [customAngle, setCustomAngle] = useState(90);
  const [useCustomAngle, setUseCustomAngle] = useState(false);
  const [radialShape, setRadialShape] = useState<RadialShape>('circle');
  const [radialSize, setRadialSize] = useState<RadialSize>('farthest-corner');
  const [radialPosition, setRadialPosition] = useState({ x: 50, y: 50 });
  const [conicAngle, setConicAngle] = useState(0);
  const [conicPosition, setConicPosition] = useState({ x: 50, y: 50 });
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: '#3b82f6', position: 0 },
    { id: '2', color: '#8b5cf6', position: 100 }
  ]);
  const [activeTab, setActiveTab] = useState('generator');
  const [gradientHistory, setGradientHistory] = useState<string[]>([]);

  const gradientPresets: GradientPreset[] = [
    {
      name: 'Ocean Blue',
      type: 'linear',
      direction: 'to right',
      colors: [
        { id: '1', color: '#0ea5e9', position: 0 },
        { id: '2', color: '#3b82f6', position: 50 },
        { id: '3', color: '#1e40af', position: 100 }
      ]
    },
    {
      name: 'Sunset',
      type: 'linear',
      direction: 'to bottom',
      colors: [
        { id: '1', color: '#f97316', position: 0 },
        { id: '2', color: '#ef4444', position: 50 },
        { id: '3', color: '#dc2626', position: 100 }
      ]
    },
    {
      name: 'Forest',
      type: 'linear',
      direction: 'to bottom right',
      colors: [
        { id: '1', color: '#22c55e', position: 0 },
        { id: '2', color: '#16a34a', position: 50 },
        { id: '3', color: '#15803d', position: 100 }
      ]
    },
    {
      name: 'Purple Haze',
      type: 'radial',
      direction: 'circle',
      colors: [
        { id: '1', color: '#a855f7', position: 0 },
        { id: '2', color: '#8b5cf6', position: 50 },
        { id: '3', color: '#7c3aed', position: 100 }
      ]
    },
    {
      name: 'Rainbow',
      type: 'conic',
      direction: 'from 0deg',
      colors: [
        { id: '1', color: '#ef4444', position: 0 },
        { id: '2', color: '#f97316', position: 16.67 },
        { id: '3', color: '#eab308', position: 33.33 },
        { id: '4', color: '#22c55e', position: 50 },
        { id: '5', color: '#3b82f6', position: 66.67 },
        { id: '6', color: '#8b5cf6', position: 83.33 },
        { id: '7', color: '#ef4444', position: 100 }
      ]
    },
    {
      name: 'Midnight',
      type: 'linear',
      direction: 'to bottom',
      colors: [
        { id: '1', color: '#1e293b', position: 0 },
        { id: '2', color: '#0f172a', position: 100 }
      ]
    }
  ];

  const generateGradientCSS = useCallback(() => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const colorStopString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');

    switch (gradientType) {
      case 'linear':
        const direction = useCustomAngle ? `${customAngle}deg` : linearDirection;
        return `linear-gradient(${direction}, ${colorStopString})`;
      
      case 'radial':
        const radialParams = `${radialShape} ${radialSize} at ${radialPosition.x}% ${radialPosition.y}%`;
        return `radial-gradient(${radialParams}, ${colorStopString})`;
      
      case 'conic':
        const conicParams = `from ${conicAngle}deg at ${conicPosition.x}% ${conicPosition.y}%`;
        return `conic-gradient(${conicParams}, ${colorStopString})`;
      
      default:
        return `linear-gradient(to right, ${colorStopString})`;
    }
  }, [gradientType, linearDirection, customAngle, useCustomAngle, radialShape, radialSize, radialPosition, conicAngle, conicPosition, colorStops]);

  const addColorStop = () => {
    const newPosition = colorStops.length > 0 
      ? Math.min(100, Math.max(...colorStops.map(s => s.position)) + 20)
      : 50;
    
    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#000000',
      position: newPosition
    };
    
    setColorStops([...colorStops, newStop]);
  };

  const removeColorStop = (id: string) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter(stop => stop.id !== id));
    }
  };

  const updateColorStop = (id: string, field: 'color' | 'position', value: string | number) => {
    setColorStops(colorStops.map(stop => 
      stop.id === id ? { ...stop, [field]: value } : stop
    ));
  };

  const loadPreset = (preset: GradientPreset) => {
    setGradientType(preset.type);
    setColorStops(preset.colors);
    
    if (preset.type === 'linear') {
      if (preset.direction.includes('deg')) {
        setUseCustomAngle(true);
        setCustomAngle(parseInt(preset.direction));
      } else {
        setUseCustomAngle(false);
        setLinearDirection(preset.direction as LinearDirection);
      }
    }
  };

  const generateRandomGradient = () => {
    const colors = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f59e0b'
    ];
    
    const numColors = Math.floor(Math.random() * 3) + 2; // 2-4 colors
    const newStops: ColorStop[] = [];
    
    for (let i = 0; i < numColors; i++) {
      newStops.push({
        id: Date.now().toString() + i,
        color: colors[Math.floor(Math.random() * colors.length)],
        position: (i / (numColors - 1)) * 100
      });
    }
    
    setColorStops(newStops);
    
    // Random gradient type
    const types: GradientType[] = ['linear', 'radial', 'conic'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    setGradientType(randomType);
    
    if (randomType === 'linear') {
      const directions: LinearDirection[] = ['to right', 'to left', 'to bottom', 'to top', 'to bottom right'];
      setLinearDirection(directions[Math.floor(Math.random() * directions.length)]);
    }
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${format} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const downloadGradient = () => {
    const css = generateGradientCSS();
    const gradientData = {
      type: gradientType,
      css,
      colorStops,
      settings: {
        linearDirection: useCustomAngle ? `${customAngle}deg` : linearDirection,
        radialShape,
        radialSize,
        radialPosition,
        conicAngle,
        conicPosition
      },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(gradientData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gradient-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveToHistory = () => {
    const css = generateGradientCSS();
    if (!gradientHistory.includes(css)) {
      setGradientHistory(prev => [css, ...prev.slice(0, 19)]); // Keep last 20
    }
  };

  useEffect(() => {
    const css = generateGradientCSS();
    if (css && !gradientHistory.includes(css)) {
      // Auto-save to history when gradient changes
      const timeoutId = setTimeout(() => {
        setGradientHistory(prev => {
          if (!prev.includes(css)) {
            return [css, ...prev.slice(0, 19)];
          }
          return prev;
        });
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [generateGradientCSS, gradientHistory]);

  const currentGradient = generateGradientCSS();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Gradient Generator</h1>
        <p className="text-lg text-muted-foreground">
          Create beautiful CSS gradients with live preview and multiple format support.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gradient Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="gradient-type">Gradient Type</Label>
                    <Select value={gradientType} onValueChange={(value: GradientType) => setGradientType(value)}>
                      <SelectTrigger id="gradient-type" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="radial">Radial</SelectItem>
                        <SelectItem value="conic">Conic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {gradientType === 'linear' && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="custom-angle"
                          checked={useCustomAngle}
                          onChange={(e) => setUseCustomAngle(e.target.checked)}
                        />
                        <Label htmlFor="custom-angle">Use custom angle</Label>
                      </div>
                      
                      {useCustomAngle ? (
                        <div>
                          <Label htmlFor="angle-slider">Angle: {customAngle}°</Label>
                          <Slider
                            id="angle-slider"
                            min={0}
                            max={360}
                            step={1}
                            value={[customAngle]}
                            onValueChange={(value) => setCustomAngle(value[0])}
                            className="mt-2"
                          />
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="direction">Direction</Label>
                          <Select value={linearDirection} onValueChange={(value: LinearDirection) => setLinearDirection(value)}>
                            <SelectTrigger id="direction" className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="to right">To Right</SelectItem>
                              <SelectItem value="to left">To Left</SelectItem>
                              <SelectItem value="to bottom">To Bottom</SelectItem>
                              <SelectItem value="to top">To Top</SelectItem>
                              <SelectItem value="to bottom right">To Bottom Right</SelectItem>
                              <SelectItem value="to bottom left">To Bottom Left</SelectItem>
                              <SelectItem value="to top right">To Top Right</SelectItem>
                              <SelectItem value="to top left">To Top Left</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {gradientType === 'radial' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="radial-shape">Shape</Label>
                        <Select value={radialShape} onValueChange={(value: RadialShape) => setRadialShape(value)}>
                          <SelectTrigger id="radial-shape" className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="circle">Circle</SelectItem>
                            <SelectItem value="ellipse">Ellipse</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="radial-size">Size</Label>
                        <Select value={radialSize} onValueChange={(value: RadialSize) => setRadialSize(value)}>
                          <SelectTrigger id="radial-size" className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="closest-side">Closest Side</SelectItem>
                            <SelectItem value="closest-corner">Closest Corner</SelectItem>
                            <SelectItem value="farthest-side">Farthest Side</SelectItem>
                            <SelectItem value="farthest-corner">Farthest Corner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="radial-x">Center X: {radialPosition.x}%</Label>
                          <Slider
                            id="radial-x"
                            min={0}
                            max={100}
                            step={1}
                            value={[radialPosition.x]}
                            onValueChange={(value) => setRadialPosition(prev => ({ ...prev, x: value[0] }))}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="radial-y">Center Y: {radialPosition.y}%</Label>
                          <Slider
                            id="radial-y"
                            min={0}
                            max={100}
                            step={1}
                            value={[radialPosition.y]}
                            onValueChange={(value) => setRadialPosition(prev => ({ ...prev, y: value[0] }))}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {gradientType === 'conic' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="conic-angle">Start Angle: {conicAngle}°</Label>
                        <Slider
                          id="conic-angle"
                          min={0}
                          max={360}
                          step={1}
                          value={[conicAngle]}
                          onValueChange={(value) => setConicAngle(value[0])}
                          className="mt-2"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="conic-x">Center X: {conicPosition.x}%</Label>
                          <Slider
                            id="conic-x"
                            min={0}
                            max={100}
                            step={1}
                            value={[conicPosition.x]}
                            onValueChange={(value) => setConicPosition(prev => ({ ...prev, x: value[0] }))}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="conic-y">Center Y: {conicPosition.y}%</Label>
                          <Slider
                            id="conic-y"
                            min={0}
                            max={100}
                            step={1}
                            value={[conicPosition.y]}
                            onValueChange={(value) => setConicPosition(prev => ({ ...prev, y: value[0] }))}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={generateRandomGradient} variant="outline" className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Random
                    </Button>
                    <Button onClick={saveToHistory} variant="outline" className="flex-1">
                      Save to History
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Color Stops</CardTitle>
                    <Button size="sm" onClick={addColorStop}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Stop
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {colorStops.map((stop, index) => (
                      <div key={stop.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="color"
                            value={stop.color}
                            onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                            className="w-10 h-10 rounded border cursor-pointer"
                          />
                          <Input
                            value={stop.color}
                            onChange={(e) => updateColorStop(stop.id, 'color', e.target.value)}
                            className="flex-1"
                            placeholder="#000000"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm whitespace-nowrap">{stop.position}%</Label>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[stop.position]}
                            onValueChange={(value) => updateColorStop(stop.id, 'position', value[0])}
                            className="w-20"
                          />
                        </div>
                        {colorStops.length > 2 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeColorStop(stop.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="w-full h-64 rounded-lg border border-border"
                    style={{ background: currentGradient }}
                  />
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">CSS Code</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(currentGradient, 'CSS gradient')}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-sm break-all">
                        background: {currentGradient};
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">CSS</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-sm">
                        .gradient-bg {'{'}\n
                        {'  '}background: {currentGradient};\n
                        {'}'}
                      </code>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tailwind CSS (as arbitrary value)</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-sm break-all">
                        bg-[{currentGradient.replace(/\s+/g, '_')}]
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gradientPresets.map((preset, index) => {
              const presetCSS = (() => {
                const sortedStops = [...preset.colors].sort((a, b) => a.position - b.position);
                const colorStopString = sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ');
                
                switch (preset.type) {
                  case 'linear':
                    return `linear-gradient(${preset.direction}, ${colorStopString})`;
                  case 'radial':
                    return `radial-gradient(${preset.direction}, ${colorStopString})`;
                  case 'conic':
                    return `conic-gradient(${preset.direction}, ${colorStopString})`;
                  default:
                    return `linear-gradient(to right, ${colorStopString})`;
                }
              })();
              
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => loadPreset(preset)}>
                  <CardContent className="p-4">
                    <div
                      className="w-full h-24 rounded-lg mb-3 border border-border"
                      style={{ background: presetCSS }}
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{preset.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{preset.type}</p>
                      </div>
                      <Badge variant="outline">{preset.colors.length} colors</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gradient History</CardTitle>
              <CardDescription>
                Recently created gradients (click to load)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {gradientHistory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {gradientHistory.map((gradient, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="w-full h-20 rounded-lg border border-border cursor-pointer hover:scale-105 transition-transform"
                        style={{ background: gradient }}
                        onClick={() => {
                          // This would require parsing the CSS back to settings
                          // For now, just copy to clipboard
                          copyToClipboard(gradient, 'Gradient CSS');
                        }}
                        title="Click to copy"
                      />
                      <div className="flex items-center justify-between">
                        <code className="text-xs text-muted-foreground truncate flex-1">
                          {gradient.substring(0, 30)}...
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(gradient, 'Gradient CSS');
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No gradients in history yet. Create some gradients to see them here.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => copyToClipboard(currentGradient, 'CSS gradient')} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy CSS
                </Button>
                
                <Button onClick={downloadGradient} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
                
                <Button 
                  onClick={() => copyToClipboard(`bg-[${currentGradient.replace(/\s+/g, '_')}]`, 'Tailwind class')}
                  variant="outline" 
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Tailwind Class
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Gradient</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="w-full h-32 rounded-lg border border-border mb-4"
                  style={{ background: currentGradient }}
                />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">CSS Code</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <code className="text-sm break-all">{currentGradient}</code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>About CSS Gradients</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Linear Gradients</h4>
              <p className="text-sm text-muted-foreground">
                Create smooth transitions between colors along a straight line. 
                Perfect for backgrounds, buttons, and creating depth.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Radial Gradients</h4>
              <p className="text-sm text-muted-foreground">
                Radiate colors from a center point outward in a circular or elliptical pattern. 
                Great for spotlight effects and focal points.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Conic Gradients</h4>
              <p className="text-sm text-muted-foreground">
                Rotate colors around a center point. Perfect for creating 
                pie charts, progress indicators, and rainbow effects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}