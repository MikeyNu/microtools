/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only ignore during builds if absolutely necessary - removed for better code quality
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  images: {
    unoptimized: true, // Required for static export
  },
  // Enable static export for GoDaddy hosting
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  
  // Note: Security headers cannot be applied with static export
  // They need to be configured on your web server (GoDaddy/hosting provider)
  // See IMPROVEMENTS.md for recommended headers to add to your .htaccess file
}

export default nextConfig