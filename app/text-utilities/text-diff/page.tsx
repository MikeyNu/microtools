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
  GitCompare, 
  Copy, 
  Download, 
  RefreshCw, 
  FileText, 
  Split, 
  Minus, 
  Plus,
  ArrowLeftRight,
  Eye,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
  oldContent?: string;
  newContent?: string;
}

interface DiffStats {
  additions: number;
  deletions: number;
  modifications: number;
  unchanged: number;
  totalLines: number;
}

export default function TextDiffPage() {
  const { toast } = useToast();
  const [originalText, setOriginalText] = useState('');
  const [modifiedText, setModifiedText] = useState('');
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [diffMode, setDiffMode] = useState<'line' | 'word' | 'character'>('line');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [stats, setStats] = useState<DiffStats>({
    additions: 0,
    deletions: 0,
    modifications: 0,
    unchanged: 0,
    totalLines: 0
  });

  // Sample texts for demonstration
  const loadSampleTexts = () => {
    const original = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

const items = [
  { name: 'Apple', price: 1.50 },
  { name: 'Banana', price: 0.75 },
  { name: 'Orange', price: 2.00 }
];

console.log('Total:', calculateTotal(items));`;

    const modified = `function calculateTotal(items, tax = 0) {
  let total = 0;
  for (const item of items) {
    total += item.price;
  }
  return total * (1 + tax);
}

const items = [
  { name: 'Apple', price: 1.50 },
  { name: 'Banana', price: 0.75 },
  { name: 'Orange', price: 2.00 },
  { name: 'Grape', price: 3.25 }
];

const taxRate = 0.08;
console.log('Total with tax:', calculateTotal(items, taxRate));`;

    setOriginalText(original);
    setModifiedText(modified);
  };

  // Normalize text based on settings
  const normalizeText = (text: string): string => {
    let normalized = text;
    
    if (ignoreCase) {
      normalized = normalized.toLowerCase();
    }
    
    if (ignoreWhitespace) {
      normalized = normalized.replace(/\s+/g, ' ').trim();
    }
    
    return normalized;
  };

  // Simple diff algorithm (Myers algorithm simplified)
  const calculateDiff = (): DiffLine[] => {
    const originalLines = normalizeText(originalText).split('\n');
    const modifiedLines = normalizeText(modifiedText).split('\n');
    
    if (diffMode === 'line') {
      return calculateLineDiff(originalLines, modifiedLines);
    } else if (diffMode === 'word') {
      return calculateWordDiff(originalText, modifiedText);
    } else {
      return calculateCharacterDiff(originalText, modifiedText);
    }
  };

  const calculateLineDiff = (originalLines: string[], modifiedLines: string[]): DiffLine[] => {
    const diff: DiffLine[] = [];
    const m = originalLines.length;
    const n = modifiedLines.length;
    
    // Simple LCS-based diff
    const lcs = calculateLCS(originalLines, modifiedLines);
    
    let i = 0, j = 0;
    let oldLineNum = 1, newLineNum = 1;
    
    while (i < m || j < n) {
      if (i < m && j < n && originalLines[i] === modifiedLines[j]) {
        // Lines are the same
        diff.push({
          type: 'unchanged',
          oldLineNumber: oldLineNum++,
          newLineNumber: newLineNum++,
          content: originalLines[i]
        });
        i++;
        j++;
      } else if (i < m && (j >= n || !lcs[i][j])) {
        // Line was removed
        diff.push({
          type: 'removed',
          oldLineNumber: oldLineNum++,
          content: originalLines[i]
        });
        i++;
      } else if (j < n) {
        // Line was added
        diff.push({
          type: 'added',
          newLineNumber: newLineNum++,
          content: modifiedLines[j]
        });
        j++;
      }
    }
    
    return diff;
  };

  const calculateWordDiff = (original: string, modified: string): DiffLine[] => {
    const originalWords = normalizeText(original).split(/\s+/);
    const modifiedWords = normalizeText(modified).split(/\s+/);
    
    const diff: DiffLine[] = [];
    const lcs = calculateLCS(originalWords, modifiedWords);
    
    let i = 0, j = 0;
    let currentLine: DiffLine = { type: 'unchanged', content: '', oldContent: '', newContent: '' };
    
    while (i < originalWords.length || j < modifiedWords.length) {
      if (i < originalWords.length && j < modifiedWords.length && originalWords[i] === modifiedWords[j]) {
        currentLine.content += originalWords[i] + ' ';
        i++;
        j++;
      } else if (i < originalWords.length && (j >= modifiedWords.length || !lcs[i][j])) {
        if (currentLine.type !== 'removed' && currentLine.content) {
          diff.push({ ...currentLine });
          currentLine = { type: 'removed', content: '', oldContent: '', newContent: '' };
        }
        currentLine.type = 'removed';
        currentLine.content += originalWords[i] + ' ';
        i++;
      } else if (j < modifiedWords.length) {
        if (currentLine.type !== 'added' && currentLine.content) {
          diff.push({ ...currentLine });
          currentLine = { type: 'added', content: '', oldContent: '', newContent: '' };
        }
        currentLine.type = 'added';
        currentLine.content += modifiedWords[j] + ' ';
        j++;
      }
    }
    
    if (currentLine.content) {
      diff.push(currentLine);
    }
    
    return diff;
  };

  const calculateCharacterDiff = (original: string, modified: string): DiffLine[] => {
    const originalChars = normalizeText(original).split('');
    const modifiedChars = normalizeText(modified).split('');
    
    const diff: DiffLine[] = [];
    const lcs = calculateLCS(originalChars, modifiedChars);
    
    let i = 0, j = 0;
    let currentLine: DiffLine = { type: 'unchanged', content: '' };
    
    while (i < originalChars.length || j < modifiedChars.length) {
      if (i < originalChars.length && j < modifiedChars.length && originalChars[i] === modifiedChars[j]) {
        if (currentLine.type !== 'unchanged' && currentLine.content) {
          diff.push({ ...currentLine });
          currentLine = { type: 'unchanged', content: '' };
        }
        currentLine.content += originalChars[i];
        i++;
        j++;
      } else if (i < originalChars.length && (j >= modifiedChars.length || !lcs[i][j])) {
        if (currentLine.type !== 'removed' && currentLine.content) {
          diff.push({ ...currentLine });
          currentLine = { type: 'removed', content: '' };
        }
        currentLine.type = 'removed';
        currentLine.content += originalChars[i];
        i++;
      } else if (j < modifiedChars.length) {
        if (currentLine.type !== 'added' && currentLine.content) {
          diff.push({ ...currentLine });
          currentLine = { type: 'added', content: '' };
        }
        currentLine.type = 'added';
        currentLine.content += modifiedChars[j];
        j++;
      }
    }
    
    if (currentLine.content) {
      diff.push(currentLine);
    }
    
    return diff;
  };

  // Calculate Longest Common Subsequence
  const calculateLCS = (a: string[], b: string[]): boolean[][] => {
    const m = a.length;
    const n = b.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Backtrack to find LCS
    const lcs: boolean[][] = Array(m).fill(null).map(() => Array(n).fill(false));
    let i = m, j = n;
    
    while (i > 0 && j > 0) {
      if (a[i - 1] === b[j - 1]) {
        lcs[i - 1][j - 1] = true;
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    return lcs;
  };

  // Calculate statistics
  const calculateStats = (diff: DiffLine[]): DiffStats => {
    const stats = {
      additions: 0,
      deletions: 0,
      modifications: 0,
      unchanged: 0,
      totalLines: diff.length
    };
    
    diff.forEach(line => {
      switch (line.type) {
        case 'added':
          stats.additions++;
          break;
        case 'removed':
          stats.deletions++;
          break;
        case 'modified':
          stats.modifications++;
          break;
        case 'unchanged':
          stats.unchanged++;
          break;
      }
    });
    
    return stats;
  };

  const swapTexts = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  const clearTexts = () => {
    setOriginalText('');
    setModifiedText('');
  };

  const copyDiff = async () => {
    const diffText = diffLines.map(line => {
      const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
      return prefix + line.content;
    }).join('\n');
    
    try {
      await navigator.clipboard.writeText(diffText);
      toast({
        title: 'Copied!',
        description: 'Diff results copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const downloadDiff = () => {
    const diffText = diffLines.map(line => {
      const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
      return prefix + line.content;
    }).join('\n');
    
    const blob = new Blob([diffText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const diff = calculateDiff();
    setDiffLines(diff);
    setStats(calculateStats(diff));
  }, [originalText, modifiedText, diffMode, ignoreWhitespace, ignoreCase]);

  const getLineStyle = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-500 text-green-800';
      case 'removed':
        return 'bg-red-50 border-l-4 border-red-500 text-red-800';
      case 'modified':
        return 'bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800';
      default:
        return 'bg-background';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Text Diff Tool</h1>
        <p className="text-lg text-muted-foreground">
          Compare two texts and highlight differences with side-by-side or unified view.
        </p>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Diff Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="view-mode">View Mode</Label>
                <Select value={viewMode} onValueChange={(value: 'side-by-side' | 'unified') => setViewMode(value)}>
                  <SelectTrigger id="view-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="side-by-side">
                      <div className="flex items-center gap-2">
                        <Split className="h-4 w-4" />
                        Side by Side
                      </div>
                    </SelectItem>
                    <SelectItem value="unified">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Unified
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="diff-mode">Diff Mode</Label>
                <Select value={diffMode} onValueChange={(value: 'line' | 'word' | 'character') => setDiffMode(value)}>
                  <SelectTrigger id="diff-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line by Line</SelectItem>
                    <SelectItem value="word">Word by Word</SelectItem>
                    <SelectItem value="character">Character by Character</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ignore-whitespace"
                    checked={ignoreWhitespace}
                    onCheckedChange={setIgnoreWhitespace}
                  />
                  <Label htmlFor="ignore-whitespace" className="text-sm">
                    Ignore Whitespace
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ignore-case"
                    checked={ignoreCase}
                    onCheckedChange={setIgnoreCase}
                  />
                  <Label htmlFor="ignore-case" className="text-sm">
                    Ignore Case
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-line-numbers"
                    checked={showLineNumbers}
                    onCheckedChange={setShowLineNumbers}
                  />
                  <Label htmlFor="show-line-numbers" className="text-sm">
                    Line Numbers
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={loadSampleTexts} size="sm" variant="outline">
                    Load Sample
                  </Button>
                  <Button onClick={swapTexts} size="sm" variant="outline">
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Texts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Original Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste your original text here..."
                className="font-mono text-sm h-64 resize-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Modified Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                placeholder="Paste your modified text here..."
                className="font-mono text-sm h-64 resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Diff Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.additions}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Plus className="h-3 w-3" />
                  Additions
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.deletions}</div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Minus className="h-3 w-3" />
                  Deletions
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.modifications}</div>
                <div className="text-sm text-muted-foreground">Modifications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.unchanged}</div>
                <div className="text-sm text-muted-foreground">Unchanged</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.totalLines}</div>
                <div className="text-sm text-muted-foreground">Total Lines</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diff Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Diff Results
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={copyDiff} size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Diff
                </Button>
                <Button onClick={downloadDiff} size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={clearTexts} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {diffLines.length > 0 ? (
              <div className="space-y-1">
                {viewMode === 'side-by-side' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Original</h4>
                      {diffLines.map((line, index) => (
                        line.type !== 'added' && (
                          <div
                            key={index}
                            className={`p-2 rounded text-sm font-mono ${getLineStyle(line.type)}`}
                          >
                            {showLineNumbers && line.oldLineNumber && (
                              <span className="text-muted-foreground mr-4 select-none">
                                {line.oldLineNumber.toString().padStart(3, ' ')}
                              </span>
                            )}
                            <span className="whitespace-pre-wrap">{line.content}</span>
                          </div>
                        )
                      ))}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Modified</h4>
                      {diffLines.map((line, index) => (
                        line.type !== 'removed' && (
                          <div
                            key={index}
                            className={`p-2 rounded text-sm font-mono ${getLineStyle(line.type)}`}
                          >
                            {showLineNumbers && line.newLineNumber && (
                              <span className="text-muted-foreground mr-4 select-none">
                                {line.newLineNumber.toString().padStart(3, ' ')}
                              </span>
                            )}
                            <span className="whitespace-pre-wrap">{line.content}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {diffLines.map((line, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded text-sm font-mono ${getLineStyle(line.type)}`}
                      >
                        <span className="text-muted-foreground mr-2 select-none">
                          {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                        </span>
                        {showLineNumbers && (
                          <span className="text-muted-foreground mr-4 select-none">
                            {(line.oldLineNumber || line.newLineNumber || '').toString().padStart(3, ' ')}
                          </span>
                        )}
                        <span className="whitespace-pre-wrap">{line.content}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <GitCompare className="h-12 w-12 mx-auto mb-4" />
                <p>Enter text in both fields to see the differences</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 border-l-4 border-green-500 rounded-sm"></div>
                <span className="text-sm">Added lines</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 border-l-4 border-red-500 rounded-sm"></div>
                <span className="text-sm">Removed lines</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded-sm"></div>
                <span className="text-sm">Unchanged lines</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}