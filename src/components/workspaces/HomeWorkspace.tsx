// 檔案路徑：src/components/workspaces/HomeWorkspace.tsx
"use client";

import React from "react";
import { MessageSquare, Plus, Home as HomeIcon, FileText } from "lucide-react";
import { ThemeConfig, Note, BrowserTab } from "@/types";

interface HomeWorkspaceProps {
    currentTheme: ThemeConfig;
    notes: Note[];
    openRightTab: (targetTab: Omit<BrowserTab, "id">) => void;
}

export default function HomeWorkspace({
    currentTheme,
    notes,
    openRightTab,
}: HomeWorkspaceProps) {
    return (
        <div className="flex-1 overflow-y-auto px-6 md:px-16 py-12 max-w-5xl w-full mx-auto space-y-10">
            <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">
                    歡迎來到您的 AI 靈感空間
                </h1>
                <p className={`${currentTheme.textMuted} text-sm`}>
                    從這裡開始，自由開啟對話大腦或開始撰寫您的本地檔案。
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    onClick={() =>
                        openRightTab({ type: "ai", title: "AI 對話大腦" })
                    }
                    className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-6 rounded-2xl hover:shadow-xs cursor-pointer transition-all space-y-2`}
                >
                    <div
                        className={`w-8 h-8 rounded-lg ${currentTheme.accent} ${currentTheme.accentText} flex items-center justify-center`}
                    >
                        <MessageSquare size={16} />
                    </div>
                    <h3 className="font-bold text-sm pt-2">開啟獨立 AI 對話</h3>
                    <p
                        className={`${currentTheme.textMuted} text-xs leading-relaxed`}
                    >
                        與 Gemma 4 進行純淨深度對話、程式重構或腦力激盪。
                    </p>
                </div>

                <div
                    onClick={() =>
                        openRightTab({ type: "note", title: "未命名檔案" })
                    }
                    className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-6 rounded-2xl hover:shadow-xs cursor-pointer transition-all space-y-2`}
                >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <Plus size={16} />
                    </div>
                    <h3 className="font-bold text-sm pt-2">建立全新本地檔案</h3>
                    <p
                        className={`${currentTheme.textMuted} text-xs leading-relaxed`}
                    >
                        新增一份空白筆記文件，支援 Markdown
                        即時預覽以及大模型背景自動摘要。
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider opacity-70">
                    最近更新檔案
                </h3>
                {notes.length === 0 ? (
                    <p className="text-xs opacity-50 italic">
                        目前尚未建立任何本地檔案
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {notes.slice(0, 3).map((n) => (
                            <div
                                key={n.id}
                                onClick={() =>
                                    openRightTab({
                                        type: "note",
                                        title: n.title || "未命名檔案",
                                        noteId: n.id,
                                    })
                                }
                                className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-3.5 rounded-xl hover:bg-black/5 cursor-pointer transition-all text-xs flex items-center gap-2.5`}
                            >
                                <FileText
                                    size={14}
                                    className={currentTheme.textMuted}
                                />
                                <span className="font-bold truncate">
                                    {n.title || "未命名檔案"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
