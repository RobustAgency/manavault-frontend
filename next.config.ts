import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["mrqvkhrqhubwqxgdkppc.supabase.co", "manavault.robustapps.net"],
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
