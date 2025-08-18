"use client"

import { useState } from "react"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { ToolLayout } from "@/components/tool-layout"

export default function MetaGeneratorPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [keywords, setKeywords] = useState("")
  const [author, setAuthor] = useState("")
  const [viewport, setViewport] = useState("width=device-width, initial-scale=1.0")
  const [robots, setRobots] = useState("index, follow")
  const { toast } = useToast()

  const generateMetaTags = () => {
    const metaTags = `<!-- Basic Meta Tags -->
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords}">
<meta name="author" content="${author}">
<meta name="viewport" content="${viewport}">
<meta name="robots" content="${robots}">

<!-- Open Graph Meta Tags -->
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://yourwebsite.com">
<meta property="og:image" content="https://yourwebsite.com/image.jpg">

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="https://yourwebsite.com/image.jpg">

<!-- Additional Meta Tags -->
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<link rel="canonical" href="https://yourwebsite.com">`

    return metaTags
  }

  const copyMetaTags = () => {
    const metaTags = generateMetaTags()
    navigator.clipboard.writeText(metaTags)
    toast({
      title: "Copied!",
      description: "Meta tags copied to clipboard",
    })
  }

  const relatedTools = [
    { name: "Keyword Density Checker", href: "/seo-tools/keyword-density" },
    { name: "Robots.txt Generator", href: "/seo-tools/robots-generator" },
    { name: "Open Graph Generator", href: "/seo-tools/open-graph" },
    { name: "Schema Generator", href: "/seo-tools/schema-generator" },
  ]

  return (
    <ToolLayout
      title="Meta Tag Generator"
      description="Generate comprehensive HTML meta tags for better SEO, social media sharing, and search engine optimization."
      category="SEO Tools"
      categoryHref="/seo-tools"
      relatedTools={relatedTools}
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Meta Tag Generator</CardTitle>
            <p className="text-muted-foreground">Generate HTML meta tags for better SEO and social media sharing</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    placeholder="Your Page Title (50-60 characters)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={60}
                  />
                  <p className="text-sm text-muted-foreground mt-1">{title.length}/60 characters</p>
                </div>

                <div>
                  <Label htmlFor="description">Meta Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your page (150-160 characters)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={160}
                    className="min-h-[80px]"
                  />
                  <p className="text-sm text-muted-foreground mt-1">{description.length}/160 characters</p>
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="keyword1, keyword2, keyword3"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    placeholder="Your Name or Company"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="viewport">Viewport</Label>
                  <Input id="viewport" value={viewport} onChange={(e) => setViewport(e.target.value)} />
                </div>

                <div>
                  <Label htmlFor="robots">Robots</Label>
                  <Input id="robots" value={robots} onChange={(e) => setRobots(e.target.value)} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-semibold">Generated Meta Tags</h3>
                  <Button variant="outline" onClick={copyMetaTags} disabled={!title || !description}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Tags
                  </Button>
                </div>
                <Textarea
                  value={
                    title || description ? generateMetaTags() : "Fill in the required fields to generate meta tags"
                  }
                  readOnly
                  className="min-h-[400px] font-mono text-sm"
                />
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">SEO Best Practices</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <strong>Title Tag:</strong> Keep it under 60 characters and include your main keyword
                </div>
                <div>
                  <strong>Meta Description:</strong> Write compelling descriptions under 160 characters
                </div>
                <div>
                  <strong>Keywords:</strong> Use relevant keywords but avoid keyword stuffing
                </div>
                <div>
                  <strong>Open Graph:</strong> Essential for social media sharing and appearance
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  )
}
