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
    setIsProfileModalOpen: (o: boolean) => void; // 👈 1. 新增控制狀態傳入
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
            className={`h-11 border-b ${currentTheme.sidebarBorder} flex items-center justify-between sticky top-0 ${currentTheme.sidebarBg} z-20 select-none overflow-hidden pr-4`}
        >
            {/* 前段程式碼保持不變 ... */}
            <div className="flex items-center flex-1 h-full overflow-hidden">
                <div className="flex items-center gap-1 px-3 border-r border-neutral-200/20 h-full shrink-0">
                    {!isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`p-1 rounded-md ${currentTheme.cardHover} mr-1`}
                        >
                            <ChevronRight size={14} />
                        </button>
                    )}
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
                                className={`group flex items-center justify-between h-full px-4 text-xs font-medium cursor-pointer border-r ${currentTheme.sidebarBorder} transition-all min-w-[125px] max-w-[180px] flex-1 ${
                                    isActive
                                        ? `${currentTheme.bg} border-b-2 border-b-neutral-800 font-bold text-neutral-900`
                                        : "text-neutral-500 bg-black/5 hover:bg-black/10"
                                }`}
                            >
                                <div className="flex items-center gap-2 truncate pr-1">
                                    <Icon size={13} className="opacity-70" />
                                    <span className="truncate">
                                        {tab.title}
                                    </span>
                                </div>
                                {openTabs.length > 1 && (
                                    <button
                                        onClick={(e) =>
                                            handleCloseTab(tab.id, e)
                                        }
                                        className="p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-3.5 shrink-0 pl-2">
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
                        className={`px-3 py-1 text-[11px] ${currentTheme.accent} ${currentTheme.accentText} rounded-md font-bold disabled:opacity-40 transition-opacity shrink-0`}
                    >
                        儲存與分析
                    </button>
                )}

                {/* 右上角會員資訊區塊 */}
                {profile ? (
                    // 👈 2. 將外層改為具備點擊功能的按鈕/區域，增加 cursor-pointer 與 hover 效果
                    <div
                        onClick={() => setIsProfileModalOpen(true)}
                        className="flex items-center gap-2 border-l pl-3.5 border-neutral-300/30 text-xs cursor-pointer hover:opacity-80 transition-all group"
                    >
                        <img
                            src={
                                profile.avatar_url ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                            }
                            alt="Avatar"
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-400/30 shrink-0 group-hover:ring-neutral-500"
                        />
                        <div className="flex flex-col max-w-[85px] leading-tight">
                            <span className="font-bold truncate opacity-90 group-hover:underline">
                                {profile.username}
                            </span>
                            <span
                                className={`text-[9px] font-medium ${profile.role === "admin" ? "text-red-500 font-extrabold" : "opacity-50"}`}
                            >
                                {profile.role === "admin"
                                    ? "管理員"
                                    : "普通用戶"}
                            </span>
                        </div>
                        {/* 👈 3. 登出按鈕加上 e.stopPropagation() 防止點擊事件往上冒泡觸發打開彈窗 */}
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
                        className="border-l pl-3.5 border-neutral-300/30 text-xs font-bold hover:opacity-70 flex items-center gap-1.5"
                    >
                        <User size={13} className="opacity-70" />
                        <span>登入/註冊</span>
                    </button>
                )}
            </div>
        </header>
    );
}
