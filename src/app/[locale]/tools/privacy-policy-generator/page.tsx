import { setRequestLocale } from "next-intl/server";
import { generateToolMetadata } from "@/lib/seo";
import ToolLayout from "@/components/ui/ToolLayout";
import JsonLd from "@/components/seo/JsonLd";
import { getWebApplicationJsonLd, getBreadcrumbJsonLd, getFaqJsonLd } from "@/lib/structured-data";
import PrivacyPolicyGeneratorTool from "./PrivacyPolicyGeneratorTool";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return generateToolMetadata("privacy-policy-generator", (await params).locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolSeo = seoMessages.tools?.["privacy-policy-generator"];
  const name = toolSeo?.title || "Privacy Policy Generator";
  const description = toolSeo?.description || "";
  const faq = toolSeo?.faq || [];
  return (
    <>
      <JsonLd data={getWebApplicationJsonLd("privacy-policy-generator", name, description, locale)} />
      <JsonLd data={getBreadcrumbJsonLd([
        { name: "Home", url: "https://toollo.org" },
        { name: "Generators", url: "https://toollo.org" },
        { name, url: locale === "en" ? "https://toollo.org/tools/privacy-policy-generator" : `https://toollo.org/${locale}/tools/privacy-policy-generator` },
      ])} />
      {faq.length > 0 && <JsonLd data={getFaqJsonLd(faq)} />}
      <ToolLayout toolId="privacy-policy-generator" category="Generators" faq={faq}>
        <PrivacyPolicyGeneratorTool />
      </ToolLayout>
    </>
  );
}
