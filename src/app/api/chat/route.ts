import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json(); // 接收前端傳來的完整對話歷史

        // 💡 核心優化：從環境變數讀取配置，若沒設定則自動 fallback 回本地地端
        const apiUrl = process.env.AI_API_URL || "http://127.0.0.1:11434/api/chat";
        const modelName = process.env.AI_MODEL_NAME || "gemma4";
        const apiKey = process.env.AI_API_KEY || ""; // 預留給雲端 API 或 ngrok 驗證使用

        // 動態建構 Headers
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
        }

        // 呼叫 AI API 端點
        const aiResponse = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: modelName,
                messages: messages, 
                stream: true,
            }),
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            throw new Error(`AI 連線異常: ${aiResponse.status} - ${errorText}`);
        }

        // 建立標準 SSE 串流轉發給前端
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                const reader = aiResponse.body?.getReader();
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
                        
                        // 移除 OpenAI 格式可能帶有的 "data: " 前綴
                        const cleanLine = line.startsWith("data: ") ? line.slice(6) : line;
                        if (cleanLine.trim() === "[DONE]") continue;

                        try {
                            const parsed = JSON.parse(cleanLine);
                            let content = "";

                            // 💡 相容性核心：同時支援 Ollama 格式與標準 OpenAI/DeepSeek 格式
                            if (parsed.message?.content) {
                                content = parsed.message.content; // Ollama 格式
                            } else if (parsed.choices?.[0]?.delta?.content) {
                                content = parsed.choices[0].delta.content; // OpenAI / DeepSeek / Groq 格式
                            }

                            if (content) {
                                // 包裝成前端統一的串流格式傳回
                                controller.enqueue(
                                    encoder.encode(
                                        `data: ${JSON.stringify({ text: content })}\n\n`,
                                    ),
                                );
                            }
                        } catch (e) {
                            // 忽略部分還沒傳輸完整的 JSON 碎片
                        }
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
            headers: { "Content-Type": "application/json" }
        });
    }
}