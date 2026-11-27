import { GET as emdashSitemap } from "emdash/internal/routes/sitemap-_collection_.xml";
import { uncached } from "@/utils/uncached";

export const prerender = false;

export const GET = uncached(emdashSitemap);
