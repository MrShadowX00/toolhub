import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { locales, rtlLocales, type Locale } from "@/i18n/config";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getOrganizationJsonLd, getWebsiteJsonLd } from "@/lib/structured-data";
import { generateHomeMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import FirebaseAnalytics from "@/components/analytics/FirebaseAnalytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const messages = (await import(`@/messages/${locale}/seo.json`)).default;
  const title = messages.home?.title || "Toollo — Free Online Tools";
  const description =
    messages.home?.description ||
    "50+ free online tools. No signup. No tracking. Image compressor, JSON formatter, QR generator, and more — everything runs in your browser.";

  return generateHomeMetadata(title, description, locale);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const isRtl = rtlLocales.includes(locale as Locale);

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#030712" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col bg-gray-950 font-sans text-gray-100">
        <NextIntlClientProvider messages={messages}>
          <JsonLd data={getOrganizationJsonLd()} />
          <JsonLd data={getWebsiteJsonLd()} />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <FirebaseAnalytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
