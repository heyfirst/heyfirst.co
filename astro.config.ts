import fs from "node:fs";
import { fileURLToPath } from "node:url";
import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, sessionDrivers } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import webmanifest from "astro-webmanifest";
import emdash, { local } from "emdash/astro";
import { postgres } from "emdash/db";
import { loadEnv } from "vite";
import { expressiveCodeOptions, siteConfig } from "./src/site.config";

// Bun loads .env for itself but not for the node process that runs astro, so read it here too.
const env = { ...loadEnv(process.env.NODE_ENV ?? "production", process.cwd(), ""), ...process.env };
const databaseUrl = env.DATABASE_URL;
const siteUrl = env.SITE_URL;
const stagingOrigin = env.STAGING_ORIGIN;
const allowedDomains = [siteUrl, stagingOrigin]
	.filter((url): url is string => Boolean(url))
	.map((url) => ({ hostname: new URL(url).hostname }));

// The Node adapter keeps sessions under node_modules/.astro, which the non-root container user cannot
// write; without a session the admin cannot sign in after registering its passkey.
const sessionDir =
	env.SESSION_DIR ?? fileURLToPath(new URL("./node_modules/.astro/sessions", import.meta.url));

// https://astro.build/config
export default defineConfig({
	site: siteUrl ?? siteConfig.url,
	session: { driver: sessionDrivers.fsLite({ base: sessionDir }) },
	integrations: [
		expressiveCode(expressiveCodeOptions),
		icon(),
		react(),
		emdash({
			database: postgres({ ...(databaseUrl && { connectionString: databaseUrl }) }),
			storage: local({
				directory: env.UPLOADS_DIR ?? "./uploads",
				baseUrl: "/_emdash/api/media/file",
			}),
			...(siteUrl && { siteUrl }),
			allowedOrigins: stagingOrigin ? [stagingOrigin] : [],
			trustedProxyHeaders: ["cf-connecting-ip"],
			toolbar: "client",
			middleware: { outer: "./src/observability/request-span.ts" },
			plugins: [
				{
					id: "search-sync",
					version: "1.0.0",
					entrypoint: fileURLToPath(
						new URL("./src/emdash-plugins/search-sync.ts", import.meta.url),
					),
					format: "native",
				},
			],
		}),
		webmanifest({
			// See: https://github.com/alextim/astro-lib/blob/main/packages/astro-webmanifest/README.md
			name: siteConfig.title,
			short_name: "Astro_Cactus", // optional
			description: siteConfig.description,
			lang: siteConfig.lang,
			icon: "public/icon.svg", // the source for generating favicon & icons
			icons: [
				{
					src: "icons/apple-touch-icon.png", // used in src/components/BaseHead.astro L:26
					sizes: "180x180",
					type: "image/png",
				},
				{
					src: "icons/icon-192.png",
					sizes: "192x192",
					type: "image/png",
				},
				{
					src: "icons/icon-512.png",
					sizes: "512x512",
					type: "image/png",
				},
			],
			start_url: "/",
			background_color: "#1d1f21",
			theme_color: "#2bbc8a",
			display: "standalone",
			config: {
				insertFaviconLinks: false,
				insertThemeColorMeta: false,
				insertManifestLink: false,
			},
		}),
	],
	// https://docs.astro.build/en/guides/prefetch/
	prefetch: true,
	vite: {
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
		plugins: [tailwindcss(), rawFonts([".ttf", ".woff"])],
		server: {
			allowedHosts: ["heyfirst.localhost"],
		},
	},
	output: "server",
	adapter: node({ mode: "standalone" }),
	security: { allowedDomains },
	redirects: {
		"/blog/[...slug]": { status: 301, destination: "/posts/[...slug]" },
		"/sitemap-index.xml": { status: 301, destination: "/sitemap.xml" },
		"/sitemap-0.xml": { status: 301, destination: "/sitemap.xml" },
	},
});

function rawFonts(ext: string[]) {
	return {
		name: "vite-plugin-raw-fonts",
		// @ts-expect-error:next-line
		transform(_, id) {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
		},
	};
}
