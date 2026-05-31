"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Eye, EyeSlash, Calendar } from "iconsax-reactjs";
import { cn } from "@/lib/utils";
import { PRIMARY_COLOR } from "@/lib/constants";

type Dir = "ltr" | "rtl";

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string | boolean;
  leftIcon?: React.ReactNode;
  focusBorderColor?: string;
  /** Force direction for this field only (fallbacks to locale) */
  direction?: Dir;
}

function Input({
  className,
  type,
  error,
  leftIcon,
  label,
  focusBorderColor = PRIMARY_COLOR,
  id,
  direction,
  ...props
}: InputProps) {
  const locale = useLocale();
  const derivedDir: Dir = (direction ??
    (locale === "ar" ? "rtl" : "ltr")) as Dir;
  const isRTL = derivedDir === "rtl";

  const [showPassword, setShowPassword] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);

  const isPassword = type === "password";
  const isDate = type === "date";
  const inputType = isPassword && showPassword ? "text" : type;

  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = isPassword || isDate;

  const safeId =
    id ??
    (label
      ? label.trim().toLowerCase().replace(/\s+/g, "-")
      : Math.random().toString(36));

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const openDatePicker = React.useCallback(() => {
    const el = inputRef.current;
    if (!el) return;

    // Focus first so iOS/Safari behave
    el.focus({ preventScroll: true });

    try {
      // Try native showPicker (Chromium/Safari TP/FF)
      (el as any).showPicker?.();
    } catch (e: any) {
      // If blocked (NotAllowedError) or unsupported, click as a fallback.
      // Because we're inside a pointer handler, this is still a user gesture.
      el.click();
    }
  }, []);

  // Make the entire control open the picker for date fields.
  // Use pointer events (covering mouse/touch/pen) to satisfy user-activation.
  const handleWrapperPointerDown = (e: React.PointerEvent) => {
    if (!isDate || props.disabled || props.readOnly) return;
    // Stop the native click from firing twice and messing with caret selection.
    e.preventDefault();
    openDatePicker();
  };

  return (
    <div className="w-full" dir={derivedDir}>
      {label && (
        <label
          htmlFor={safeId}
          className={cn(
            "block mb-2 ty-body-md text-primary-700",
            isRTL && "text-right"
          )}
        >
          {label}
        </label>
      )}

      <div className="relative w-full" onPointerDown={handleWrapperPointerDown}>
        {/* Left icon */}
        {hasLeftIcon && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground flex items-center",
              isRTL ? "right-3" : "left-3"
            )}
          >
            {leftIcon}
          </div>
        )}

        <input
          ref={inputRef}
          id={safeId}
          type={inputType}
          dir={derivedDir}
          data-slot="input"
          aria-invalid={!!error}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          // Important: don't also open on onClick to avoid double invocation/NotAllowedError.
          className={cn(
            // base
            "file:text-foreground placeholder:text-[#808080] selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-13 w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "text-sm",
            // error styles
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            error &&
              "border-destructive text-destructive placeholder-destructive/60",
            // paddings flip with direction
            hasLeftIcon ? (isRTL ? "pr-10" : "pl-10") : isRTL ? "pr-4" : "pl-4",
            hasRightIcon
              ? isRTL
                ? "pl-10"
                : "pr-10"
              : isRTL
              ? "pl-4"
              : "pr-4",
            // align text with direction
            isRTL ? "text-right" : "text-left",
            // mark date inputs for CSS to hide native icon
            isDate && "date-input",
            className
          )}
          style={{ borderColor: isFocused ? focusBorderColor : undefined }}
          {...props}
        />

        {/* Right-side controls */}
        {isPassword && (
          <button
            type="button"
            onPointerDown={(e) => {
              // consume the gesture so we don't also trigger wrapper handler
              e.stopPropagation();
            }}
            onClick={() => setShowPassword((prev) => !prev)}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none",
              isRTL ? "left-3" : "right-3"
            )}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        )}

        {isDate && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={openDatePicker}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none",
              isRTL ? "left-3" : "right-3"
            )}
            tabIndex={-1}
            aria-label="Open calendar"
          >
            <Calendar size={18} />
          </button>
        )}
      </div>

      {typeof error === "string" && (
        <p className="mt-1 text-sm text-destructive text-start">{error}</p>
      )}

      {/* Scoped styles to hide native date indicators */}
      <style jsx>{`
        /* Hide the default date picker icon (Chromium/WebKit) */
        :global(.date-input::-webkit-calendar-picker-indicator) {
          opacity: 0 !important;
          display: none !important;
          -webkit-appearance: none;
        }
        :global(.date-input::-webkit-clear-button),
        :global(.date-input::-webkit-inner-spin-button) {
          display: none !important;
        }
        /* Firefox: no icon by default, but normalize appearance */
        :global(.date-input) {
          -moz-appearance: textfield;
          -webkit-appearance: none;
          appearance: none;
          background-image: none;
        }
      `}</style>
    </div>
  );
}

export { Input };
