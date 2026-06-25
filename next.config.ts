// 檔案路徑：next.config.ts
import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// 💡 用 as any 強制忽略外掛套件版本不一致的型別警告
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  workbox: {
    skipWaiting: true,
    clientsClaim: true,
  }
} as any);

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
};

module.exports = {
    allowedDevOrigins: ["26.133.163.81", "120.108.137.10"],
};

export default withPWA(nextConfig);
