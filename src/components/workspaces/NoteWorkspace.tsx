// 檔案路徑：src/components/workspaces/NoteWorkspace.tsx
"use client";

import React from "react";
import { Sparkles, Mic, MicOff } from "lucide-react";
import { ThemeConfig, Note, BrowserTab } from "@/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

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
    
    // 綁定筆記區的獨立語音辨識：將辨識結果直接串接在原本的筆記內容後面
    const { isListening, toggleListening } = useSpeechRecognition({
        onResult: (text) => {
            setInputContent(inputContent + text);
        },
    });

    return (
        <div
            className={`flex-1 overflow-y-auto px-6 md:px-16 py-10 w-full mx-auto pb-32 ${isFullWidth ? "max-w-full" : "max-w-4xl"}`}
        >
            {/* 標題與語音按鈕區塊 */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <input
                    type="text"
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="未命名檔案標題"
                    className={`flex-1 text-3xl font-black border-0 p-0 focus:ring-0 focus:outline-none bg-transparent ${currentTheme.text} placeholder-neutral-400/70`}
                />

                {/* 語音輸入按鈕：色彩與目前主題的卡片、邊框完全同步 */}
                <button
                    onClick={toggleListening}
                    className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all shrink-0 shadow-3xs border ${
                        isListening
                            ? "bg-red-500 text-white border-red-600 animate-pulse"
                            : `${currentTheme.cardBg} ${currentTheme.sidebarBorder} ${currentTheme.text} opacity-90 hover:opacity-100 bg-neutral-100/50 dark:bg-neutral-800/50`
                    }`}
                >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    <span>{isListening ? "正在聆聽..." : "語音輸入"}</span>
                </button>
            </div>

            {/* AI 摘要區塊 */}
            {(activeNoteData?.summary ||
                (currentTab.noteId &&
                    analyzingNoteId === currentTab.noteId)) && (
                <div
                    className={`mb-8 ${currentTheme.cardBg} border ${currentTheme.sidebarBorder} rounded-xl p-5 text-xs leading-relaxed shadow-3xs`}
                >
                    <div className={`font-bold mb-2 flex items-center justify-between ${currentTheme.text}`}>
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
                            <div className="h-3 bg-neutral-400/20 rounded animate-pulse w-full" />
                            <div className="h-3 bg-neutral-400/20 rounded animate-pulse w-[92%]" />
                        </div>
                    ) : (
                        <>
                            <p className={`${currentTheme.text} font-medium leading-relaxed opacity-95`}>
                                {activeNoteData?.summary}
                            </p>
                            {activeNoteData?.tags &&
                                activeNoteData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                        {activeNoteData.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-neutral-400/10 text-[10px] px-2 py-0.5 rounded-md font-medium opacity-80"
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

            {/* 筆記內容編輯區：字體顏色交給 currentTheme.text */}
            <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="在此點擊開始自由輸入您的深度思考內容，或是點擊右上方按鈕開始語音輸入..."
                rows={16}
                className={`w-full bg-transparent resize-none border-0 p-0 text-sm md:text-base focus:ring-0 focus:outline-none leading-7 ${currentTheme.text} placeholder-neutral-400/70`}
            />
        </div>
    );
}