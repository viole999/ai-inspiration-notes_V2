// 檔案路徑：src/types/index.ts

export interface ThemeConfig {
    id: string;
    name: string;
    bg: string;
    sidebarBg: string;
    sidebarBorder: string;
    text: string;
    textMuted: string;
    cardBg: string;
    cardHover: string;
    accent: string;
    accentText: string;
    chatInputBg: string;
}

export interface Note {
    id: string;
    title: string;
    content: string;
    tags: string[];
    summary: string | null;
    is_favorite: boolean;
    created_at: string;
}

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export interface BrowserTab {
    id: string;
    type: "home" | "ai" | "meeting" | "inbox" | "note";
    title: string;
    noteId?: string;
}

export interface UserProfile {
    id: string;
    username: string;
    avatar_url: string | null;
    role: "user" | "admin";
}

export const THEMES: Record<string, ThemeConfig> = {
    geek: {
        id: "geek",
        name: "簡約極客 (灰)",
        bg: "bg-[#fafafa]",
        sidebarBg: "bg-[#f4f4f4]",
        sidebarBorder: "border-[#e5e5e5]",
        text: "text-neutral-800",
        textMuted: "text-neutral-400",
        cardBg: "bg-white",
        cardHover: "hover:bg-neutral-100",
        accent: "bg-neutral-900",
        accentText: "text-white",
        chatInputBg: "bg-neutral-200/50",
    },
    forest: {
        id: "forest",
        name: "松林幽徑 (綠)",
        bg: "bg-[#f4f7f5]",
        sidebarBg: "bg-[#e7ede9]",
        sidebarBorder: "border-[#d2ded6]",
        text: "text-[#1e3322]",
        textMuted: "text-[#708c75]",
        cardBg: "bg-[#ffffff]",
        cardHover: "hover:bg-[#deede2]",
        accent: "bg-[#2d5234]",
        accentText: "text-white",
        chatInputBg: "bg-[#e2eae4]",
    },
    twilight: {
        id: "twilight",
        name: "暮光沉思 (暖)",
        bg: "bg-[#fcf9f5]",
        sidebarBg: "bg-[#f3ede4]",
        sidebarBorder: "border-[#e4dac9]",
        text: "text-[#433422]",
        textMuted: "text-[#9c8971]",
        cardBg: "bg-white",
        cardHover: "hover:bg-[#eae0d2]",
        accent: "bg-[#614d34]",
        accentText: "text-white",
        chatInputBg: "bg-[#efe6da]",
    },
    dark: {
        id: "dark",
        name: "暗夜星空 (黑)",
        bg: "bg-[#121212]",
        sidebarBg: "bg-[#1e1e1e]",
        sidebarBorder: "border-[#2d2d2d]",
        text: "text-neutral-200",
        textMuted: "text-neutral-500",
        cardBg: "bg-[#1a1a1a]",
        cardHover: "hover:bg-[#262626]",
        accent: "bg-blue-600",
        accentText: "text-white",
        chatInputBg: "bg-[#222222]",
    },
};
