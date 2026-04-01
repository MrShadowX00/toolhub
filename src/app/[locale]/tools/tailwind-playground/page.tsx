import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/structured-data";
import TailwindPlaygroundTool from "./TailwindPlaygroundTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("tailwind-playground", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["tailwind-playground"];
  const name = toolSeo?.title || "Tailwind Playground";
  const description = toolSeo?.description || "";
  const faq = toolSeo?.faq || [];
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("tailwind-playground", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Developer Tools", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/tailwind-playground" : `https://toollo.org/${locale}/tools/tailwind-playground` },
      ])} />
      {faq.length > 0 && <JsonLd data={getFaqJsonLd(faq)} />}
      <ToolLayout toolId="tailwind-playground" category="Developer Tools" faq={faq}>
        <TailwindPlaygroundTool />
      </ToolLayout>
    </>
  );
}
