import type { Metadata } from "next";
import { locales, type Locale } from "@/i18n/config";
import { tools } from "@/lib/tools";

const baseUrl = "https://toollo.org";

function getLocalePath(locale: Locale, path: string = ""): string {
  if (locale === "en") {
    return `${baseUrl}${path}`;
  }
  return `${baseUrl}/${locale}${path}`;
}

export async function generateToolMetadata(
  toolId: string,
  locale: string
): Promise<Metadata> {
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.[toolId];
  const tool = tools.find((t) => t.id === toolId);

  const title = toolSeo?.title || tool?.name || toolId;
  const description = toolSeo?.description || tool?.description || "";

  const toolPath = `/tools/${toolId}`;

  const alternates: Record<string, string> = {};
  for (const loc of locales) {
    alternates[loc] = getLocalePath(loc as Locale, toolPath);
  }

  return {
    title,
    description,
    alternates: {
      canonical: getLocalePath(locale as Locale, toolPath),
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url: getLocalePath(locale as Locale, toolPath),
      siteName: "Toollo",
      locale,
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateHomeMetadata(
  title: string,
  description: string,
  locale: string
): Metadata {
  const alternates: Record<string, string> = {};
  for (const loc of locales) {
    alternates[loc] = loc === "en" ? baseUrl : `${baseUrl}/${loc}`;
  }

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: "%s | Toollo",
    },
    description,
    keywords: [
      "free online tools",
      "image compressor",
      "json formatter",
      "qr code generator",
      "base64 encoder",
      "hash generator",
      "regex tester",
      "pdf converter",
      "url encoder",
      "uuid generator",
      "no signup tools",
      "browser tools",
      "privacy tools",
      "developer tools",
      "toollo",
    ],
    authors: [{ name: "Toollo" }],
    creator: "Toollo",
    publisher: "Toollo",
    alternates: {
      canonical: locale === "en" ? baseUrl : `${baseUrl}/${locale}`,
      languages: alternates,
    },
    openGraph: {
      title,
      description,
      url: locale === "en" ? baseUrl : `${baseUrl}/${locale}`,
      siteName: "Toollo",
      locale,
      type: "website",
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Toollo — Free Online Tools",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${baseUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "YOUR_GOOGLE_VERIFICATION_CODE",
    },
    category: "technology",
  };
}
