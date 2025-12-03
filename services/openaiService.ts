import { ChatMessage } from "../types";

// Helper: Fetch with timeout
const fetchWithTimeout = async (resource: string, options: any = {}, timeout = 15000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
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
    // 2. Robust API Call
    const response = await fetchWithTimeout("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: apiMessages,
        temperature: 0.7
      })
    });

    // 3. Status Handling
    if (response.status === 404) {
        console.error("API Route not found.");
        return "⚠️ Lỗi kết nối: Không tìm thấy máy chủ AI. Nếu chạy Local, hãy dùng 'vercel dev'.";
    }

    if (response.status === 500) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error?.code === 'MISSING_API_KEY') {
            return "⚠️ Lỗi cấu hình: Admin chưa nhập API Key trên Server Vercel.";
        }
        return "⚠️ Hệ thống đang bận. Vui lòng thử lại sau.";
    }

    const data = await response.json();

    // 4. OpenAI Error Handling
    if (data.error) {
        console.error("OpenAI Error Detail:", data.error);
        
        if (data.error.code === 'insufficient_quota') {
            return "⚠️ Hệ thống AI đang tạm ngưng do hết hạn mức sử dụng (Hết tiền trong tài khoản OpenAI).";
        }
        if (data.error.code === 'invalid_api_key') {
            return "⚠️ API Key không hợp lệ. Vui lòng kiểm tra lại cấu hình.";
        }
        
        return `⚠️ Có lỗi xảy ra: ${data.error.message}`;
    }

    return data.choices?.[0]?.message?.content || "Xin lỗi, mình chưa nghĩ ra câu trả lời.";

  } catch (error: any) {
    console.error("Network/Timeout Error:", error);
    if (error.name === 'AbortError') {
        return "⚠️ Phản hồi quá lâu. Vui lòng thử lại câu hỏi ngắn hơn.";
    }
    return "⚠️ Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền internet.";
  }
};

// --- Helper Functions (Updated to use fetchWithTimeout logic simplified) ---

export const generateChatSuggestions = async (lastMessages: string[], type: 'reply' | 'starter'): Promise<string[]> => {
    try {
        let prompt = type === 'starter' 
            ? "Gợi ý 3 câu hỏi mở đầu làm quen với mẹ khác (JSON array string)." 
            : `Gợi ý 3 câu trả lời ngắn cho tin nhắn: "${lastMessages[0]}" (JSON array string).`;

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
        return JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch { return []; }
};

export const analyzePostWithAI = async (postContent: string): Promise<string> => {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "Bạn là chuyên gia tư vấn. Hãy đưa ra lời khuyên ngắn gọn cho bài viết sau:" },
                    { role: "user", content: postContent }
                ]
            })
        });
        if (!response.ok) return "Không thể phân tích.";
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
                    { role: "system", content: "Viết 1 bình luận ngắn (dưới 20 từ) chia sẻ hoặc khen ngợi bài viết này:" },
                    { role: "user", content: postContent }
                ]
            })
        });
        if (!response.ok) return "";
        const data = await response.json();
        return (data.choices?.[0]?.message?.content || "").replace(/"/g, '');
    } catch { return ""; }
};