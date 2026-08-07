/**
 * Form Validation Utility Module
 * Provides schema validation logic and React hooks for NID, Birth Registration numbers,
 * phone numbers, and certificate form submissions.
 */

import { useState, useCallback } from 'react';
import { toEnglishNumeral } from '../lib/utils';

/**
 * Converts input digits (English or Bengali) into clean English numeric characters.
 */
export function normalizeDigits(input: string | undefined | null): string {
  if (!input) return '';
  const converted = toEnglishNumeral(input);
  return converted.replace(/\D/g, '');
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validates Bangladeshi National ID (NID) number.
 * Valid lengths: 10 (Smart Card NID), 13 (Legacy NID), or 17 (Legacy NID with birth year prefix).
 */
export function validateNid(nid: string, isRequired = false): ValidationResult {
  const trimmed = nid ? nid.trim() : '';
  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, message: 'এনআইডি (NID) নম্বর প্রদান করা আবশ্যক।' };
    }
    return { isValid: true };
  }

  const clean = normalizeDigits(trimmed);
  if (!clean) {
    return { isValid: false, message: 'এনআইডি (NID) নম্বরে শুধুমাত্র ডিজিট থাকতে পারবে।' };
  }

  if (![10, 13, 17].includes(clean.length)) {
    return {
      isValid: false,
      message: `এনআইডি (NID) নম্বর অকার্যকর! জাতীয় পরিচয়পত্র নম্বর ১০, ১৩ অথবা ১৭ সংখ্যার হওয়া আবশ্যক (বর্তমানে ${clean.length} ডিজিট)।`
    };
  }

  return { isValid: true };
}

/**
 * Validates Birth Registration Number (জন্ম নিবন্ধন নম্বর).
 * Standard required length: exactly 17 digits.
 */
export function validateBirthNo(birthNo: string, isRequired = false): ValidationResult {
  const trimmed = birthNo ? birthNo.trim() : '';
  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, message: 'জন্ম নিবন্ধন নম্বর প্রদান করা আবশ্যক।' };
    }
    return { isValid: true };
  }

  const clean = normalizeDigits(trimmed);
  if (!clean) {
    return { isValid: false, message: 'জন্ম নিবন্ধন নম্বরে শুধুমাত্র ডিজিট থাকতে পারবে।' };
  }

  if (clean.length !== 17) {
    return {
      isValid: false,
      message: `জন্ম নিবন্ধন নম্বর অকার্যকর! জন্ম নিবন্ধন নম্বর অবশ্যই ১৭ সংখ্যার হতে হবে (বর্তমানে ${clean.length} ডিজিট)।`
    };
  }

  return { isValid: true };
}

/**
 * Validates Bangladeshi Mobile Phone Number.
 * Format: 11 digits starting with "01" (operators 013-019).
 */
export function validatePhone(phone: string, isRequired = false): ValidationResult {
  const trimmed = phone ? phone.trim() : '';
  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, message: 'মোবাইল নম্বর প্রদান করা আবশ্যক।' };
    }
    return { isValid: true };
  }

  const clean = normalizeDigits(trimmed);
  if (!clean) {
    return { isValid: false, message: 'মোবাইল নম্বরে শুধুমাত্র ডিজিট থাকতে পারবে।' };
  }

  let normalizedMobile = clean;
  if (normalizedMobile.startsWith('8801')) {
    normalizedMobile = normalizedMobile.substring(2);
  }

  if (normalizedMobile.length !== 11 || !/^01[3-9]\d{8}$/.test(normalizedMobile)) {
    return {
      isValid: false,
      message: 'মোবাইল নম্বর অকার্যকর! বাংলাদেশি মোবাইল নম্বর ০১ দিয়ে শুরু এবং ১১ ডিজিটের হওয়া আবশ্যক (যেমন: 01711223344)।'
    };
  }

  return { isValid: true };
}

export interface CertificateFormDataToValidate {
  name: string;
  mother: string;
  father?: string;
  spouseName?: string;
  village?: string;
  nid?: string;
  birthNo?: string;
  mobile?: string;
  simpleFields?: Record<string, string>;
  requiredSimpleFields?: Array<{ key: string; label: string; required?: boolean }>;
}

/**
 * Validates full Certificate Form payload schema and returns validation errors object.
 */
export function validateCertificateFormData(data: CertificateFormDataToValidate): {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
} {
  const errors: Record<string, string> = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'আবেদনকারীর পূর্ণ নাম প্রদান করা আবশ্যক।';
  }

  if (!data.mother || !data.mother.trim()) {
    errors.mother = 'আবেদনকারীর মাতার নাম প্রদান করা আবশ্যক।';
  }

  if ((!data.father || !data.father.trim()) && (!data.spouseName || !data.spouseName.trim())) {
    errors.father = 'পিতার নাম অথবা স্বামী/স্ত্রীর নাম—অন্তত একটি প্রদান করুন।';
  }

  if (!data.village || !data.village.trim()) {
    errors.village = 'গ্রাম / এলাকার নাম প্রদান করুন।';
  }

  if (data.nid) {
    const nidVal = validateNid(data.nid);
    if (!nidVal.isValid && nidVal.message) {
      errors.nid = nidVal.message;
    }
  }

  if (data.birthNo) {
    const birthVal = validateBirthNo(data.birthNo);
    if (!birthVal.isValid && birthVal.message) {
      errors.birthNo = birthVal.message;
    }
  }

  if (data.mobile) {
    const phoneVal = validatePhone(data.mobile);
    if (!phoneVal.isValid && phoneVal.message) {
      errors.mobile = phoneVal.message;
    }
  }

  if (data.requiredSimpleFields && data.simpleFields) {
    for (const field of data.requiredSimpleFields) {
      if (field.required && (!data.simpleFields[field.key] || !data.simpleFields[field.key].trim())) {
        errors[field.key] = `"${field.label}" ফিল্ডটি পূরণ করা আবশ্যক।`;
      }
    }
  }

  const errorKeys = Object.keys(errors);
  const isValid = errorKeys.length === 0;
  const firstError = isValid ? undefined : errors[errorKeys[0]];

  return { isValid, errors, firstError };
}

/**
 * Custom React Hook for form validation and live field error tracking.
 */
export function useCertificateValidation() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: string, isRequired = false): string | null => {
    let result: ValidationResult = { isValid: true };
    if (field === 'nid') {
      result = validateNid(value, isRequired);
    } else if (field === 'birthNo') {
      result = validateBirthNo(value, isRequired);
    } else if (field === 'mobile') {
      result = validatePhone(value, isRequired);
    }

    if (!result.isValid && result.message) {
      setFieldErrors(prev => ({ ...prev, [field]: result.message! }));
      return result.message;
    } else {
      setFieldErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
      return null;
    }
  }, []);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  return {
    fieldErrors,
    setFieldErrors,
    validateField,
    validateNid,
    validateBirthNo,
    validatePhone,
    validateCertificateFormData,
    clearErrors
  };
}
