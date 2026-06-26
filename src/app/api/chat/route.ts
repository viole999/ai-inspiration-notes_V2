// 檔案路徑：src/app/api/chat/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json(); // 接收前端傳來的完整對話歷史

        // 呼叫地端 Ollama 的 chat 專用 API
        const ollamaResponse = await fetch("http://127.0.0.1:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gemma4",
                messages: messages, // 傳遞歷史紀錄，AI 就會記得上文
                stream: true,
            }),
        });

        if (!ollamaResponse.ok) throw new Error("Ollama 連線異常");

        // 建立標準 SSE 串流轉發給前端
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                const reader = ollamaResponse.body?.getReader();
                const decoder = new TextDecoder();

                if (!reader) {
                    controller.close();
                    return;
                }

                let buffer = "";
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.message?.content) {
                                // 包裝成前端統一的串流格式
                                controller.enqueue(
                                    encoder.encode(
                                        `data: ${JSON.stringify({ text: parsed.message.content })}\n\n`,
                                    ),
                                );
                            }
                        } catch (e) {}
                    }
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
            },
        });
    } catch (error: any) {
        console.error("Chat API 失敗:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
} 
