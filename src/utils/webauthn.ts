import { WebAuthnPasskeyCredential } from '../types';

/**
 * Utility module for WebAuthn / Biometric (Touch ID, Face ID, Windows Hello, Android Biometrics)
 * authentication for official certificate issuance and admin-level high-security operations.
 */

// Helper to convert ArrayBuffer to Base64URL string
export function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Helper to convert Base64URL string to Uint8Array
export function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Checks if the browser supports WebAuthn API (window.PublicKeyCredential)
 */
export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential;
}

/**
 * Checks if a platform biometric authenticator (Touch ID, Face ID, Windows Hello, Fingerprint) is available
 */
export async function isPlatformBiometricAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch (err) {
    console.warn('Error checking platform authenticator availability:', err);
  }
  return false;
}

/**
 * Retrieve saved WebAuthn passkeys for an admin email from LocalStorage
 */
export function getStoredPasskeys(adminEmail: string): WebAuthnPasskeyCredential[] {
  if (typeof window === 'undefined') return [];
  try {
    const key = `bup_webauthn_passkeys_${adminEmail.toLowerCase().trim()}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading stored WebAuthn passkeys:', e);
    return [];
  }
}

/**
 * Save a new passkey credential to LocalStorage for an admin email
 */
export function savePasskeyToStorage(adminEmail: string, passkey: WebAuthnPasskeyCredential): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredPasskeys(adminEmail);
    const updated = [passkey, ...existing.filter(p => p.id !== passkey.id)];
    const key = `bup_webauthn_passkeys_${adminEmail.toLowerCase().trim()}`;
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving passkey to storage:', e);
  }
}

/**
 * Remove a passkey credential by ID
 */
export function deletePasskeyFromStorage(adminEmail: string, credentialId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredPasskeys(adminEmail);
    const updated = existing.filter(p => p.id !== credentialId);
    const key = `bup_webauthn_passkeys_${adminEmail.toLowerCase().trim()}`;
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting passkey from storage:', e);
  }
}

/**
 * Register a WebAuthn / Biometric Passkey on the admin's current device
 */
export async function registerWebAuthnPasskey(
  adminEmail: string,
  adminName: string
): Promise<{ success: boolean; passkey?: WebAuthnPasskeyCredential; message: string }> {
  if (!isWebAuthnSupported()) {
    return {
      success: false,
      message: 'আপনার ব্রাউজার বা ডিভাইসে WebAuthn / প্যাসকি প্রযুক্তি সমর্থিত নয়।'
    };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userIdBytes = new TextEncoder().encode(adminEmail);

    const creationOptions: CredentialCreationOptions = {
      publicKey: {
        challenge: challenge.buffer as ArrayBuffer,
        rp: {
          name: '০২নং বহেড়াতৈল ইউনিয়ন পরিষদ - BUP Digital Portal',
          id: window.location.hostname
        },
        user: {
          id: userIdBytes.buffer as ArrayBuffer,
          name: adminEmail,
          displayName: adminName || adminEmail
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'preferred',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      }
    };

    const credential = (await navigator.credentials.create(creationOptions)) as PublicKeyCredential | null;

    if (!credential) {
      return {
        success: false,
        message: 'বায়োমেট্রিক প্যাসকি তৈরি করা সম্ভব হয় নাই।'
      };
    }

    const rawIdBase64 = bufferToBase64Url(credential.rawId);
    const userAgent = navigator.userAgent;
    let deviceName = 'ডিভাইস বায়োমেট্রিক (Touch ID / Face ID / Windows Hello)';
    if (userAgent.includes('Macintosh')) deviceName = 'Mac Touch ID / Passkey';
    else if (userAgent.includes('Windows')) deviceName = 'Windows Hello Biometric';
    else if (userAgent.includes('Android')) deviceName = 'Android Biometric Sensor';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) deviceName = 'iOS Touch ID / Face ID';

    const newPasskey: WebAuthnPasskeyCredential = {
      id: credential.id,
      rawId: rawIdBase64,
      type: credential.type,
      deviceName,
      authenticatorAttachment: 'platform',
      registeredAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      userEmail: adminEmail.toLowerCase().trim()
    };

    savePasskeyToStorage(adminEmail, newPasskey);

    return {
      success: true,
      passkey: newPasskey,
      message: '✓ সফলভাবে আপনার ডিভাইসের বায়োমেট্রিক ফিঙ্গারপ্রিন্ট / WebAuthn প্যাসকি নিবন্ধিত হইয়াছে!'
    };
  } catch (err: any) {
    console.warn('WebAuthn Registration Error:', err);
    if (err.name === 'NotAllowedError' || err.message?.includes('cancelled')) {
      return {
        success: false,
        message: 'বায়োমেট্রিক নিবন্ধন বাতিল করা হয়েছে বা সময় পার হইয়া গিয়াছে।'
      };
    }
    return {
      success: false,
      message: `বায়োমেট্রিক নিবন্ধনে ত্রুটি: ${err.message || 'অজানা ত্রুটি'}`
    };
  }
}

/**
 * Verify WebAuthn / Biometric Passkey before performing an official admin action
 */
export async function verifyWebAuthnPasskey(
  adminEmail: string
): Promise<{
  success: boolean;
  authType: 'WebAuthn Passkey' | 'Platform Biometrics' | 'Biometric PIN';
  message: string;
  credentialId?: string;
}> {
  if (!isWebAuthnSupported()) {
    return {
      success: false,
      authType: 'WebAuthn Passkey',
      message: 'আপনার ডিভাইস বা ব্রাউজারে WebAuthn / বায়োমেট্রিক প্রযুক্তি চালু নেই।'
    };
  }

  try {
    const storedPasskeys = getStoredPasskeys(adminEmail);
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const allowCredentials: PublicKeyCredentialDescriptor[] = storedPasskeys.map(pk => ({
      id: base64UrlToUint8Array(pk.rawId).buffer as ArrayBuffer,
      type: 'public-key',
      transports: ['internal']
    }));

    const getOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: challenge.buffer as ArrayBuffer,
        timeout: 60000,
        userVerification: 'preferred',
        allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined
      }
    };

    const assertion = (await navigator.credentials.get(getOptions)) as PublicKeyCredential | null;

    if (assertion) {
      // Update last used timestamp for matching passkey
      if (storedPasskeys.length > 0) {
        const matched = storedPasskeys.find(pk => pk.id === assertion.id);
        if (matched) {
          matched.lastUsedAt = new Date().toISOString();
          savePasskeyToStorage(adminEmail, matched);
        }
      }

      return {
        success: true,
        authType: 'WebAuthn Passkey',
        credentialId: assertion.id,
        message: '✓ বায়োমেট্রিক ও WebAuthn প্যাসকি নিরাপত্তা যাচাই সফল হইয়াছে!'
      };
    } else {
      return {
        success: false,
        authType: 'WebAuthn Passkey',
        message: 'বায়োমেট্রিক ফিঙ্গারপ্রিন্ট বা প্যাসকি যাচাই করা সম্ভব হয় নাই।'
      };
    }
  } catch (err: any) {
    console.warn('WebAuthn Authentication Error:', err);
    if (err.name === 'NotAllowedError' || err.message?.includes('cancelled')) {
      return {
        success: false,
        authType: 'WebAuthn Passkey',
        message: 'বায়োমেট্রিক স্ক্যান বাতিল করা হইয়াছে।'
      };
    }
    return {
      success: false,
      authType: 'WebAuthn Passkey',
      message: `বায়োমেট্রিক যাচাইকরণে ত্রুটি: ${err.message || 'অজানা ত্রুটি'}`
    };
  }
}

/**
 * Security PIN Fallback verification (e.g. 6-digit Chairman / Secretary Official Master Security PIN)
 */
export function verifySecurityPin(inputPin: string, masterPin: string = '786021'): boolean {
  return inputPin.trim() === masterPin.trim();
}
