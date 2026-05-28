import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "UI Blocks — your personal Tailwind component library",
  description:
    "A growing personal library of React + Tailwind components designed with Claude. Browse, copy, and reuse across projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-950 text-ink-100">
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-6 pb-24 pt-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
