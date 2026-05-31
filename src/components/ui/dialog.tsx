"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

type Dir = "ltr" | "rtl";

// ---- Direction helpers ----
function useDirection(explicit?: Dir): { dir: Dir; isRTL: boolean } {
  const locale = useLocale?.() as string | undefined;
  const [docDir, setDocDir] = React.useState<Dir>("ltr");

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const d = (document.documentElement.getAttribute("dir") || "ltr") as Dir;
      setDocDir(d);
    }
  }, []);

  const auto: Dir = locale === "ar" ? "rtl" : "ltr";
  const dir: Dir =
    explicit ??
    (typeof document !== "undefined"
      ? (document.documentElement.dir as Dir) || auto
      : auto) ??
    "ltr";
  return { dir, isRTL: dir === "rtl" };
}

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(
  props: React.ComponentProps<typeof DialogPrimitive.Trigger>
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(
  props: React.ComponentProps<typeof DialogPrimitive.Portal>
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(
  props: React.ComponentProps<typeof DialogPrimitive.Close>
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

type ContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  /** Force direction; otherwise inferred from locale/document */
  direction?: Dir;
  /** Show the corner close button */
  showCloseButton?: boolean;
};

function DialogContent({
  className,
  children,
  showCloseButton = true,
  direction,
  ...props
}: ContentProps) {
  const { dir, isRTL } = useDirection(direction);

  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        dir={dir}
        className={cn(
          "bg-background fixed top-1/2 left-1/2 z-50 grid w-full",
          "max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2",
          "gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "max-h-[92vh] overflow-auto",
          className
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              "absolute top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100",
              "ring-offset-background focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
              // use logical inset so it mirrors in RTL
              // (Tailwind doesn't have inset-inline utilities yet; use inline style)
            )}
            style={{ insetInlineEnd: "1rem" }}
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      // text-start respects dir (LTR: left, RTL: right)
      className={cn("flex flex-col gap-2 text-center sm:text-start", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
