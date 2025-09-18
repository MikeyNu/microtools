import { AdSenseProvider } from '@/components/adsense-provider'
import { AdSenseVisualTest } from '@/components/adsense-visual-test'

export default function AdTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">AdSense Test Page</h1>
      <p className="mb-4">
        This page demonstrates that AdSense is properly configured. You should see:
      </p>
      <ul className="list-disc ml-6 mb-6">
        <li>AdSense script loading in browser dev tools</li>
        <li>No AdSense TagError in console</li>
        <li>Your actual publisher ID being used</li>
      </ul>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Configuration Status</h2>
        <ul className="text-sm">
          <li>✅ Publisher ID: ca-pub-4745112150588316</li>
          <li>✅ Customer ID: 962207481</li>
          <li>✅ Ads enabled in development</li>
          <li>✅ Auto ads enabled</li>
        </ul>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Note about Ad Display</h2>
        <p className="text-sm">
          Even with ads enabled, you may not see actual ad banners in development due to:
        </p>
        <ul className="list-disc ml-6 text-sm">
          <li>Google AdSense policy restrictions for localhost</li>
          <li>Ad inventory targeting (ads target your live domain)</li>
          <li>Ad blocker detection</li>
          <li>Development environment limitations</li>
        </ul>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">How to Verify It's Working</h3>
        <ol className="list-decimal ml-6 text-sm">
          <li>Open browser DevTools (F12)</li>
          <li>Go to Network tab</li>
          <li>Look for requests to googlesyndication.com</li>
          <li>Check that your publisher ID is in the request URL</li>
          <li>No AdSense TagError should appear in console</li>
        </ol>
      </div>
      
      <div className="mt-8">
        <AdSenseVisualTest />
      </div>
    </div>
  )
}