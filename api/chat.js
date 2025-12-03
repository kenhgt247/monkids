// api/chat.js
// Vercel Serverless Function (Node.js 18+)
// Acts as a robust, production-ready proxy to OpenAI.

module.exports = async (req, res) => {
  // --- 1. CORS CONFIGURATION ---
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle Preflight Request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // --- 2. VALIDATION ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed. Use POST.' } });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('SERVER ERROR: OPENAI_API_KEY is missing.');
    return res.status(500).json({ 
      error: { 
        code: 'MISSING_API_KEY',
        message: 'Server chưa được cấu hình API Key. Vui lòng kiểm tra cài đặt Environment Variables trên Vercel.' 
      } 
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    
    const messages = body.messages || [
        { role: 'user', content: 'Xin chào' }
    ];

    // --- 3. CALL OPENAI API ---
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model || 'gpt-3.5-turbo',
        messages: messages,
        temperature: body.temperature || 0.7,
        max_tokens: body.max_tokens || 800,
      }),
    });

    const data = await response.json();

    // --- 4. ERROR HANDLING ---
    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      return res.status(response.status).json({ 
        error: {
            code: data.error?.code || 'OPENAI_ERROR',
            message: data.error?.message || 'Lỗi không xác định từ OpenAI',
            details: data
        }
      });
    }

    // --- 5. SUCCESS ---
    return res.status(200).json(data);

  } catch (error) {
    console.error('INTERNAL SERVER ERROR:', error);
    return res.status(500).json({ 
      error: { 
        code: 'INTERNAL_ERROR',
        message: error.message || 'Lỗi nội bộ Server' 
      } 
    });
  }
};