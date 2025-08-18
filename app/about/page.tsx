import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { AdSensePlaceholder } from "@/components/adsense-placeholder"
import { Users, Target, Zap, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNav items={[{ label: "About" }]} />

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">About ToolHub</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Your trusted destination for free, high-quality online tools that save time and boost productivity.
            </p>
          </div>

          <div className="mb-8">
            <AdSensePlaceholder size="leaderboard" className="mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To provide everyone with access to powerful, easy-to-use online tools that simplify daily tasks and
                  enhance productivity without any cost barriers.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To become the world's most comprehensive and trusted platform for online utilities, serving millions
                  of users worldwide.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Why Choose Us</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• 100% free to use</li>
                  <li>• No registration required</li>
                  <li>• Fast and reliable</li>
                  <li>• Mobile-friendly design</li>
                  <li>• Regular updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• User privacy first</li>
                  <li>• Quality over quantity</li>
                  <li>• Continuous improvement</li>
                  <li>• Community feedback</li>
                  <li>• Accessibility for all</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <AdSensePlaceholder size="rectangle" className="mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
