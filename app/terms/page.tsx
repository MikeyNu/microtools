import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { AdSensePlaceholder } from "@/components/adsense-placeholder"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BreadcrumbNav items={[{ label: "Terms of Use" }]} />

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-8">Terms of Use</h1>

          <div className="mb-8">
            <AdSensePlaceholder size="leaderboard" className="mx-auto" />
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground mb-6">Last updated: June 2026</p>

            <section className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Use of the Platform</h2>
              <p className="text-muted-foreground mb-4">
                Micro Tools provides browser-based utilities for calculation, conversion, formatting, diagnostics,
                and related workflows. You are responsible for reviewing outputs before using them in production,
                legal, financial, medical, or security-sensitive decisions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">No Warranty</h2>
              <p className="text-muted-foreground mb-4">
                The tools are provided as-is. We aim for accurate and reliable behavior, but we do not guarantee that
                every result will be complete, current, or suitable for every purpose.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Local Processing</h2>
              <p className="text-muted-foreground mb-4">
                Many tools run entirely in your browser. Some network tools may contact third-party public endpoints,
                such as RDAP or DNS services, to complete a lookup.
              </p>
            </section>

            <div className="my-8">
              <AdSensePlaceholder size="rectangle" className="mx-auto" />
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">
                Do not use the platform to attack systems, overload third-party services, bypass access controls, or
                process content you do not have permission to use.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Contact</h2>
              <p className="text-muted-foreground">
                Questions about these terms can be sent to support@microtools.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
