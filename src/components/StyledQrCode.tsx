import React, { useEffect, useRef, useState } from 'react';
import { 
  renderStyledQrToCanvas, 
  QrColorScheme, 
  QrStyleConfig, 
  QR_COLOR_PRESETS 
} from '../utils/qrCodeGenerator';
import { ShieldCheck, Download, ExternalLink, Sparkles, Check } from 'lucide-react';

export interface StyledQrCodeProps {
  value: string;
  colorScheme?: QrColorScheme;
  customDarkColor?: string;
  customLightColor?: string;
  embedLogo?: boolean;
  logoUrl?: string;
  logoShape?: 'circle' | 'rounded';
  frameStyle?: 'clean' | 'badge' | 'double' | 'minimal';
  size?: number;
  className?: string;
  showVerificationBadge?: boolean;
  checksum?: string;
  interactive?: boolean;
  onQrClick?: () => void;
}

export const StyledQrCode: React.FC<StyledQrCodeProps> = ({
  value,
  colorScheme = 'govt-emerald',
  customDarkColor,
  customLightColor,
  embedLogo = true,
  logoUrl = '/baheratail_seal.svg',
  logoShape = 'circle',
  frameStyle = 'clean',
  size = 72,
  className = '',
  showVerificationBadge = false,
  checksum,
  interactive = true,
  onQrClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (canvasRef.current && value) {
      renderStyledQrToCanvas(canvasRef.current, value, {
        colorScheme: colorScheme as QrColorScheme,
        customDarkColor,
        customLightColor,
        embedLogo,
        logoUrl,
        logoShape: logoShape as 'circle' | 'rounded',
        frameStyle: frameStyle as 'clean' | 'badge' | 'double' | 'minimal',
        size: Math.max(size * 2, 256), // 2x resolution for retina print quality
        errorCorrectionLevel: 'H'
      })
        .then(() => {
          if (isMounted) {
            setIsRendered(true);
            setRenderError(null);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error('Failed to render styled QR code:', err);
            setRenderError(err.message || 'QR Rendering Error');
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [value, colorScheme, customDarkColor, customLightColor, embedLogo, logoUrl, logoShape, size]);

  const preset = QR_COLOR_PRESETS[colorScheme] || QR_COLOR_PRESETS['govt-emerald'];
  const darkColor = colorScheme === 'custom' && customDarkColor ? customDarkColor : preset.dark;

  // Frame Styles
  const getFrameClasses = () => {
    switch (frameStyle) {
      case 'double':
        return 'p-1.5 bg-white border-2 border-emerald-900 rounded-xl outline outline-1 outline-emerald-700/50 shadow-sm';
      case 'badge':
        return 'p-1.5 bg-white border border-slate-300 rounded-xl shadow-md';
      case 'minimal':
        return 'p-0.5 bg-transparent border-0';
      case 'clean':
      default:
        return 'p-1 bg-white border-2 rounded-lg shadow-sm';
    }
  };

  const downloadQrImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `QR_Verification_${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className={`styled-qr-container inline-flex flex-col items-center select-none ${className}`}>
      <div 
        className={`qr-frame relative transition-all duration-200 group ${getFrameClasses()} ${
          interactive ? 'cursor-pointer hover:scale-[1.03]' : ''
        }`}
        style={{ borderColor: frameStyle === 'clean' ? darkColor : undefined }}
        onClick={onQrClick}
        title="অনলাইন সত্যতা যাচাই করতে ক্লিক বা স্ক্যান করুন"
      >
        <canvas
          ref={canvasRef}
          className="qr-canvas block rounded"
          style={{ width: `${size}px`, height: `${size}px` }}
        />

        {/* Optional Interactive Hover Overlay for Download / Open */}
        {interactive && (
          <div className="absolute inset-0 bg-emerald-950/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 print:hidden p-1">
            <span className="text-[8px] font-bold text-amber-300 text-center leading-tight">
              অনলাইন যাচাই
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={downloadQrImage}
                className="p-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[9px] flex items-center justify-center transition"
                title="QR কোড ডাউনলোড করুন"
              >
                <Download className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Optional Under-QR Verification & Checksum Details */}
      {showVerificationBadge && (
        <div className="mt-1 text-center">
          <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold text-emerald-950">
            <ShieldCheck className="w-3 h-3 text-emerald-700 shrink-0" />
            <span>ডিজিটাল সত্যতা যাচাই</span>
          </div>
          {checksum && (
            <p className="text-[8px] font-mono text-slate-700 font-bold bg-slate-100 px-1 py-0.5 rounded border border-slate-300 inline-block my-0.5 max-w-[110px] truncate">
              {checksum}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
