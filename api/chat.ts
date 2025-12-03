import type { VercelRequest, VercelResponse } from '@vercel/node';

// Hàm Serverless chính
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Chỉ chấp nhận POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  // Lấy API key từ biến môi trường
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { message: "Missing OPENAI_API_KEY in Vercel Environment Variables" }
    });
  }

  try {
    // Body gửi lên từ frontend
    const body = req.body;

    // Gọi API OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return res.status(500).json({
      error: { message: error?.message || "Internal Server Error" },
    });
  }
}
