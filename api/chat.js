module.exports = async (req, res) => {
  // Chỉ chấp nhận POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    // Lấy API Key từ biến môi trường Vercel
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: { message: 'Missing OpenAI API Key in Environment Variables' }
      });
    }

    // Parse JSON body từ Vercel Serverless Function
    let body = "";
    await new Promise(resolve => {
      req.on("data", chunk => (body += chunk));
      req.on("end", resolve);
    });

    const jsonBody = JSON.parse(body);

    // Gọi OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(jsonBody)
    });

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (err) {
    console.error("Server ERROR:", err);
    return res.status(500).json({ error: { message: err.message } });
  }
};
