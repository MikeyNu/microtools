"use client";

import { AdSenseVisualTest } from "@/components/adsense-visual-test";
import { shouldDisplayAds, ADSENSE_CONFIG } from "@/lib/adsense-config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

export default function AdTestPage() {
  const canDisplayAds = shouldDisplayAds();
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  const isProduction = process.env.NODE_ENV === "production";
  const showAdsEnabled = process.env.NEXT_PUBLIC_SHOW_ADS === "true";

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (
    condition: boolean,
    trueText: string,
    falseText: string,
  ) => {
    return (
      <Badge variant={condition ? "default" : "destructive"}>
        {condition ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🔍 AdSense Integration Test</h1>
        <p className="text-lg text-muted-foreground">
          This page shows the current status of your AdSense configuration and
          helps verify everything is working correctly.
        </p>
      </div>

      {/* Overall Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(canDisplayAds)}
            Overall AdSense Status
          </CardTitle>
          <CardDescription>
            Current configuration status for AdSense integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {canDisplayAds ? (
              <span className="text-green-600">✅ Ready for Production</span>
            ) : (
              <span className="text-red-600">❌ Configuration Required</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Environment Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
            <CardDescription>
              Current environment and variable status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Environment:</span>
              <Badge variant={isProduction ? "default" : "secondary"}>
                {isProduction ? "Production" : "Development"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Publisher ID Set:</span>
              {getStatusBadge(
                !!publisherId && publisherId !== "YOUR_PUBLISHER_ID_HERE",
                "Configured",
                "Missing",
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Show Ads Enabled:</span>
              {getStatusBadge(showAdsEnabled, "Enabled", "Disabled")}
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Auto Ads:</span>
              {getStatusBadge(
                ADSENSE_CONFIG.optimization.autoAds,
                "Enabled",
                "Disabled",
              )}
            </div>
          </CardContent>
        </Card>

        {/* Publisher Information */}
        <Card>
          <CardHeader>
            <CardTitle>Publisher Information</CardTitle>
            <CardDescription>AdSense account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Publisher ID:</span>
              <div className="mt-1 p-2 bg-muted rounded font-mono text-sm">
                {publisherId
                  ? publisherId === "YOUR_PUBLISHER_ID_HERE"
                    ? "❌ Placeholder - Replace with real ID"
                    : `ca-${publisherId}`
                  : "❌ Not configured"}
              </div>
            </div>

            <div>
              <span className="font-medium">Customer ID:</span>
              <div className="mt-1 p-2 bg-muted rounded font-mono text-sm">
                {ADSENSE_CONFIG.customerId}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Check */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Live AdSense Status</CardTitle>
          <CardDescription>
            Real-time status of AdSense integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdSenseVisualTest />
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="mt-8 space-y-6">
        {!canDisplayAds && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                Configuration Required
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-700">
              <p className="mb-4">
                Your AdSense integration needs configuration:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Get your Publisher ID from AdSense Dashboard → Account →
                  Account Information
                </li>
                <li>
                  Update your{" "}
                  <code className="bg-orange-100 px-1 rounded">.env.local</code>{" "}
                  file:
                </li>
                <li>
                  Set{" "}
                  <code className="bg-orange-100 px-1 rounded">
                    NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=pub-YOUR_ACTUAL_ID
                  </code>
                </li>
                <li>
                  Set{" "}
                  <code className="bg-orange-100 px-1 rounded">
                    NEXT_PUBLIC_SHOW_ADS=true
                  </code>
                </li>
                <li>Rebuild and redeploy your application</li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Verification Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How to Verify AdSense is Working
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">In Development:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>Open browser DevTools (F12)</li>
                  <li>Go to Network tab and refresh the page</li>
                  <li>
                    Look for requests to <code>googlesyndication.com</code>
                  </li>
                  <li>Check Console tab for any AdSense errors</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">In Production:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-4">
                  <li>
                    Ads should appear on your live website within 24-48 hours
                  </li>
                  <li>Check AdSense dashboard for site activity</li>
                  <li>Verify no policy violations in AdSense Policy Center</li>
                  <li>Monitor earnings in AdSense reporting</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle>Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Ads not showing on live site:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-1">
                  <li>Wait 24-48 hours after domain approval</li>
                  <li>Check if domain is approved in AdSense → Sites</li>
                  <li>Verify publisher ID format (pub-1234567890123456)</li>
                  <li>Ensure no ad blockers are interfering</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">Console errors:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-1">
                  <li>Check that publisher ID is correctly set</li>
                  <li>Ensure HTTPS is enabled on your domain</li>
                  <li>Verify AdSense account is not restricted</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
