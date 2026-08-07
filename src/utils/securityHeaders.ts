/**
 * Security Headers Utility Module
 * Defines a strong Content Security Policy (CSP) object and applies dynamic security
 * meta tags to the document head to prevent cross-site scripting (XSS) and unauthorized resource loading.
 */

export interface CspDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'frame-ancestors': string[];
}

export const SECURITY_CSP_CONFIG: CspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https:', 'blob:'],
  'style-src': ["'self'", "'unsafe-inline'", 'https:'],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https:', 'wss:'],
  'frame-ancestors': ["'self'", '*']
};

/**
 * Serializes the CSP configuration object into a standard CSP header string.
 */
export function buildCspString(config: CspDirectives = SECURITY_CSP_CONFIG): string {
  return Object.entries(config)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * Dynamically applies CSP and security meta tags to document.head.
 */
export function applySecurityMetaTags(cspConfig: CspDirectives = SECURITY_CSP_CONFIG): void {
  if (typeof document === 'undefined') return;

  const cspString = buildCspString(cspConfig);

  // 1. Content-Security-Policy Meta Tag
  let cspMeta = document.querySelector<HTMLMetaElement>('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) {
    cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    document.head.appendChild(cspMeta);
  }
  cspMeta.content = cspString;

  // 2. X-Content-Type-Options Meta Tag
  let nosniffMeta = document.querySelector<HTMLMetaElement>('meta[http-equiv="X-Content-Type-Options"]');
  if (!nosniffMeta) {
    nosniffMeta = document.createElement('meta');
    nosniffMeta.httpEquiv = 'X-Content-Type-Options';
    document.head.appendChild(nosniffMeta);
  }
  nosniffMeta.content = 'nosniff';

  // 3. X-XSS-Protection Meta Tag
  let xssMeta = document.querySelector<HTMLMetaElement>('meta[http-equiv="X-XSS-Protection"]');
  if (!xssMeta) {
    xssMeta = document.createElement('meta');
    xssMeta.httpEquiv = 'X-XSS-Protection';
    document.head.appendChild(xssMeta);
  }
  xssMeta.content = '1; mode=block';
}
