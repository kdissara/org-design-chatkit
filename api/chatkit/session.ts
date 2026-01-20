import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

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
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { user_id = 'default-user' } = req.body || {};

    // Use OpenAI SDK to create ChatKit session (like the Python example)
    const session = await openai.beta.chatkit.sessions.create({
      workflow: { id: process.env.WORKFLOW_ID },
      user: user_id,
    });

    return res.status(200).json({ client_secret: session.client_secret });
  } catch (error: any) {
    console.error('ChatKit session error:', error);
    return res.status(500).json({ error: error.message });
  }
}
