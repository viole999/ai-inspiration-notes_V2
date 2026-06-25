// 檔案路徑：src/components/workspaces/NoteWorkspace.tsx
"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { ThemeConfig, Note, BrowserTab } from "@/types";

interface NoteWorkspaceProps {
    currentTheme: ThemeConfig;
    isFullWidth: boolean;
    inputTitle: string;
    setInputTitle: (t: string) => void;
    inputContent: string;
    setInputContent: (c: string) => void;
    activeNoteData: Note | null;
    currentTab: BrowserTab;
    analyzingNoteId: string | null;
}

export default function NoteWorkspace({
    currentTheme,
    isFullWidth,
    inputTitle,
    setInputTitle,
    inputContent,
    setInputContent,
    activeNoteData,
    currentTab,
    analyzingNoteId,
}: NoteWorkspaceProps) {
    return (
        <div
            className={`flex-1 overflow-y-auto px-6 md:px-16 py-10 w-full mx-auto pb-32 ${isFullWidth ? "max-w-full" : "max-w-4xl"}`}
        >
            <input
                type="text"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                placeholder="未命名檔案標題"
                className="w-full text-3xl font-black border-0 p-0 focus:ring-0 focus:outline-none mb-6 bg-transparent"
            />

            {(activeNoteData?.summary ||
                (currentTab.noteId &&
                    analyzingNoteId === currentTab.noteId)) && (
                <div
                    className={`mb-8 ${currentTheme.cardBg} border ${currentTheme.sidebarBorder} rounded-xl p-5 text-xs leading-relaxed shadow-3xs`}
                >
                    <div className="font-bold mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Sparkles
                                size={13}
                                className={`text-amber-500 ${analyzingNoteId === currentTab.noteId ? "animate-spin" : "animate-pulse"}`}
                            />
                            <span>Gemma 4 模型摘要提煉</span>
                        </div>
                        {analyzingNoteId === currentTab.noteId && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold animate-pulse tracking-wider">
                                AI 正在深度思考提煉中...
                            </span>
                        )}
                    </div>

                    {analyzingNoteId === currentTab.noteId ? (
                        <div className="space-y-2 py-1">
                            <div className="h-3 bg-neutral-200/70 dark:bg-neutral-800 rounded animate-pulse w-full" />
                            <div className="h-3 bg-neutral-200/70 dark:bg-neutral-800 rounded animate-pulse w-[92%]" />
                        </div>
                    ) : (
                        <>
                            <p className="opacity-90">
                                {activeNoteData?.summary}
                            </p>
                            {activeNoteData?.tags &&
                                activeNoteData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {activeNoteData.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-black/5 text-[10px] px-2 py-0.5 rounded-md opacity-70"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                        </>
                    )}
                </div>
            )}

            <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="在此點擊開始自由輸入您的深度思考內容..."
                rows={16}
                className="w-full bg-transparent resize-none border-0 p-0 text-sm md:text-base focus:ring-0 focus:outline-none leading-7"
            />
        </div>
    );
}
