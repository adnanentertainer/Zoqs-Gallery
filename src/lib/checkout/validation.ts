export { validateFullName } from "@/lib/auth/validation";
import { isValidEmail } from "@/lib/auth/validation";

const CUSTOMER_NOTES_MAX_LENGTH = 500;

/**
 * Unlike auth's validateEmail (an account identifier, always required),
 * email at checkout is optional — phone is the primary delivery contact.
 * A blank value passes; a non-blank one still has to be a real address.
 */
export function validateCheckoutEmail(value: string): string | undefined {
  if (value.trim().length === 0) return undefined;
  return isValidEmail(value) ? undefined : "Enter a valid email address.";
}

/**
 * Accepts common Pakistani mobile formats: 03XXXXXXXXX (11 digits) or
 * +923XXXXXXXXX / 923XXXXXXXXX (country code form). Deliberately permissive
 * about spaces/dashes rather than rejecting otherwise-valid input.
 */
export function validatePakistaniPhone(value: string): string | undefined {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Phone number is required.";
  const digitsOnly = trimmed.replace(/[\s-]/g, "");
  const isValid =
    /^03\d{9}$/.test(digitsOnly) || /^(\+92|92)3\d{9}$/.test(digitsOnly);
  return isValid
    ? undefined
    : "Enter a valid Pakistani phone number (e.g. 03XXXXXXXXX).";
}

export function validateAddressLine1(value: string): string | undefined {
  return value.trim().length === 0 ? "Address is required." : undefined;
}

export function validateCity(value: string): string | undefined {
  return value.trim().length === 0 ? "City is required." : undefined;
}

export function validateProvince(value: string): string | undefined {
  return value.trim().length === 0 ? "Province is required." : undefined;
}

export function validateCustomerNotes(value: string): string | undefined {
  if (value.length > CUSTOMER_NOTES_MAX_LENGTH) {
    return `Notes must be ${CUSTOMER_NOTES_MAX_LENGTH} characters or fewer.`;
  }
  return undefined;
}

export { CUSTOMER_NOTES_MAX_LENGTH };
