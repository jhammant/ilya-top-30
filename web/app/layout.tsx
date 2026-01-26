import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GlobalProvider } from "@/context/GlobalContext";
import { LearningProvider } from "@/context/LearningContext";
import ThemeScript from "@/components/ThemeScript";
import LayoutWrapper from "@/components/LayoutWrapper";
import PWARegister from "@/components/PWARegister";
import OfflineIndicator from "@/components/OfflineIndicator";

const GA_MEASUREMENT_ID = "G-45GD12EB87";

// Use Inter font with swap display for better loading
const font = Inter({
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Ilya's Top 30 - AI Paper Learning Platform",
  description: "Master the foundational AI papers from Ilya Sutskever's reading list",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ilya's Top 30",
  },
  formatDetection: {
    telephone: false,
  },
  applicationName: "Ilya's Top 30",
  keywords: ["AI", "machine learning", "deep learning", "papers", "education", "Ilya Sutskever"],
  authors: [{ name: "Ilya's Top 30 Team" }],
  creator: "Ilya's Top 30",
  publisher: "Ilya's Top 30",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <ThemeScript />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={font.className}>
        <GlobalProvider>
          <LearningProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <OfflineIndicator />
          </LearningProvider>
        </GlobalProvider>
        <PWARegister />
      </body>
    </html>
  );
}
