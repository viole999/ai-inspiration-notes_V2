// 檔案路徑：src/components/SearchModal.tsx
"use client";

import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { ThemeConfig, Note, BrowserTab } from "@/types";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTheme: ThemeConfig;
    notes: Note[];
    openRightTab: (targetTab: Omit<BrowserTab, "id">) => void;
}

export default function SearchModal({
    isOpen,
    onClose,
    currentTheme,
    notes,
    openRightTab,
}: SearchModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    if (!isOpen) return null;

    const filteredNotes = notes.filter(
        (n) =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center pt-[15vh]">
            <div
                className={`${currentTheme.cardBg} w-full max-w-xl rounded-xl shadow-2xl border ${currentTheme.sidebarBorder} p-2 m-4`}
            >
                <div className="flex items-center gap-3 px-3 py-2.5 border-b border-neutral-200/20">
                    <Search size={16} className={currentTheme.textMuted} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="輸入關鍵字以搜尋本地檔案內容..."
                        className="flex-1 border-0 text-sm focus:ring-0 bg-transparent focus:outline-none"
                        autoFocus
                    />
                    <button onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className="p-2 max-h-60 overflow-y-auto">
                    {filteredNotes.length === 0 ? (
                        <div className="p-4 text-xs text-center opacity-50">
                            查無相符的檔案內容
                        </div>
                    ) : (
                        filteredNotes.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => {
                                    onClose();
                                    openRightTab({
                                        type: "note",
                                        title: n.title || "未命名檔案",
                                        noteId: n.id,
                                    });
                                }}
                                className={`p-2.5 rounded-lg cursor-pointer text-xs font-bold ${currentTheme.cardHover} transition-colors`}
                            >
                                {n.title || "未命名檔案"}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
