"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PRIMARY_COLOR } from "@/lib/constants";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  /** Show an error state or message */
  error?: string | boolean;
  /** Optional icon rendered on the left, inside the field */
  leftIcon?: React.ReactNode;
  /** If provided with `showCount`, a character counter is shown */
  maxLength?: number;
  /** Show a character counter (works best with `maxLength`) */
  showCount?: boolean;
  /** Auto-grow vertically to fit content */
  autoResize?: boolean;
  /** Dynamic border color when focused */
  focusBorderColor?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      leftIcon,
      maxLength,
      showCount = false,
      autoResize = true,
      onChange,
      value,
      defaultValue,
      focusBorderColor = PRIMARY_COLOR,
      ...props
    },
    ref
  ) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);
    const combinedRef = React.useCallback(
      (node: HTMLTextAreaElement) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current =
            node;
      },
      [ref]
    );

    const hasLeftIcon = !!leftIcon;
    const [isFocused, setIsFocused] = React.useState(false);

    const resize = React.useCallback(() => {
      if (!autoResize || !innerRef.current) return;
      const el = innerRef.current;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + 2}px`; // small offset
    }, [autoResize]);

    React.useEffect(() => {
      resize();
    }, [resize, value, defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) onChange(e);
      if (autoResize) resize();
    };

    const currentLength =
      typeof value === "string"
        ? value.length
        : typeof defaultValue === "string"
        ? defaultValue.length
        : 0;

    return (
      <div className="w-full">
        <div className="relative w-full">
          {/* Left Icon */}
          {hasLeftIcon && (
            <div className="absolute left-3 top-4 text-muted-foreground flex items-start">
              {leftIcon}
            </div>
          )}

          <textarea
            ref={combinedRef}
            data-slot="textarea"
            aria-invalid={!!error}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            style={{
              borderColor: isFocused ? focusBorderColor : undefined,
            }}
            className={cn(
              // base
              "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-colors outline-none md:text-sm",
              // textarea specifics
              "min-h-24 resize-y leading-relaxed",
              // invalid states
              "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
              // padding
              hasLeftIcon ? "pl-10 pr-4 py-3" : "px-3 py-2",
              // error coloring
              error &&
                "border-destructive text-destructive placeholder-destructive/60",
              className
            )}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />

          {/* Character counter */}
          {showCount && typeof maxLength === "number" && (
            <div
              className={cn(
                "pointer-events-none absolute bottom-2 right-3 text-xs text-muted-foreground",
                error && "text-destructive"
              )}
            >
              {Math.min(currentLength, maxLength)} / {maxLength}
            </div>
          )}
        </div>

        {typeof error === "string" && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
