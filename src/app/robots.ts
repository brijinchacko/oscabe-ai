import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/crm", "/portal", "/dashboard", "/onboarding", "/api"],
      },
    ],
    sitemap: "https://oscabe.com/sitemap.xml",
  };
}
