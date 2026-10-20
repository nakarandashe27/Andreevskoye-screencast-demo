const encoder = new TextEncoder();
export function validateManifest(m) {
  if (m?.version !== 1 || m.kdf !== 'PBKDF2' || m.hash !== 'SHA-256' || m.cipher !== 'AES-GCM' || m.tagLength !== 128 || m.iterations !== 600000 || m.payload !== 'model.enc') throw new Error('Unsupported encrypted model format');
  return m;
}
function decode64(value) { return Uint8Array.from(atob(value), c => c.charCodeAt(0)); }
export async function unlockBytes(manifest, bytes, login, password) {
  const m = validateManifest(manifest), salt = decode64(m.salt), iv = decode64(m.iv);
  if (salt.length !== 32 || iv.length !== 12) throw new Error('Invalid encryption parameters');
  const secret = encoder.encode(JSON.stringify([login.trim(), password]));
  try {
    const material = await crypto.subtle.importKey('raw', secret, 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({name:'PBKDF2', hash:m.hash, salt, iterations:m.iterations}, material, {name:'AES-GCM', length:256}, false, ['decrypt']);
    return await crypto.subtle.decrypt({name:'AES-GCM', iv, additionalData:encoder.encode(JSON.stringify(m)), tagLength:128}, key, bytes);
  } finally { secret.fill(0); }
}
