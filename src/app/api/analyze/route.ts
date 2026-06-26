import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const { content } = await req.json();

        if (!content) {
            return new Response(JSON.stringify({ error: "內容不能為空" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // 定義系統提示詞，強迫其輸出特定 JSON 格式
        const systemPrompt = `你是一位高效的知識管理助手。請針對使用者的輸入內容進行分析，並嚴格只返回以下 JSON 格式，不要包含任何額外的對話、 markdown 語法（不要用 \`\`\`json）或解釋：
{
    "summary": "一句話精煉的摘要（繁體中文，不超過 200 字）",
    "tags": ["標籤1", "標籤2", "標籤3"] (最多三個與內容高度相關的繁體中文繁體標籤)
}`;

        // 💡 讀取配置：如果是本地預設連 Ollama 的 generate，雲端則通常連相容端點
        const isOllamaDefault = !process.env.AI_API_URL;
        const apiUrl = process.env.AI_API_URL || "http://127.0.0.1:11434/api/generate";
        // 💡 針對上次 Groq 的更動，這裡直接沿用你設定好的 Llama3 模型，它比舊的 Gemma 更會抓 JSON 格式
        const modelName = process.env.AI_MODEL_NAME || "gemma4";
        const apiKey = process.env.AI_API_KEY || "";

        // 動態建構 Headers
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (apiKey) {
            headers["Authorization"] = `Bearer ${apiKey}`;
        }

        // 根據不同的 API 供應商，組合不同的 Body 欄位名稱
        let requestBody: any = {
            model: modelName,
            stream: true,
        };

        if (isOllamaDefault) {
            // Ollama /api/generate 格式
            requestBody.prompt = `內容：${content}\n\n請根據上述內容，嚴格按照要求的 JSON 格式輸出。`;
            requestBody.system = systemPrompt;
            requestBody.format = "json";
        } else {
            // Groq / OpenAI / DeepSeek / Gemini 相容格式
            requestBody.messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: `內容：${content}\n\n請根據上述內容，嚴格按照要求的 JSON 格式輸出。` }
            ];
            // 部分雲端供應商支援強制的 JSON Mode
            requestBody.response_format = { type: "json_object" };
        }

        // 向 AI 服務發起請求
        const aiResponse = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestBody),
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            throw new Error(`AI 服務連線失敗: ${aiResponse.status} - ${errorText}`);
        }

        const reader = aiResponse.body?.getReader();
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                if (!reader) {
                    controller.close();
                    return;
                }

                let buffer = "";
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split("\n");
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            if (!line.trim()) continue;

                            // 移除雲端 API 常見的 "data: " 前綴
                            const cleanLine = line.startsWith("data: ") ? line.slice(6) : line;
                            if (cleanLine.trim() === "[DONE]") continue;

                            try {
                                const parsed = JSON.parse(cleanLine);
                                let textChunk = "";

                                // 💡 完美相容：同時解析 Ollama (.response) 與 雲端 API (.delta.content)
                                if (parsed.response) {
                                    textChunk = parsed.response; // Ollama 專用
                                } else if (parsed.choices?.[0]?.delta?.content) {
                                    textChunk = parsed.choices[0].delta.content; // Groq / OpenAI 專用
                                }

                                if (textChunk) {
                                    controller.enqueue(
                                        encoder.encode(
                                            `data: ${JSON.stringify({ text: textChunk })}\n\n`,
                                        ),
                                    );
                                }
                            } catch (e) {
                                // 忽略未完整的 JSON 片段
                            }
                        }
                    }
                } catch (error) {
                    controller.error(error);
                } finally {
                    controller.close();
                    reader.releaseLock();
                }
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
        console.error("AI 處理失敗:", error);
        return new Response(
            JSON.stringify({ error: error.message || "內部伺服器錯誤" }),
            { 
                status: 500,
                headers: { "Content-Type": "application/json" }
            },
        );
    }
}