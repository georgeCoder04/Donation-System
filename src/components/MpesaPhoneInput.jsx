import { useState } from 'react';

/**
 * Safaricom (M-Pesa Kenya) phone validation + ready-to-use input component.
 *
 * Accepts: +254712345678, 254712345678, 00254712345678, 0712345678,
 *          712345678, "0712 345 678", "+254 (712) 345-678"
 * Returns the Daraja API format: 2547XXXXXXXX / 2541XXXXXXXX
 * Rejects foreign numbers (+30, +44, +255...) and non-Safaricom Kenyan numbers.
 *
 * Safaricom adds prefixes over time — re-check the ranges periodically.
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

/**
 * Drop-in input. `onValidChange(normalized | null)` fires on every change,
 * giving the parent the clean 254… number or null when invalid.
 */
export const MpesaPhoneInput = ({ value, onChange, onValidChange, label = 'M-Pesa number' }) => {
  const [touched, setTouched] = useState(false);

  // Derived from `value`, so it stays correct if the parent resets or
  // pre-fills the field, and an empty field shows "required" on blur.
  const result = validateMpesaNumber(value ?? '');
  const error = result.valid ? '' : result.error;

  const handleChange = (event) => {
    const next = event.target.value;
    onChange?.(next);

    const nextResult = validateMpesaNumber(next);
    onValidChange?.(nextResult.valid ? nextResult.normalized : null);
  };

  const showError = touched && Boolean(error);

  return (
    <div className="mpesa-field">
      <label htmlFor="mpesa_number">{label}</label>
      <input
        id="mpesa_number"
        name="mpesa_number"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0712 345 678"
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        aria-invalid={Boolean(showError)}
        aria-describedby={showError ? 'mpesa_number_error' : undefined}
      />
      {showError && (
        <p id="mpesa_number_error" role="alert" className="mpesa-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default MpesaPhoneInput;
