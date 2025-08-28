// SEO Configuration for ToolHub
// Comprehensive SEO settings to maximize organic traffic and ad revenue

export const SEO_CONFIG = {
  // Site-wide SEO settings
  site: {
    name: "ToolHub - Free Online Tools & Calculators",
    description: "Access 120+ free online tools and calculators. From basic calculators to advanced converters, text tools, and design utilities. No registration required.",
    url: "https://toolhub.vercel.app", // Update with your actual domain
    keywords: [
      "online tools", "free calculators", "web tools", "converters", 
      "text tools", "design tools", "SEO tools", "productivity tools",
      "online calculator", "unit converter", "color picker", "QR generator"
    ],
    author: "ToolHub Team",
    language: "en",
    locale: "en_US",
    type: "website"
  },

  // Category-specific SEO
  categories: {
    calculators: {
      title: "Free Online Calculators - Basic, Scientific & Financial",
      description: "Free online calculators for math, finance, health, and more. Basic calculator, loan calculator, BMI calculator, percentage calculator, and tip calculator.",
      keywords: ["calculator", "online calculator", "free calculator", "math calculator", "scientific calculator"]
    },
    converters: {
      title: "Unit Converters - Length, Weight, Temperature & More",
      description: "Convert units instantly with our free online converters. Length, weight, temperature, currency, and data size converters available.",
      keywords: ["unit converter", "length converter", "weight converter", "temperature converter", "currency converter"]
    },
    textTools: {
      title: "Text Tools - Word Counter, Case Converter & Text Utilities",
      description: "Free text processing tools including word counter, character counter, case converter, text formatter, and more text utilities.",
      keywords: ["text tools", "word counter", "character counter", "case converter", "text formatter"]
    },
    designTools: {
      title: "Design Tools - Color Picker, Gradient Generator & More",
      description: "Free design tools for developers and designers. Color picker, gradient generator, CSS tools, and image utilities.",
      keywords: ["design tools", "color picker", "gradient generator", "CSS tools", "web design"]
    },
    webTools: {
      title: "Web Development Tools - URL Shortener, QR Generator & More",
      description: "Essential web development tools including URL shortener, QR code generator, base64 encoder, and JSON formatter.",
      keywords: ["web tools", "developer tools", "URL shortener", "QR generator", "JSON formatter"]
    },
    seoTools: {
      title: "SEO Tools - Meta Tag Generator, Keyword Density & More",
      description: "Free SEO tools to optimize your website. Meta tag generator, keyword density checker, robots.txt generator, and more.",
      keywords: ["SEO tools", "meta tags", "keyword density", "SEO checker", "website optimization"]
    }
  },

  // Tool-specific SEO templates
  tools: {
    basicCalculator: {
      title: "Free Basic Calculator Online - Simple Math Calculator",
      description: "Free online basic calculator for simple math operations. Add, subtract, multiply, and divide with our easy-to-use calculator.",
      keywords: ["basic calculator", "simple calculator", "math calculator", "online calculator", "free calculator"]
    },
    loanCalculator: {
      title: "Loan Calculator - Calculate Monthly Payments & Interest",
      description: "Calculate loan payments, interest rates, and total cost with our free loan calculator. Perfect for mortgages, auto loans, and personal loans.",
      keywords: ["loan calculator", "mortgage calculator", "payment calculator", "interest calculator", "finance calculator"]
    },
    bmiCalculator: {
      title: "BMI Calculator - Calculate Body Mass Index Online",
      description: "Calculate your BMI (Body Mass Index) with our free online calculator. Determine if you're underweight, normal, overweight, or obese.",
      keywords: ["BMI calculator", "body mass index", "weight calculator", "health calculator", "fitness calculator"]
    },
    percentageCalculator: {
      title: "Percentage Calculator - Calculate Percentages Online",
      description: "Free percentage calculator to find percentages, percentage increase/decrease, and percentage of a number. Easy and accurate calculations.",
      keywords: ["percentage calculator", "percent calculator", "percentage increase", "percentage decrease", "math calculator"]
    },
    tipCalculator: {
      title: "Tip Calculator - Calculate Tips and Split Bills",
      description: "Calculate tips and split bills easily with our free tip calculator. Perfect for restaurants, delivery, and service calculations.",
      keywords: ["tip calculator", "bill splitter", "restaurant calculator", "gratuity calculator", "service tip"]
    },
    mortgageCalculator: {
      title: "Mortgage Calculator - Calculate Monthly Mortgage Payments",
      description: "Calculate mortgage payments, interest, and amortization with our free mortgage calculator. Compare different loan terms and rates.",
      keywords: ["mortgage calculator", "home loan calculator", "mortgage payment", "real estate calculator", "housing calculator"]
    }
  },

  // Structured data schemas
  structuredData: {
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "ToolHub",
      "description": "Free online tools and calculators for everyday use",
      "url": "https://toolhub.vercel.app",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://toolhub.vercel.app/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ToolHub",
      "description": "Provider of free online tools and calculators",
      "url": "https://toolhub.vercel.app",
      "logo": "https://toolhub.vercel.app/logo.png",
      "sameAs": [
        // Add social media links when available
      ]
    },
    breadcrumb: (items: Array<{name: string, url: string}>) => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    }),
    tool: (toolName: string, description: string, category: string) => ({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": toolName,
      "description": description,
      "applicationCategory": category,
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    })
  },

  // Meta tag generators
  generateMetaTags: ({
    title,
    description,
    keywords,
    canonical,
    ogImage,
    noindex = false
  }: {
    title: string;
    description: string;
    keywords?: string[];
    canonical?: string;
    ogImage?: string;
    noindex?: boolean;
  }) => {
    const tags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords?.join(', ') || '' },
      { name: 'author', content: SEO_CONFIG.site.author },
      { name: 'robots', content: noindex ? 'noindex,nofollow' : 'index,follow' },
      { name: 'googlebot', content: noindex ? 'noindex,nofollow' : 'index,follow' },
      
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SEO_CONFIG.site.name },
      { property: 'og:locale', content: SEO_CONFIG.site.locale },
      
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      
      // Additional SEO
      { name: 'theme-color', content: '#000000' },
      { name: 'msapplication-TileColor', content: '#000000' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ];

    if (canonical) {
      tags.push({ rel: 'canonical', href: canonical } as any);
    }

    if (ogImage) {
      tags.push(
        { property: 'og:image', content: ogImage },
        { name: 'twitter:image', content: ogImage }
      );
    }

    return tags.filter(tag => tag.content && tag.content.trim() !== '');
  },

  // Sitemap configuration
  sitemap: {
    changeFreq: {
      homepage: 'daily',
      categories: 'weekly',
      tools: 'monthly'
    },
    priority: {
      homepage: 1.0,
      categories: 0.8,
      popularTools: 0.9,
      tools: 0.7
    }
  },

  // Analytics and tracking
  analytics: {
    googleAnalytics: process.env.NEXT_PUBLIC_GA_ID,
    googleSearchConsole: process.env.NEXT_PUBLIC_GSC_ID,
    bingWebmaster: process.env.NEXT_PUBLIC_BING_ID
  }
};

// Helper functions
export const getSEOForTool = (toolKey: string) => {
  return SEO_CONFIG.tools[toolKey as keyof typeof SEO_CONFIG.tools] || {
    title: "Free Online Tool - ToolHub",
    description: "Free online tool for your daily needs. No registration required.",
    keywords: ["online tool", "free tool", "web tool"]
  };
};

export const getSEOForCategory = (categoryKey: string) => {
  return SEO_CONFIG.categories[categoryKey as keyof typeof SEO_CONFIG.categories] || {
    title: "Free Online Tools - ToolHub",
    description: "Collection of free online tools for your daily needs.",
    keywords: ["online tools", "free tools", "web tools"]
  };
};

export const generateToolStructuredData = (toolName: string, description: string, category: string) => {
  return SEO_CONFIG.structuredData.tool(toolName, description, category);
};

export const generateBreadcrumbStructuredData = (items: Array<{name: string, url: string}>) => {
  return SEO_CONFIG.structuredData.breadcrumb(items);
};