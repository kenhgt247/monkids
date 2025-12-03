import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Note: In a real environment, never expose API keys on the client side without restrictions.
// We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (
  messages: ChatMessage[],
  context: string = 'parenting'
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Lỗi: Chưa cấu hình API Key. Vui lòng kiểm tra cài đặt.";
  }

  try {
    const history = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Remove the last user message from history as it will be sent as the new message
    const lastMessage = history.pop();
    if (!lastMessage || !lastMessage.parts[0].text) return "Vui lòng nhập câu hỏi.";

    let systemInstruction = "Bạn là một trợ lý ảo thông thái, dịu dàng và chu đáo tên là 'Mẹ Thông Thái' (Wise Mom). Bạn chuyên giúp đỡ các bậc phụ huynh về kiến thức nuôi dạy con, sức khỏe mẹ và bé, dinh dưỡng và giáo dục sớm. Hãy trả lời bằng tiếng Việt, giọng văn thân thiện, đồng cảm và khuyến khích. Dùng các emoji dễ thương.";
    
    if (context === 'kids_story') {
        systemInstruction = "Bạn là một người kể chuyện cổ tích tuyệt vời cho trẻ em. Hãy kể những câu chuyện ngắn, mang tính giáo dục, nhân văn, giọng kể vui tươi, hấp dẫn. Dùng từ ngữ đơn giản phù hợp với trẻ mầm non.";
    }

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: history // Pass previous history
    });

    const result = await chat.sendMessage({
        message: lastMessage.parts[0].text
    });

    return result.text || "Xin lỗi, mình đang suy nghĩ một chút, bạn hỏi lại sau nhé!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Xin lỗi, hiện tại hệ thống đang bận. Vui lòng thử lại sau.";
  }
};