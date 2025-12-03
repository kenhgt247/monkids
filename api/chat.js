// api/chat.js
// Vercel Serverless Function (Node.js) - ESM Version
import https from 'node:https';
import { Buffer } from 'node:buffer';

export default async function handler(req, res) {
  // 1. CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('SERVER: Missing API Key');
    return res.status(500).json({ error: { code: 'MISSING_API_KEY', message: 'Chưa cấu hình OPENAI_API_KEY' } });
  }

  // 2. Parse Body securely
  let bodyData;
  try {
    bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!bodyData) throw new Error('Body empty');
  } catch (e) {
    return res.status(400).json({ error: { message: 'Invalid JSON body' } });
  }

  const messages = bodyData.messages || [{ role: 'user', content: 'Hello' }];

  // 3. Prepare Request Options
  const requestData = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0.7,
    max_tokens: 800
  });

  const options = {
    hostname: 'api.openai.com',
    path: '/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Length': Buffer.byteLength(requestData)
    }
  };

  // 4. Execute HTTPS Request
  await new Promise((resolve) => {
    const proxyReq = https.request(options, (proxyRes) => {
      let data = '';

      proxyRes.on('data', (chunk) => {
        data += chunk;
      });

      proxyRes.on('end', () => {
        try {
          // Check if response is JSON
          let jsonResponse;
          try {
             jsonResponse = JSON.parse(data);
          } catch(e) {
             // If OpenAI returns non-JSON (e.g. 502 Bad Gateway html), handle it
             console.error('Non-JSON response from OpenAI:', data);
             res.status(502).json({ error: { message: 'Lỗi phản hồi từ OpenAI (Bad Gateway)' } });
             resolve();
             return;
          }
          
          if (proxyRes.statusCode >= 400) {
            console.error('OpenAI Error:', jsonResponse);
            res.status(proxyRes.statusCode).json({
              error: {
                code: jsonResponse.error?.code || 'OPENAI_ERROR',
                message: jsonResponse.error?.message || 'Lỗi từ OpenAI',
                details: jsonResponse
              }
            });
          } else {
            res.status(200).json(jsonResponse);
          }
        } catch (e) {
          console.error('Parse Error:', e);
          res.status(500).json({ error: { message: 'Lỗi xử lý dữ liệu server' } });
        }
        resolve();
      });
    });

    proxyReq.on('error', (e) => {
      console.error('Request Error:', e);
      res.status(500).json({ error: { message: `Lỗi kết nối OpenAI: ${e.message}` } });
      resolve();
    });

    proxyReq.write(requestData);
    proxyReq.end();
  });
}