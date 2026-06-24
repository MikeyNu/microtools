# Micro SaaS Tools Hub

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

## Overview

A comprehensive collection of free online tools for developers, designers, and content creators. Built with Next.js 15, TypeScript, and Tailwind CSS, featuring a modern, responsive design with dark mode support.

## Features

- **120+ Free Tools** across multiple categories
- **Real-time Processing** with instant results
- **Dark/Light Mode** with system preference detection
- **Responsive Design** optimized for all devices with mobile hamburger menu
- **SEO Optimized** with proper meta tags and structured data
- **Fast Performance** with Next.js App Router
- **Accessibility** compliant with WCAG guidelines
- **Export Options** for most tools (PDF, CSV, JSON, etc.)

## Tool Categories

### Calculators (25+ tools)
- Basic Calculator
- BMI Calculator
- Loan Calculator
- Mortgage Calculator
- Percentage Calculator
- Age Calculator
- Date Calculator
- Investment Calculator
- Tax Calculator
- Tip Calculator
- And more...

### Converters (30+ tools)
- Unit Converter (Length, Weight, Temperature)
- Currency Converter
- Image Format Converter
- Color Format Converter
- Base64 Encoder/Decoder
- JSON to CSV Converter
- Markdown to HTML
- PDF Tools
- And more...

### Text Utilities (20+ tools)
- Markdown Editor with Live Preview
- Text Diff Tool
- URL Encoder/Decoder
- HTML Encoder/Decoder
- Text Case Converter
- Word Counter
- Lorem Ipsum Generator
- Text Formatter
- And more...

### Design Tools (15+ tools)
- Color Picker & Palette Generator
- Gradient Generator
- QR Code Generator
- Favicon Generator
- Image Resizer
- CSS Generator
- And more...

### Web Tools (18+ tools)
- Password Generator
- Hash Generator (MD5, SHA256, etc.)
- JWT Decoder
- URL Shortener
- Meta Tag Generator
- Robots.txt Generator
- And more...

### SEO Tools (12+ tools)
- Meta Tag Generator
- Keyword Density Checker
- Sitemap Generator
- Open Graph Generator
- Schema Markup Generator
- And more...

### Developer Tools (15+ tools)
- JSON Formatter & Validator
- Regex Tester
- API Tester
- Code Formatter
- Minifier Tools
- And more...

### Timestamp Tools (10+ tools)
- Unix Timestamp Converter
- Date Format Converter
- Timezone Converter
- Time Calculator
- And more...

### Image Tools (12+ tools)
- Image Compressor
- Image Format Converter
- Image Resizer
- Image Cropper
- And more...

### PDF Tools (8+ tools)
- PDF Merger
- PDF Splitter
- PDF to Image
- PDF Compressor
- And more...

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **Deployment**: Vercel / GoDaddy (Static Export)
- **Analytics**: Google Analytics (optional)
- **SEO**: Next.js built-in SEO features
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/micro-tools.git
cd micro-tools
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Google Analytics
NEXT_PUBLIC_GA_ID=your_ga_id

# Optional: AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=your_adsense_client_id

# Optional: Other analytics
NEXT_PUBLIC_GSC_ID=your_search_console_id
NEXT_PUBLIC_BING_ID=your_bing_webmaster_id
```

## Project Structure

```
micro/
├── app/                    # Next.js App Router
│   ├── calculators/        # Calculator tools
│   ├── converters/         # Converter tools
│   ├── text-utilities/     # Text processing tools
│   ├── design-tools/       # Design utilities
│   ├── web-tools/          # Web development tools
│   ├── seo-tools/          # SEO utilities
│   ├── developer-tools/    # Developer utilities
│   ├── timestamp-tools/    # Time/date tools
│   ├── image-tools/        # Image processing
│   ├── pdf-tools/          # PDF utilities
│   └── globals.css         # Global styles
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Custom components
├── lib/                    # Utility functions
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
└── ...
```

## Customization

### Adding New Tools

1. Create a new page in the appropriate category folder
2. Add the tool to the search database in `components/search-functionality.tsx`
3. Update the category page with the new tool
4. Add SEO configuration in `lib/seo-config.ts`

### Theming

The project uses Tailwind CSS with CSS variables for theming. Modify `app/globals.css` to customize colors and themes.

### Components

All UI components are built with Radix UI and styled with Tailwind CSS. They're located in `components/ui/`.

## Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for LCP, INP, and CLS
- **Bundle Size**: Optimized with Next.js automatic code splitting
- **SEO**: Comprehensive meta tags and structured data

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Quality

- ESLint for code linting
- TypeScript for type safety
- Prettier for code formatting

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms

- **Netlify**: Works out of the box
- **Railway**: Supports Next.js
- **DigitalOcean**: App Platform
- **AWS**: Amplify or EC2

## Analytics & Monitoring

- Google Analytics integration
- Search Console integration
- Performance monitoring
- Error tracking

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Lucide](https://lucide.dev/) for icons
- [shadcn/ui](https://ui.shadcn.com/) for the component library

## Support

If you have any questions or need help, please open an issue on GitHub.
