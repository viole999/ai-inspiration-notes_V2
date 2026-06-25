// 檔案路徑：src/components/ProfileModal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, User, Shield, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThemeConfig, UserProfile } from "@/types";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: ThemeConfig;
    profile: UserProfile | null;
    onProfileUpdate: (userId: string) => Promise<void>;
}

export default function ProfileModal({
    isOpen,
    onClose,
    currentTheme,
    profile,
    onProfileUpdate,
}: ProfileModalProps) {
    const [username, setUsername] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || "");
            setAvatarUrl(profile.avatar_url || "");
        }
    }, [profile, isOpen]);

    if (!isOpen || !profile) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: "error", text: "❌ 圖片大小不能超過 2MB" });
            return;
        }

        setIsUploading(true);
        setMessage({ type: "", text: "" });

        try {
            const fileExt = file.name.split(".").pop();
            const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, {
                    upsert: true,
                    contentType: file.type,
                });

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage.from("avatars").getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            setMessage({
                type: "success",
                text: "📸 頭像圖片已暫存，請點擊下方「儲存修改」完成更新。",
            });
        } catch (error: any) {
            setMessage({
                type: "error",
                text: `圖片上傳失敗：${error.message}`,
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    username: username.trim(),
                    avatar_url: avatarUrl,
                })
                .eq("id", profile.id);

            if (error) throw error;

            await onProfileUpdate(profile.id);
            setMessage({ type: "success", text: "✨ 個人資料已成功更新！" });

            setTimeout(() => {
                setMessage({ type: "", text: "" });
                onClose();
            }, 1000);
        } catch (error: any) {
            setMessage({ type: "error", text: `更新失敗：${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center">
            <div
                className={`${currentTheme.cardBg} w-full max-w-md rounded-2xl p-6 border ${currentTheme.sidebarBorder} shadow-2xl m-4`}
            >
                <div className="flex justify-between items-center border-b border-neutral-200/20 pb-3 mb-5">
                    <h3 className="font-black text-sm flex items-center gap-2">
                        <User size={16} /> 個人資料中心
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`p-1 rounded-md ${currentTheme.cardHover}`}
                    >
                        <X size={16} />
                    </button>
                </div>

                {message.text && (
                    <div
                        className={`p-3 rounded-xl text-xs font-bold mb-4 border ${
                            message.type === "success"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                                : "bg-red-50 text-red-600 border-red-200/50"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* 核心改動：移除下方的按鈕，只保留點擊頭像觸發 */}
                <div className="flex flex-col items-center gap-2 mb-6 bg-black/5 p-5 rounded-xl relative">
                    <div
                        className="relative group cursor-pointer shadow-md rounded-full overflow-hidden"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <img
                            src={
                                avatarUrl ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                            }
                            alt="預覽頭像"
                            className="w-20 h-20 rounded-full object-cover ring-2 ring-neutral-400/20 transition-opacity group-hover:opacity-75"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80";
                            }}
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isUploading ? (
                                <Loader2
                                    size={18}
                                    className="text-white animate-spin"
                                />
                            ) : (
                                <Upload size={18} className="text-white" />
                            )}
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                    />

                    <span className="font-bold text-sm mt-1">
                        {username || "新用戶"}
                    </span>

                    <span className="text-[10px] opacity-40 flex items-center gap-1">
                        <Shield size={11} /> 權限級別：
                        {profile.role === "admin" ? "系統管理員" : "一般會員"}
                    </span>
                </div>

                <form
                    onSubmit={handleUpdateProfile}
                    className="space-y-4 text-xs"
                >
                    <div>
                        <label className="block font-bold mb-1.5 opacity-70">
                            顯示名稱 (Username)
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="請輸入您的暱稱"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/5 border-0 focus:ring-1 focus:ring-neutral-400 p-2.5 rounded-xl text-xs focus:outline-none font-medium"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border ${currentTheme.sidebarBorder} hover:bg-black/5 transition-colors`}
                        >
                            取消返回
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isUploading}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-opacity ${currentTheme.accent} ${currentTheme.accentText} disabled:opacity-50`}
                        >
                            {isLoading ? "儲存中..." : "儲存修改"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
