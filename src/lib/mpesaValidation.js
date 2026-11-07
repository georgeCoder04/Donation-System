/**
 * Safaricom (M-Pesa Kenya) phone number validation.
 * Plain JS (no React) so both the form and the API route can import it.
 *
 * Accepts: 0712345678, +254712345678, 254712345678, 00254712345678,
 *          +254 0712 345 678, 712345678, numbers with spaces/dashes/brackets.
 * Returns { valid: true, normalized: "2547XXXXXXXX" } or { valid: false, error }.
 *
 * Safaricom adds prefixes over time - re-check the ranges periodically.
 */
 
// 3-digit network prefix + 6 digits. Ranges: 700-729, 740-743, 745, 746, 748,
// 757-759, 768-769, 790-799, 110-115.
export const SAFARICOM_SUBSCRIBER = /^(?:7(?:[0129]\d|4[0-35-68]|5[7-9]|6[89])|11[0-5])\d{6}$/;
 
// Optional +254 / 00254 / 254, then an optional trunk 0 (so "+254 0712…"
// also works), then capture the 9 subscriber digits.
const KENYA_FORMAT = /^(?:(?:\+|00)?254)?0?([17]\d{8})$/;
 
// Starts with + or 00 but is NOT Kenya.
const FOREIGN_FORMAT = /^(?:\+|00)(?!254)\d{1,3}/;
 
export const validateMpesaNumber = (input) => {
  if (typeof input !== 'string' || !input.trim()) {
    return { valid: false, error: 'Phone number is required.' };
  }
 
  if (/[a-z]/i.test(input)) {
    return { valid: false, error: 'Phone number may only contain digits and a leading +.' };
  }
 
  // Keep a leading + and digits only. This also strips invisible/unusual
  // characters from copy-paste (non-breaking spaces, en dashes, slashes...).
  const trimmed = input.trim();
  const cleaned = (trimmed.startsWith('+') ? '+' : '') + trimmed.replace(/\D/g, '');
 
  if (FOREIGN_FORMAT.test(cleaned)) {
    return {
      valid: false,
      error: 'M-Pesa only supports Kenyan Safaricom numbers (+254). International numbers are not accepted.',
    };
  }
 
  const match = cleaned.match(KENYA_FORMAT);
  if (!match) {
    return { valid: false, error: 'Enter a valid Kenyan number, e.g. 0712 345 678 or +254 712 345 678.' };
  }
 
  const subscriber = match[1];
  if (!SAFARICOM_SUBSCRIBER.test(subscriber)) {
    return { valid: false, error: 'This number is not on the Safaricom network, so it cannot receive M-Pesa prompts.' };
  }
 
  return { valid: true, normalized: `254${subscriber}` };
};
 
