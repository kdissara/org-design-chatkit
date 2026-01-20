import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function ChatWidget() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        // Refresh logic if session exists
        if (existing) {
          // Could implement refresh here
        }

        // Use relative URL - works on Vercel
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: 'test-user' }),
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
  });

  return (
    <div className="chat-container">
      <h1>Org Design Assistant</h1>
      <ChatKit control={control} className="h-[600px] w-full max-w-[800px]" />
    </div>
  );
}
