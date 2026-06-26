// 檔案路徑：src/components/MiniMarkdown.tsx
"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { ThemeConfig } from "@/types";

interface MiniMarkdownProps {
    content: string;
    currentTheme?: ThemeConfig; // 💡 傳入目前的主題配置
}

function CopyButton({ code }: { code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("複製失敗", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition-colors bg-neutral-800 px-2 py-1 rounded border border-neutral-700/60"
        >
            {copied ? (
                <>
                    <Check className="text-emerald-400" size={12} />
                    <span className="text-emerald-400">已複製!</span>
                </>
            ) : (
                <><Copy size={12} /><span>複製代碼</span></>
            )}
        </button>
    );
}

export default function MiniMarkdown({ content, currentTheme }: MiniMarkdownProps) {
    if (!content) return null;

    // 💡 如果呼叫端忘了傳，就 fallback 回安全的繼承色，絕對不綁死特定黑白色系
    const textClass = currentTheme?.text || "text-inherit";

    return (
        <div className={`markdown-body w-full ${textClass}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const rawCode = String(children).replace(/\n$/, "");
                        const lang = match ? match[1] : "";

                        if (!inline && match) {
                            return (
                                <div className="my-4 overflow-hidden rounded-xl border border-neutral-200/20 dark:border-neutral-700/30 shadow-3xs">
                                    <div className="flex items-center justify-between px-4 py-2 bg-neutral-950 border-b border-neutral-900 text-neutral-400 select-none">
                                        <span className="text-xs font-mono font-medium tracking-wide uppercase">
                                            {lang}
                                        </span>
                                        <CopyButton code={rawCode} />
                                    </div>
                                    <SyntaxHighlighter
                                        language={lang}
                                        style={oneDark}
                                        PreTag="div"
                                        customStyle={{
                                            margin: 0,
                                            padding: "1rem",
                                            fontSize: "0.85rem",
                                            lineHeight: "1.6",
                                            background: "#161616",
                                        }}
                                        {...props}
                                    >
                                        {rawCode}
                                    </SyntaxHighlighter>
                                </div>
                            );
                        }

                        return (
                            <code
                                className="px-1.5 py-0.5 rounded-md font-mono text-xs bg-neutral-400/10 text-red-500 dark:text-rose-400 border border-neutral-400/20 font-semibold"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    // 💡 所有標籤全面移除非黑即白的樣式，改用帶有 opacity 的 textClass
                    p: ({ children }: any) => <p className="mb-3.5 leading-7 text-sm md:text-[14.5px] opacity-95 last:mb-0">{children}</p>,
                    h1: ({ children }: any) => <h1 className={`text-2xl font-black tracking-tight mt-6 mb-3 ${textClass}`}>{children}</h1>,
                    h2: ({ children }: any) => <h2 className={`text-xl font-bold tracking-tight mt-5 mb-2.5 ${textClass}`}>{children}</h2>,
                    h3: ({ children }: any) => <h3 className={`text-lg font-bold tracking-tight mt-4 mb-2 ${textClass}`}>{children}</h3>,
                    ul: ({ children }: any) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-sm opacity-95">{children}</ul>,
                    ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-sm opacity-95">{children}</ol>,
                    li: ({ children }: any) => <li className="leading-6">{children}</li>,
                    blockquote: ({ children }: any) => (
                        <blockquote className="border-l-4 border-neutral-400/40 pl-4 py-0.5 my-4 italic opacity-80">
                            {children}
                        </blockquote>
                    ),
                    table: ({ children }: any) => (
                        <div className="w-full overflow-x-auto my-4 border border-neutral-400/20 rounded-xl shadow-3xs">
                            <table className="w-full text-left border-collapse text-xs md:text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }: any) => <thead className="bg-neutral-400/5 border-b border-neutral-400/20 font-bold">{children}</thead>,
                    tbody: ({ children }: any) => <tbody className="divide-y divide-neutral-400/10">{children}</tbody>,
                    tr: ({ children }: any) => <tr className="hover:bg-neutral-400/5 transition-colors">{children}</tr>,
                    th: ({ children }: any) => <th className={`p-3 font-semibold ${textClass}`}>{children}</th>,
                    td: ({ children }: any) => <td className="p-3 opacity-90 leading-relaxed">{children}</td>,
                    a: ({ href, children }: any) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:opacity-80 transition-opacity">{children}</a>,
                    strong: ({ children }: any) => <strong className={`font-bold mx-0.5 ${textClass}`}>{children}</strong>,
                    hr: () => <hr className="my-6 border-neutral-400/10" />
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}