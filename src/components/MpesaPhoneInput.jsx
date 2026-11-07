'use client';

import { useState } from 'react';
import { validateMpesaNumber } from '@/lib/mpesaValidation';

/**
 * Drop-in input. `onValidChange(normalized | null)` fires on every change,
 * giving the parent the clean 254… number or null when invalid.
 */
export const MpesaPhoneInput = ({
  value,
  onChange,
  onValidChange,
  label = 'M-Pesa number',
  className = '',
}) => {
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
    <div className={`w-full ${className}`}>
      <label htmlFor="mpesa_number" className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        className={`w-full rounded-lg border px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 outline-none transition-colors focus:ring-2 ${
          showError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-300 focus:border-green-600 focus:ring-green-200'
        }`}
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
        <p id="mpesa_number_error" role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default MpesaPhoneInput;
