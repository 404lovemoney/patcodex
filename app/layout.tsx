import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import "./globals.css";

const themeInitScript = `
(function () {
  try {
    var storageKey = "murong-theme-mode";
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
  title: "沐绒宠物洗护",
  description: "温柔洗护、精细护理、可视化服务的宠物洗护预约页面",
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
