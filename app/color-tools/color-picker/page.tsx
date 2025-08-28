'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, Palette, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColorFormats {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
  lab: { l: number; a: number; b: number };
}

interface ColorHarmony {
  name: string;
  colors: string[];
}

export default function ColorPickerPage() {
  const { toast } = useToast();
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [colorFormats, setColorFormats] = useState<ColorFormats>({
    hex: '#3b82f6',
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    hsv: { h: 217, s: 76, v: 96 },
    cmyk: { c: 76, m: 47, y: 0, k: 4 },
    lab: { l: 55, a: 8, b: -64 }
  });
  const [colorHistory, setColorHistory] = useState<string[]>(['#3b82f6']);
  const [harmonies, setHarmonies] = useState<ColorHarmony[]>([]);
  const [activeTab, setActiveTab] = useState('picker');

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

  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;

    const d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max !== min) {
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
      v: Math.round(v * 100)
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const k = 1 - Math.max(r, Math.max(g, b));
    const c = (1 - r - k) / (1 - k) || 0;
    const m = (1 - g - k) / (1 - k) || 0;
    const y = (1 - b - k) / (1 - k) || 0;

    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  const rgbToLab = (r: number, g: number, b: number): { l: number; a: number; b: number } => {
    // Simplified LAB conversion (approximate)
    r /= 255;
    g /= 255;
    b /= 255;

    // Convert to XYZ
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

    return {
      l: Math.round((116 * y) - 16),
      a: Math.round(500 * (x - y)),
      b: Math.round(200 * (y - z))
    };
  };

  const generateColorHarmonies = useCallback((baseColor: string): ColorHarmony[] => {
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const baseHue = hsl.h;

    const hslToHex = (h: number, s: number, l: number): string => {
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

      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);

      return rgbToHex(r, g, b);
    };

    return [
      {
        name: 'Monochromatic',
        colors: [
          hslToHex(baseHue, hsl.s, Math.max(10, hsl.l - 30)),
          hslToHex(baseHue, hsl.s, Math.max(10, hsl.l - 15)),
          baseColor,
          hslToHex(baseHue, hsl.s, Math.min(90, hsl.l + 15)),
          hslToHex(baseHue, hsl.s, Math.min(90, hsl.l + 30))
        ]
      },
      {
        name: 'Analogous',
        colors: [
          hslToHex(baseHue - 60, hsl.s, hsl.l),
          hslToHex(baseHue - 30, hsl.s, hsl.l),
          baseColor,
          hslToHex(baseHue + 30, hsl.s, hsl.l),
          hslToHex(baseHue + 60, hsl.s, hsl.l)
        ]
      },
      {
        name: 'Complementary',
        colors: [
          baseColor,
          hslToHex(baseHue + 180, hsl.s, hsl.l)
        ]
      },
      {
        name: 'Triadic',
        colors: [
          baseColor,
          hslToHex(baseHue + 120, hsl.s, hsl.l),
          hslToHex(baseHue + 240, hsl.s, hsl.l)
        ]
      },
      {
        name: 'Split Complementary',
        colors: [
          baseColor,
          hslToHex(baseHue + 150, hsl.s, hsl.l),
          hslToHex(baseHue + 210, hsl.s, hsl.l)
        ]
      },
      {
        name: 'Tetradic',
        colors: [
          baseColor,
          hslToHex(baseHue + 90, hsl.s, hsl.l),
          hslToHex(baseHue + 180, hsl.s, hsl.l),
          hslToHex(baseHue + 270, hsl.s, hsl.l)
        ]
      }
    ];
  }, []);

  const updateColorFormats = useCallback((color: string) => {
    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const lab = rgbToLab(rgb.r, rgb.g, rgb.b);

    setColorFormats({
      hex: color,
      rgb,
      hsl,
      hsv,
      cmyk,
      lab
    });
  }, []);

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    updateColorFormats(color);
    
    // Add to history if not already present
    if (!colorHistory.includes(color)) {
      setColorHistory(prev => [color, ...prev.slice(0, 19)]); // Keep last 20 colors
    }
  };

  const handleRgbChange = (component: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...colorFormats.rgb, [component]: value };
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    handleColorChange(newHex);
  };

  const handleHslChange = (component: 'h' | 's' | 'l', value: number) => {
    const newHsl = { ...colorFormats.hsl, [component]: value };
    
    // Convert HSL back to RGB then to HEX
    const h = newHsl.h / 360;
    const s = newHsl.s / 100;
    const l = newHsl.l / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    const newHex = rgbToHex(r, g, b);
    handleColorChange(newHex);
  };

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${format} value copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const generateRandomColor = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    handleColorChange(randomHex);
  };

  const downloadPalette = (harmony: ColorHarmony) => {
    const paletteData = {
      name: harmony.name,
      baseColor: currentColor,
      colors: harmony.colors,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${harmony.name.toLowerCase().replace(/\s+/g, '-')}-palette.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    updateColorFormats(currentColor);
    setHarmonies(generateColorHarmonies(currentColor));
  }, [currentColor, updateColorFormats, generateColorHarmonies]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Advanced Color Picker</h1>
        <p className="text-lg text-muted-foreground">
          Professional color picker with format conversion, color harmonies, and palette generation.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="picker">Color Picker</TabsTrigger>
          <TabsTrigger value="formats">Formats</TabsTrigger>
          <TabsTrigger value="harmonies">Harmonies</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="picker" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="color-input">Color</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        id="color-input"
                        type="color"
                        value={currentColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-16 h-16 rounded border border-border cursor-pointer"
                      />
                      <div className="flex-1">
                        <Input
                          value={currentColor}
                          onChange={(e) => handleColorChange(e.target.value)}
                          placeholder="#000000"
                          className="mb-2"
                        />
                        <Button onClick={generateRandomColor} variant="outline" size="sm" className="w-full">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Random Color
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>RGB Values</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <Label htmlFor="r-slider" className="text-sm text-red-600">R: {colorFormats.rgb.r}</Label>
                          <Slider
                            id="r-slider"
                            min={0}
                            max={255}
                            step={1}
                            value={[colorFormats.rgb.r]}
                            onValueChange={(value) => handleRgbChange('r', value[0])}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="g-slider" className="text-sm text-green-600">G: {colorFormats.rgb.g}</Label>
                          <Slider
                            id="g-slider"
                            min={0}
                            max={255}
                            step={1}
                            value={[colorFormats.rgb.g]}
                            onValueChange={(value) => handleRgbChange('g', value[0])}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="b-slider" className="text-sm text-blue-600">B: {colorFormats.rgb.b}</Label>
                          <Slider
                            id="b-slider"
                            min={0}
                            max={255}
                            step={1}
                            value={[colorFormats.rgb.b]}
                            onValueChange={(value) => handleRgbChange('b', value[0])}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>HSL Values</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <Label htmlFor="h-slider" className="text-sm">H: {colorFormats.hsl.h}°</Label>
                          <Slider
                            id="h-slider"
                            min={0}
                            max={360}
                            step={1}
                            value={[colorFormats.hsl.h]}
                            onValueChange={(value) => handleHslChange('h', value[0])}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="s-slider" className="text-sm">S: {colorFormats.hsl.s}%</Label>
                          <Slider
                            id="s-slider"
                            min={0}
                            max={100}
                            step={1}
                            value={[colorFormats.hsl.s]}
                            onValueChange={(value) => handleHslChange('s', value[0])}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="l-slider" className="text-sm">L: {colorFormats.hsl.l}%</Label>
                          <Slider
                            id="l-slider"
                            min={0}
                            max={100}
                            step={1}
                            value={[colorFormats.hsl.l]}
                            onValueChange={(value) => handleHslChange('l', value[0])}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Color Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div 
                    className="w-full h-32 rounded-lg border border-border"
                    style={{ backgroundColor: currentColor }}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: currentColor, color: '#ffffff' }}>
                      <p className="font-medium">White Text</p>
                      <p className="text-sm opacity-90">Sample content</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: currentColor, color: '#000000' }}>
                      <p className="font-medium">Black Text</p>
                      <p className="text-sm opacity-70">Sample content</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">HEX</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono">{colorFormats.hex}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(colorFormats.hex, 'HEX')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">RGB</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">
                      rgb({colorFormats.rgb.r}, {colorFormats.rgb.g}, {colorFormats.rgb.b})
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`rgb(${colorFormats.rgb.r}, ${colorFormats.rgb.g}, ${colorFormats.rgb.b})`, 'RGB')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    R: {colorFormats.rgb.r}, G: {colorFormats.rgb.g}, B: {colorFormats.rgb.b}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">HSL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">
                      hsl({colorFormats.hsl.h}, {colorFormats.hsl.s}%, {colorFormats.hsl.l}%)
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`hsl(${colorFormats.hsl.h}, ${colorFormats.hsl.s}%, ${colorFormats.hsl.l}%)`, 'HSL')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    H: {colorFormats.hsl.h}°, S: {colorFormats.hsl.s}%, L: {colorFormats.hsl.l}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">HSV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">
                      hsv({colorFormats.hsv.h}, {colorFormats.hsv.s}%, {colorFormats.hsv.v}%)
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`hsv(${colorFormats.hsv.h}, ${colorFormats.hsv.s}%, ${colorFormats.hsv.v}%)`, 'HSV')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    H: {colorFormats.hsv.h}°, S: {colorFormats.hsv.s}%, V: {colorFormats.hsv.v}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CMYK</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">
                      cmyk({colorFormats.cmyk.c}, {colorFormats.cmyk.m}, {colorFormats.cmyk.y}, {colorFormats.cmyk.k})
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`cmyk(${colorFormats.cmyk.c}, ${colorFormats.cmyk.m}, ${colorFormats.cmyk.y}, ${colorFormats.cmyk.k})`, 'CMYK')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    C: {colorFormats.cmyk.c}%, M: {colorFormats.cmyk.m}%, Y: {colorFormats.cmyk.y}%, K: {colorFormats.cmyk.k}%
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">LAB</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">
                      lab({colorFormats.lab.l}, {colorFormats.lab.a}, {colorFormats.lab.b})
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`lab(${colorFormats.lab.l}, ${colorFormats.lab.a}, ${colorFormats.lab.b})`, 'LAB')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    L: {colorFormats.lab.l}, A: {colorFormats.lab.a}, B: {colorFormats.lab.b}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="harmonies" className="space-y-6">
          <div className="space-y-6">
            {harmonies.map((harmony) => (
              <Card key={harmony.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{harmony.name}</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadPalette(harmony)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    {harmony.colors.map((color, index) => (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div
                          className="w-16 h-16 rounded-lg border border-border cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => handleColorChange(color)}
                          title={`Click to select ${color}`}
                        />
                        <code className="text-xs font-mono">{color}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(color, 'Color')}
                          className="h-6 px-2"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Color History</CardTitle>
              <CardDescription>
                Recently used colors (click to select)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {colorHistory.length > 0 ? (
                <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
                  {colorHistory.map((color, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div
                        className="w-12 h-12 rounded border border-border cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                        title={color}
                      />
                      <code className="text-xs font-mono">{color}</code>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No colors in history yet. Start picking colors to see them here.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>About Color Picker</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Color Formats</h4>
              <ul className="space-y-1 text-sm">
                <li><strong>HEX:</strong> Hexadecimal color notation (#RRGGBB)</li>
                <li><strong>RGB:</strong> Red, Green, Blue values (0-255)</li>
                <li><strong>HSL:</strong> Hue, Saturation, Lightness</li>
                <li><strong>HSV:</strong> Hue, Saturation, Value</li>
                <li><strong>CMYK:</strong> Cyan, Magenta, Yellow, Key (Black)</li>
                <li><strong>LAB:</strong> Lightness, A (green-red), B (blue-yellow)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Color Harmonies</h4>
              <ul className="space-y-1 text-sm">
                <li><strong>Monochromatic:</strong> Different shades of the same hue</li>
                <li><strong>Analogous:</strong> Colors adjacent on the color wheel</li>
                <li><strong>Complementary:</strong> Colors opposite on the color wheel</li>
                <li><strong>Triadic:</strong> Three colors evenly spaced on the color wheel</li>
                <li><strong>Split Complementary:</strong> Base color plus two adjacent to its complement</li>
                <li><strong>Tetradic:</strong> Four colors forming a rectangle on the color wheel</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}