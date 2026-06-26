// 檔案路徑：src/components/workspaces/AiWorkspace.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { Sparkles, Compass, Code, PenTool, Send } from "lucide-react";
import { ThemeConfig, ChatMessage } from "@/types";
import MiniMarkdown from "../MiniMarkdown";

interface AiWorkspaceProps {
    currentTheme: ThemeConfig;
    chatMessages: ChatMessage[];
    chatInput: string;
    setChatInput: (val: string) => void;
    isChatLoading: boolean;
    handleSendChatMessage: (text?: string) => void;
    chatEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function AiWorkspace({
    currentTheme,
    chatMessages,
    chatInput,
    setChatInput,
    isChatLoading,
    handleSendChatMessage,
    chatEndRef,
}: AiWorkspaceProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 文字輸入時自動調整 Textarea 高度
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [chatInput]);

    return (
        <div className="flex-1 flex flex-col overflow-hidden w-full mx-auto bg-transparent">
            {/* 訊息紀錄流 */}
            <div className="flex-1 overflow-y-auto px-6 md:px-0 py-8 space-y-8 w-full">
                {chatMessages.length === 0 ? (
                    /* 歡迎首頁：調用主題的主文字與次要文字變數 */
                    <div className="h-full flex flex-col justify-center items-center text-center px-4 max-w-2xl mx-auto pt-[6vh] w-full">
                        <div className={`w-12 h-12 rounded-2xl ${currentTheme.accent} ${currentTheme.accentText} flex items-center justify-center mb-6 shadow-3xs`}>
                            <Sparkles size={22} />
                        </div>
                        <h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-3 ${currentTheme.text}`}>
                            有什麼我可以幫忙的嗎？
                        </h1>
                        <p className={`text-sm md:text-base font-semibold ${currentTheme.textMuted} mb-10 max-w-md leading-relaxed`}>
                            這是您的專屬 Gemma 4 獨立大腦，與您的筆記環境完全獨立。
                        </p>

                        {/* 快捷引導卡片 (卡片內文完美融入各主題色) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
                            {[
                                {
                                    text: "協助重組零散想法...",
                                    prompt: "請幫我將最近零散的想法重組成一份具備可行性的專案構想書",
                                    icon: Compass
                                },
                                {
                                    text: "代碼深度檢查與重構...",
                                    prompt: "請幫我檢查並重構一段具有潛在邏輯漏洞的非同步前端代碼",
                                    icon: Code
                                },
                                {
                                    text: "撰寫商務推廣郵件...",
                                    prompt: "我想撰寫一篇富有說服力的產品推廣商務郵件草稿",
                                    icon: PenTool
                                }
                            ].map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleSendChatMessage(item.prompt)}
                                        className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-4 rounded-xl hover:opacity-80 cursor-pointer transition-all text-left flex flex-col justify-between h-28 group shadow-3xs`}
                                    >
                                        <p className={`text-xs font-bold ${currentTheme.text} leading-relaxed`}>
                                            {item.text}
                                        </p>
                                        <Icon
                                            size={15}
                                            className={`${currentTheme.textMuted} opacity-80 group-hover:opacity-100 transition-colors self-end`}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* 對話內容區區塊 */
                    <div className="max-w-2xl w-full mx-auto space-y-8 px-4 md:px-0">
                        {chatMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-4 w-full ${msg.role === "user" ? "justify-end" : "justify-start animate-fade-in"}`}
                            >
                                {/* AI 大腦頭像 */}
                                {msg.role === "assistant" && (
                                    <div className={`w-7 h-7 rounded-lg border ${currentTheme.sidebarBorder} ${currentTheme.cardBg} flex items-center justify-center shrink-0 mt-0.5 shadow-3xs`}>
                                        <Sparkles size={13} className={`${currentTheme.text} opacity-80`} />
                                    </div>
                                )}
                                
                                <div
                                    className={`text-sm leading-7 max-w-[88%] ${
                                        msg.role === "user"
                                            ? `${currentTheme.cardBg} border ${currentTheme.sidebarBorder} ${currentTheme.text} rounded-2xl px-4 py-2.5 font-bold shadow-3xs`
                                            : `w-full pt-0.5 ${currentTheme.text} max-w-none`
                                    }`}
                                >
                                    {msg.content === "" && isChatLoading ? (
                                        <div className={`flex items-center gap-2 text-xs ${currentTheme.textMuted} py-1`}>
                                            <Sparkles size={12} className="animate-spin text-amber-500" />
                                            Gemma 4 正在思考...
                                        </div>
                                    ) : (
                                        <MiniMarkdown content={msg.content} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* 底部輸入框區塊 */}
            <div className={`p-4 md:px-0 md:pb-6 md:pt-2 w-full border-t ${currentTheme.sidebarBorder}`}>
                <div className="max-w-2xl w-full mx-auto relative">
                    <div
                        className={`flex flex-col ${currentTheme.chatInputBg} rounded-2xl border ${currentTheme.sidebarBorder} focus-within:opacity-100 transition-all shadow-3xs px-4 py-2.5`}
                    >
                        {/* 輸入框文字顏色優化 */}
                        <textarea
                            ref={textareaRef}
                            rows={1}
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (chatInput.trim() && !isChatLoading) handleSendChatMessage();
                                }
                            }}
                            placeholder="給 Gemma 發送訊息..."
                            className={`w-full bg-transparent border-0 p-0 text-sm focus:ring-0 focus:outline-none resize-none min-h-[24px] max-h-[200px] leading-6 ${currentTheme.text} font-medium placeholder-neutral-400/70`}
                            disabled={isChatLoading}
                        />

                        {/* 發送按鈕 */}
                        <div className="flex items-center justify-end mt-1.5 pt-1">
                            <button
                                onClick={() => handleSendChatMessage()}
                                disabled={!chatInput.trim() || isChatLoading}
                                className={`p-1.5 rounded-xl transition-all ${
                                    chatInput.trim() && !isChatLoading
                                        ? "bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-950 opacity-100 hover:scale-[1.02]"
                                        : "opacity-20 cursor-not-allowed"
                                }`}
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                    <div className={`text-[10px] text-center ${currentTheme.textMuted} mt-2 tracking-wide font-medium opacity-80`}>
                        Gemma 4 可能會產生錯誤資訊，請仔細核對重要內容。
                    </div>
                </div>
            </div>
        </div>
    );
}