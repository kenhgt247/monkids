// api/chat.js
// Vercel Serverless Function (Node.js 18+)
// Acts as a secure proxy to OpenAI to hide the API Key from the client.

module.exports = async (req, res) => {
  // 1. Validate Method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  // 2. Get API Key from Environment Variables
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('SERVER ERROR: OPENAI_API_KEY is missing in Vercel environment variables.');
    return res.status(500).json({ 
      error: { message: 'Missing OpenAI API Key on Server Configuration' } 
    });
  }

  try {
    // 3. Forward request to OpenAI
    // req.body is automatically parsed by Vercel for JSON requests
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await openaiResponse.json();

    // 4. Return OpenAI response to client
    // We relay the exact status code from OpenAI (e.g., 200, 401, 429)
    return res.status(openaiResponse.status).json(data);

  } catch (error) {
    // 5. Handle internal server errors
    console.error('PROXY ERROR:', error);
    return res.status(500).json({ 
      error: { message: error.message || 'Internal Server Error' } 
    });
  }
};