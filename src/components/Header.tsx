// 檔案路徑：src/components/Header.tsx
"use client";

import React from "react";
import {
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    X,
    Home as HomeIcon,
    MessageSquare,
    Video,
    Inbox,
    FileText,
    User,
    LogOut,
    Menu, // 💡 新增：引入漢堡選單圖示
} from "lucide-react";
import { ThemeConfig, BrowserTab, UserProfile } from "@/types";

interface HeaderProps {
    currentTheme: ThemeConfig;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (o: boolean) => void;
    openTabs: BrowserTab[];
    activeTabId: string;
    setActiveTabId: (id: string) => void;
    historyIndex: number;
    tabHistory: string[];
    handleGoBack: () => void;
    handleGoForward: () => void;
    handleCloseTab: (id: string, e: React.MouseEvent) => void;
    handleSaveOrUpdate: () => void;
    inputContent: string;
    isLoading: boolean;
    analyzingNoteId: string | null;
    currentTab: BrowserTab;
    profile: UserProfile | null;
    handleSignOut: () => void;
    setIsAuthModalOpen: (o: boolean) => void;
    setIsProfileModalOpen: (o: boolean) => void;
}

export default function Header({
    currentTheme,
    isSidebarOpen,
    setIsSidebarOpen,
    openTabs,
    activeTabId,
    setActiveTabId,
    historyIndex,
    tabHistory,
    handleGoBack,
    handleGoForward,
    handleCloseTab,
    handleSaveOrUpdate,
    inputContent,
    isLoading,
    analyzingNoteId,
    currentTab,
    profile,
    handleSignOut,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
}: HeaderProps) {
    return (
        <header
            className={`h-11 border-b ${currentTheme.sidebarBorder} flex items-center justify-between sticky top-0 ${currentTheme.sidebarBg} z-20 select-none overflow-hidden pr-4 w-full`}
        >
            <div className="flex items-center flex-1 h-full overflow-hidden">
                {/* 💡 漢堡選單按鈕區塊（手機與電腦端響應式切換） */}
                <div className="flex items-center gap-1 px-3 border-r border-neutral-200/20 h-full shrink-0">
                    {/* 手機版：不論側邊欄開或關，都固定用 Menu（漢堡鈕）來進行無縫開關 */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={`p-1 rounded-md ${currentTheme.cardHover} md:hidden block text-neutral-500`}
                    >
                        <Menu size={16} />
                    </button>

                    {/* 電腦版：維持原本邏輯，只有當側邊欄關閉時，才顯示右向 Chevron 箭頭 */}
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`p-1 rounded-md ${currentTheme.cardHover} mr-1 hidden md:block`}
                        >
                            <ChevronRight size={14} />
                        </button>
                    )}
                    
                    {/* 💡 歷史紀錄前進與後退鈕：在手機版上完全隱藏 (hidden md:flex)，釋放給頁籤空間 */}
                    <div className="hidden md:flex items-center gap-1">
                        <button
                            onClick={handleGoBack}
                            disabled={historyIndex === 0}
                            className="p-1 rounded-md text-neutral-500 hover:bg-black/5 disabled:opacity-20 transition-all"
                        >
                            <ArrowLeft size={14} />
                        </button>
                        <button
                            onClick={handleGoForward}
                            disabled={historyIndex >= tabHistory.length - 1}
                            className="p-1 rounded-md text-neutral-500 hover:bg-black/5 disabled:opacity-20 transition-all"
                        >
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

                {/* 頂部分頁標籤（支援水平滾動且隱藏滾動條） */}
                <div className="flex items-end h-full flex-1 overflow-x-auto no-scrollbar">
                    {openTabs.map((tab) => {
                        const isActive = tab.id === activeTabId;
                        const Icon =
                            tab.type === "home"
                                ? HomeIcon
                                : tab.type === "ai"
                                  ? MessageSquare
                                  : tab.type === "meeting"
                                    ? Video
                                    : tab.type === "inbox"
                                      ? Inbox
                                      : FileText;
                        return (
                            <div
                                key={tab.id}
                                onClick={() => setActiveTabId(tab.id)}
                                className={`group flex items-center justify-between h-full px-3 md:px-4 text-xs font-medium cursor-pointer border-r ${currentTheme.sidebarBorder} transition-all min-w-[100px] max-w-[160px] md:max-w-[180px] flex-1 ${
                                    isActive
                                        ? `${currentTheme.bg} border-b-2 border-b-neutral-800 font-bold text-neutral-900`
                                        : "text-neutral-500 bg-black/5 hover:bg-black/10"
                                }`}
                            >
                                <div className="flex items-center gap-1.5 md:gap-2 truncate pr-1">
                                    <Icon size={12} className="opacity-70 shrink-0" />
                                    <span className="truncate text-[11px] md:text-xs">
                                        {tab.title}
                                    </span>
                                </div>
                                {openTabs.length > 1 && (
                                    <button
                                        onClick={(e) =>
                                            handleCloseTab(tab.id, e)
                                        }
                                        className="p-0.5 rounded-md opacity-40 md:opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-all shrink-0"
                                    >
                                        <X size={11} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 右側功能操作區 */}
            <div className="flex items-center gap-2 md:gap-3.5 shrink-0 pl-1 md:pl-2">
                {currentTab.type === "note" && (
                    <button
                        onClick={handleSaveOrUpdate}
                        disabled={
                            !inputContent.trim() ||
                            isLoading ||
                            (currentTab.noteId
                                ? analyzingNoteId === currentTab.noteId
                                : false)
                        }
                        className={`px-2.5 py-1 text-[10px] md:text-[11px] ${currentTheme.accent} ${currentTheme.accentText} rounded-md font-bold disabled:opacity-40 transition-opacity shrink-0`}
                    >
                        儲存與分析
                    </button>
                )}

                {/* 會員資訊區塊 */}
                {profile ? (
                    <div
                        onClick={() => setIsProfileModalOpen(true)}
                        className="flex items-center gap-1.5 md:gap-2 border-l pl-2 md:pl-3.5 border-neutral-300/30 text-xs cursor-pointer hover:opacity-80 transition-all group"
                    >
                        <img
                            src={
                                profile.avatar_url ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                            }
                            alt="Avatar"
                            className="w-6 h-6 md:w-7 h-7 rounded-full object-cover ring-1 ring-neutral-400/30 shrink-0 group-hover:ring-neutral-500"
                        />
                        {/* 💡 使用者名稱：在手機版（窄螢幕）完全隱藏，只顯示大頭貼以節省寶貴寬度 */}
                        <div className="hidden sm:flex flex-col max-w-[85px] leading-tight">
                            <span className="font-bold truncate opacity-90 group-hover:underline">
                                {profile.username}
                            </span>
                            <span
                                className={`text-[9px] font-medium ${profile.role === "admin" ? "text-red-500 font-extrabold" : "opacity-50"}`}
                            >
                                {profile.role === "admin" ? "管理員" : "普通用戶"}
                            </span>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSignOut();
                            }}
                            className="p-1 rounded-md text-neutral-400 hover:text-red-500 hover:bg-black/5 transition-colors"
                        >
                            <LogOut size={13} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="border-l pl-2 md:pl-3.5 border-neutral-300/30 text-[11px] md:text-xs font-bold hover:opacity-70 flex items-center gap-1 text-neutral-700"
                    >
                        <User size={13} className="opacity-70" />
                        <span>登入/註冊</span>
                    </button>
                )}
            </div>
        </header>
    );
}