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
          '"OpenAI Sans", "Noto Sans Thai", "Sarabun", "Prompt", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
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
      greeting: 'ต้องการความช่วยเหลือด้านใดครับ/คะ',
      prompts: [
        {
          icon: 'chart',
          label: 'ขอคำแนะนำโครงสร้างองค์กร',
          prompt: 'ช่วยแนะนำโครงสร้างองค์กรสำหรับธุรกิจของเรา พร้อมบทบาทหลักและสายบังคับบัญชา',
        },
        {
          icon: 'compass',
          label: 'เริ่มต้นออกแบบโครงสร้างสำหรับธุรกิจใหม่',
          prompt: 'ขอคำถามเพื่อช่วยกำหนดโครงสร้างองค์กรสำหรับธุรกิจใหม่ของเรา',
        },
        {
          icon: 'profile-card',
          label: 'ออกแบบระดับตำแหน่ง (IC/Manager)',
          prompt: 'ช่วยออกแบบระดับตำแหน่ง IC และ Manager พร้อมเกณฑ์แต่ละระดับให้เหมาะกับบริษัทเรา',
        },
        {
          icon: 'sparkle',
          label: 'เปรียบเทียบโครงสร้าง',
          prompt: 'ช่วยเปรียบเทียบโครงสร้างแบบ functional กับ product pod สำหรับบริษัทขนาดเล็ก-กลาง',
        },
        {
          icon: 'search',
          label: 'สรุปโครงสร้างปัจจุบัน (S.Napa/Gusco/GEM)',
          prompt: 'ช่วยสรุปโครงสร้างปัจจุบันของ GEM จากข้อมูลที่มี และอธิบายเหตุผลของโครงสร้างนั้น',
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
        console.log('chatkit widget action', JSON.stringify(action, null, 2));

        try {
          const payload = action.payload;

          // Handle guided choice select (asean pattern)
          if (action.type === 'guided_choice.select' || action.type === 'asean.select') {
            const id = payload?.optionId || payload?.id;
            if (typeof id === 'string') {
              await sendUserMessage({ text: `Selected: ${id}` });
            }
            return;
          }

          // Handle guided choice free text submit
          if (action.type === 'guided_choice.free_text_submit' || action.type === 'asean.custom_submit') {
            const custom = payload?.custom || payload?.text;
            if (typeof custom === 'string' && custom.trim()) {
              await sendUserMessage({ text: custom.trim() });
            }
            return;
          }

          // Handle intake form submit
          if (action.type === 'intake.submit') {
            const formatKey = (key: string): string => {
              return key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
            };

            const formatValue = (value: string): string => {
              return value.replace(/_/g, ' ');
            };

            const extractFields = (obj: Record<string, unknown>): string[] => {
              const lines: string[] = [];
              for (const [key, value] of Object.entries(obj)) {
                if (key === 'widgetId' || key === 'includeFields') continue;
                if (value === '' || value === null || value === undefined) continue;
                if (typeof value === 'object' && value !== null) {
                  lines.push(...extractFields(value as Record<string, unknown>));
                } else {
                  lines.push(`- ${formatKey(key)}: ${formatValue(String(value))}`);
                }
              }
              return lines;
            };

            const fields = extractFields(payload || {});
            const text = fields.length > 0
              ? `User submitted intake form:\n${fields.join('\n')}`
              : 'User submitted intake form.';

            console.log('Sending intake message:', text);
            await sendUserMessage({ text });
            console.log('Intake message sent');
            return;
          }

          // Handle intake cancel
          if (action.type === 'intake.cancel') {
            await sendUserMessage({ text: 'User cancelled the intake form.' });
            return;
          }

          console.log('No matching handler for action type:', action.type);
        } catch (err) {
          console.error('Failed to handle action:', err);
        }
      },
    },
  });

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h1 className="chat-title">Org Design Assistant</h1>
      </div>
      <ChatKit
        control={control}
        className="chatkit-frame"
        style={{ width: '100%', height: 'min(82vh, 900px)', minHeight: 620, display: 'block' }}
      />
    </div>
  );
}
