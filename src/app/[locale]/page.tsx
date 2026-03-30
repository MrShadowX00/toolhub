import { setRequestLocale } from "next-intl/server";
import HomeClient from "./HomeClient";
import JsonLd from "@/components/seo/JsonLd";
import { getCollectionPageJsonLd } from "@/lib/structured-data";
import { tools } from "@/lib/tools";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const seoMessages = (await import(`@/messages/${locale}/seo.json`)).default;
  const toolItems = tools.map((t) => ({
    id: t.id,
    name: seoMessages.tools?.[t.id]?.title || t.name,
  }));

  return (
    <>
      <JsonLd data={getCollectionPageJsonLd(toolItems)} />
      <HomeClient />
    </>
  );
}
