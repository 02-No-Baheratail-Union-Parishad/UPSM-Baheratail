/**
 * Security Utility Module
 * Provides input sanitization for escaping HTML characters to prevent XSS and code injection attacks.
 */

export function sanitizeInput(input: string | undefined | null): string {
  if (!input || typeof input !== "string") return "";
  
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
