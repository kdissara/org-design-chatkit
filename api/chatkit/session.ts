import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id = 'default-user' } = req.body || {};

    // Direct API call with required beta header
    const response = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        workflow: { id: process.env.WORKFLOW_ID },
        user: user_id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ChatKit API error:', errorData);
      return res.status(response.status).json({ error: errorData });
    }

    const { client_secret } = await response.json();
    return res.status(200).json({ client_secret });
  } catch (error: any) {
    console.error('ChatKit session error:', error);
    return res.status(500).json({ error: error.message });
  }
}
