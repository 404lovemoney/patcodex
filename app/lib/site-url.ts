export const getSiteUrl = () => {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000";
  const normalizedUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;

  return new URL(normalizedUrl.replace(/\/+$/, ""));
};
