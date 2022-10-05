/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  swcMinify: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      import("./scripts/generate-sitemap.mjs");
      import("./scripts/generate-rss.mjs");
    }

    return config;
  },
  async redirects() {
    return [
      {
        source: "/blog/2021-01-23-rule-of-three",
        destination: "/blog/1-2-refactor",
        permanent: true,
      },
      {
        source: "/blog/2021-02-05-make-it-work-right-and-fast",
        destination: "/blog/make-it-work-make-it-right-make-it-fast",
        permanent: true,
      },
    ];
  },
  images: {
    domains: ["webring.wonderful.software"],
  },
};

// https://securityheaders.com
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.youtube.com *.twitter.com cdn.usefathom.com heyfirst.ck.page *.convertkit.com *.googletagmanager.com *.spotify.com giscus.app cdnjs.cloudflare.com *.heyfirst.co;
  child-src *.youtube.com *.google.com *.twitter.com heyfirst.ck.page *.convertkit.com *.spotify.com giscus.app giphy.com;
  style-src 'self' 'unsafe-inline' *.googleapis.com giscus.app *.cdnfonts.com;
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self' 'unsafe-eval' fonts.gstatic.com fonts.googleapis.com fonts.cdnfonts.com;
`;

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\n/g, ""),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: "Referrer-Policy",
    value: "origin-when-cross-origin",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  // Opt-out of Google FLoC: https://amifloced.org/
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

export default nextConfig;
