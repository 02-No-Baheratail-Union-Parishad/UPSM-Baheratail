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

