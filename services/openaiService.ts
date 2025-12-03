import { ChatMessage } from "../types";

// 1. Helper: Fetch with timeout (tránh treo app khi mạng lag)
const fetchWithTimeout = async (resource: string, options: any = {}, timeout = 25000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// 2. Hàm gọi API chung (Shared Function) để xử lý mọi request AI
const callAIEndpoint = async (messages: any[], temperature: number = 0.7): Promise<any> => {
    try {
        const response = await fetchWithTimeout("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: temperature
            })
        });

        // Xử lý các trường hợp lỗi từ Server
        if (!response.ok) {
            let errorMsg = `Lỗi kết nối (${response.status})`;
            try {
                const errorData = await response.json();
                if (errorData.error) {
                    // Lỗi cụ thể từ Backend hoặc OpenAI (ví dụ: Hết tiền, Sai Key)
                    errorMsg = `⚠️ ${errorData.error.message || 'Lỗi API không xác định'}`;
                }
            } catch (e) {
                // Nếu không parse được JSON -> Khả năng cao là lỗi HTML từ Vercel (404, 500, 504)
                const text = await response.text();
                console.error("Non-JSON Response:", text);
                
                if (response.status === 404) errorMsg = "⚠️ Không tìm thấy API (404). Hãy chắc chắn bạn đang chạy 'vercel dev'.";
                else if (response.status === 504) errorMsg = "⚠️ Server Timeout (504). OpenAI phản hồi quá lâu.";
                else errorMsg = `⚠️ Lỗi Server (${response.status}). Vui lòng kiểm tra Console.`;
            }
            throw new Error(errorMsg);
        }

        return await response.json();

    } catch (error: any) {
        console.error("AI Service Error:", error);
        if (error.name === 'AbortError') throw new Error("⚠️ Phản hồi quá lâu (Timeout).");
        throw error; // Ném lỗi ra để hàm gọi xử lý hiển thị
    }
};

// 3. Chat Chính: Mẹ Thông Thái
export const getOpenAIResponse = async (
  messages: ChatMessage[],
  context: string = 'parenting'
): Promise<string> => {
  
  let systemPrompt = "Bạn là 'Mẹ Thông Thái' - trợ lý ảo chuyên về nuôi dạy con, sức khỏe và gia đình. Hãy trả lời ngắn gọn, ấm áp, dùng icon dễ thương. Nếu không biết chắc chắn, hãy khuyên đi khám bác sĩ.";
  
  if (context === 'kids_story') {
      systemPrompt = "Bạn là một người kể chuyện cổ tích cho bé. Hãy kể giọng văn vui tươi, bài học ý nghĩa, dùng từ ngữ đơn giản cho bé 3-6 tuổi hiểu.";
  }

  const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.text
      }))
  ];

  try {
      const data = await callAIEndpoint(apiMessages);
      return data.choices?.[0]?.message?.content || "Xin lỗi, mình chưa nghĩ ra câu trả lời.";
  } catch (error: any) {
      return error.message || "⚠️ Lỗi hệ thống AI.";
  }
};

// 4. Tính năng: Gợi ý tin nhắn (Chat Suggestions)
export const generateChatSuggestions = async (lastMessages: string[], type: 'reply' | 'starter'): Promise<string[]> => {
    try {
        let prompt = type === 'starter' 
            ? "Gợi ý 3 câu hỏi mở đầu làm quen với mẹ khác (chỉ trả về JSON array string, không markdown)." 
            : `Gợi ý 3 câu trả lời ngắn cho tin nhắn: "${lastMessages[0]}" (chỉ trả về JSON array string, không markdown).`;

        const data = await callAIEndpoint([{ role: "user", content: prompt }]);
        const text = data.choices?.[0]?.message?.content || "[]";
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Suggestion Error:", e);
        return []; 
    }
};

// 5. Tính năng: Phân tích bài viết (Ask AI)
export const analyzePostWithAI = async (postContent: string): Promise<string> => {
    try {
        const messages = [
            { role: "system", content: "Bạn là chuyên gia tư vấn. Hãy đưa ra lời khuyên ngắn gọn, hữu ích cho bài viết sau:" },
            { role: "user", content: postContent }
        ];
        const data = await callAIEndpoint(messages);
        return data.choices?.[0]?.message?.content || "";
    } catch { return "Không thể phân tích lúc này."; }
};

// 6. Tính năng: Gợi ý bình luận (Magic Comment)
export const generateCommentSuggestion = async (postContent: string): Promise<string> => {
    try {
        const messages = [
            { role: "system", content: "Viết 1 bình luận ngắn (dưới 20 từ), lịch sự, đồng cảm để trả lời bài viết này:" },
            { role: "user", content: postContent }
        ];
        const data = await callAIEndpoint(messages);
        let content = data.choices?.[0]?.message?.content || "";
        if (content.startsWith('"') && content.endsWith('"')) content = content.slice(1, -1);
        return content;
    } catch { return ""; }
};