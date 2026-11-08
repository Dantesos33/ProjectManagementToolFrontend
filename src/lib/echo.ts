import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window { Pusher: typeof Pusher }
}
window.Pusher = Pusher;

interface EchoDeps {
  getToken: () => string | null;
  refreshToken: () => Promise<string | null>;
}

let instance: Echo<'reverb'> | null = null;

type EchoOptions = ConstructorParameters<typeof Echo<'reverb'>>[0];

function postAuth(url: string, token: string | null, socketId: string, channelName: string) {
  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ socket_id: socketId, channel_name: channelName }),
  });
}

export function connectEcho({ getToken, refreshToken }: EchoDeps): Echo<'reverb'> {
  if (instance) return instance;

  const authUrl = `${import.meta.env.VITE_API_URL}/broadcasting/auth`;
  const port = Number(import.meta.env.VITE_REVERB_PORT ?? 8080);

  const options = {
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: port,
    wssPort: port,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel: { name: string }) => ({
      authorize: (socketId: string, callback: (error: Error | null, data: unknown) => void) => {
        (async () => {
          let res = await postAuth(authUrl, getToken(), socketId, channel.name);

          if (res.status === 401) {
            const fresh = await refreshToken();
            if (fresh) res = await postAuth(authUrl, fresh, socketId, channel.name);
          }

          if (!res.ok) throw new Error(`Broadcast auth failed (${res.status})`);
          callback(null, await res.json());
        })().catch((err: unknown) =>
          callback(err instanceof Error ? err : new Error('Broadcast auth failed'), null),
        );
      },
    }),
  } as EchoOptions;

  instance = new Echo(options);

  return instance;
}

export function disconnectEcho(): void {
  instance?.disconnect();
  instance = null;
}

export const getEcho = (): Echo<'reverb'> | null => instance;

export const getSocketId = (): string | undefined => instance?.socketId();