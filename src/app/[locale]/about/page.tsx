import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Zap, Shield, Globe, Heart } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pages.about" });
  const baseUrl = "https://toollo.org";
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
    alternates: {
      canonical:
        locale === "en"
          ? `${baseUrl}/about`
          : `${baseUrl}/${locale}/about`,
    },
  };
}

const featureIcons = [Shield, Zap, Globe, Heart];
const featureKeys = [
  { title: "privacyFirst", desc: "privacyFirstDesc" },
  { title: "lightningFast", desc: "lightningFastDesc" },
  { title: "availableEverywhere", desc: "availableEverywhereDesc" },
  { title: "freeForever", desc: "freeForeverDesc" },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.about");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">{t("title")}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        {featureKeys.map((feature, i) => {
          const Icon = featureIcons[i];
          return (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-800 bg-gray-900 p-6"
            >
              <div className="mb-4 inline-flex rounded-lg bg-indigo-500/10 p-2.5">
                <Icon
                  className="h-6 w-6 text-indigo-400"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-lg font-semibold text-white">
                {t(feature.title)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                {t(feature.desc)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-16 rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">{t("missionTitle")}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400 leading-relaxed">
          {t("missionDesc")}
        </p>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-xl font-bold text-white">{t("builtWith")}</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {[
            "Next.js",
            "React",
            "TypeScript",
            "Tailwind CSS",
            "Lucide Icons",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-gray-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
