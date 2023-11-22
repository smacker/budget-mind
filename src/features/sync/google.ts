import { atom, computed, onMount } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';
import { scopes as gdriveScopes } from '../../infra/storage/aspire/gdrive-api';
import { scopes as gsheetScopes } from '../../infra/storage/aspire/gsheet-api';

// Load google GSI library asynchronously

const $scriptLoadedSuccessfully = atom<boolean>(false);

onMount($scriptLoadedSuccessfully, () => {
  const scriptTag = document.createElement('script');
  scriptTag.src = 'https://accounts.google.com/gsi/client';
  scriptTag.async = true;
  scriptTag.defer = true;
  scriptTag.onload = () => {
    $scriptLoadedSuccessfully.set(true);
  };
  scriptTag.onerror = () => {
    $scriptLoadedSuccessfully.set(false);
  };

  document.body.appendChild(scriptTag);

  return () => {
    document.body.removeChild(scriptTag);
  };
});

// Create google token client instance

const scope = `openid profile email ${[...gdriveScopes, ...gsheetScopes].join(
  ' '
)}`;

const $googleClient = computed($scriptLoadedSuccessfully, (loaded) => {
  if (!loaded) return null;

  const client = window?.google?.accounts.oauth2.initTokenClient({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope,
    callback: (response) => {
      if (response.error) {
        console.error('token error', response.error);
        return;
      }

      $tokenHolder.set({
        token: response.access_token,
        expiresAt: new Date().getTime() + +response.expires_in * 1000,
      });
    },
    error_callback: (nonOAuthError) => {
      console.error('non oauth error', nonOAuthError);
    },
  });

  return client;
});

// Storing the token

interface AccessToken {
  token: string;
  expiresAt: number;
}

function isValidToken(token: AccessToken | null): boolean {
  if (!token) return false;

  return token.expiresAt > new Date().getTime();
}

const $tokenHolder = persistentAtom<AccessToken | null>('google-token', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Exported Auth API

export const $token = computed($tokenHolder, (token) =>
  token ? token.token : null
);

export const $isLoggedIn = computed(
  $tokenHolder,
  (token) => token && isValidToken(token)
);

export const $readyToLogin = computed($googleClient, (client) => !!client);

export const login = () => {
  const client = $googleClient.get();
  if (!client) {
    throw new Error('Google client not initialized');
  }

  $tokenHolder.set(null);
  client.requestAccessToken();
};

export const logout = () => {
  $tokenHolder.set(null);
};
