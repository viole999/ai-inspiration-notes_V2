// 檔案路徑：src/app/layout.tsx
import type { Metadata, Viewport } from "next"; // 1. 這裡額外引入了 Viewport 型別
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 2. 移除原有的 themeColor
export const metadata: Metadata = {
  title: "隨身靈感筆記",
  description: "結合地端 AI 的行動優先靈感筆記",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "靈感筆記",
  },
  formatDetection: {
    telephone: false,
  },
};

// 3. 新增獨立的 viewport 導出，將 themeColor 移到這裡
export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        {children}
        
        {/* 自動註冊 Service Worker 的客戶端腳本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('Service Worker 註冊成功，範圍:', registration.scope);
                    },
                    function(err) {
                      console.log('Service Worker 註冊失敗:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}