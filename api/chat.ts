import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: { message: "Method not allowed – Use POST" }
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: { message: "Missing OPENAI_API_KEY in Vercel Environment Variables" }
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body)  // <-- req.body dùng chuẩn Vercel
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err: any) {
    console.error("Server AI Error:", err);
    return res.status(500).json({
      error: { message: err.message || "Internal Server Error" }
    });
  }
}
