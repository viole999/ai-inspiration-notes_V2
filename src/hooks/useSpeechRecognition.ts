import { useState, useEffect, useRef } from "react";

interface UseSpeechRecognitionProps {
    onResult: (text: string) => void;
}

export function useSpeechRecognition({ onResult }: UseSpeechRecognitionProps) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // 檢查瀏覽器是否支援 Web Speech API
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
            const rec = new SpeechRecognition();
            rec.continuous = false; // 單次辨識，結束後自動停止
            rec.interimResults = false; // 是否需要即時看未完成的字（預設否）
            rec.lang = "zh-TW"; // 設定語系

            rec.onstart = () => setIsListening(true);
            rec.onend = () => setIsListening(false);
            rec.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onResult(transcript);
            };

            recognitionRef.current = rec;
        }
    }, [onResult]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("你的瀏覽器不支援語音輸入功能");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    return { isListening, toggleListening };
}