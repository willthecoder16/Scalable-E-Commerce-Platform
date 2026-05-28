// Deterministic gradient + emoji art for products (no image assets needed)

const GRADIENTS = [
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #c2b8ff 0%, #e7c6ff 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function gradientFor(key: string): string {
  return GRADIENTS[hash(key) % GRADIENTS.length];
}

export function emojiFor(name?: string, category?: string): string {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();
  const both = `${n} ${c}`;

  // Most specific matches first (based on product name)
  if (/drone|aerial/.test(n)) return '🚁';
  if (/doorbell/.test(n)) return '🔔';
  if (/thermostat|climate/.test(n)) return '🌡️';
  if (/bulb|light/.test(n)) return '💡';
  if (/lamp/.test(n)) return '🛋️';
  if (/desk(?!top)|standing desk/.test(n)) return '🪑';
  if (/chair/.test(n)) return '🪑';
  if (/notebook|paper|journal/.test(n)) return '📓';
  if (/monitor|ultrawide|display/.test(n)) return '🖥️';
  if (/laptop|ultrabook|macbook/.test(n)) return '💻';
  if (/tablet|slate|ipad/.test(n)) return '📱';
  if (/turntable|vinyl/.test(n)) return '🎵';
  if (/webcam/.test(n)) return '🎥';
  if (/camera|mirrorless|action cam/.test(n)) return '📷';
  if (/controller|gamepad/.test(n)) return '🎮';
  if (/headset/.test(n)) return '🎧';
  if (/keyboard/.test(n)) return '⌨️';
  if (/mouse/.test(n)) return '🖱️';
  if (/speaker|boombox/.test(n)) return '🔊';
  if (/earbud|earphone|airpod/.test(n)) return '🎧';
  if (/headphone/.test(n)) return '🎧';
  if (/watch/.test(n)) return '⌚';
  if (/band|tracker|fit/.test(n)) return '⌚';
  if (/cable/.test(n)) return '🔌';
  if (/hub|adapter|dock/.test(n)) return '🔌';
  if (/charg|power|battery|magsafe/.test(n)) return '🔋';
  if (/voice|assistant|smart speaker|hub/.test(n)) return '🔊';

  // Fall back to category
  if (/audio/.test(c)) return '🎧';
  if (/wearable/.test(c)) return '⌚';
  if (/computer/.test(c)) return '💻';
  if (/gaming/.test(c)) return '🎮';
  if (/camera/.test(c)) return '📷';
  if (/smart home/.test(c)) return '🏠';
  if (/home office|office/.test(c)) return '🪑';
  if (/accessor/.test(c)) return '🔌';
  if (/electronic/.test(both)) return '🔋';
  if (/cloth|shirt|wear|apparel/.test(both)) return '👕';
  return '📦';
}
