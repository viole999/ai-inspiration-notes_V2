// 檔案路徑：src/components/SettingsModal.tsx
"use client";

import React from "react";
import { X, Palette } from "lucide-react";
import { ThemeConfig, THEMES } from "@/types";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: ThemeConfig;
    setCurrentTheme: (theme: ThemeConfig) => void;
    isFullWidth: boolean;
    setIsFullWidth: (full: boolean) => void;
}

export default function SettingsModal({
    isOpen,
    onClose,
    currentTheme,
    setCurrentTheme,
    isFullWidth,
    setIsFullWidth,
}: SettingsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center">
            <div
                className={`${currentTheme.cardBg} w-full max-w-md rounded-2xl p-6 border ${currentTheme.sidebarBorder} shadow-2xl m-4`}
            >
                <div className="flex justify-between items-center border-b border-neutral-200/20 pb-3 mb-5">
                    <h3 className="font-black text-sm">空間設定與色彩主題</h3>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-md ${currentTheme.cardHover}`}
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-5 text-xs">
                    <div>
                        <label
                            className={`block font-bold mb-2.5 ${currentTheme.textMuted}`}
                        >
                            選擇視覺色彩主題
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(THEMES).map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setCurrentTheme(t)}
                                    className={`p-3 rounded-xl border text-left font-medium transition-all ${
                                        currentTheme.id === t.id
                                            ? "border-neutral-800 ring-1 ring-neutral-800 font-bold"
                                            : "border-neutral-200 opacity-80 hover:opacity-100"
                                    } ${t.bg} ${t.text}`}
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr className="border-neutral-200/20 my-2" />

                    <div className="flex justify-between items-center py-1">
                        <div>
                            <span className="font-bold block">
                                全畫面寬度配適
                            </span>
                            <span
                                className={`text-[11px] ${currentTheme.textMuted}`}
                            >
                                開啟後編輯器將自適應拉伸至最大可視範圍
                            </span>
                        </div>
                        <button
                            onClick={() => setIsFullWidth(!isFullWidth)}
                            className={`w-10 h-5 rounded-full transition-colors ${isFullWidth ? "bg-neutral-800" : "bg-neutral-200"}`}
                        >
                            <div
                                className={`bg-white w-4 h-4 rounded-full shadow-sm transform ${isFullWidth ? "translate-x-5" : "translate-x-1"} transition-transform`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
