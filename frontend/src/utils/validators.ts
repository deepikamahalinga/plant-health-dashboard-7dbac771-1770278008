// Types for validation functions
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// Email validation
export const isEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? undefined : 'Invalid email format'
  };
};

// URL validation
export const isUrl = (url: string): ValidationResult => {
  try {
    new URL(url);
    return {
      isValid: true
    };
  } catch {
    return {
      isValid: false,
      message: 'Invalid URL format'
    };
  }
};

// Phone number validation
export const isPhoneNumber = (phone: string): ValidationResult => {
  // Supports formats: +1234567890, 123-456-7890, (123) 456-7890
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return {
    isValid: phoneRegex.test(phone),
    message: phoneRegex.test(phone) ? undefined : 'Invalid phone number format'
  };
};

// Minimum length validation
export const minLength = (value: string, min: number): ValidationResult => {
  return {
    isValid: value.length >= min,
    message: value.length >= min ? undefined : `Minimum length should be ${min} characters`
  };
};

// Maximum length validation
export const maxLength = (value: string, max: number): ValidationResult => {
  return {
    isValid: value.length <= max,
    message: value.length <= max ? undefined : `Maximum length should be ${max} characters`
  };
};

// Combined length validation
export const isLength = (value: string, min: number, max: number): ValidationResult => {
  const minCheck = minLength(value, min);
  if (!minCheck.isValid) return minCheck;
  
  const maxCheck = maxLength(value, max);
  if (!maxCheck.isValid) return maxCheck;
  
  return {
    isValid: true
  };
};

// String is not empty validation
export const isNotEmpty = (value: string): ValidationResult => {
  return {
    isValid: value.trim().length > 0,
    message: value.trim().length > 0 ? undefined : 'Value cannot be empty'
  };
};

// Numeric value validation
export const isNumeric = (value: string): ValidationResult => {
  const numericRegex = /^-?\d*\.?\d+$/;
  return {
    isValid: numericRegex.test(value),
    message: numericRegex.test(value) ? undefined : 'Value must be numeric'
  };
};