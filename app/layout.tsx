import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AssistantWidget } from "@/components/assistant-widget";
import { PageBackdrop } from "@/components/page-backdrop";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mentoria Hub — Opportunities & Async Learning",
  description:
    "Discover competitions, scholarships and internships, and learn with structured Mentoria courses — personalized, async, and built to scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${syne.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers>
          <PageBackdrop />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <AssistantWidget />
        </Providers>
      </body>
    </html>
  );
}
