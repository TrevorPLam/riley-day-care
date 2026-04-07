import type { MetadataRoute } from "next";
import { env, getBaseUrl } from "@/lib/env";

const baseUrl = getBaseUrl();

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

