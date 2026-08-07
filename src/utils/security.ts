/**
 * Security Utility Module
 * Provides input sanitization and length validation to prevent XSS, HTML injection,
 * and payload overflow/injection attacks across form submission handlers.
 */

export function sanitizeInput(input: string | undefined | null, maxLength?: number): string {
  if (!input || typeof input !== "string") return "";
  
  let sanitized = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");

  if (maxLength && maxLength > 0 && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Recursively sanitizes object inputs (arrays and nested objects) with optional string length caps.
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
      result[key] = sanitizeObject((data as Record<string, any>)[key], maxStringLength);
    }
    return result as T;
  }
  return data;
}

