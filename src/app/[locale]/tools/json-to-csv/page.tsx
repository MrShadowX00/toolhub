import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/structured-data";
import JsonToCsvTool from "./JsonToCsvTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("json-to-csv", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["json-to-csv"];
  const name = toolSeo?.title || "JSON to CSV";
  const description = toolSeo?.description || "";
  const faq = toolSeo?.faq || [];
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("json-to-csv", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Developer Tools", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/json-to-csv" : `https://toollo.org/${locale}/tools/json-to-csv` },
      ])} />
      {faq.length > 0 && <JsonLd data={getFaqJsonLd(faq)} />}
      <ToolLayout toolId="json-to-csv" category="Developer Tools" faq={faq}>
        <JsonToCsvTool />
      </ToolLayout>
    </>
  );
}
