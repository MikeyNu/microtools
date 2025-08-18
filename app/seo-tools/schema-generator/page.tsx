"use client"

import { useState } from "react"
import { Code2, ArrowLeft, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SchemaGeneratorPage() {
  const [schemaType, setSchemaType] = useState("Organization")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [image, setImage] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const { toast } = useToast()

  const generateSchema = () => {
    const schema: any = {
      "@context": "https://schema.org",
      "@type": schemaType,
      name: name,
      description: description,
      url: url,
    }

    if (image) {
      schema.image = image
    }

    if (schemaType === "Organization" || schemaType === "LocalBusiness") {
      if (address) {
        schema.address = {
          "@type": "PostalAddress",
          streetAddress: address,
        }
      }
      if (phone) {
        schema.telephone = phone
      }
      if (email) {
        schema.email = email
      }
    }

    if (schemaType === "Article") {
      schema.author = {
        "@type": "Person",
        name: "Author Name",
      }
      schema.publisher = {
        "@type": "Organization",
        name: "Publisher Name",
        logo: {
          "@type": "ImageObject",
          url: image || "https://example.com/logo.jpg",
        },
      }
      schema.datePublished = new Date().toISOString().split("T")[0]
      schema.dateModified = new Date().toISOString().split("T")[0]
    }

    if (schemaType === "Product") {
      schema.offers = {
        "@type": "Offer",
        price: "0.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      }
      schema.brand = {
        "@type": "Brand",
        name: "Brand Name",
      }
    }

    return JSON.stringify(schema, null, 2)
  }

  const copySchema = () => {
    const schema = generateSchema()
    const schemaScript = `<script type="application/ld+json">
${schema}
</script>`
    navigator.clipboard.writeText(schemaScript)
    toast({
      title: "Copied!",
      description: "Schema markup copied to clipboard",
    })
  }

  const schemaTypes = [
    { value: "Organization", label: "Organization" },
    { value: "LocalBusiness", label: "Local Business" },
    { value: "Article", label: "Article" },
    { value: "Product", label: "Product" },
    { value: "Person", label: "Person" },
    { value: "Event", label: "Event" },
    { value: "Recipe", label: "Recipe" },
    { value: "Review", label: "Review" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Code2 className="h-8 w-8 text-primary" />
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
              <CardTitle className="font-serif text-2xl">Schema Markup Generator</CardTitle>
              <p className="text-muted-foreground">
                Generate structured data markup for better search engine understanding
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Schema Type</Label>
                    <Select value={schemaType} onValueChange={setSchemaType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {schemaTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>

                  {(schemaType === "Organization" || schemaType === "LocalBusiness") && (
                    <>
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          placeholder="123 Main St, City, State"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1-555-123-4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="contact@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-semibold">Generated Schema</h3>
                    <Button variant="outline" onClick={copySchema} disabled={!name}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Schema
                    </Button>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>
                        {name
                          ? `<script type="application/ld+json">\n${generateSchema()}\n</script>`
                          : "Fill in the required fields to generate schema markup"}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Schema Markup Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <strong>Rich Snippets:</strong> Enhanced search results with additional information
                  </div>
                  <div>
                    <strong>Better CTR:</strong> More attractive listings can improve click-through rates
                  </div>
                  <div>
                    <strong>Voice Search:</strong> Helps search engines understand content for voice queries
                  </div>
                  <div>
                    <strong>Knowledge Graph:</strong> May help your content appear in Google's Knowledge Graph
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-800">Implementation Tips</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Add the generated script to your HTML head section</li>
                  <li>• Test your markup using Google's Rich Results Test</li>
                  <li>• Keep schema markup accurate and up-to-date</li>
                  <li>• Use multiple schema types when appropriate</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
