const DEFAULT_SECRET = 'nest-offline-cache-profile-v1';

function getSecret(): string {
  const configured = process.env.EXPO_PUBLIC_NEST_OFFLINE_CACHE_SECRET;
  if (typeof configured === 'string' && configured.length >= 12) {
    return configured;
  }

  return DEFAULT_SECRET;
}

function encodeBase64(value: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf-8').toString('base64');
  }

  if (typeof btoa === 'function') {
    return btoa(value);
  }

  return value;
}

function decodeBase64(value: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'base64').toString('utf-8');
  }

  if (typeof atob === 'function') {
    return atob(value);
  }

  return value;
}

function xorWithSecret(input: string, secret: string): string {
  let output = '';
  for (let index = 0; index < input.length; index += 1) {
    const keyCode = secret.charCodeAt(index % secret.length);
    const next = input.charCodeAt(index) ^ keyCode;
    output += String.fromCharCode(next);
  }

  return output;
}

export function encryptOfflineCachePayload<TValue>(value: TValue): string {
  const json = JSON.stringify(value);
  const encrypted = xorWithSecret(json, getSecret());
  return `enc.v1:${encodeBase64(encrypted)}`;
}

export function decryptOfflineCachePayload<TValue>(
  raw: string,
  fallback: TValue
): TValue {
  if (!raw) {
    return fallback;
  }

  if (!raw.startsWith('enc.v1:')) {
    try {
      return JSON.parse(raw) as TValue;
    } catch {
      return fallback;
    }
  }

  try {
    const payload = raw.slice('enc.v1:'.length);
    const encrypted = decodeBase64(payload);
    const json = xorWithSecret(encrypted, getSecret());
    return JSON.parse(json) as TValue;
  } catch {
    return fallback;
  }
}
