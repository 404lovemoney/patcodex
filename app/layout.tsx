import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { siteSeo } from "./config/seo";
import { getSiteUrl } from "./lib/site-url";
import { THEME_STORAGE_KEY } from "./lib/theme";
import "./globals.css";

const themeInitScript = `
(function () {
  try {
    var storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
    var savedMode = window.localStorage.getItem(storageKey);
    var mode = savedMode === "light" || savedMode === "dark" || savedMode === "system" ? savedMode : "system";
    var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = mode === "system" ? systemTheme : mode;
  } catch (error) {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: siteSeo.title,
  description: siteSeo.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteSeo.title,
    description: siteSeo.description,
    url: "/",
    siteName: siteSeo.name,
    locale: siteSeo.locale,
    type: "website",
    images: [
      {
        url: siteSeo.ogImage.src,
        width: siteSeo.ogImage.width,
        height: siteSeo.ogImage.height,
        alt: siteSeo.ogImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteSeo.title,
    description: siteSeo.description,
    images: [siteSeo.ogImage.src],
  },
  icons: {
    icon: "/icon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
