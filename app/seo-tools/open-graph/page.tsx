"use client"

import { useState } from "react"
import { Share2, ArrowLeft, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function OpenGraphPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [image, setImage] = useState("")
  const [type, setType] = useState("website")
  const [siteName, setSiteName] = useState("")
  const [locale, setLocale] = useState("en_US")
  const { toast } = useToast()

  const generateOpenGraphTags = () => {
    const ogTags = `<!-- Open Graph Meta Tags -->
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:site_name" content="${siteName}">
<meta property="og:locale" content="${locale}">

<!-- Twitter Card Meta Tags -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:url" content="${url}">

<!-- Facebook Meta Tags -->
<meta property="fb:app_id" content="your_app_id_here">

<!-- Additional Meta Tags -->
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${title}">`

    return ogTags
  }

  const copyTags = () => {
    const tags = generateOpenGraphTags()
    navigator.clipboard.writeText(tags)
    toast({
      title: "Copied!",
      description: "Open Graph tags copied to clipboard",
    })
  }

  const ogTypes = [
    { value: "website", label: "Website" },
    { value: "article", label: "Article" },
    { value: "book", label: "Book" },
    { value: "profile", label: "Profile" },
    { value: "music.song", label: "Music Song" },
    { value: "music.album", label: "Music Album" },
    { value: "video.movie", label: "Video Movie" },
    { value: "video.episode", label: "Video Episode" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Share2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-primary">ToolHub</h1>
            </Link>
            <Link
              href="/seo-tools"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to SEO Tools
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="font-serif text-2xl">Open Graph Generator</CardTitle>
              <p className="text-muted-foreground">Create Open Graph meta tags for better social media sharing</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Your page title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={95}
                    />
                    <p className="text-sm text-muted-foreground mt-1">{title.length}/95 characters</p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your content"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength={300}
                      className="min-h-[80px]"
                    />
                    <p className="text-sm text-muted-foreground mt-1">{description.length}/300 characters</p>
                  </div>

                  <div>
                    <Label htmlFor="url">URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://yourwebsite.com/page"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Image URL *</Label>
                    <Input
                      id="image"
                      type="url"
                      placeholder="https://yourwebsite.com/image.jpg"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Recommended: 1200x630 pixels</p>
                  </div>

                  <div>
                    <Label>Content Type</Label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ogTypes.map((ogType) => (
                          <SelectItem key={ogType.value} value={ogType.value}>
                            {ogType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      placeholder="Your Website Name"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="locale">Locale</Label>
                    <Input id="locale" placeholder="en_US" value={locale} onChange={(e) => setLocale(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold">Generated Tags</h3>
                    <Button variant="outline" onClick={copyTags} disabled={!title || !description || !url || !image}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Tags
                    </Button>
                  </div>
                  <Textarea
                    value={
                      title && description && url && image
                        ? generateOpenGraphTags()
                        : "Fill in the required fields to generate Open Graph tags"
                    }
                    readOnly
                    className="min-h-[400px] font-mono text-sm"
                  />

                  {title && description && url && image && (
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Preview</h4>
                      <div className="border rounded-lg p-3 bg-background">
                        {image && (
                          <div className="mb-2">
                            <img
                              src={image || "/placeholder.svg"}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <h5 className="font-semibold text-sm line-clamp-2">{title}</h5>
                          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
                          <p className="text-xs text-muted-foreground">{url}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Open Graph Best Practices</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong>Image Size:</strong> Use 1200x630 pixels for best results across platforms
                  </div>
                  <div>
                    <strong>Title Length:</strong> Keep titles under 95 characters to avoid truncation
                  </div>
                  <div>
                    <strong>Description:</strong> Write compelling descriptions under 300 characters
                  </div>
                  <div>
                    <strong>Testing:</strong> Use Facebook Debugger and Twitter Card Validator to test
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
