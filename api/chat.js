export default async function handler(req, res) {
  // Chỉ chấp nhận method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  // Lấy API Key từ biến môi trường Vercel (Server-side)
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: { message: 'Missing OpenAI API Key on Server Configuration' } });
  }

  try {
    // Gọi sang OpenAI từ phía Server
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body) // Chuyển tiếp body từ client gửi lên
    });

    const data = await response.json();

    // Trả kết quả về cho Client
    return res.status(response.status).json(data);

  } catch (error) {
    console.error("Server API Error:", error);
    return res.status(500).json({ error: { message: error.message || 'Internal Server Error' } });
  }
}
