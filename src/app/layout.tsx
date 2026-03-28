import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ToolHub — Free Online Tools",
    template: "%s | ToolHub",
  },
  description:
    "50+ free online tools. No signup. No tracking. Image compressor, JSON formatter, QR generator, and more — everything runs in your browser.",
  keywords: [
    "online tools",
    "free tools",
    "image compressor",
    "json formatter",
    "qr generator",
    "developer tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Google AdSense placeholder */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col bg-gray-950 font-sans text-gray-100">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
