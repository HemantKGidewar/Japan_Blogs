const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

function normalizeSiteUrl(value?: string): URL {
  if (!value) return new URL("http://localhost:3000");
  const withProtocol = /^https?:\/\//.test(value) ? value : `https://${value}`;
  return new URL(withProtocol.replace(/\/$/, ""));
}

export const site = {
  name: "Japan Time-Capsule",
  shortName: "Japan Time-Capsule",
  description: "Photo stories about everyday life, quiet moments, and neon streets in Japan.",
  url: normalizeSiteUrl(configuredUrl),
  author: "Hemant Kumar Gidewar",
};

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, site.url).toString();
}
