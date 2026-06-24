// 檔案路徑：src/app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Mic, MicOff, Sparkles, Trash2, ChevronLeft, ChevronRight, 
  FileText, Settings, Search, Plus, X, Send, Compass, Code, 
  PenTool, Palette, Home as HomeIcon, MessageSquare, Video, Inbox,
  ArrowLeft, ArrowRight
} from 'lucide-react';

interface ThemeConfig {
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

const THEMES: Record<string, ThemeConfig> = {
  geek: {
    id: 'geek',
    name: '簡約極客 (灰)',
    bg: 'bg-[#fafafa]',
    sidebarBg: 'bg-[#f4f4f4]',
    sidebarBorder: 'border-[#e5e5e5]',
    text: 'text-neutral-800',
    textMuted: 'text-neutral-400',
    cardBg: 'bg-white',
    cardHover: 'hover:bg-neutral-100',
    accent: 'bg-neutral-900',
    accentText: 'text-white',
    chatInputBg: 'bg-neutral-200/50'
  },
  forest: {
    id: 'forest',
    name: '松林幽徑 (綠)',
    bg: 'bg-[#f4f7f5]',
    sidebarBg: 'bg-[#e7ede9]',
    sidebarBorder: 'border-[#d2ded6]',
    text: 'text-[#1e3322]',
    textMuted: 'text-[#708c75]',
    cardBg: 'bg-[#ffffff]',
    cardHover: 'hover:bg-[#deede2]',
    accent: 'bg-[#2d5234]',
    accentText: 'text-white',
    chatInputBg: 'bg-[#e2eae4]'
  },
  twilight: {
    id: 'twilight',
    name: '暮光沉思 (暖)',
    bg: 'bg-[#fcf9f5]',
    sidebarBg: 'bg-[#f3ede4]',
    sidebarBorder: 'border-[#e4dac9]',
    text: 'text-[#433422]',
    textMuted: 'text-[#9c8971]',
    cardBg: 'bg-white',
    cardHover: 'hover:bg-[#eae0d2]',
    accent: 'bg-[#614d34]',
    accentText: 'text-white',
    chatInputBg: 'bg-[#efe6da]'
  },
  dark: {
    id: 'dark',
    name: '暗夜星空 (黑)',
    bg: 'bg-[#121212]',
    sidebarBg: 'bg-[#1e1e1e]',
    sidebarBorder: 'border-[#2d2d2d]',
    text: 'text-neutral-200',
    textMuted: 'text-neutral-500',
    cardBg: 'bg-[#1a1a1a]',
    cardHover: 'hover:bg-[#262626]',
    accent: 'bg-blue-600',
    accentText: 'text-white',
    chatInputBg: 'bg-[#222222]'
  }
};

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  summary: string | null;
  is_favorite: boolean;
  created_at: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface BrowserTab {
  id: string;          
  type: 'home' | 'ai' | 'meeting' | 'inbox' | 'note';
  title: string;
  noteId?: string;     
}

function MiniMarkdown({ content }: { content: string }) {
  if (!content) return null;
  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={i} className="min-h-[1.25rem]">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-extrabold mx-0.5">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES.geek);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 控制左側欄切換狀態
  const [activeSidebar, setActiveSidebar] = useState<'home' | 'ai' | 'meeting' | 'inbox'>('home');

  // 右側大工作區瀏覽器分頁狀態
  const [openTabs, setOpenTabs] = useState<BrowserTab[]>([
    { id: 'tab-home-default', type: 'home', title: '首頁工作台' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-home-default');
  
  // 上一頁/下一頁歷史紀錄
  const [tabHistory, setTabHistory] = useState<string[]>(['tab-home-default']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const isNavigatingRef = useRef(false);

  // 內容與對話狀態
  const [inputTitle, setInputTitle] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 💡 用於追蹤當前哪份筆記正在接受大模型提煉分析，讓提示框能一時間瞬發出現
  const [analyzingNoteId, setAnalyzingNoteId] = useState<string | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullWidth, setIsFullWidth] = useState(true);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotes();
    initializeSpeechRecognition();
  }, []);

  // 當切換右側分頁時，如果開啟的是筆記，同步將該筆記的內容填入編輯器中
  useEffect(() => {
    const currentTab = openTabs.find(t => t.id === activeTabId);
    if (!currentTab) return;

    isNavigatingRef.current = true;
    if (currentTab.type === 'note' && currentTab.noteId) {
      const foundNote = notes.find(n => n.id === currentTab.noteId);
      if (foundNote) {
        setSelectedNote(foundNote);
        setInputTitle(foundNote.title || '');
        setInputContent(foundNote.content || '');
      } else {
        // 如果是新建立還沒存檔的空白分頁
        setSelectedNote(null);
        setInputTitle(currentTab.title === '未命名檔案' ? '' : currentTab.title);
        setInputContent('');
      }
    } else {
      setSelectedNote(null);
      setInputTitle('');
      setInputContent('');
    }
    isNavigatingRef.current = false;
  }, [activeTabId, openTabs, notes]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // 開啟或切換至右側大工作區分頁
  const openRightTab = (targetTab: Omit<BrowserTab, 'id'>) => {
    let existingTab = openTabs.find(t => 
      t.type === targetTab.type && 
      (targetTab.type === 'note' ? t.noteId === targetTab.noteId : true)
    );

    let finalTabId = '';
    if (existingTab) {
      finalTabId = existingTab.id;
    } else {
      const newId = `tab-${Date.now()}`;
      setOpenTabs(prev => [...prev, { ...targetTab, id: newId }]);
      finalTabId = newId;
    }

    setActiveTabId(finalTabId);

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
      const targetTabId = tabHistory[newIndex];
      if (openTabs.some(t => t.id === targetTabId)) {
        setActiveTabId(targetTabId);
      }
    }
  };

  const handleGoForward = () => {
    if (historyIndex < tabHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const targetTabId = tabHistory[newIndex];
      if (openTabs.some(t => t.id === targetTabId)) {
        setActiveTabId(targetTabId);
      }
    }
  };

  const handleCloseTab = (tabIdToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (openTabs.length === 1) return; 

    const indexToClose = openTabs.findIndex(t => t.id === tabIdToClose);
    const updatedTabs = openTabs.filter(t => t.id !== tabIdToClose);
    setOpenTabs(updatedTabs);

    if (activeTabId === tabIdToClose) {
      const nextActiveIndex = indexToClose === 0 ? 0 : indexToClose - 1;
      setActiveTabId(updatedTabs[nextActiveIndex].id);
    }
  };

  const initializeSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const customWindow = window as any;
      const SpeechRecognition = customWindow.webkitSpeechRecognition || customWindow.speechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'zh-TW';

        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          }
          if (finalTranscript) {
            const currentTab = openTabs.find(t => t.id === activeTabId);
            if (currentTab?.type === 'note') {
              setInputContent((prev) => prev + finalTranscript);
            } else {
              setChatInput((prev) => prev + finalTranscript);
            }
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

  const fetchNotes = async () => {
    const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
    if (data) setNotes(data);
  };

  const handleSaveOrUpdate = async () => {
    if (!inputContent.trim()) return;
    setIsLoading(true);
    const titleToSave = inputTitle.trim() || inputContent.substring(0, 10) || '未命名文件';

    const currentTab = openTabs.find(t => t.id === activeTabId);

    if (currentTab && currentTab.type === 'note' && currentTab.noteId) {
      // 更新現有檔案
      const { error } = await supabase.from('notes').update({ title: titleToSave, content: inputContent }).eq('id', currentTab.noteId);
      if (!error) {
        setNotes(notes.map(n => n.id === currentTab.noteId ? { ...n, title: titleToSave, content: inputContent } : n));
        setOpenTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, title: titleToSave } : t));
        setIsLoading(false);
        // 進入大模型分析
        triggerAiAnalyze(currentTab.noteId, inputContent);
      } else {
        setIsLoading(false);
      }
    } else {
      // 建立全新檔案
      const { data } = await supabase.from('notes').insert([{ title: titleToSave, content: inputContent, tags: [], summary: null, is_favorite: false }]).select();
      if (data && data.length > 0) {
        setNotes([data[0], ...notes]);
        setIsLoading(false);
        // 將當前的全新空白分頁物件更新綁定 noteId
        setOpenTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, title: data[0].title, noteId: data[0].id } : t));
        // 進入大模型分析
        triggerAiAnalyze(data[0].id, inputContent);
      } else {
        setIsLoading(false);
      }
    }
  };

  const triggerAiAnalyze = async (noteId: string, content: string) => {
    // 💡 瞬發機制：一進入函式立刻標記此 noteId 正在分析，迫使 UI 提示框直接渲染
    setAnalyzingNoteId(noteId);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullJsonString = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                fullJsonString += JSON.parse(line.slice(6)).text;
              } catch (e) {}
            }
          }
        }
      }
      const aiResult = JSON.parse(fullJsonString.trim());
      await supabase.from('notes').update({ summary: aiResult.summary, tags: aiResult.tags }).eq('id', noteId);
      await fetchNotes();
    } catch (e) {
      console.error('AI 摘要分析失敗:', e);
    } finally {
      // 💡 分析結束，不論成功或失敗皆卸載分析狀態
      setAnalyzingNoteId(null);
    }
  };

  const handleSendChatMessage = async (textToSend?: string) => {
    const messageContent = textToSend || chatInput;
    if (!messageContent.trim() || isChatLoading) return;

    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: messageContent }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);

    setChatMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim() || !line.startsWith('data: ')) continue;
            try {
              const jsonData = JSON.parse(line.slice(6));
              if (jsonData && jsonData.text) {
                accumulatedText += jsonData.text;
                setChatMessages(prev => {
                  const updated = [...prev];
                  if (updated.length > 0) updated[updated.length - 1].content = accumulatedText;
                  return updated;
                });
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error('對話連線發生錯誤:', error);
    } finally { 
      setIsChatLoading(false);
    }
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('確定要刪除此文件嗎？')) {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (!error) {
        setNotes(notes.filter(n => n.id !== id));
        const targetTab = openTabs.find(t => t.noteId === id);
        if (targetTab) handleCloseTab(targetTab.id, e);
      }
    }
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()));
  const currentTab = openTabs.find(t => t.id === activeTabId) || openTabs[0];

  // 找出當前右側開啟的 Note 完整物件資料
  const activeNoteData = currentTab.type === 'note' ? notes.find(n => n.id === currentTab.noteId) : null;

  return (
    <div className={`min-h-screen flex ${currentTheme.bg} ${currentTheme.text} antialiased transition-colors duration-300`}>
      
      {/* ========================================== */}
      {/* 1. 左側導覽列 */}
      {/* ========================================== */}
      <aside className={`${currentTheme.sidebarBg} ${currentTheme.sidebarBorder} border-r flex flex-col transition-all duration-300 z-40 fixed md:static inset-y-0 left-0 ${
        isSidebarOpen ? 'w-[260px]' : 'w-0 overflow-hidden'
      }`}>
        <div className="p-4 flex items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-lg ${currentTheme.accent} ${currentTheme.accentText} flex items-center justify-center font-bold text-xs`}>
              智
            </div>
            <span className="text-sm font-bold tracking-wide">個人 AI 靈感空間</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className={`p-1 rounded-md ${currentTheme.cardHover} transition-colors`}>
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* 頂部圖示分頁導選單 */}
        <div className="px-4 pb-4 pt-1 flex items-center justify-between gap-1 border-b border-neutral-200/20">
          <button
            onClick={() => setActiveSidebar('home')}
            className={`group relative flex items-center justify-center p-2 rounded-xl transition-all flex-1 ${
              activeSidebar === 'home' ? `${currentTheme.accent} ${currentTheme.accentText} shadow-xs` : 'hover:bg-black/5 text-neutral-500'
            }`}
          >
            <HomeIcon size={16} />
            <span className="absolute left-1/2 -translate-x-1/2 top-9 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-sm">首頁</span>
          </button>

          <button
            onClick={() => setActiveSidebar('ai')}
            className={`group relative flex items-center justify-center p-2 rounded-xl transition-all flex-1 ${
              activeSidebar === 'ai' ? `${currentTheme.accent} ${currentTheme.accentText} shadow-xs` : 'hover:bg-black/5 text-neutral-500'
            }`}
          >
            <MessageSquare size={16} />
            <span className="absolute left-1/2 -translate-x-1/2 top-9 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-sm">對話</span>
          </button>

          <button
            onClick={() => setActiveSidebar('meeting')}
            className={`group relative flex items-center justify-center p-2 rounded-xl transition-all flex-1 ${
              activeSidebar === 'meeting' ? `${currentTheme.accent} ${currentTheme.accentText} shadow-xs` : 'hover:bg-black/5 text-neutral-500'
            }`}
          >
            <Video size={16} />
            <span className="absolute left-1/2 -translate-x-1/2 top-9 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-sm">會議</span>
          </button>

          <button
            onClick={() => setActiveSidebar('inbox')}
            className={`group relative flex items-center justify-center p-2 rounded-xl transition-all flex-1 ${
              activeSidebar === 'inbox' ? `${currentTheme.accent} ${currentTheme.accentText} shadow-xs` : 'hover:bg-black/5 text-neutral-500'
            }`}
          >
            <Inbox size={16} />
            <span className="absolute left-1/2 -translate-x-1/2 top-9 bg-neutral-900 text-white text-[10px] px-2 py-0.5 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-sm">收件匣</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="group relative flex items-center justify-center p-2 rounded-xl text-neutral-500 hover:bg-black/5 transition-all flex-1"
          >
            <Search size={16} />
          </button>
        </div>

        <div className="px-3 py-2 space-y-[4px] border-b border-neutral-200/20 pb-2">
          <button onClick={() => setIsSettingsOpen(true)} className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg ${currentTheme.cardHover} text-left transition-colors`}>
            <Palette size={14} className={currentTheme.textMuted} />
            <span>主題與介面切換</span>
          </button>
        </div>

        {/* 依據功能選單切換左側內容 */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          
          {/* A 面板：首頁工作台選單 */}
          {activeSidebar === 'home' && (
            <div className="space-y-4 pt-1">
              <div>
                <div className={`text-[10px] font-bold ${currentTheme.textMuted} px-3 py-1 uppercase tracking-wider`}>會議</div>
                <div className="mt-1 px-3 py-1.5 text-xs opacity-50 italic">暫無今日會議安排</div>
              </div>

              <div>
                <div className={`text-[10px] font-bold ${currentTheme.textMuted} px-3 py-1 uppercase tracking-wider`}>私人本地檔案</div>
                <div className="mt-1">
                  <button 
                    onClick={() => { openRightTab({ type: 'home', title: '首頁工作台' }); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-black/5 text-left font-medium mb-1"
                  >
                    <HomeIcon size={14} className={currentTheme.textMuted} /> <span>返回首頁儀表板</span>
                  </button>
                  <button 
                    onClick={() => { openRightTab({ type: 'note', title: '未命名檔案' }); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-black/5 text-left font-medium mb-2 border border-dashed border-neutral-300/50"
                  >
                    <Plus size={14} /> <span>建立全新空白筆記</span>
                  </button>

                  <div className="space-y-[2px]">
                    {notes.map((note) => {
                      const isSelected = currentTab.type === 'note' && currentTab.noteId === note.id;
                      return (
                        <div
                          key={note.id}
                          onClick={() => openRightTab({ type: 'note', title: note.title || '未命名檔案', noteId: note.id })}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer group transition-colors ${
                            isSelected ? `${currentTheme.accent} ${currentTheme.accentText} font-bold shadow-3xs` : `hover:bg-black/5`
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate pr-2">
                            <FileText size={14} className={isSelected ? 'text-white' : currentTheme.textMuted} />
                            <span className="truncate">{note.title || '未命名檔案'}</span>
                          </div>
                          <button onClick={(e) => handleDeleteNote(note.id, e)} className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md text-red-500 hover:bg-red-50">
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

          {/* B 面板：Notion AI 對話選單 */}
          {activeSidebar === 'ai' && (
            <div className="space-y-4 pt-1">
              <div>
                <div className={`text-[10px] font-bold ${currentTheme.textMuted} px-3 py-1 uppercase tracking-wider`}>Notion AI</div>
                <button 
                  onClick={() => openRightTab({ type: 'ai', title: 'AI 對話大腦' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-black/5 hover:bg-black/10 text-xs text-left font-bold mt-1 shadow-3xs"
                >
                  <div className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-[10px]">AI</div>
                  <span>Gemma 4 對話大腦</span>
                </button>
              </div>

              <div>
                <div className={`text-[10px] font-bold ${currentTheme.textMuted} px-3 py-1 uppercase tracking-wider`}>今天快捷發問</div>
                <div className="mt-1 space-y-[2px]">
                  <div onClick={() => { openRightTab({ type: 'ai', title: 'AI 對話大腦' }); handleSendChatMessage('我能做什麼'); }} className="px-3 py-2 rounded-lg text-xs hover:bg-black/5 cursor-pointer truncate flex items-center gap-2 text-neutral-600"><MessageSquare size={13} /> 我能做什麼</div>
                  <div onClick={() => { openRightTab({ type: 'ai', title: 'AI 對話大腦' }); handleSendChatMessage('工作空間內容總結'); }} className="px-3 py-2 rounded-lg text-xs hover:bg-black/5 cursor-pointer truncate flex items-center gap-2 text-neutral-600"><MessageSquare size={13} /> 工作空間內容總結</div>
                </div>
              </div>
            </div>
          )}

          {/* C 面板：會議選單 */}
          {activeSidebar === 'meeting' && (
            <div className="space-y-4 pt-1">
              <div>
                <div className={`text-[10px] font-bold ${currentTheme.textMuted} px-3 py-1 uppercase tracking-wider`}>即將到來</div>
                <div className="px-3 py-2 space-y-2 opacity-40">
                  <div className="h-2 w-32 bg-neutral-400 rounded" />
                  <div className="h-2 w-24 bg-neutral-400 rounded" />
                </div>
              </div>
              <div>
                <div className={`text-[10px] font-bold ${currentTheme.textMuted} px-3 py-1 uppercase tracking-wider`}>今天</div>
                <button 
                  onClick={() => openRightTab({ type: 'meeting', title: '會議簡報室' })}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-black/5 text-left font-medium text-neutral-600"
                >
                  <Mic size={14} /> <span>新增 AI 會議記錄</span>
                </button>
              </div>
            </div>
          )}

          {/* D 面板：收件匣選單 */}
          {activeSidebar === 'inbox' && (
            <div className="flex flex-col items-center justify-center pt-12 text-center px-4">
              <div className="w-8 h-8 rounded-full border border-neutral-400/40 flex items-center justify-center text-neutral-400 mb-2 text-sm">✓</div>
              <p className="text-xs font-bold opacity-80">都看完啦！</p>
              <button onClick={() => openRightTab({ type: 'inbox', title: '收件摘要匣' })} className="mt-3 px-3 py-1 bg-black/5 hover:bg-black/10 text-[10px] font-bold rounded-md transition-colors">編輯篩選條件</button>
            </div>
          )}

        </div>
      </aside>

      {/* ========================================== */}
      {/* 2. 右側主要大工作區 */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative">
        
        {/* 瀏覽器方塊分頁列 UI */}
        <header className={`h-11 border-b ${currentTheme.sidebarBorder} flex items-center justify-between sticky top-0 ${currentTheme.sidebarBg} z-20 select-none overflow-hidden pr-4`}>
          <div className="flex items-center flex-1 h-full overflow-hidden">
            
            {/* 歷史導覽 */}
            <div className="flex items-center gap-1 px-3 border-r border-neutral-200/20 h-full shrink-0">
              {!isSidebarOpen && (
                <button onClick={() => setIsSidebarOpen(true)} className={`p-1 rounded-md ${currentTheme.cardHover} mr-1`}>
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

            {/* 方塊分頁列 */}
            <div className="flex items-end h-full flex-1 overflow-x-auto no-scrollbar">
              {openTabs.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`group flex items-center justify-between h-full px-4 text-xs font-medium cursor-pointer border-r ${currentTheme.sidebarBorder} transition-all min-w-[125px] max-w-[180px] flex-1 ${
                      isActive 
                        ? `${currentTheme.bg} border-b-2 border-b-neutral-800 font-bold text-neutral-900` 
                        : 'text-neutral-500 bg-black/5 hover:bg-black/10'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1">
                      {tab.type === 'home' && <HomeIcon size={13} className="opacity-70" />}
                      {tab.type === 'ai' && <MessageSquare size={13} className="opacity-70" />}
                      {tab.type === 'meeting' && <Video size={13} className="opacity-70" />}
                      {tab.type === 'inbox' && <Inbox size={13} className="opacity-70" />}
                      {tab.type === 'note' && <FileText size={13} className="opacity-70" />}
                      <span className="truncate">{tab.title}</span>
                    </div>
                    {openTabs.length > 1 && (
                      <button
                        onClick={(e) => handleCloseTab(tab.id, e)}
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

          {currentTab.type === 'note' && (
            <button 
              onClick={handleSaveOrUpdate} 
              disabled={!inputContent.trim() || isLoading || (currentTab.noteId ? analyzingNoteId === currentTab.noteId : false)} 
              className={`px-3 py-1 text-[11px] ${currentTheme.accent} ${currentTheme.accentText} rounded-md font-bold disabled:opacity-40 transition-opacity shrink-0`}
            >
              儲存與分析
            </button>
          )}
        </header>

        {/* 模式：首頁工作台 */}
        {currentTab.type === 'home' && (
          <div className="flex-1 overflow-y-auto px-6 md:px-16 py-12 max-w-5xl w-full mx-auto space-y-10">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-2">歡迎來到您的 AI 靈感空間</h1>
              <p className={`${currentTheme.textMuted} text-sm`}>從這裡開始，自由開啟對話大腦或開始撰寫您的本地檔案。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => openRightTab({ type: 'ai', title: 'AI 對話大腦' })}
                className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-6 rounded-2xl hover:shadow-xs cursor-pointer transition-all space-y-2`}
              >
                <div className={`w-8 h-8 rounded-lg ${currentTheme.accent} ${currentTheme.accentText} flex items-center justify-center`}><MessageSquare size={16} /></div>
                <h3 className="font-bold text-sm pt-2">開啟獨立 AI 對話</h3>
                <p className={`${currentTheme.textMuted} text-xs leading-relaxed`}>與 Gemma 4 進行純淨、不干擾筆記結構的即時深度對話、程式重構或腦力激盪。</p>
              </div>

              <div 
                onClick={() => { openRightTab({ type: 'note', title: '未命名檔案' }); }}
                className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-6 rounded-2xl hover:shadow-xs cursor-pointer transition-all space-y-2`}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center"><Plus size={16} /></div>
                <h3 className="font-bold text-sm pt-2">建立全新本地檔案</h3>
                <p className={`${currentTheme.textMuted} text-xs leading-relaxed`}>新增一份空白筆記文件，支援 Markdown 即時預覽以及大模型背景自動摘要。</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider opacity-70">最近更新檔案</h3>
              {notes.length === 0 ? (
                <p className="text-xs opacity-50 italic">目前尚未建立任何本地檔案</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {notes.slice(0, 3).map(n => (
                    <div 
                      key={n.id}
                      onClick={() => openRightTab({ type: 'note', title: n.title || '未命名檔案', noteId: n.id })}
                      className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-3.5 rounded-xl hover:bg-black/5 cursor-pointer transition-all text-xs flex items-center gap-2.5`}
                    >
                      <FileText size={14} className={currentTheme.textMuted} />
                      <span className="font-bold truncate">{n.title || '未命名檔案'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 模式：筆記編輯 */}
        {currentTab.type === 'note' && (
          <div className={`flex-1 overflow-y-auto px-6 md:px-16 py-10 w-full mx-auto pb-32 ${isFullWidth ? 'max-w-full' : 'max-w-4xl'}`}>
            <input 
              type="text" 
              value={inputTitle} 
              onChange={(e) => setInputTitle(e.target.value)} 
              placeholder="未命名檔案標題" 
              className="w-full text-3xl font-black border-0 p-0 focus:ring-0 focus:outline-none mb-6 bg-transparent" 
            />
            
            {/* 💡 【優化改良】判定條件升級：只要有舊摘要 OR 當前分頁正在被 AI 分析，皆立即顯示提示框面板 */}
            {(activeNoteData?.summary || (currentTab.noteId && analyzingNoteId === currentTab.noteId)) && (
              <div className={`mb-8 ${currentTheme.cardBg} border ${currentTheme.sidebarBorder} rounded-xl p-5 text-xs leading-relaxed shadow-3xs animate-fadeIn`}>
                <div className="font-bold mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className={`text-amber-500 ${analyzingNoteId === currentTab.noteId ? 'animate-spin' : 'animate-pulse'}`} />
                    <span>Gemma 4 模型摘要提煉</span>
                  </div>
                  {/* 如果是當前分頁正在分析，右上角顯示狀態 */}
                  {analyzingNoteId === currentTab.noteId && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold animate-pulse tracking-wider">AI 正在深度思考提煉中...</span>
                  )}
                </div>

                {/* 狀態切換：如果正在分析，展示動態骨架屏 */}
                {analyzingNoteId === currentTab.noteId ? (
                  <div className="space-y-2 py-1">
                    <div className="h-3 bg-neutral-200/70 dark:bg-neutral-800 rounded animate-pulse w-full" />
                    <div className="h-3 bg-neutral-200/70 dark:bg-neutral-800 rounded animate-pulse w-[92%]" />
                    <div className="h-3 bg-neutral-200/50 dark:bg-neutral-800/80 rounded animate-pulse w-[65%]" />
                  </div>
                ) : (
                  <>
                    <p className="opacity-90">{activeNoteData?.summary}</p>
                    {activeNoteData?.tags && activeNoteData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {activeNoteData.tags.map((tag, idx) => (
                          <span key={idx} className="bg-black/5 text-[10px] px-2 py-0.5 rounded-md opacity-70">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <textarea 
              value={inputContent} 
              onChange={(e) => setInputContent(e.target.value)} 
              placeholder="在此點擊開始自由輸入您的深度思考內容..." 
              rows={16} 
              className="w-full bg-transparent resize-none border-0 p-0 text-sm md:text-base focus:ring-0 focus:outline-none leading-7" 
            />
          </div>
        )}

        {/* 模式：Gemma 4 獨立對話空間 */}
        {currentTab.type === 'ai' && (
          <div className="flex-1 flex flex-col overflow-hidden w-full mx-auto">
            <div className="flex-1 overflow-y-auto px-6 md:px-16 py-8 space-y-6 w-full">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-start pt-[4vh] w-full max-w-5xl mx-auto">
                  <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 bg-gradient-to-r from-neutral-500 via-neutral-800 to-neutral-900 bg-clip-text text-transparent">
                    哈囉，我是 Gemma 4 獨立對話大腦
                  </h1>
                  <p className={`text-lg md:text-xl font-medium ${currentTheme.textMuted} mb-12`}>
                    這是一個與筆記環境完全獨立的對話空間。今天有什麼我可以與您一同探討、協作的嗎？
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div onClick={() => handleSendChatMessage('請幫我將最近零散的想法重組成一份具備可行性的專案構想書')} className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-5 rounded-2xl hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between h-32 group`}>
                      <p className="text-xs font-semibold leading-relaxed">協助重組零散想法，撰寫具備可行性的專案構想書...</p>
                      <Compass size={16} className={`${currentTheme.textMuted} group-hover:text-neutral-800 transition-colors self-end`} />
                    </div>
                    <div onClick={() => handleSendChatMessage('請幫我檢查並重構一段具有潛在邏輯漏洞的非同步前端代碼')} className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-5 rounded-2xl hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between h-32 group`}>
                      <p className="text-xs font-semibold leading-relaxed">對非同步前端代碼進行深度邏輯漏洞檢查與代碼重構...</p>
                      <Code size={16} className={`${currentTheme.textMuted} group-hover:text-neutral-800 transition-colors self-end`} />
                    </div>
                    <div onClick={() => handleSendChatMessage('我想撰寫一篇富有說服力的產品推廣商務郵件草稿')} className={`${currentTheme.cardBg} border ${currentTheme.sidebarBorder} p-5 rounded-2xl hover:shadow-xs cursor-pointer transition-all flex flex-col justify-between h-32 group`}>
                      <p className="text-xs font-semibold leading-relaxed">提供創意靈感，撰寫一篇富有高度說服力的商務推廣郵件...</p>
                      <PenTool size={16} className={`${currentTheme.textMuted} group-hover:text-neutral-800 transition-colors self-end`} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-5xl w-full mx-auto space-y-6">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className={`w-8 h-8 rounded-xl ${currentTheme.accent} ${currentTheme.accentText} flex items-center justify-center font-bold text-xs shrink-0 shadow-3xs`}>
                          腦
                        </div>
                      )}
                      <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed max-w-[85%] ${
                        msg.role === 'user' 
                          ? `${currentTheme.cardBg} border ${currentTheme.sidebarBorder} font-medium shadow-3xs` 
                          : 'opacity-95'
                      }`}>
                        {msg.content === '' && isChatLoading ? (
                          <span className="flex items-center gap-2 text-xs opacity-60">
                            <Sparkles size={12} className="animate-spin" /> Gemma 4 正在深度思考...
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

            <div className={`p-6 md:px-16 border-t ${currentTheme.sidebarBorder}`}>
              <div className="max-w-5xl w-full mx-auto relative">
                <div className={`flex items-center ${currentTheme.chatInputBg} rounded-2xl px-5 py-3.5 border border-transparent focus-within:border-neutral-400 focus-within:bg-transparent transition-all`}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(); }}
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
        )}

        {/* 模式：會議和收件匣的右側內容佔位 */}
        {(currentTab.type === 'meeting' || currentTab.type === 'inbox') && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-60">
            <Sparkles size={24} className="mb-2 animate-pulse" />
            <p className="text-sm font-bold">{currentTab.title} 視窗</p>
            <p className="text-xs mt-1">此核心功能大腦內容已成功開啟在獨立分頁中。</p>
          </div>
        )}

        {/* 全域語音按鈕 */}
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          {isListening && (
            <span className="text-[11px] bg-red-500 text-white font-bold px-3 py-1.5 rounded-full animate-pulse shadow-md">
              即時語音辨識中...
            </span>
          )}
          <button 
            onClick={toggleListening} 
            className={`w-12 h-12 rounded-full border ${currentTheme.cardBg} ${currentTheme.sidebarBorder} flex items-center justify-center transition-all shadow-md hover:scale-105`}
          >
            {isListening ? <MicOff size={18} className="text-red-500" /> : <Mic size={18} />}
          </button>
        </div>

      </div>

      {/* 彈窗：搜尋 */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-start justify-center pt-[15vh]">
          <div className={`${currentTheme.cardBg} w-full max-w-xl rounded-xl shadow-2xl border ${currentTheme.sidebarBorder} p-2 m-4`}>
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
              <button onClick={() => setIsSearchOpen(false)}><X size={16} /></button>
            </div>
            <div className="p-2 max-h-60 overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <div className="p-4 text-xs text-center opacity-50">查無相符的檔案內容</div>
              ) : (
                filteredNotes.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => { setIsSearchOpen(false); openRightTab({ type: 'note', title: n.title || '未命名檔案', noteId: n.id }); }} 
                    className={`p-2.5 rounded-lg cursor-pointer text-xs font-bold ${currentTheme.cardHover} transition-colors`}
                  >
                    {n.title || '未命名檔案'}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 彈窗：主題設定 */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className={`${currentTheme.cardBg} w-full max-w-md rounded-2xl p-6 border ${currentTheme.sidebarBorder} shadow-2xl m-4`}>
            <div className="flex justify-between items-center border-b border-neutral-200/20 pb-3 mb-5">
              <h3 className="font-black text-sm">空間設定與色彩主題</h3>
              <button onClick={() => setIsSettingsOpen(false)} className={`p-1 rounded-md ${currentTheme.cardHover}`}><X size={16} /></button>
            </div>
            
            <div className="space-y-5 text-xs">
              <div>
                <label className={`block font-bold mb-2.5 ${currentTheme.textMuted}`}>選擇視覺色彩主題</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(THEMES).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setCurrentTheme(t)}
                      className={`p-3 rounded-xl border text-left font-medium transition-all ${
                        currentTheme.id === t.id 
                          ? 'border-neutral-800 ring-1 ring-neutral-800 font-bold' 
                          : 'border-neutral-200 opacity-80 hover:opacity-100'
                      } ${t.bg} ${t.text}`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-neutral-200/20 my-2" />

              <div className="flex justify-between items-center py-1">
                <div>
                  <span className="font-bold block">全畫面寬度配適</span>
                  <span className={`text-[11px] ${currentTheme.textMuted}`}>開啟後編輯器將自適應拉伸至最大可視範圍</span>
                </div>
                <button 
                  onClick={() => setIsFullWidth(!isFullWidth)} 
                  className={`w-10 h-5 rounded-full transition-colors ${isFullWidth ? 'bg-neutral-800' : 'bg-neutral-200'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform ${isFullWidth ? 'translate-x-5' : 'translate-x-1'} transition-transform`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}