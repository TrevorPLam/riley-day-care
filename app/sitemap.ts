import type { MetadataRoute } from "next";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/programs", "/tuition", "/enrollment", "/faq", "/contact", "/privacy"];

  return routes.map((route) => {
    const url = new URL(route || "/", baseUrl).toString();
    return {
      url,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: route === "" ? 1 : 0.6
    };
  });
}

