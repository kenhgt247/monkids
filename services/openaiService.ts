import { ChatMessage } from "../types";

// Helper: Fetch with timeout
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

export const getOpenAIResponse = async (
  messages: ChatMessage[],
  context: string = 'parenting'
): Promise<string> => {
  
  // 1. Enhanced System Prompt
  let systemPrompt = "Bạn là 'Mẹ Thông Thái' - trợ lý ảo chuyên về nuôi dạy con, sức khỏe và gia đình. Hãy trả lời ngắn gọn, ấm áp, dùng icon dễ thương. Nếu không biết chắc chắn, hãy khuyên đi khám bác sĩ.";
  
  if (context === 'kids_story') {
      systemPrompt = "Bạn là người kể chuyện cổ tích cho bé. Hãy kể giọng văn vui tươi, bài học ý nghĩa, dùng từ ngữ đơn giản cho bé 3-6 tuổi hiểu.";
  }

  const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.text
      }))
  ];

  try {
    // 2. Call Serverless Function
    const response = await fetchWithTimeout("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: apiMessages,
        temperature: 0.7
      })
    });

    // 3. Handle HTTP Errors
    if (!response.ok) {
        let errorMessage = `Lỗi kết nối (${response.status})`;
        
        try {
            const errorData = await response.json();
            // Ưu tiên hiển thị message từ server trả về
            if (errorData.error) {
                errorMessage = `⚠️ ${errorData.error.message || errorData.error.code || 'Lỗi không xác định'}`;
            }
        } catch (e) {
            // Nếu không parse được JSON (ví dụ Vercel trả về HTML lỗi 500/504)
            if (response.status === 504) errorMessage = "⚠️ Server phản hồi quá lâu (Timeout).";
            else if (response.status === 404) errorMessage = "⚠️ Không tìm thấy API. Hãy đảm bảo bạn đang chạy 'vercel dev'.";
            else errorMessage = `⚠️ Lỗi Server (${response.status}). Vui lòng kiểm tra Console.`;
        }
        
        console.error("API Error:", errorMessage);
        return errorMessage;
    }

    // 4. Success
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Xin lỗi, mình chưa nghĩ ra câu trả lời.";

  } catch (error: any) {
    console.error("Network/Timeout Error:", error);
    if (error.name === 'AbortError') {
        return "⚠️ Phản hồi quá lâu. Vui lòng thử lại câu hỏi ngắn hơn.";
    }
    return "⚠️ Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền internet.";
  }
};

// --- Helper Functions ---

export const generateChatSuggestions = async (lastMessages: string[], type: 'reply' | 'starter'): Promise<string[]> => {
    try {
        let prompt = type === 'starter' 
            ? "Gợi ý 3 câu hỏi mở đầu làm quen với mẹ khác (chỉ trả về JSON array string, không có text khác)." 
            : `Gợi ý 3 câu trả lời ngắn cho tin nhắn: "${lastMessages[0]}" (chỉ trả về JSON array string, không có text khác).`;

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt }]
            })
        });
        
        if (!response.ok) return [];
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content || "[]";
        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Auto-suggest error:", e);
        return []; 
    }
};

export const analyzePostWithAI = async (postContent: string): Promise<string> => {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Bạn là chuyên gia tư vấn. Hãy đưa ra lời khuyên ngắn gọn, hữu ích cho bài viết sau:" },
                    { role: "user", content: postContent }
                ]
            })
        });
        if (!response.ok) return "Không thể phân tích lúc này.";
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "";
    } catch { return "Lỗi kết nối AI."; }
};

export const generateCommentSuggestion = async (postContent: string): Promise<string> => {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Viết 1 bình luận ngắn (dưới 20 từ), lịch sự, đồng cảm để trả lời bài viết này:" },
                    { role: "user", content: postContent }
                ]
            })
        });
        if (!response.ok) return "";
        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || "";
        // Remove quotes if present
        if (content.startsWith('"') && content.endsWith('"')) {
            content = content.slice(1, -1);
        }
        return content;
    } catch { return ""; }
};