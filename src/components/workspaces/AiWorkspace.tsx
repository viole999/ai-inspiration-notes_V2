// 檔案路徑：src/components/workspaces/AiWorkspace.tsx
"use client";

import React from "react";
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
    return (
        <div className="flex-1 flex flex-col overflow-hidden w-full mx-auto">
            <div className="flex-1 overflow-y-auto px-6 md:px-16 py-8 space-y-6 w-full">
                {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-start pt-[4vh] w-full max-w-5xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-neutral-500 via-neutral-800 to-neutral-900 bg-clip-text text-transparent">
                            哈囉，我是 Gemma 4 獨立對話大腦
                        </h1>
                        <p
                            className={`text-lg md:text-xl font-medium ${currentTheme.textMuted} mb-12`}
                        >
                            這是一個與筆記環境完全獨立的對話空間。
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                            <div
                                onClick={() =>
                                    handleSendChatMessage(
                                        "請幫我將最近零散的想法重組成一份具備可行性的專案構想書",
                                    )
                                }
                                className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-5 rounded-2xl hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between h-32 group`}
                            >
                                <p className="text-xs font-semibold leading-relaxed">
                                    協助重組零散想法...
                                </p>
                                <Compass
                                    size={16}
                                    className={`${currentTheme.textMuted} group-hover:text-neutral-800 transition-colors self-end`}
                                />
                            </div>
                            <div
                                onClick={() =>
                                    handleSendChatMessage(
                                        "請幫我檢查並重構一段具有潛在邏輯漏洞的非同步前端代碼",
                                    )
                                }
                                className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-5 rounded-2xl hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between h-32 group`}
                            >
                                <p className="text-xs font-semibold leading-relaxed">
                                    代碼深度檢查與重構...
                                </p>
                                <Code
                                    size={16}
                                    className={`${currentTheme.textMuted} group-hover:text-neutral-800 transition-colors self-end`}
                                />
                            </div>
                            <div
                                onClick={() =>
                                    handleSendChatMessage(
                                        "我想撰寫一篇富有說服力的產品推廣商務郵件草稿",
                                    )
                                }
                                className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-5 rounded-2xl hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between h-32 group`}
                            >
                                <p className="text-xs font-semibold leading-relaxed">
                                    撰寫商務推廣郵件...
                                </p>
                                <PenTool
                                    size={16}
                                    className={`${currentTheme.textMuted} group-hover:text-neutral-800 transition-colors self-end`}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-5xl w-full mx-auto space-y-6">
                        {chatMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "assistant" && (
                                    <div
                                        className={`w-8 h-8 rounded-xl ${currentTheme.accent} ${currentTheme.accentText} flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs`}
                                    >
                                        腦
                                    </div>
                                )}
                                <div
                                    className={`rounded-2xl px-5 py-3 text-sm leading-relaxed max-w-[85%] ${
                                        msg.role === "user"
                                            ? `${currentTheme.cardBg} border ${currentTheme.sidebarBorder} font-medium shadow-3xs`
                                            : "opacity-95"
                                    }`}
                                >
                                    {msg.content === "" && isChatLoading ? (
                                        <span className="flex items-center gap-2 text-xs opacity-60">
                                            <Sparkles
                                                size={12}
                                                className="animate-spin"
                                            />{" "}
                                            Gemma 4 正在思考...
                                        </span>
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

            <div
                className={`p-6 md:px-16 border-t ${currentTheme.sidebarBorder}`}
            >
                <div className="max-w-5xl w-full mx-auto relative">
                    <div
                        className={`flex items-center ${currentTheme.chatInputBg} rounded-2xl px-5 py-3.5 border border-transparent focus-within:border-neutral-400 focus-within:bg-transparent transition-all`}
                    >
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSendChatMessage();
                            }}
                            placeholder="在此輸入您的問題，向 Gemma 4 提出任何疑問..."
                            className="flex-1 bg-transparent border-0 p-0 text-sm focus:ring-0 focus:outline-none placeholder-neutral-400"
                            disabled={isChatLoading}
                        />
                        <button
                            onClick={() => handleSendChatMessage()}
                            disabled={!chatInput.trim() || isChatLoading}
                            className={`p-1.5 rounded-xl ${currentTheme.text} opacity-60 hover:opacity-100 disabled:opacity-20 transition-all`}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
