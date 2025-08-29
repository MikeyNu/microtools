'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Copy, 
  FileText, 
  Eye, 
  Code, 
  Split, 
  Maximize2, 
  Minimize2,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Code2,
  Image,
  Table,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarkdownStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  readingTime: number;
  headings: number;
  links: number;
  images: number;
  codeBlocks: number;
}

export default function MarkdownEditorPage() {
  const { toast } = useToast();
  const [markdown, setMarkdown] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState<MarkdownStats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    lines: 0,
    paragraphs: 0,
    readingTime: 0,
    headings: 0,
    links: 0,
    images: 0,
    codeBlocks: 0
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sample markdown content
  const sampleMarkdown = `# Welcome to Markdown Editor

This is a **powerful** markdown editor with live preview and export capabilities.

## Features

- Live preview
- Syntax highlighting
- Export to HTML
- Text statistics
- Toolbar shortcuts

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

### Table Example

| Feature | Status | Priority |
|---------|--------|---------|
| Live Preview | ✅ | High |
| Export | ✅ | High |
| Statistics | ✅ | Medium |

### Links and Images

Check out [Markdown Guide](https://www.markdownguide.org/) for more information.

![Markdown Logo](https://markdown-here.com/img/icon256.png)

> This is a blockquote. Markdown makes it easy to format text.

---

**Happy writing!** 🚀`;

  // Markdown to HTML conversion (simplified)
  const markdownToHtml = (md: string): string => {
    let html = md
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code inline
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Horizontal rule
      .replace(/^---$/gim, '<hr>')
      // Line breaks
      .replace(/\n/g, '<br>');

    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      const lines = code.trim().split('\n');
      const language = lines[0].trim();
      const codeContent = lines.slice(1).join('\n');
      return `<pre><code class="language-${language}">${codeContent}</code></pre>`;
    });

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');

    // Tables
    const tableRegex = /\|(.+)\|\n\|[-\s|]+\|\n((\|.+\|\n?)+)/g;
    html = html.replace(tableRegex, (match: string, header: string, body: string) => {
      const headerCells = header.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell);
      const bodyRows = body.trim().split('\n').map((row: string) => 
        row.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell)
      );
      
      let table = '<table style="border-collapse: collapse; width: 100%; margin: 1em 0;">';
      table += '<thead><tr>';
      headerCells.forEach((cell: string) => {
        table += `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5;">${cell}</th>`;
      });
      table += '</tr></thead><tbody>';
      
      bodyRows.forEach((row: string[]) => {
        table += '<tr>';
        row.forEach((cell: string) => {
          table += `<td style="border: 1px solid #ddd; padding: 8px;">${cell}</td>`;
        });
        table += '</tr>';
      });
      
      table += '</tbody></table>';
      return table;
    });

    return html;
  };

  // Calculate text statistics
  const calculateStats = (text: string): MarkdownStats => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    const headings = (text.match(/^#{1,6} /gm) || []).length;
    const links = (text.match(/\[([^\]]+)\]\(([^\)]+)\)/g) || []).length;
    const images = (text.match(/!\[([^\]]*)\]\(([^\)]+)\)/g) || []).length;
    const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;

    return {
      characters,
      charactersNoSpaces,
      words,
      lines,
      paragraphs,
      readingTime,
      headings,
      links,
      images,
      codeBlocks
    };
  };

  // Insert markdown syntax
  const insertMarkdown = (syntax: string, placeholder = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    let newText = '';
    let newCursorPos = start;
    
    switch (syntax) {
      case 'bold':
        newText = `**${textToInsert}**`;
        newCursorPos = start + (selectedText ? newText.length : 2);
        break;
      case 'italic':
        newText = `*${textToInsert}*`;
        newCursorPos = start + (selectedText ? newText.length : 1);
        break;
      case 'code':
        newText = `\`${textToInsert}\``;
        newCursorPos = start + (selectedText ? newText.length : 1);
        break;
      case 'link':
        newText = `[${textToInsert || 'Link text'}](URL)`;
        newCursorPos = start + newText.length - 4;
        break;
      case 'image':
        newText = `![${textToInsert || 'Alt text'}](Image URL)`;
        newCursorPos = start + newText.length - 11;
        break;
      case 'h1':
        newText = `# ${textToInsert || 'Heading 1'}`;
        newCursorPos = start + newText.length;
        break;
      case 'h2':
        newText = `## ${textToInsert || 'Heading 2'}`;
        newCursorPos = start + newText.length;
        break;
      case 'h3':
        newText = `### ${textToInsert || 'Heading 3'}`;
        newCursorPos = start + newText.length;
        break;
      case 'ul':
        newText = `- ${textToInsert || 'List item'}`;
        newCursorPos = start + newText.length;
        break;
      case 'ol':
        newText = `1. ${textToInsert || 'List item'}`;
        newCursorPos = start + newText.length;
        break;
      case 'quote':
        newText = `> ${textToInsert || 'Quote'}`;
        newCursorPos = start + newText.length;
        break;
      case 'table':
        newText = `| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |`;
        newCursorPos = start + newText.length;
        break;
      default:
        return;
    }
    
    const newMarkdown = markdown.substring(0, start) + newText + markdown.substring(end);
    setMarkdown(newMarkdown);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const loadSample = () => {
    setMarkdown(sampleMarkdown);
  };

  const clearEditor = () => {
    setMarkdown('');
    textareaRef.current?.focus();
  };

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      toast({
        title: 'Copied!',
        description: 'Markdown content copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const copyHtml = async () => {
    try {
      const html = markdownToHtml(markdown);
      await navigator.clipboard.writeText(html);
      toast({
        title: 'Copied!',
        description: 'HTML content copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadHtml = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Document</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
    </style>
</head>
<body>
${markdownToHtml(markdown)}
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setStats(calculateStats(markdown));
  }, [markdown]);

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown('bold'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('italic'), tooltip: 'Italic' },
    { icon: Code2, action: () => insertMarkdown('code'), tooltip: 'Inline Code' },
    { icon: Link, action: () => insertMarkdown('link'), tooltip: 'Link' },
    { icon: Image, action: () => insertMarkdown('image'), tooltip: 'Image' },
    { icon: Heading1, action: () => insertMarkdown('h1'), tooltip: 'Heading 1' },
    { icon: Heading2, action: () => insertMarkdown('h2'), tooltip: 'Heading 2' },
    { icon: Heading3, action: () => insertMarkdown('h3'), tooltip: 'Heading 3' },
    { icon: List, action: () => insertMarkdown('ul'), tooltip: 'Bullet List' },
    { icon: ListOrdered, action: () => insertMarkdown('ol'), tooltip: 'Numbered List' },
    { icon: Quote, action: () => insertMarkdown('quote'), tooltip: 'Quote' },
    { icon: Table, action: () => insertMarkdown('table'), tooltip: 'Table' },
  ];

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'container mx-auto px-4 py-8 max-w-7xl'}`}>
      {!isFullscreen && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Markdown Editor</h1>
          <p className="text-lg text-muted-foreground">
            Write and preview Markdown with live rendering, syntax highlighting, and export options.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Toolbar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                {/* View Mode */}
                <Select value={viewMode} onValueChange={(value: 'edit' | 'preview' | 'split') => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="edit">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Edit
                      </div>
                    </SelectItem>
                    <SelectItem value="preview">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </div>
                    </SelectItem>
                    <SelectItem value="split">
                      <div className="flex items-center gap-2">
                        <Split className="h-4 w-4" />
                        Split
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Formatting Buttons */}
                <div className="flex items-center gap-1 border-l pl-2">
                  {toolbarButtons.map((button, index) => {
                    const IconComponent = button.icon;
                    return (
                      <Button
                        key={index}
                        size="sm"
                        variant="ghost"
                        onClick={button.action}
                        title={button.tooltip}
                        className="h-8 w-8 p-0"
                      >
                        <IconComponent className="h-4 w-4" />
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={loadSample} size="sm" variant="outline">
                  Load Sample
                </Button>
                <Button onClick={clearEditor} size="sm" variant="outline">
                  Clear
                </Button>
                <Button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  size="sm"
                  variant="outline"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor and Preview */}
        <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Editor */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Markdown Editor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  ref={textareaRef}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Start writing your markdown here..."
                  className={`font-mono text-sm resize-none ${isFullscreen ? 'h-[calc(100vh-300px)]' : 'h-96'}`}
                />
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className={`prose prose-sm max-w-none overflow-auto ${isFullscreen ? 'h-[calc(100vh-300px)]' : 'h-96'}`}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Statistics and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Document Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Characters:</span>
                    <Badge variant="outline">{stats.characters.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Characters (no spaces):</span>
                    <Badge variant="outline">{stats.charactersNoSpaces.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Words:</span>
                    <Badge variant="outline">{stats.words.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Lines:</span>
                    <Badge variant="outline">{stats.lines.toLocaleString()}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Paragraphs:</span>
                    <Badge variant="outline">{stats.paragraphs.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reading time:</span>
                    <Badge variant="outline">{stats.readingTime} min</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Headings:</span>
                    <Badge variant="outline">{stats.headings}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Links:</span>
                    <Badge variant="outline">{stats.links}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Export & Actions</CardTitle>
              <CardDescription>
                Copy or download your content in different formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={copyMarkdown} variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy MD
                </Button>
                <Button onClick={copyHtml} variant="outline" className="w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy HTML
                </Button>
                <Button onClick={downloadMarkdown} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download MD
                </Button>
                <Button onClick={downloadHtml} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download HTML
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {!isFullscreen && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Markdown Syntax Guide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Headers</h4>
                <code className="block text-xs bg-muted p-2 rounded">
                  # H1<br/>
                  ## H2<br/>
                  ### H3
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Emphasis</h4>
                <code className="block text-xs bg-muted p-2 rounded">
                  **bold**<br/>
                  *italic*<br/>
                  `code`
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Lists</h4>
                <code className="block text-xs bg-muted p-2 rounded">
                  - Item 1<br/>
                  - Item 2<br/>
                  1. Numbered
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Links & Images</h4>
                <code className="block text-xs bg-muted p-2 rounded">
                  [Link](URL)<br/>
                  ![Image](URL)
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tables</h4>
                <code className="block text-xs bg-muted p-2 rounded">
                  | Col 1 | Col 2 |<br/>
                  |-------|-------|<br/>
                  | Data  | Data  |
                </code>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Code Blocks</h4>
                <code className="block text-xs bg-muted p-2 rounded">
                  ```javascript<br/>
                  code here<br/>
                  ```
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}