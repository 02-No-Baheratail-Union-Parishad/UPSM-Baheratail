import { GoogleChatSpace, GoogleChatMessage, GoogleChatMembership, CertificateRecord, UnionParishadConfig } from '../types';
import { getGoogleAccessToken } from '../firebase';

const CHAT_API_BASE = 'https://chat.googleapis.com/v1';

export interface SendMessagePayload {
  spaceName: string;
  text: string;
}

export interface CreateSpacePayload {
  displayName: string;
  description?: string;
}

/**
 * Fetch all Google Chat spaces accessible by the authenticated user
 */
export async function fetchGoogleChatSpaces(token?: string): Promise<GoogleChatSpace[]> {
  const accessToken = token || getGoogleAccessToken();
  if (!accessToken) {
    throw new Error('গুগল চ্যাট অ্যাক্সেস টোকেন পাওয়া যায়নি। অনুগ্রহ করে গুগল একাউন্ট দিয়ে সাইন-ইন করুন।');
  }

  const response = await fetch(`${CHAT_API_BASE}/spaces`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP ${response.status} Error fetching spaces`;
    throw new Error(`Google Chat API ত্রুটি: ${message}`);
  }

  const data = await response.json();
  return data.spaces || [];
}

/**
 * Fetch recent messages for a specific space
 */
export async function fetchSpaceMessages(spaceName: string, token?: string, pageSize: number = 30): Promise<GoogleChatMessage[]> {
  const accessToken = token || getGoogleAccessToken();
  if (!accessToken) {
    throw new Error('গুগল চ্যাট অ্যাক্সেস টোকেন পাওয়া যায়নি।');
  }

  // Format: spaces/{spaceId}/messages
  const encodedSpace = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const response = await fetch(`${CHAT_API_BASE}/${encodedSpace}/messages?pageSize=${pageSize}&orderBy=createTime%20desc`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP ${response.status} Error fetching messages`;
    throw new Error(`বার্তা লোড করতে ত্রুটি: ${message}`);
  }

  const data = await response.json();
  const messages: GoogleChatMessage[] = data.messages || [];
  // Sort chronologically ascending for standard chat view
  return messages.reverse();
}

/**
 * Send a message to a Google Chat Space
 */
export async function sendChatMessageToSpace(
  spaceName: string, 
  text: string, 
  token?: string
): Promise<GoogleChatMessage> {
  const accessToken = token || getGoogleAccessToken();
  if (!accessToken) {
    throw new Error('গুগল চ্যাট অ্যাক্সেস টোকেন পাওয়া যায়নি।');
  }

  const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const response = await fetch(`${CHAT_API_BASE}/${cleanSpaceName}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.trim(),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP ${response.status} Error sending message`;
    throw new Error(`বার্তা প্রেরণ ব্যর্থ হয়েছে: ${message}`);
  }

  return await response.json();
}

/**
 * Create a new Google Chat Space for Union Parishad
 */
export async function createGoogleChatSpace(
  displayName: string,
  description?: string,
  token?: string
): Promise<GoogleChatSpace> {
  const accessToken = token || getGoogleAccessToken();
  if (!accessToken) {
    throw new Error('গুগল চ্যাট অ্যাক্সেস টোকেন পাওয়া যায়নি।');
  }

  const response = await fetch(`${CHAT_API_BASE}/spaces`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      displayName: displayName.trim(),
      spaceType: 'SPACE',
      spaceDetails: description ? { description: description.trim() } : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP ${response.status} Error creating space`;
    throw new Error(`নতুন চ্যাট স্পেস তৈরি করা সম্ভব হয়নি: ${message}`);
  }

  return await response.json();
}

/**
 * Fetch members of a space
 */
export async function fetchSpaceMemberships(spaceName: string, token?: string): Promise<GoogleChatMembership[]> {
  const accessToken = token || getGoogleAccessToken();
  if (!accessToken) {
    return [];
  }

  const cleanSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
  const response = await fetch(`${CHAT_API_BASE}/${cleanSpaceName}/members`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.memberships || [];
}

/**
 * Format a Certificate notification message for broadcasting to Google Chat
 */
export function formatCertificateChatNotification(cert: CertificateRecord, config: UnionParishadConfig): string {
  const dateStr = cert.issueDate || new Date().toLocaleDateString('bn-BD');
  const qrVerification = cert.verificationUrl || window.location.origin;

  return `🏛️ *${config.upName || 'ইউনিয়ন পরিষদ'} — নতুন প্রত্যয়নপত্র ইস্যু বিজ্ঞপ্তি*
━━━━━━━━━━━━━━━━━━━━
📄 *সনদের ধরন:* ${cert.typeLabel}
🔢 *স্মারক নম্বর:* \`${cert.memoNo}\`
👤 *নাগরিকের নাম:* ${cert.citizen?.name || 'অজ্ঞাত'}
📍 *গ্রাম ও ওয়ার্ড:* ${cert.citizen?.village || ''}, ওয়ার্ড নং ${cert.citizen?.wardNo || '০'}
📅 *ইস্যুর তারিখ:* ${dateStr}
💳 *ফি ও স্ট্যাটাস:* ${cert.feeAmount ? `৳${cert.feeAmount}` : 'বিনামূল্যে'} (${cert.status === 'approved' || cert.status === 'issued' ? '✅ অনুমোদিত' : '⏳ প্রক্রিয়াধীন'})
🔗 *যাচাইকরণ লিংক:* ${qrVerification}
━━━━━━━━━━━━━━━━━━━━
_স্বয়ংক্রিয়ভাবে ইউনিয়ন ডিজিটাল সেবা পোর্টাল থেকে প্রেরিত_`;
}
