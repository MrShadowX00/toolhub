const baseUrl = "https://toollo.org";

export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Toollo",
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    description:
      "Free online tools — image compressor, JSON formatter, QR generator, and 70+ more. No signup, no tracking.",
    sameAs: [],
  };
}

export function getWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Toollo",
    url: baseUrl,
    description:
      "70+ free online tools. No signup. No tracking. Everything runs in your browser.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getWebApplicationJsonLd(
  toolId: string,
  name: string,
  description: string,
  locale: string
) {
  const url =
    locale === "en"
      ? `${baseUrl}/tools/${toolId}`
      : `${baseUrl}/${locale}/tools/${toolId}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    softwareVersion: "1.0",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    inLanguage: locale,
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: "Toollo",
      url: baseUrl,
    },
    screenshot: `${baseUrl}/og-image.png`,
  };
}

export function getBreadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getFaqJsonLd(
  faqs: { q: string; a: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export function getCollectionPageJsonLd(
  toolItems: { id: string; name: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Toollo — Free Online Tools",
    description:
      "70+ free online tools. No signup. No tracking. Everything runs in your browser.",
    url: baseUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: toolItems.length,
      itemListElement: toolItems.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: `${baseUrl}/tools/${tool.id}`,
      })),
    },
  };
}
