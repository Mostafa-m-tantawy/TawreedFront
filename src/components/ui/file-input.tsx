"use client";

import * as React from "react";
import { File as FileIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CloudAdd } from "iconsax-reactjs";

type Strings = string | ((params: Record<string, string | number>) => string);

// ---- NEW: type for existing files coming from your API ----
export type ExistingItem = {
  id?: string | number; // keep backend id if you have it
  url: string;
  name?: string; // fallback filenames are inferred from url
  mime?: string; // optional; helps detect image vs non-image
};

export type FileInputProps = {
  value: File[];
  onChange: (files: File[]) => void;

  // ---- NEW: pass existing URLs for edit screens ----
  existing?: ExistingItem[];
  onChangeExisting?: (items: ExistingItem[]) => void;

  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  error?: string;

  label: Strings;
  description?: Strings;
  browseLabel?: Strings;
  hint?: Strings;
  filesSelectedText?: Strings;

  className?: string;
  name?: string;
  id?: string;
};

export default function FileInput({
  value,
  onChange,
  existing = [],
  onChangeExisting,
  accept,
  multiple = true,
  maxFiles = 1,
  maxSizeMB = 50,
  disabled,
  error,
  label,
  description,
  browseLabel,
  hint,
  filesSelectedText,
  className,
  name,
  id,
}: FileInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [drag, setDrag] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const fmt = (s?: Strings, params: Record<string, string | number> = {}) =>
    !s
      ? ""
      : typeof s === "function"
      ? s(params)
      : s.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ""));

  const openPicker = () => !disabled && inputRef.current?.click();

  // ---- helpers for type/preview detection ----
  const fileIsImage = (f: File) => f.type?.startsWith("image/");
  const urlLooksImage = (u: string, mime?: string) =>
    (mime && mime.startsWith("image/")) ||
    /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?.*)?$/i.test(u);

  // ---- enforce max limit across existing + new ----
  const totalCount = existing.length + value.length;

  const validateFiles = (files: File[]) => {
    if (files.length + totalCount > maxFiles) {
      return `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed`;
    }
    const tooBig = files.find((f) => f.size > maxSizeMB * 1024 * 1024);
    if (tooBig) return `“${tooBig.name}” exceeds ${maxSizeMB}MB`;
    return null;
  };

  const handleFiles = (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    const msg = validateFiles(files);
    setLocalError(msg);
    if (msg) return;
    const next = [...value, ...files].slice(
      0,
      Math.max(0, maxFiles - existing.length)
    );
    onChange(next);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFiles(e.target.files);
    e.target.value = ""; // allow reselect same file
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  // ---- NEW: removal for existing items ----
  const removeExistingAt = (i: number) => {
    const next = existing.filter((_, idx) => idx !== i);
    onChangeExisting?.(next);
  };

  // split previews
  const newImages = value
    .map((f, idx) => ({ f, idx }))
    .filter(({ f }) => fileIsImage(f));
  const newNonImages = value
    .map((f, idx) => ({ f, idx }))
    .filter(({ f }) => !fileIsImage(f));

  const existingImages = existing
    .map((e, idx) => ({ e, idx }))
    .filter(({ e }) => urlLooksImage(e.url, e.mime));
  const existingNonImages = existing
    .map((e, idx) => ({ e, idx }))
    .filter(({ e }) => !urlLooksImage(e.url, e.mime));

  // create/revoke object URLs for new image files
  const [previewMap, setPreviewMap] = React.useState<Record<number, string>>(
    {}
  );
  React.useEffect(() => {
    const map: Record<number, string> = {};
    newImages.forEach(({ f, idx }) => {
      map[idx] = URL.createObjectURL(f);
    });
    setPreviewMap(map);
    return () => Object.values(map).forEach((url) => URL.revokeObjectURL(url));
  }, [value]);

  const hasAnyFiles = totalCount > 0;

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center justify-between rounded-md border border-dashed divide-dashed p-4 transition-colors",
          drag ? "border-primary-400 bg-primary-50/40" : "border-[#C5C6D8]",
          disabled && "opacity-60",
          !!error && "border-destructive",
          className
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDrag(false);
        }}
        onDrop={(ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          setDrag(false);
          if (ev.dataTransfer.files?.length) handleFiles(ev.dataTransfer.files);
        }}
        aria-disabled={disabled}
      >
        {/* Left */}
        <div className="flex w-full min-w-0 items-start gap-3">
          <CloudAdd size={24} color="#475467" />
          <div className="min-w-0 flex-1">
            <div className="ty-body-xs text-secondary-900">{fmt(label)}</div>

            {!hasAnyFiles && !!description && (
              <div className="mt-1 ty-body-xs text-[#A1A8B0]">
                {fmt(description, { size: maxSizeMB })}
              </div>
            )}

            {hasAnyFiles && filesSelectedText && (
              <div className="mt-1 text-xs text-neutral-600">
                {fmt(filesSelectedText, { count: totalCount })}
              </div>
            )}

            {/* --- EXISTING IMAGE PREVIEWS (URLs) --- */}
            {existingImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {existingImages.map(({ e, idx }) => (
                  <ExistingPreviewCard
                    key={`ex-${idx}-${e.url}`}
                    item={e}
                    onRemove={() => removeExistingAt(idx)}
                    disabled={disabled}
                  />
                ))}
              </div>
            )}

            {/* --- NEW IMAGE PREVIEWS (Files) --- */}
            {newImages.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {newImages.map(({ f, idx }) => (
                  <PreviewCard
                    key={`new-${idx}-${f.name}`}
                    file={f}
                    url={previewMap[idx]}
                    onRemove={() => removeAt(idx)}
                    disabled={disabled}
                  />
                ))}
              </div>
            )}

            {/* --- EXISTING NON-IMAGE LIST (URLs) --- */}
            {existingNonImages.length > 0 && (
              <ul className="mt-3 space-y-2">
                {existingNonImages.map(({ e, idx }) => (
                  <li
                    key={`exn-${idx}-${e.url}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <FileIcon className="h-4 w-4 text-neutral-500" />
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate underline decoration-neutral-400 hover:decoration-neutral-700"
                    >
                      {e.name || filenameFromUrl(e.url)}
                    </a>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeExistingAt(idx)}
                        className="ml-1 rounded p-1 text-neutral-500 hover:text-neutral-700"
                        aria-label={`Remove ${e.name || e.url}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* --- NEW NON-IMAGE LIST (Files) --- */}
            {newNonImages.length > 0 && (
              <ul className="mt-3 space-y-2">
                {newNonImages.map(({ f, idx }) => (
                  <li
                    key={`newn-${idx}-${f.name}`}
                    className="flex items-center gap-2 text-sm"
                  >
                    <FileIcon className="h-4 w-4 text-neutral-500" />
                    <span className="truncate">{f.name}</span>
                    <span className="text-xs text-neutral-500">
                      ({Math.ceil(f.size / 1024)} KB)
                    </span>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeAt(idx)}
                        className="ml-1 rounded p-1 text-neutral-500 hover:text-neutral-700"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {!disabled && !hasAnyFiles && hint && (
              <p className="mt-2 text-xs text-neutral-500">
                {fmt(hint, { btn: fmt(browseLabel ?? "Browse File") })}
              </p>
            )}
          </div>
        </div>

        {/* Right action */}
        <div className="shrink-0 ps-4">
          <Button
            type="button"
            variant="outline"
            onClick={openPicker}
            disabled={disabled || totalCount >= maxFiles}
            className="shadow-none"
          >
            {fmt(browseLabel ?? "Browse File")}
          </Button>

          <input
            ref={inputRef}
            id={id}
            name={name}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={onInputChange}
            disabled={disabled}
          />
        </div>
      </div>

      {(error || localError) && (
        <p className="mt-1 text-sm text-destructive text-start">
          {error || localError}
        </p>
      )}
    </div>
  );
}

/* --------------------------------- helpers --------------------------------- */

function filenameFromUrl(u: string) {
  try {
    const p = new URL(u).pathname;
    const base = p.split("/").pop() || "";
    return base || u;
  } catch {
    return u;
  }
}

/* --------------------------- Preview subcomponents --------------------------- */

function PreviewCard({
  file,
  url,
  onRemove,
  disabled,
}: {
  file: File;
  url?: string;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative rounded-lg border border-neutral-200 overflow-hidden bg-white">
      {url ? (
        <img
          src={url}
          alt={file.name}
          className="h-32 w-full object-contain"
          loading="lazy"
        />
      ) : (
        <div className="h-32 flex flex-col items-center justify-center text-neutral-500">
          <FileIcon className="h-6 w-6 mb-2" />
          <span className="px-2 text-xs text-center line-clamp-2">
            {file.name}
          </span>
        </div>
      )}
      <div className="px-2 py-1 border-t text-xs text-neutral-700 truncate">
        {file.name}
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 rounded-full bg-white/90 hover:bg-white text-neutral-700 shadow p-1"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function ExistingPreviewCard({
  item,
  onRemove,
  disabled,
}: {
  item: ExistingItem;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const title = item.name || filenameFromUrl(item.url);
  return (
    <div className="relative rounded-lg border border-neutral-200 overflow-hidden bg-white">
      <img
        src={item.url}
        alt={title}
        className="h-32 w-full object-contain"
        loading="lazy"
      />
      <div className="px-2 py-1 border-t text-xs text-neutral-700 truncate">
        {title}
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 rounded-full bg-white/90 hover:bg-white text-neutral-700 shadow p-1"
          aria-label={`Remove ${title}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
