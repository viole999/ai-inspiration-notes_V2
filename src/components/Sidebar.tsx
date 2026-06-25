"use client";

import React from "react";
import {
    ChevronLeft,
    Home as HomeIcon,
    MessageSquare,
    Video,
    Inbox,
    Search,
    Palette,
    Plus,
    FileText,
    Trash2,
} from "lucide-react";
import { ThemeConfig, Note, BrowserTab } from "@/types";

interface SidebarProps {
    currentTheme: ThemeConfig;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (o: boolean) => void;
    activeSidebar: SidebarMode;
    setActiveSidebar: (s: SidebarMode) => void;
    notes: Note[];
    currentTab: BrowserTab;
    openRightTab: (targetTab: Omit<BrowserTab, "id">) => void;
    handleDeleteNote: (id: string, e: React.MouseEvent) => void;
    setIsSettingsOpen: (o: boolean) => void;
    setIsSearchOpen: (o: boolean) => void;
    handleSendChatMessage: (t: string) => void;
}

type SidebarMode = "home" | "ai" | "meeting" | "inbox";

// 1. 移到組件外，避免重複宣告；並定義對應的 A11y 標籤與圖標
const SIDEBAR_MODES: { mode: SidebarMode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { mode: "home", label: "首頁工作台", icon: HomeIcon },
    { mode: "ai", label: "AI 對話大腦", icon: MessageSquare },
    { mode: "meeting", label: "視訊會議", icon: Video },
    { mode: "inbox", label: "收件夾", icon: Inbox },
];

export default function Sidebar({
    currentTheme,
    isSidebarOpen,
    setIsSidebarOpen,
    activeSidebar,
    setActiveSidebar,
    notes,
    currentTab,
    openRightTab,
    handleDeleteNote,
    setIsSettingsOpen,
    setIsSearchOpen,
    handleSendChatMessage,
}: SidebarProps) {
    return (
        <aside
            className={`${currentTheme.sidebarBg} ${currentTheme.sidebarBorder} border-r flex flex-col transition-all duration-300 z-40 fixed md:static inset-y-0 left-0 ${
                isSidebarOpen ? "w-[260px]" : "w-0 overflow-hidden"
            }`}
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between pb-2">
                <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-lg ${currentTheme.accent} ${currentTheme.accentText} flex items-center justify-center font-bold text-xs`}>
                        智
                    </div>
                    <span className="text-sm font-bold tracking-wide">個人 AI 靈感空間</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(false)}
                    className={`p-1 rounded-md ${currentTheme.cardHover} transition-colors`}
                    aria-label="關閉側邊欄"
                >
                    <ChevronLeft size={16} />
                </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-1 border-b border-neutral-200/20">
                {SIDEBAR_MODES.map(({ mode, label, icon: Icon }) => (
                    <button
                        key={mode}
                        onClick={() => setActiveSidebar(mode)}
                        title={label}
                        aria-label={label}
                        className={`flex items-center justify-center p-2 rounded-xl transition-all flex-1 ${
                            activeSidebar === mode
                                ? `${currentTheme.accent} ${currentTheme.accentText} shadow-xs`
                                : "hover:bg-black/5 text-neutral-500"
                        }`}
                    >
                        <Icon size={16} />
                    </button>
                ))}
                <button
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="搜尋"
                    title="搜尋"
                    className="flex items-center justify-center p-2 rounded-xl text-neutral-500 hover:bg-black/5 transition-all flex-1"
                >
                    <Search size={16} />
                </button>
            </div>

            {/* Settings */}
            <div className="px-3 py-2 space-y-[4px] border-b border-neutral-200/20 pb-2">
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg ${currentTheme.cardHover} text-left transition-colors`}
                >
                    <Palette size={14} className={currentTheme.textMuted} />
                    <span>主題與介面切換</span>
                </button>
            </div>

            {/* Main Content List */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
                {activeSidebar === "home" && (
                    <div className="space-y-4 pt-1">
                        <div>
                            <div className={`text-[10px] font-bold ${currentTheme.textMuted} px-3 py-1 uppercase tracking-wider`}>
                                私人本地檔案
                            </div>
                            <div className="mt-1">
                                <button
                                    onClick={() => openRightTab({ type: "home", title: "首頁工作台" })}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-black/5 text-left font-medium mb-1"
                                >
                                    <HomeIcon size={14} className={currentTheme.textMuted} />
                                    <span>返回首頁儀表板</span>
                                </button>
                                <button
                                    onClick={() => openRightTab({ type: "note", title: "未命名檔案" })}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-black/5 text-left font-medium mb-2 border border-dashed border-neutral-300/50"
                                >
                                    <Plus size={14} />
                                    <span>建立全新空白筆記</span>
                                </button>
                                <div className="space-y-[2px]">
                                    {notes.map((note) => {
                                        const isSelected = currentTab.type === "note" && currentTab.noteId === note.id;
                                        return (
                                            <div
                                                key={note.id}
                                                onClick={() => openRightTab({
                                                    type: "note",
                                                    title: note.title || "未命名檔案",
                                                    noteId: note.id,
                                                })}
                                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer group transition-colors ${
                                                    isSelected
                                                        ? `${currentTheme.accent} ${currentTheme.accentText} font-bold`
                                                        : `hover:bg-black/5`
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate pr-2">
                                                    <FileText
                                                        size={14}
                                                        className={isSelected ? "text-white" : currentTheme.textMuted}
                                                    />
                                                    <span className="truncate">{note.title || "未命名檔案"}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteNote(note.id, e)}
                                                    aria-label="刪除筆記"
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md text-red-500 hover:bg-red-50 transition-opacity"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeSidebar === "ai" && (
                    <div className="space-y-4 pt-1">
                        <div
                            onClick={() => openRightTab({ type: "ai", title: "AI 對話大腦" })}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-black/5 hover:bg-black/10 text-xs text-left font-bold mt-1 cursor-pointer"
                        >
                            <div className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-[10px]">
                                AI
                            </div>
                            <span>Gemma 4 對話大腦</span>
                        </div>
                        <div className="space-y-1">
                            <div
                                onClick={() => {
                                    openRightTab({ type: "ai", title: "AI 對話大腦" });
                                    handleSendChatMessage("工作空間內容總結");
                                }}
                                className="px-3 py-2 rounded-lg text-xs hover:bg-black/5 cursor-pointer truncate flex items-center gap-2 text-neutral-600"
                            >
                                <MessageSquare size={13} /> 工作空間內容總結
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 未來可在這裡擴充 meeting 與 inbox 的面板 */}
            </div>
        </aside>
    );
}