import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Zap, Shield, Globe, Heart } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = "https://toollo.org";
  return {
    title: "About Toollo",
    description:
      "About Toollo — 50+ free online tools that run in your browser. No signup, no tracking, no data collection.",
    alternates: {
      canonical:
        locale === "en"
          ? `${baseUrl}/about`
          : `${baseUrl}/${locale}/about`,
    },
  };
}

const features = [
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "All tools run entirely in your browser. Your files and data never leave your device. Zero tracking, zero data collection.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "No server processing means instant results. Everything is computed locally using the power of modern browsers.",
  },
  {
    icon: Globe,
    title: "Available Everywhere",
    description:
      "Toollo is available in 13 languages and works on any device with a modern browser. No downloads or installations required.",
  },
  {
    icon: Heart,
    title: "Free Forever",
    description:
      "All 50+ tools are completely free to use. No subscriptions, no paywalls, no hidden fees. Supported by non-intrusive ads.",
  },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">About Toollo</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
          A collection of 50+ free online tools designed to make your life
          easier. Built with privacy at its core.
        </p>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border border-gray-800 bg-gray-900 p-6"
          >
            <div className="mb-4 inline-flex rounded-lg bg-indigo-500/10 p-2.5">
              <feature.icon
                className="h-6 w-6 text-indigo-400"
                aria-hidden="true"
              />
            </div>
            <h2 className="text-lg font-semibold text-white">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Our Mission</h2>
        <p className="mx-auto mt-4 max-w-2xl text-gray-400 leading-relaxed">
          We believe essential online tools should be free, fast, and private.
          Too many tool websites upload your data to servers, require signups,
          or hide features behind paywalls. Toollo is different — every tool
          runs entirely in your browser, your data stays on your device, and
          everything is free. No compromises.
        </p>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-xl font-bold text-white">Built With</h2>
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
