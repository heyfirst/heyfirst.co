import withMDX from "@next/mdx";

export default withMDX()({
  pageExtensions: ["ts", "tsx", "mdx"],
  experimental: {
    mdxRs: true,
  },
  swcMinify: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
  headers() {
    return [];
  },
  redirects() {
    return [];
  },
});
