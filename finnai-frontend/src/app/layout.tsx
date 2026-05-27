import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getAppUrl } from "@/config/env";
import { AppProviders } from "@/providers/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "FinnAI — Gestão financeira com IA",
    template: "%s | FinnAI",
  },
  description:
    "Plataforma premium de gestão financeira pessoal e familiar com inteligência artificial, dashboards e relatórios.",
  applicationName: "FinnAI",
  keywords: ["finanças", "gestão financeira", "IA", "dashboard", "fintech"],
  authors: [{ name: "FinnAI" }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: appUrl,
    siteName: "FinnAI",
    title: "FinnAI — Gestão financeira com IA",
    description:
      "Controle receitas, despesas e metas com insights de IA em uma experiência fintech premium.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinnAI — Gestão financeira com IA",
    description:
      "Controle receitas, despesas e metas com insights de IA em uma experiência fintech premium.",
  },
  alternates: {
    canonical: appUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0c0f" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-bg"
        >
          Pular para o conteúdo
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
