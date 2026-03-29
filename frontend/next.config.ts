import type { NextConfig } from "next";

/* ── Build-time env guard ──
   Fail the build LOUDLY if critical env vars are missing.
   Prevents deploying bundles that crash at runtime with:
   "@supabase/ssr: Your project's URL and API key are required" */
const REQUIRED_BUILD_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const missing = REQUIRED_BUILD_ENV.filter(k => !process.env[k]);
if (missing.length > 0) {
  throw new Error(
    `\n❌ [StudySolo Build] Missing required environment variables:\n` +
    missing.map(k => `   - ${k}`).join('\n') + '\n\n' +
    `Ensure .env.local (or .env.production) exists in:\n` +
    `   ${process.cwd()}\n` +
    `with the correct Supabase credentials.\n`
  );
}

const BACKEND_URL =
  process.env.INTERNAL_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:2038";

const normalizedBackendUrl = BACKEND_URL.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Force env vars into ALL client chunks — workaround for Next.js 16 Turbopack
  // chunk-splitting bug where NEXT_PUBLIC_* vars only get baked into SOME chunks
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '',
    NEXT_PUBLIC_COOKIE_DOMAIN: process.env.NEXT_PUBLIC_COOKIE_DOMAIN ?? '',
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${normalizedBackendUrl}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        // Redirect old /workspace/{uuid} to /c/{uuid} — preserves /workspace (list page)
        source: "/workspace/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})",
        destination: "/c/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
