export async function sha256(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

export function bytesToString(bytes: Uint8Array) {
  const array = Array.from(new Uint8Array(bytes));
  return array.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
