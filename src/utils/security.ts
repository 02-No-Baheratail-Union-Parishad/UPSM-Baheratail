/**
 * Security Utility Module
 * Provides input sanitization, SQL/NoSQL injection protection, and length validation 
 * to prevent XSS, HTML injection, SQL/NoSQL injection, and payload overflow attacks.
 */

export function sanitizeInput(input: string | undefined | null, maxLength?: number): string {
  if (!input || typeof input !== "string") return "";
  
  let sanitized = input
    // Core HTML Escaping (XSS Prevention)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    // SQL Injection Protection: Escape comment markers (--), statement terminators (;), and block comment delimiters (/*, */)
    .replace(/--/g, "&#x2D;&#x2D;")
    .replace(/;/g, "&#x3B;")
    .replace(/\/\*/g, "&#x2F;&#x2A;")
    .replace(/\*\//g, "&#x2A;&#x2F;")
    // NoSQL Query Injection Protection: Escape dollar signs ($) to neutralize query operators ($ne, $gt, $where, etc.)
    .replace(/\$/g, "&#x24;");

  if (maxLength && maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Recursively sanitizes object inputs (arrays and nested objects) with optional string length caps.
 * Sanitizes both object values and keys to prevent NoSQL operator key injection.
 */
export function sanitizeObject<T>(data: T, maxStringLength: number = 2000): T {
  if (typeof data === "string") {
    // Preserve base64 image URIs
    if (data.startsWith("data:image/") && data.includes(";base64,")) {
      return data as T;
    }
    return sanitizeInput(data, maxStringLength) as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeObject(item, maxStringLength)) as unknown as T;
  }
  if (data !== null && typeof data === "object") {
    const result: Record<string, any> = {};
    for (const key of Object.keys(data as object)) {
      // Prevent NoSQL key operator injection (e.g., "$gt", "$ne", "$where")
      const safeKey = key.replace(/^\$/, "&#x24;").replace(/\./g, "&#x2E;");
      result[safeKey] = sanitizeObject((data as Record<string, any>)[key], maxStringLength);
    }
    return result as T;
  }
  return data;
}

/**
 * Validates external URLs to prevent Server-Side Request Forgery (SSRF).
 * Blocks internal loopback, private IPv4/IPv6 subnets, link-local addresses,
 * and non-HTTP(S) protocols.
 */
export function isSafeExternalUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== "string") return false;
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    const cleanHostname = hostname.replace(/^\[|\]$/g, "");

    // Check integer or hex IP representations (e.g. 2130706433 or 0x7f000001)
    let ipInt: number | null = null;
    if (/^\d+$/.test(cleanHostname)) {
      ipInt = parseInt(cleanHostname, 10);
    } else if (/^0x[0-9a-f]+$/i.test(cleanHostname)) {
      ipInt = parseInt(cleanHostname, 16);
    }

    if (ipInt !== null && !isNaN(ipInt)) {
      // 0.0.0.0/8
      if (ipInt >= 0 && ipInt <= 16777215) return false;
      // 10.0.0.0/8
      if (ipInt >= 167772160 && ipInt <= 184549375) return false;
      // 127.0.0.0/8
      if (ipInt >= 2130706432 && ipInt <= 2147483647) return false;
      // 169.254.0.0/16
      if (ipInt >= 2851995648 && ipInt <= 2852061183) return false;
      // 172.16.0.0/12
      if (ipInt >= 2886729728 && ipInt <= 2887778303) return false;
      // 192.168.0.0/16
      if (ipInt >= 3232235520 && ipInt <= 3232301055) return false;
    }

    const isLocalhost =
      cleanHostname === "localhost" ||
      cleanHostname === "127.0.0.1" ||
      cleanHostname === "0.0.0.0" ||
      cleanHostname === "::1" ||
      cleanHostname === "::" ||
      cleanHostname === "0:0:0:0:0:0:0:1" ||
      cleanHostname === "0:0:0:0:0:0:0:0";

    const isPrivateIpv4 =
      /^10\./.test(cleanHostname) ||
      /^127\./.test(cleanHostname) ||
      /^169\.254\./.test(cleanHostname) ||
      /^192\.168\./.test(cleanHostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(cleanHostname) ||
      /^0\./.test(cleanHostname);

    const isPrivateIpv6 =
      /^(fc|fd)/i.test(cleanHostname) ||
      /^fe80:/i.test(cleanHostname) ||
      /^::ffff:/i.test(cleanHostname);

    return !(isLocalhost || isPrivateIpv4 || isPrivateIpv6);
  } catch {
    return false;
  }
}
