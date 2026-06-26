// 檔案路徑：src/app/api/analyze/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs"; // 確保運行在 Node.js 環境以支援與地端 Ollama 通訊

export async function POST(req: NextRequest) {
    try {
        const { content } = await req.json();

        if (!content) {
            return new Response(JSON.stringify({ error: "內容不能為空" }), {
                status: 400,
            });
        }

        // 定義給 Ollama 的系統提示詞，強迫其輸出特定 JSON 格式
        const systemPrompt = `你是一位高效的知識管理助手。請針對使用者的輸入內容進行分析，並嚴格只返回以下 JSON 格式，不要包含任何額外的對話、 markdown 語法（不要用 \`\`\`json）或解釋：
{
    "summary": "一句話精煉的摘要（繁體中文，不超過 200 字）",
    "tags": ["標籤1", "標籤2", "標籤3"] (最多三個與內容高度相關的繁體中文繁體標籤)
}`;

        // 向本機運行的 Ollama 服務發起請求 (預設埠口為 11434)
        // 注意：請確認你本地運行的模型名稱是否為 llama3，若為 mistral 或 gemma2:2b 請自行修改此處
        const ollamaResponse = await fetch(
            "http://127.0.0.1:11434/api/generate",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "gemma4",
                    prompt: `內容：${content}\n\n請根據上述內容，嚴格按照要求的 JSON 格式輸出。`,
                    system: systemPrompt,
                    format: "json", // 強制 Ollama 輸出結構化 JSON
                    stream: true, // 開啟串流模式
                }),
            },
        );

        if (!ollamaResponse.ok) {
            throw new Error(
                `Ollama 服務連線失敗: ${ollamaResponse.statusText}`,
            );
        }

        // 建立可讀取流（ReadableStream），將 Ollama 的資料逐字轉發給前端
        const reader = ollamaResponse.body?.getReader();
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                if (!reader) {
                    controller.close();
                    return;
                }

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        // 解碼從 Ollama 收到的區塊 (Chunk)
                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk
                            .split("\n")
                            .filter((line) => line.trim() !== "");

                        for (const line of lines) {
                            try {
                                const parsed = JSON.parse(line);
                                // Ollama 串流的文字碎塊在 parsed.response
                                if (parsed.response) {
                                    // 封裝成標準 SSE 格式 "data: 內容\n\n"
                                    controller.enqueue(
                                        encoder.encode(
                                            `data: ${JSON.stringify({ text: parsed.response })}\n\n`,
                                        ),
                                    );
                                }
                            } catch (e) {
                                // 忽略單行解析失敗，防止干擾整體流
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

        // 回傳標準的 SSE 標頭
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
            { status: 500 },
        );
    }
}
