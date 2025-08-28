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
import { Copy, Download, RefreshCw, Palette, Lock, Unlock, Heart, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  locked: boolean;
}

interface ColorPalette {
  id: string;
  name: string;
  colors: Color[];
  type: string;
  liked: boolean;
}

type PaletteType = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary' | 'random';

export default function PaletteGeneratorPage() {
  const { toast } = useToast();
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [paletteType, setPaletteType] = useState<PaletteType>('analogous');
  const [paletteSize, setPaletteSize] = useState(5);
  const [currentPalette, setCurrentPalette] = useState<Color[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<ColorPalette[]>([]);
  const [activeTab, setActiveTab] = useState('generator');
  const [colorVariation, setColorVariation] = useState(30);
  const [saturationRange, setSaturationRange] = useState([40, 80]);
  const [lightnessRange, setLightnessRange] = useState([30, 70]);

  // Color conversion functions
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  const createColor = (hex: string): Color => {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    return { hex, rgb, hsl, locked: false };
  };

  const generateRandomColor = (): string => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * (saturationRange[1] - saturationRange[0]) + saturationRange[0]);
    const lightness = Math.floor(Math.random() * (lightnessRange[1] - lightnessRange[0]) + lightnessRange[0]);
    const rgb = hslToRgb(hue, saturation, lightness);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  const generatePalette = useCallback(() => {
    const baseRgb = hexToRgb(baseColor);
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
    const colors: Color[] = [];

    // Keep locked colors
    const lockedColors = currentPalette.filter(color => color.locked);
    
    switch (paletteType) {
      case 'monochromatic':
        for (let i = 0; i < paletteSize; i++) {
          const lightness = Math.max(10, Math.min(90, baseHsl.l + (i - Math.floor(paletteSize / 2)) * 20));
          const rgb = hslToRgb(baseHsl.h, baseHsl.s, lightness);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        }
        break;

      case 'analogous':
        for (let i = 0; i < paletteSize; i++) {
          const hue = (baseHsl.h + (i - Math.floor(paletteSize / 2)) * colorVariation) % 360;
          const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        }
        break;

      case 'complementary':
        colors.push(createColor(baseColor));
        const compHue = (baseHsl.h + 180) % 360;
        const compRgb = hslToRgb(compHue, baseHsl.s, baseHsl.l);
        colors.push(createColor(rgbToHex(compRgb.r, compRgb.g, compRgb.b)));
        
        // Fill remaining slots with variations
        for (let i = 2; i < paletteSize; i++) {
          const useBase = i % 2 === 0;
          const hue = useBase ? baseHsl.h : compHue;
          const lightness = Math.max(10, Math.min(90, baseHsl.l + (Math.random() - 0.5) * 40));
          const rgb = hslToRgb(hue, baseHsl.s, lightness);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        }
        break;

      case 'triadic':
        for (let i = 0; i < Math.min(3, paletteSize); i++) {
          const hue = (baseHsl.h + i * 120) % 360;
          const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        }
        
        // Fill remaining slots with variations
        for (let i = 3; i < paletteSize; i++) {
          const baseIndex = i % 3;
          const baseTriadicHue = (baseHsl.h + baseIndex * 120) % 360;
          const lightness = Math.max(10, Math.min(90, baseHsl.l + (Math.random() - 0.5) * 30));
          const rgb = hslToRgb(baseTriadicHue, baseHsl.s, lightness);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        }
        break;

      case 'tetradic':
        for (let i = 0; i < Math.min(4, paletteSize); i++) {
          const hue = (baseHsl.h + i * 90) % 360;
          const rgb = hslToRgb(hue, baseHsl.s, baseHsl.l);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        }
        
        // Fill remaining slots with variations
        for (let i = 4; i < paletteSize; i++) {
          const baseIndex = i % 4;
          const baseTetradicHue = (baseHsl.h + baseIndex * 90) % 360;
          const lightness = Math.max(10, Math.min(90, baseHsl.l + (Math.random() - 0.5) * 30));
          const rgb = hslToRgb(baseTetradicHue, baseHsl.s, lightness);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        }
        break;

      case 'split-complementary':
        colors.push(createColor(baseColor));
        const splitHue1 = (baseHsl.h + 150) % 360;
        const splitHue2 = (baseHsl.h + 210) % 360;
        const split1Rgb = hslToRgb(splitHue1, baseHsl.s, baseHsl.l);
        const split2Rgb = hslToRgb(splitHue2, baseHsl.s, baseHsl.l);
        colors.push(createColor(rgbToHex(split1Rgb.r, split1Rgb.g, split1Rgb.b)));
        colors.push(createColor(rgbToHex(split2Rgb.r, split2Rgb.g, split2Rgb.b)));
        
        // Fill remaining slots with variations
        for (let i = 3; i < paletteSize; i++) {
          const hues = [baseHsl.h, splitHue1, splitHue2];
          const hue = hues[i % 3];
          const lightness = Math.max(10, Math.min(90, baseHsl.l + (Math.random() - 0.5) * 30));
          const rgb = hslToRgb(hue, baseHsl.s, lightness);
          colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
        }
        break;

      case 'random':
        for (let i = 0; i < paletteSize; i++) {
          colors.push(createColor(generateRandomColor()));
        }
        break;
    }

    // Merge with locked colors
    const newPalette = colors.slice(0, paletteSize);
    lockedColors.forEach((lockedColor, index) => {
      if (index < newPalette.length) {
        newPalette[index] = lockedColor;
      }
    });

    setCurrentPalette(newPalette);
  }, [baseColor, paletteType, paletteSize, colorVariation, saturationRange, lightnessRange, currentPalette]);

  const toggleColorLock = (index: number) => {
    setCurrentPalette(prev => 
      prev.map((color, i) => 
        i === index ? { ...color, locked: !color.locked } : color
      )
    );
  };

  const updateColor = (index: number, newHex: string) => {
    setCurrentPalette(prev => 
      prev.map((color, i) => 
        i === index ? createColor(newHex) : color
      )
    );
  };

  const savePalette = () => {
    const newPalette: ColorPalette = {
      id: Date.now().toString(),
      name: `Palette ${savedPalettes.length + 1}`,
      colors: currentPalette,
      type: paletteType,
      liked: false
    };
    
    setSavedPalettes(prev => [newPalette, ...prev]);
    toast({
      title: 'Palette Saved!',
      description: 'Your color palette has been saved to your collection.',
    });
  };

  const loadPalette = (palette: ColorPalette) => {
    setCurrentPalette(palette.colors);
    setPaletteType(palette.type as PaletteType);
    setPaletteSize(palette.colors.length);
  };

  const togglePaletteLike = (id: string) => {
    setSavedPalettes(prev => 
      prev.map(palette => 
        palette.id === id ? { ...palette, liked: !palette.liked } : palette
      )
    );
  };

  const deletePalette = (id: string) => {
    setSavedPalettes(prev => prev.filter(palette => palette.id !== id));
  };

  const copyPaletteColors = async (format: 'hex' | 'rgb' | 'hsl') => {
    let colorString = '';
    
    switch (format) {
      case 'hex':
        colorString = currentPalette.map(color => color.hex).join(', ');
        break;
      case 'rgb':
        colorString = currentPalette.map(color => 
          `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`
        ).join(', ');
        break;
      case 'hsl':
        colorString = currentPalette.map(color => 
          `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`
        ).join(', ');
        break;
    }
    
    try {
      await navigator.clipboard.writeText(colorString);
      toast({
        title: 'Copied!',
        description: `Palette colors copied as ${format.toUpperCase()} values`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const downloadPalette = () => {
    const paletteData = {
      name: `Palette ${Date.now()}`,
      type: paletteType,
      baseColor,
      colors: currentPalette.map(color => ({
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl
      })),
      settings: {
        paletteSize,
        colorVariation,
        saturationRange,
        lightnessRange
      },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-palette-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsCSS = () => {
    const cssVariables = currentPalette.map((color, index) => 
      `  --color-${index + 1}: ${color.hex};`
    ).join('\n');
    
    const cssContent = `:root {\n${cssVariables}\n}`;
    
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette-${Date.now()}.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    generatePalette();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Color Palette Generator</h1>
        <p className="text-lg text-muted-foreground">
          Generate beautiful color palettes using color theory principles and save your favorites.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="current">Current Palette</TabsTrigger>
          <TabsTrigger value="saved">Saved Palettes</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Palette Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="base-color">Base Color</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        id="base-color"
                        type="color"
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        className="w-16 h-10 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={baseColor}
                        onChange={(e) => setBaseColor(e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="palette-type">Palette Type</Label>
                    <Select value={paletteType} onValueChange={(value: PaletteType) => setPaletteType(value)}>
                      <SelectTrigger id="palette-type" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monochromatic">Monochromatic</SelectItem>
                        <SelectItem value="analogous">Analogous</SelectItem>
                        <SelectItem value="complementary">Complementary</SelectItem>
                        <SelectItem value="triadic">Triadic</SelectItem>
                        <SelectItem value="tetradic">Tetradic</SelectItem>
                        <SelectItem value="split-complementary">Split Complementary</SelectItem>
                        <SelectItem value="random">Random</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="palette-size">Palette Size: {paletteSize}</Label>
                    <Slider
                      id="palette-size"
                      min={2}
                      max={10}
                      step={1}
                      value={[paletteSize]}
                      onValueChange={(value) => setPaletteSize(value[0])}
                      className="mt-2"
                    />
                  </div>

                  {paletteType === 'analogous' && (
                    <div>
                      <Label htmlFor="color-variation">Color Variation: {colorVariation}°</Label>
                      <Slider
                        id="color-variation"
                        min={10}
                        max={60}
                        step={5}
                        value={[colorVariation]}
                        onValueChange={(value) => setColorVariation(value[0])}
                        className="mt-2"
                      />
                    </div>
                  )}

                  {paletteType === 'random' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Saturation Range: {saturationRange[0]}% - {saturationRange[1]}%</Label>
                        <Slider
                          min={0}
                          max={100}
                          step={5}
                          value={saturationRange}
                          onValueChange={setSaturationRange}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Lightness Range: {lightnessRange[0]}% - {lightnessRange[1]}%</Label>
                        <Slider
                          min={0}
                          max={100}
                          step={5}
                          value={lightnessRange}
                          onValueChange={setLightnessRange}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={generatePalette} className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                    <Button onClick={savePalette} variant="outline" className="flex-1">
                      Save Palette
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Palette</CardTitle>
                  <CardDescription>
                    Click colors to edit, lock icon to preserve during regeneration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {currentPalette.map((color, index) => (
                      <div key={index} className="space-y-2">
                        <div className="relative group">
                          <div
                            className="w-full h-24 rounded-lg border border-border cursor-pointer transition-transform hover:scale-105"
                            style={{ backgroundColor: color.hex }}
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'color';
                              input.value = color.hex;
                              input.onchange = (e) => updateColor(index, (e.target as HTMLInputElement).value);
                              input.click();
                            }}
                          />
                          <Button
                            size="sm"
                            variant={color.locked ? "default" : "outline"}
                            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => toggleColorLock(index)}
                          >
                            {color.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                          </Button>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <code className="text-sm font-mono">{color.hex}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigator.clipboard.writeText(color.hex)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            HSL: {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Palette</CardTitle>
              <CardDescription>
                Your current color palette with detailed information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-2 h-20">
                  {currentPalette.map((color, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-lg border border-border"
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentPalette.map((color, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div
                          className="w-full h-16 rounded-lg mb-3 border border-border"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Color {index + 1}</span>
                            {color.locked && <Lock className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                              <span>HEX:</span>
                              <code className="font-mono">{color.hex}</code>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>RGB:</span>
                              <code className="font-mono">{color.rgb.r}, {color.rgb.g}, {color.rgb.b}</code>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>HSL:</span>
                              <code className="font-mono">{color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%</code>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Button onClick={() => copyPaletteColors('hex')} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HEX
                  </Button>
                  <Button onClick={() => copyPaletteColors('rgb')} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy RGB
                  </Button>
                  <Button onClick={() => copyPaletteColors('hsl')} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HSL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Saved Palettes</CardTitle>
              <CardDescription>
                Your collection of saved color palettes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedPalettes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedPalettes.map((palette) => (
                    <Card key={palette.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-1 h-12 mb-3 rounded-lg overflow-hidden">
                          {palette.colors.map((color, index) => (
                            <div
                              key={index}
                              className="flex-1"
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{palette.name}</h3>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  togglePaletteLike(palette.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Heart className={`h-3 w-3 ${palette.liked ? 'fill-red-500 text-red-500' : ''}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deletePalette(palette.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span className="capitalize">{palette.type}</span>
                            <Badge variant="outline">{palette.colors.length} colors</Badge>
                          </div>
                          
                          <Button 
                            onClick={() => loadPalette(palette)} 
                            size="sm" 
                            className="w-full"
                          >
                            Load Palette
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No saved palettes</h3>
                  <p className="text-muted-foreground mb-4">
                    Generate and save your first color palette to see it here.
                  </p>
                  <Button onClick={() => setActiveTab('generator')}>
                    Generate Palette
                  </Button>
                </div>
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
                <Button onClick={() => copyPaletteColors('hex')} className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy as HEX
                </Button>
                
                <Button onClick={() => copyPaletteColors('rgb')} variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy as RGB
                </Button>
                
                <Button onClick={() => copyPaletteColors('hsl')} variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy as HSL
                </Button>
                
                <Button onClick={downloadPalette} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
                
                <Button onClick={exportAsCSS} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSS
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Palette Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-1 h-16 rounded-lg overflow-hidden">
                    {currentPalette.map((color, index) => (
                      <div
                        key={index}
                        className="flex-1"
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">CSS Variables</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <code className="text-sm">
                        :root {'{'}<br />
                        {currentPalette.map((color, index) => (
                          <span key={index}>
                            {'  '}--color-{index + 1}: {color.hex};<br />
                          </span>
                        ))}
                        {'}'}
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>About Color Palettes</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Color Theory</h4>
              <p className="text-sm text-muted-foreground">
                Color palettes are based on color theory principles that create 
                harmonious and visually pleasing combinations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Palette Types</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><strong>Monochromatic:</strong> Variations of a single hue</li>
                <li><strong>Analogous:</strong> Adjacent colors on the color wheel</li>
                <li><strong>Complementary:</strong> Opposite colors on the color wheel</li>
                <li><strong>Triadic:</strong> Three evenly spaced colors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Usage Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Use the 60-30-10 rule for balanced designs</li>
                <li>Lock colors you want to keep when regenerating</li>
                <li>Test accessibility with contrast checkers</li>
                <li>Save palettes for consistent branding</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}