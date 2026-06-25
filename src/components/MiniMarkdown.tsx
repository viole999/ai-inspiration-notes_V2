// 檔案路徑：src/components/MiniMarkdown.tsx
"use client";

import React from "react";

export default function MiniMarkdown({ content }: { content: string }) {
    if (!content) return null;
    const lines = content.split("\n");
    return (
        <div className="space-y-1">
            {lines.map((line, i) => {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p key={i} className="min-h-[1.25rem]">
                        {parts.map((part, j) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                                return (
                                    <strong
                                        key={j}
                                        className="font-extrabold mx-0.5"
                                    >
                                        {part.slice(2, -2)}
                                    </strong>
                                );
                            }
                            return part;
                        })}
                    </p>
                );
            })}
        </div>
    );
}
