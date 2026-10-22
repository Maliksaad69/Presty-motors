import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://presty-motors.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/*/admin",
          "/api/",
          "/*/checkout/confirmation",
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/admin", "/*/admin"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
