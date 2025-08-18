import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { AdSensePlaceholder } from "@/components/adsense-placeholder"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNav items={[{ label: "Privacy Policy" }]} />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Privacy Policy</h1>

          <div className="mb-8">
            <AdSensePlaceholder size="leaderboard" className="mx-auto" />
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground mb-6">Last updated: January 2025</p>

            <section className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Information We Collect</h2>
              <p className="text-muted-foreground mb-4">We collect minimal information to provide our services:</p>
              <ul className="text-muted-foreground space-y-2 ml-6">
                <li>• Usage analytics (anonymous)</li>
                <li>• Browser type and version</li>
                <li>• Device information</li>
                <li>• IP address (for security)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">How We Use Information</h2>
              <ul className="text-muted-foreground space-y-2 ml-6">
                <li>• Improve our tools and services</li>
                <li>• Analyze usage patterns</li>
                <li>• Prevent abuse and fraud</li>
                <li>• Display relevant advertisements</li>
              </ul>
            </section>

            <div className="my-8">
              <AdSensePlaceholder size="rectangle" className="mx-auto" />
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your information. All data processing happens
                locally in your browser when possible, and we don't store personal files or sensitive data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Third-Party Services</h2>
              <p className="text-muted-foreground">
                We use Google AdSense to display advertisements. Google may use cookies and other tracking technologies.
                Please review Google's privacy policy for more information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about this privacy policy, please contact us at privacy@toolhub.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
