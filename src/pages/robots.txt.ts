import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const body =
    import.meta.env.MODE === "production"
      ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", site)}\n`
      : "User-agent: *\nDisallow: /\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
