import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

const DEVICE_ID_KEY = 'chatkit_device_id';

function getDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }

  const uuid = window.crypto?.randomUUID?.();
  const deviceId = uuid ?? `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

export function ChatWidget() {
  const [lastAction, setLastAction] = useState<string | null>(null);
  const { control, sendUserMessage } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          return existing;
        }

        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: getDeviceId() }),
        });
        if (!res.ok) {
          throw new Error('Failed to create ChatKit session');
        }
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
    onReady() {
      console.log('chatkit ready');
    },
    onError({ error }) {
      console.error('chatkit error', error);
    },
    widgets: {
      async onAction(action, widgetItem) {
        console.log('chatkit widget action', action, widgetItem);
        const payload = action.payload ? JSON.stringify(action.payload) : '';
        setLastAction(`${action.type}${payload ? ` ${payload}` : ''}`);
        if (action.type === 'asean.select') {
          const id = action.payload?.id;
          if (typeof id === 'string') {
            await sendUserMessage({ text: `Selected option ${id}.` });
          }
          return;
        }

        if (action.type === 'asean.custom_submit') {
          const custom = action.payload?.custom;
          if (typeof custom === 'string' && custom.trim()) {
            await sendUserMessage({ text: custom.trim() });
          }
        }
      },
    },
  });

  return (
    <div className="chat-container">
      <h1>Org Design Assistant</h1>
      {lastAction ? <div>Widget action: {lastAction}</div> : null}
      <ChatKit control={control} style={{ height: '600px', width: '100%', maxWidth: '800px' }} />
    </div>
  );
}
