// 檔案路徑：src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("缺少 Supabase 環境變數，請檢查 .env.local 檔案設定。");
}

// 建立全域單例（Singleton）的 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        // 💡 加上這個設定：當偵測到雜湊 Token 並處理完後，自動將其從網址列中移除
        flowType: "pkce", // 如果你使用的是 PKCE 流程
        detectSessionInUrl: true,
    },
});
