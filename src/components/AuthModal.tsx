// 檔案路徑：src/components/AuthModal.tsx
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeConfig } from "@/types";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: ThemeConfig;
    initialMode?: "signin" | "signup";
}

export default function AuthModal({
    isOpen,
    onClose,
    currentTheme,
    initialMode = "signin",
}: AuthModalProps) {
    const [authMode, setAuthMode] = useState<"signin" | "signup">(initialMode);
    const [authEmail, setAuthEmail] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const [authUsername, setAuthUsername] = useState("");
    const [authAvatarUrl, setAuthAvatarUrl] = useState("");
    const [authError, setAuthError] = useState("");
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    if (!isOpen) return null;

    const handleAuthSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        setIsAuthLoading(true);

        if (authMode === "signup") {
            const { error } = await supabase.auth.signUp({
                email: authEmail,
                password: authPassword,
                options: {
                    data: {
                        username: authUsername || "新用戶",
                        avatar_url:
                            authAvatarUrl ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                    },
                },
            });
            if (error) setAuthError(error.message);
            else {
                alert("註冊成功！已自動登入並建立公開 Profile！");
                onClose();
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email: authEmail,
                password: authPassword,
            });
            if (error) setAuthError(error.message);
            else onClose();
        }
        setIsAuthLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center">
            <div
                className={`${currentTheme.cardBg} w-full max-w-sm rounded-2xl p-6 border ${currentTheme.sidebarBorder} shadow-2xl m-4`}
            >
                <div className="flex justify-between items-center border-b border-neutral-200/20 pb-3 mb-4">
                    <h3 className="font-black text-sm">
                        {authMode === "signin"
                            ? "登入靈感空間"
                            : "註冊新會員帳號"}
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-md ${currentTheme.cardHover}`}
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
                    {authError && (
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg font-medium border border-red-200/50">
                            ⚠️ {authError}
                        </div>
                    )}

                    {authMode === "signup" && (
                        <>
                            <div>
                                <label className="block font-bold mb-1 opacity-70">
                                    顯示名稱 (Username)
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="例如：米開朗基羅"
                                    value={authUsername}
                                    onChange={(e) =>
                                        setAuthUsername(e.target.value)
                                    }
                                    className="w-full bg-black/5 border-0 focus:ring-1 focus:ring-neutral-400 p-2.5 rounded-xl text-xs focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-1 opacity-70">
                                    頭像網址 (Avatar URL 可不填)
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={authAvatarUrl}
                                    onChange={(e) =>
                                        setAuthAvatarUrl(e.target.value)
                                    }
                                    className="w-full bg-black/5 border-0 focus:ring-1 focus:ring-neutral-400 p-2.5 rounded-xl text-xs focus:outline-none"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block font-bold mb-1 opacity-70">
                            電子信箱 (Email)
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            className="w-full bg-black/5 border-0 focus:ring-1 focus:ring-neutral-400 p-2.5 rounded-xl text-xs focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-1 opacity-70">
                            安全性密碼 (Password)
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="請輸入密碼 (至少 6 位數)"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="w-full bg-black/5 border-0 focus:ring-1 focus:ring-neutral-400 p-2.5 rounded-xl text-xs focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isAuthLoading}
                        className={`w-full py-2.5 mt-2 rounded-xl text-xs font-bold transition-opacity ${currentTheme.accent} ${currentTheme.accentText} disabled:opacity-50`}
                    >
                        {isAuthLoading
                            ? "正在傳送要求..."
                            : authMode === "signin"
                              ? "立刻登入進場"
                              : "完成註冊並登入"}
                    </button>

                    <div className="text-center pt-2 text-[11px]">
                        {authMode === "signin" ? (
                            <p className="opacity-70">
                                還沒有帳號嗎？{" "}
                                <span
                                    onClick={() => {
                                        setAuthMode("signup");
                                        setAuthError("");
                                    }}
                                    className="font-bold underline cursor-pointer text-blue-500"
                                >
                                    點此註冊新帳戶
                                </span>
                            </p>
                        ) : (
                            <p className="opacity-70">
                                已經擁有帳號？{" "}
                                <span
                                    onClick={() => {
                                        setAuthMode("signin");
                                        setAuthError("");
                                    }}
                                    className="font-bold underline cursor-pointer text-blue-500"
                                >
                                    點此返回登入
                                </span>
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
