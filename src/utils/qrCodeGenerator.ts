import QRCode from 'qrcode';

export type QrColorScheme = 
  | 'classic-black' 
  | 'govt-emerald' 
  | 'emerald-gold' 
  | 'govt-crimson' 
  | 'navy-slate' 
  | 'teal-cyan' 
  | 'custom';

export interface QrStyleConfig {
  colorScheme?: QrColorScheme;
  customDarkColor?: string;
  customLightColor?: string;
  embedLogo?: boolean;
  logoUrl?: string;
  logoShape?: 'circle' | 'rounded';
  frameStyle?: 'clean' | 'badge' | 'double' | 'minimal';
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export const QR_COLOR_PRESETS: Record<QrColorScheme, { label: string; dark: string; light: string; border: string; description: string }> = {
  'govt-emerald': {
    label: '🏛️ সরকারি গাঢ় সবুজ (Govt Emerald)',
    dark: '#064e3b',
    light: '#ffffff',
    border: '#065f46',
    description: 'বাংলাদেশ সরকার ও ইউনিয়ন পরিষদের ঐতিহ্যবাহী দাপ্তরিক সবুজ'
  },
  'classic-black': {
    label: '⬛ ক্লাসিক কালো (Classic Black)',
    dark: '#000000',
    light: '#ffffff',
    border: '#334155',
    description: 'সর্বোচ্চ কনট্রাস্ট ও সর্বজনীন স্ক্যানযোগ্য ক্লাসিক্যাল কিউআর'
  },
  'emerald-gold': {
    label: '✨ রয়্যাল এমারেল্ড ও গোল্ডেন (Royal Emerald)',
    dark: '#047857',
    light: '#fffdf0',
    border: '#d97706',
    description: 'অভিজাত রয়্যাল গ্রিন ব্যাকগ্রাউন্ডে হালকা সোনালী আভা'
  },
  'govt-crimson': {
    label: '🔴 সরকারি লাল / মেরুন (Govt Crimson)',
    dark: '#991b1b',
    light: '#ffffff',
    border: '#b91c1c',
    description: 'অফিশিয়াল মেমোরেন্ডাম ও সিকিউরিটি সিলের সাথে মানানসই মেরুন'
  },
  'navy-slate': {
    label: '🟦 ডিপ নেভি স্লেট (Deep Navy)',
    dark: '#0f172a',
    light: '#ffffff',
    border: '#1e293b',
    description: 'আধুনিক স্মার্ট গভর্নেন্স ও কর্পোরেট স্ট্যান্ডার্ড নেভি ব্লু'
  },
  'teal-cyan': {
    label: '🌐 ডিজিটাল টিল (Digital Teal)',
    dark: '#0f766e',
    light: '#f0fdfa',
    border: '#14b8a6',
    description: 'ডিজিটাল বাংলাদেশ ও স্মার্ট সেবা পোর্টালে ব্যবহৃত আধুনিক টিল'
  },
  'custom': {
    label: '🎨 কাস্টম কালার প্যালেট (Custom)',
    dark: '#064e3b',
    light: '#ffffff',
    border: '#065f46',
    description: 'পছন্দমতো যেকোনো ডার্ক ও লাইট কালার নির্বাচন করুন'
  }
};

/**
 * Generate a styled QR Code directly onto an HTML Canvas element
 */
export async function renderStyledQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: QrStyleConfig = {}
): Promise<void> {
  const {
    colorScheme = 'govt-emerald',
    customDarkColor,
    customLightColor,
    embedLogo = true,
    logoUrl = '/baheratail_seal.svg',
    logoShape = 'circle',
    size = 256,
    errorCorrectionLevel = 'H' // High error correction (30%) is vital when center logo is embedded
  } = options;

  const preset = QR_COLOR_PRESETS[colorScheme] || QR_COLOR_PRESETS['govt-emerald'];
  const darkColor = colorScheme === 'custom' && customDarkColor ? customDarkColor : preset.dark;
  const lightColor = colorScheme === 'custom' && customLightColor ? customLightColor : preset.light;

  // Set internal resolution for crisp high-DPI rendering
  const renderWidth = Math.max(size, 256);
  canvas.width = renderWidth;
  canvas.height = renderWidth;

  // 1. Generate base QR Code on Canvas
  await QRCode.toCanvas(canvas, text, {
    errorCorrectionLevel,
    margin: 1,
    width: renderWidth,
    color: {
      dark: darkColor,
      light: lightColor
    }
  });

  // 2. If Logo Embedding is enabled, draw the center logo with a safety badge
  if (embedLogo && logoUrl) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => {
          // If custom logo fails to load, fallback to default seal SVG
          if (logoUrl !== '/baheratail_seal.svg') {
            img.src = '/baheratail_seal.svg';
          } else {
            reject(new Error('Failed to load logo for QR code'));
          }
        };
        img.src = logoUrl;
      });

      // Calculate center badge dimensions (22% of total QR dimension is ideal for error correction H)
      const badgeSize = Math.floor(renderWidth * 0.23);
      const center = renderWidth / 2;
      const x = center - badgeSize / 2;
      const y = center - badgeSize / 2;
      const radius = logoShape === 'circle' ? badgeSize / 2 : Math.floor(badgeSize * 0.22);

      // Save context
      ctx.save();

      // Draw background safety badge with crisp shadow/border to separate logo from QR modules
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;

      if (logoShape === 'circle') {
        ctx.beginPath();
        ctx.arc(center, center, radius + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = Math.max(1.5, renderWidth * 0.008);
        ctx.stroke();
      } else {
        // Rounded rectangle badge
        ctx.beginPath();
        roundRect(ctx, x - 2, y - 2, badgeSize + 4, badgeSize + 4, radius + 2);
        ctx.fill();
        ctx.strokeStyle = darkColor;
        ctx.lineWidth = Math.max(1.5, renderWidth * 0.008);
        ctx.stroke();
      }

      // Reset shadow for logo drawing
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Clip and draw image
      ctx.beginPath();
      if (logoShape === 'circle') {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      } else {
        roundRect(ctx, x, y, badgeSize, badgeSize, radius);
      }
      ctx.clip();

      // Draw image inside clip
      ctx.drawImage(img, x, y, badgeSize, badgeSize);
      ctx.restore();
    } catch (err) {
      console.warn('QR Code center logo embed fallback notice:', err);
    }
  }
}

/**
 * Helper to draw a rounded rectangle on a canvas context
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generate a Styled QR Code Data URL string
 */
export async function generateStyledQrDataUrl(
  text: string,
  options: QrStyleConfig = {}
): Promise<string> {
  const canvas = document.createElement('canvas');
  await renderStyledQrToCanvas(canvas, text, options);
  return canvas.toDataURL('image/png');
}
