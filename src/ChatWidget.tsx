import { ChatKit, useChatKit } from '@openai/chatkit-react';

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
    theme: {
      colorScheme: 'dark',
      radius: 'round',
      density: 'compact',
      color: {
        grayscale: {
          hue: 147,
          tint: 1,
          shade: 2,
        },
        accent: {
          primary: '#42a22f',
          level: 1,
        },
      },
      typography: {
        baseSize: 17,
        fontFamily:
          '"OpenAI Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
        fontFamilyMono:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace',
        fontSources: [
          {
            family: 'OpenAI Sans',
            src: 'https://cdn.openai.com/common/fonts/openai-sans/v2/OpenAISans-Regular.woff2',
            weight: 400,
            style: 'normal',
            display: 'swap',
          },
        ],
      },
    },
    composer: {
      placeholder: 'พิมพ์ข้อความส่งให้ผู้ช่วยการออกแบบโครงสร้างองค์กร',
      attachments: {
        enabled: true,
        maxCount: 5,
        maxSize: 10485760,
      },
    },
    startScreen: {
      greeting: 'ต้องการความช่วยเหลือด้านใดครับ',
      prompts: [
        {
          icon: 'circle-question',
          label: 'What is ChatKit?',
          prompt: 'What is ChatKit?',
        },
      ],
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
      <ChatKit control={control} style={{ height: '600px', width: '100%', maxWidth: '800px' }} />
    </div>
  );
}
