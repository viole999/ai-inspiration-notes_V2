// 檔案路徑：src/app/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
    THEMES,
    ThemeConfig,
    Note,
    ChatMessage,
    BrowserTab,
    UserProfile,
} from "@/types";
import { Mic, MicOff } from "lucide-react";

// 導入拆分後的元件
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";
import SearchModal from "@/components/SearchModal";
import SettingsModal from "@/components/SettingsModal";
import HomeWorkspace from "@/components/workspaces/HomeWorkspace";
import NoteWorkspace from "@/components/workspaces/NoteWorkspace";
import AiWorkspace from "@/components/workspaces/AiWorkspace";
import ProfileModal from "@/components/ProfileModal";

export default function Home() {
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES.geek);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeSidebar, setActiveSidebar] = useState<
        "home" | "ai" | "meeting" | "inbox"
    >("home");
    const [openTabs, setOpenTabs] = useState<BrowserTab[]>([
        { id: "tab-home-default", type: "home", title: "首頁工作台" },
    ]);
    const [activeTabId, setActiveTabId] = useState<string>("tab-home-default");
    const [tabHistory, setTabHistory] = useState<string[]>([
        "tab-home-default",
    ]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    const [inputTitle, setInputTitle] = useState("");
    const [inputContent, setInputContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [analyzingNoteId, setAnalyzingNoteId] = useState<string | null>(null);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isFullWidth, setIsFullWidth] = useState(true);
    const [isListening, setIsListening] = useState(false);

    const [profile, setProfile] = useState<UserProfile | null>(null);

    const isNavigatingRef = useRef(false);
    const recognitionRef = useRef<any>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 💡 監聽螢幕寬度：如果在手機板初始化，預設將側邊欄關閉，避免擋住畫面
    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes();
        initializeSpeechRecognition();

        // 初始化認證監聽器
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) fetchUserProfile(user.id);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) fetchUserProfile(session.user.id);
            else setProfile(null);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const currentTab = openTabs.find((t) => t.id === activeTabId);
        if (!currentTab) return;
        isNavigatingRef.current = true;
        if (currentTab.type === "note" && currentTab.noteId) {
            const foundNote = notes.find((n) => n.id === currentTab.noteId);
            if (foundNote) {
                setSelectedNote(foundNote);
                setInputTitle(foundNote.title || "");
                setInputContent(foundNote.content || "");
            }
        } else {
            setSelectedNote(null);
            setInputTitle("");
            setInputContent("");
        }
        isNavigatingRef.current = false;
    }, [activeTabId, openTabs, notes]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const fetchUserProfile = async (userId: string) => {
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
        if (data) setProfile(data as UserProfile);
    };

    const fetchNotes = async () => {
        const { data } = await supabase
            .from("notes")
            .select("*")
            .order("created_at", { ascending: false });
        if (data) setNotes(data);
    };

    const openRightTab = (targetTab: Omit<BrowserTab, "id">) => {
        let existingTab = openTabs.find(
            (t) =>
                t.type === targetTab.type &&
                (targetTab.type === "note"
                    ? t.noteId === targetTab.noteId
                    : true),
        );
        let finalTabId = existingTab ? existingTab.id : `tab-${Date.now()}`;
        if (!existingTab)
            setOpenTabs((prev) => [...prev, { ...targetTab, id: finalTabId }]);
        setActiveTabId(finalTabId);

        // 💡 手機版用戶點選任何新內容（如打開筆記），自動收起側邊欄以騰出完整看讀空間
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }

        if (!isNavigatingRef.current) {
            const newHistory = tabHistory.slice(0, historyIndex + 1);
            newHistory.push(finalTabId);
            setTabHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }
    };

    const handleGoBack = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setActiveTabId(tabHistory[newIndex]);
        }
    };

    const handleGoForward = () => {
        if (historyIndex < tabHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setActiveTabId(tabHistory[newIndex]);
        }
    };

    const handleCloseTab = (tabIdToClose: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (openTabs.length === 1) return;
        const indexToClose = openTabs.findIndex((t) => t.id === tabIdToClose);
        const updatedTabs = openTabs.filter((t) => t.id !== tabIdToClose);
        setOpenTabs(updatedTabs);
        if (activeTabId === tabIdToClose) {
            setActiveTabId(
                updatedTabs[indexToClose === 0 ? 0 : indexToClose - 1].id,
            );
        }
    };

    const initializeSpeechRecognition = () => {
        if (typeof window !== "undefined") {
            const customWindow = window as any;
            const SpeechRecognition =
                customWindow.webkitSpeechRecognition ||
                customWindow.speechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.lang = "zh-TW";
                recognition.onresult = (event: any) => {
                    let trans = "";
                    for (
                        let i = event.resultIndex;
                        i < event.results.length;
                        ++i
                    ) {
                        if (event.results[i].isFinal)
                            trans += event.results[i][0].transcript;
                    }
                    if (trans) {
                        const currentTab = openTabs.find(
                            (t) => t.id === activeTabId,
                        );
                        if (currentTab?.type === "note")
                            setInputContent((prev) => prev + trans);
                        else setChatInput((prev) => prev + trans);
                    }
                };
                recognition.onend = () => setIsListening(false);
                recognitionRef.current = recognition;
            }
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const handleSaveOrUpdate = async () => {
        if (!inputContent.trim()) return;
        setIsLoading(true);
        const titleToSave =
            inputTitle.trim() || inputContent.substring(0, 10) || "未命名文件";
        const currentTab = openTabs.find((t) => t.id === activeTabId);

        if (currentTab && currentTab.type === "note" && currentTab.noteId) {
            const { error } = await supabase
                .from("notes")
                .update({ title: titleToSave, content: inputContent })
                .eq("id", currentTab.noteId);
            if (!error) {
                setNotes(
                    notes.map((n) =>
                        n.id === currentTab.noteId
                            ? {
                                  ...n,
                                  title: titleToSave,
                                  content: inputContent,
                              }
                            : n,
                    ),
                );
                setOpenTabs((prev) =>
                    prev.map((t) =>
                        t.id === activeTabId ? { ...t, title: titleToSave } : t,
                    ),
                );
                setIsLoading(false);
                triggerAiAnalyze(currentTab.noteId, inputContent);
            }
        } else {
            const { data } = await supabase
                .from("notes")
                .insert([
                    {
                        title: titleToSave,
                        content: inputContent,
                        tags: [],
                        summary: null,
                        is_favorite: false,
                    },
                ])
                .select();
            if (data && data.length > 0) {
                setNotes([data[0], ...notes]);
                setOpenTabs((prev) =>
                    prev.map((t) =>
                        t.id === activeTabId
                            ? { ...t, title: data[0].title, noteId: data[0].id }
                            : t,
                    ),
                );
                setIsLoading(false);
                triggerAiAnalyze(data[0].id, inputContent);
            }
        }
    };

    const triggerAiAnalyze = async (noteId: string, content: string) => {
        setAnalyzingNoteId(noteId);
        try {
            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            });
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullJson = "";
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n");
                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                fullJson += JSON.parse(line.slice(6)).text;
                            } catch (e) {}
                        }
                    }
                }
            }
            const aiResult = JSON.parse(fullJson.trim());
            await supabase
                .from("notes")
                .update({ summary: aiResult.summary, tags: aiResult.tags })
                .eq("id", noteId);
            fetchNotes();
        } catch (e) {
            console.error(e);
        } finally {
            setAnalyzingNoteId(null);
        }
    };

    const handleSendChatMessage = async (textToSend?: string) => {
        const messageContent = textToSend || chatInput;
        if (!messageContent.trim() || isChatLoading) return;

        const newMessages: ChatMessage[] = [
            ...chatMessages,
            { role: "user", content: messageContent },
        ];
        setChatMessages(newMessages);
        setChatInput("");
        setIsChatLoading(true);
        setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: "" },
        ]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = "",
                buffer = "";

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";
                    for (const line of lines) {
                        if (!line.trim() || !line.startsWith("data: "))
                            continue;
                        try {
                            accumulatedText += JSON.parse(line.slice(6)).text;
                            setChatMessages((prev) => {
                                const updated = [...prev];
                                if (updated.length > 0)
                                    updated[updated.length - 1].content =
                                        accumulatedText;
                                return updated;
                            });
                        } catch (e) {}
                    }
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("確定要刪除此文件嗎？")) {
            const { error } = await supabase
                .from("notes")
                .delete()
                .eq("id", id);
            if (!error) {
                setNotes(notes.filter((n) => n.id !== id));
                const targetTab = openTabs.find((t) => t.noteId === id);
                if (targetTab) handleCloseTab(targetTab.id, e);
            }
        }
    };

    const handleSignOut = async () => {
        if (confirm("確定要登出系統嗎？")) {
            await supabase.auth.signOut();
            setProfile(null);
        }
    };

    const currentTab =
        openTabs.find((t) => t.id === activeTabId) || openTabs[0];
    const activeNoteData =
        currentTab.type === "note"
            ? notes.find((n) => n.id === currentTab.noteId) || null
            : null;

    return (
        // 💡 修正點：加上 relative 與 overflow-hidden 避免手機版發生奇怪的左右晃動滑動破版
        <div
            className={`min-h-screen w-full flex ${currentTheme.bg} ${currentTheme.text} antialiased transition-colors duration-300 relative overflow-hidden`}
        >
            {/* 💡 手機版限定遮罩層：當手機版側邊欄被打開時，背景會變黑，點擊即關閉側邊欄 */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-30 md:hidden animate-fade-in transition-opacity"
                />
            )}

            {/* 導覽列 */}
            <Sidebar
                currentTheme={currentTheme}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                activeSidebar={activeSidebar}
                setActiveSidebar={setActiveSidebar}
                notes={notes}
                currentTab={currentTab}
                openRightTab={openRightTab}
                handleDeleteNote={handleDeleteNote}
                setIsSettingsOpen={setIsSettingsOpen}
                setIsSearchOpen={setIsSearchOpen}
                handleSendChatMessage={handleSendChatMessage}
            />

            {/* 工作大區 */}
            {/* 💡 修正點：加上 h-screen flex-col overflow-hidden，確保內部 Workspace 元件可以完美計算高度而不溢出螢幕外 */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
                <Header
                    currentTheme={currentTheme}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    openTabs={openTabs}
                    activeTabId={activeTabId}
                    setActiveTabId={setActiveTabId}
                    historyIndex={historyIndex}
                    tabHistory={tabHistory}
                    handleGoBack={handleGoBack}
                    handleGoForward={handleGoForward}
                    handleCloseTab={handleCloseTab}
                    handleSaveOrUpdate={handleSaveOrUpdate}
                    inputContent={inputContent}
                    isLoading={isLoading}
                    analyzingNoteId={analyzingNoteId}
                    currentTab={currentTab}
                    profile={profile}
                    handleSignOut={handleSignOut}
                    setIsAuthModalOpen={setIsAuthModalOpen}
                    setIsProfileModalOpen={setIsProfileModalOpen}
                />

                {/* 依據當前分頁渲染對應的 Workspace 分頁區 */}
                {/* 💡 修正點：外層包覆一個 flex-1 overflow-y-auto 的容器，確保手機版內容可以流暢滾動且不破版 */}
                <div className="flex-1 min-h-0 w-full overflow-y-auto">
                    {currentTab.type === "home" && (
                        <HomeWorkspace
                            currentTheme={currentTheme}
                            notes={notes}
                            openRightTab={openRightTab}
                        />
                    )}

                    {currentTab.type === "note" && (
                        <NoteWorkspace
                            currentTheme={currentTheme}
                            isFullWidth={isFullWidth}
                            inputTitle={inputTitle}
                            setInputTitle={setInputTitle}
                            inputContent={inputContent}
                            setInputContent={setInputContent}
                            activeNoteData={activeNoteData}
                            currentTab={currentTab}
                            analyzingNoteId={analyzingNoteId}
                        />
                    )}

                    {currentTab.type === "ai" && (
                        <AiWorkspace
                            currentTheme={currentTheme}
                            chatMessages={chatMessages}
                            chatInput={chatInput}
                            setChatInput={setChatInput}
                            isChatLoading={isChatLoading}
                            handleSendChatMessage={handleSendChatMessage}
                            chatEndRef={chatEndRef}
                        />
                    )}
                </div>

                {/* 語音按鈕 */}
                <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
                    {isListening && (
                        <span className="text-[11px] bg-red-500 text-white font-bold px-3 py-1.5 rounded-full animate-pulse shadow-md">
                            即時語音辨識中...
                        </span>
                    )}
                    <button
                        onClick={toggleListening}
                        className={`w-12 h-12 rounded-full border ${currentTheme.cardBg} ${currentTheme.sidebarBorder} flex items-center justify-center shadow-md hover:scale-105 transition-transform`}
                    >
                        {isListening ? (
                            <MicOff size={18} className="text-red-500" />
                        ) : (
                            <Mic size={18} />
                        )}
                    </button>
                </div>
            </div>

            {/* 全域浮層彈窗組件組 */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                currentTheme={currentTheme}
            />
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                currentTheme={currentTheme}
                notes={notes}
                openRightTab={openRightTab}
            />
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
                isFullWidth={isFullWidth}
                setIsFullWidth={setIsFullWidth}
            />

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                currentTheme={currentTheme}
                profile={profile}
                onProfileUpdate={fetchUserProfile}
            />
        </div>
    );
}