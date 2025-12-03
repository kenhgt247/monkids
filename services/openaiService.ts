import { ChatMessage } from "../types";

// QUAN TRỌNG: Đã xóa API Key cứng. 
// Bây giờ code sẽ gọi về /api/chat để dùng key bảo mật trên Vercel.

export const getOpenAIResponse = async (
  messages: ChatMessage[],
  context: string = 'parenting'
): Promise<string> => {
  
  try {
    let systemPrompt = "Bạn là một trợ lý ảo thông thái, dịu dàng và chu đáo tên là 'Mẹ Thông Thái' (Wise Mom). Bạn chuyên giúp đỡ các bậc phụ huynh về kiến thức nuôi dạy con, sức khỏe mẹ và bé, dinh dưỡng và giáo dục sớm. Hãy trả lời bằng tiếng Việt, giọng văn thân thiện, đồng cảm và khuyến khích. Dùng các emoji dễ thương.";
    
    if (context === 'kids_story') {
        systemPrompt = "Bạn là một người kể chuyện cổ tích tuyệt vời cho trẻ em. Hãy kể những câu chuyện ngắn, mang tính giáo dục, nhân văn, giọng kể vui tươi, hấp dẫn. Dùng từ ngữ đơn giản phù hợp với trẻ mầm non.";
    }

    // Chuẩn bị lịch sử chat cho OpenAI
    const apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.map(msg => ({
            role: msg.role === 'model' ? 'assistant' : 'user',
            content: msg.text
        }))
    ];

    // GỌI VỀ API SERVERLESS CỦA CHÍNH MÌNH (AN TOÀN)
    // Đường dẫn tương đối /api/chat sẽ tự động trỏ về Server Vercel hiện tại
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await response.json();

    if (data.error) {
        console.error("OpenAI Error:", JSON.stringify(data.error, null, 2));
        return "Xin lỗi, hệ thống AI đang bận hoặc chưa cấu hình đúng Key trên Server.";
    }

    return data.choices?.[0]?.message?.content || "Xin lỗi, mình chưa nghĩ ra câu trả lời ngay lúc này.";
  } catch (error) {
    console.error("Network Error:", error);
    return "Lỗi kết nối. Vui lòng kiểm tra mạng.";
  }
};

// Hàm mới: Gợi ý trả lời tin nhắn hoặc câu hỏi mở đầu
export const generateChatSuggestions = async (lastMessages: string[], type: 'reply' | 'starter'): Promise<string[]> => {
    try {
        let prompt = "";
        if (type === 'starter') {
            prompt = "Hãy gợi ý 3 câu hỏi ngắn gọn, thân thiện, lịch sự bằng tiếng Việt để bắt đầu cuộc trò chuyện với một người mẹ khác trong cộng đồng Mom & Kids. Trả lời dưới dạng JSON array string, ví dụ: [\"Chào mẹ, bé nhà bạn mấy tháng rồi?\", \"Rất vui được làm quen!\"]";
        } else {
            prompt = `Dựa trên tin nhắn cuối cùng của đối phương: "${lastMessages[lastMessages.length - 1]}". Hãy gợi ý 3 câu trả lời ngắn gọn, tự nhiên, thân thiện bằng tiếng Việt. Trả lời dưới dạng JSON array string.`;
        }

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Bạn là trợ lý AI giúp gợi ý tin nhắn chat. Chỉ trả về JSON array, không thêm text nào khác." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        if (data.error) return [];
        const content = data.choices?.[0]?.message?.content;
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanContent);
    } catch (e) {
        return [];
    }
};

// Hàm mới: Phân tích bài viết và đưa ra lời khuyên chuyên gia
export const analyzePostWithAI = async (postContent: string): Promise<string> => {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Bạn là một chuyên gia tư vấn nuôi dạy con cái và sức khỏe gia đình. Hãy đọc bài viết của người dùng, phân tích vấn đề họ gặp phải và đưa ra lời khuyên ngắn gọn, hữu ích, khoa học (dưới 150 từ). Nếu bài viết chỉ là chia sẻ vui, hãy bình luận chúc mừng hoặc chia sẻ niềm vui." },
                    { role: "user", content: postContent }
                ],
                temperature: 0.7
            })
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || "Không thể phân tích lúc này.";
    } catch (e) {
        return "Lỗi kết nối AI.";
    }
};

// Hàm mới: Gợi ý bình luận cho bài viết
export const generateCommentSuggestion = async (postContent: string): Promise<string> => {
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Bạn là một thành viên nhiệt tình trong cộng đồng mẹ và bé. Hãy đọc bài viết này và viết một câu bình luận ngắn (dưới 30 từ) thể hiện sự đồng cảm, chia sẻ hoặc khen ngợi một cách tự nhiên." },
                    { role: "user", content: postContent }
                ],
                temperature: 0.8
            })
        });
        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || "";
        // Xóa dấu ngoặc kép nếu có
        if (content.startsWith('"') && content.endsWith('"')) {
            content = content.slice(1, -1);
        }
        return content;
    } catch (e) {
        return "";
    }
};