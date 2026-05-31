"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIMARY_COLOR } from "@/lib/constants";

type Dir = "ltr" | "rtl";

function getDir(explicit?: Dir): Dir {
  if (explicit) return explicit;
  if (typeof document !== "undefined" && (document as any).dir) {
    return ((document as any).dir as Dir) || "ltr";
  }
  return "ltr";
}

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" dir={getDir()} {...props} />;
}

function SelectGroup(
  props: React.ComponentProps<typeof SelectPrimitive.Group>
) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(
  props: React.ComponentProps<typeof SelectPrimitive.Value>
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

type TriggerProps = React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
  error?: string | boolean;
  leftIcon?: React.ReactNode;
  direction?: Dir; // NEW: can force dir
  focusBorderColor?: string;
};

function SelectTrigger({
  className,
  size = "default",
  children,
  error,
  leftIcon,
  direction,
  focusBorderColor = PRIMARY_COLOR,
  onFocus,
  onBlur,
  ...props
}: TriggerProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const derivedDir = getDir(direction);
  const isRTL = derivedDir === "rtl";
  const hasLeftIcon = !!leftIcon;

  return (
    <div className="w-full h-13 relative" dir={derivedDir}>
      <SelectPrimitive.Trigger
        data-slot="select-trigger"
        data-size={size}
        aria-invalid={!!error}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "border-input file:text-foreground placeholder:text-[#808080] selection:bg-primary selection:text-primary-foreground dark:bg-input/30",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "flex h-13 w-full min-w-0 items-center rounded-md border bg-transparent text-base shadow-xs transition-colors outline-none md:text-sm",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "whitespace-nowrap justify-between gap-2",
          hasLeftIcon ? (isRTL ? "pr-10" : "pl-10") : isRTL ? "pr-4" : "pl-4",
          isRTL ? "pl-10" : "pr-10",
          isRTL ? "text-right" : "text-left",
          className
        )}
        style={{ borderColor: isFocused ? focusBorderColor : undefined }}
        {...props}
      >
        {hasLeftIcon && (
          <span
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
              isRTL ? "left-3 rtl:left-3" : "left-3",
              isRTL ? "right-auto" : ""
            )}
            style={{ insetInlineStart: "0.75rem" }}
          >
            {leftIcon}
          </span>
        )}

        {children}

        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon
            className="absolute top-1/2 -translate-y-1/2 size-4 opacity-50 pointer-events-none"
            style={{ insetInlineEnd: "0.75rem" }}
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      {typeof error === "string" && (
        <p
          className={cn("mt-1 text-sm text-destructive", isRTL && "text-right")}
        >
          {error}
        </p>
      )}
    </div>
  );
}

type ContentProps = React.ComponentProps<typeof SelectPrimitive.Content> & {
  direction?: Dir; // NEW
};

function SelectContent({
  className,
  children,
  position = "popper",
  direction,
  ...props
}: ContentProps) {
  const derivedDir = getDir(direction);
  const isRTL = derivedDir === "rtl";

  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        dir={derivedDir}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {/* Make list text align respect dir */}
          <div
            dir={derivedDir}
            className={cn(isRTL ? "text-right" : "text-left")}
          >
            {children}
          </div>
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel(
  props: React.ComponentProps<typeof SelectPrimitive.Label>
) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs")}
      {...props}
    />
  );
}

type ItemProps = React.ComponentProps<typeof SelectPrimitive.Item> & {
  direction?: Dir; // NEW
};

function SelectItem({ className, children, direction, ...props }: ItemProps) {
  const derivedDir = getDir(direction);
  const isRTL = derivedDir === "rtl";

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      dir={derivedDir}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // remove fixed pr/pl and use logical padding
        "px-2",
        className
      )}
      // Logical padding so the indicator has room at inline-end (mirrors in RTL)
      style={{ paddingInlineEnd: "2rem" }}
      {...props}
    >
      {/* Indicator pinned to inline-end (mirrors in RTL) */}
      <span
        className="absolute flex size-3.5 items-center justify-center"
        style={{ insetInlineEnd: "0.5rem" }}
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>

      <SelectPrimitive.ItemText
        className={cn(isRTL ? "text-right" : "text-left")}
      >
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
