'use client';

import { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  name?: string;
  inputClassName?: string;
  /** Accessible name for the input itself (the visible label is rendered by the caller). */
  ariaLabel?: string;
}

const INPUT_CLASSES =
  'w-full bg-transparent border-b border-off-white/25 py-3.5 pr-12 text-[15px] text-off-white placeholder:text-off-white/25 outline-none focus:border-red transition-colors';

/**
 * Reusable password input with a touch-safe show/hide toggle.
 * - Masked by default, toggles between type="password" and type="text".
 * - Value is never modified during toggling; focus + cursor are preserved.
 * - Toggle is a real <button type="button"> with a 44px touch target.
 */
export function PasswordField({
  value,
  onChange,
  autoComplete = 'current-password',
  required,
  disabled,
  placeholder,
  id,
  name,
  inputClassName,
  ariaLabel,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggle = () => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? null;
    const end = el?.selectionEnd ?? null;
    setVisible((v) => !v);
    // Restore focus + caret after the type swap re-renders.
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus({ preventScroll: true });
      try {
        if (start !== null && end !== null) el.setSelectionRange(start, end);
      } catch {
        // setSelectionRange can throw for non-text inputs — ignore.
      }
    });
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(INPUT_CLASSES, inputClassName)}
      />
      <button
        type="button"
        onClick={toggle}
        // Prevent the input from blurring on mouse/touch press before click fires.
        onMouseDown={(e) => e.preventDefault()}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] text-off-white/50 hover:text-off-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded-full"
      >
        {visible ? (
          <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
