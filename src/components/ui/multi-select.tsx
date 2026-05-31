import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ChevronsUpDown, Check, X } from "lucide-react";
import { useState } from "react";
import { Label } from "./label";
import { useTranslations } from "next-intl";

type Option = { id: number; name: string };

type Props = {
  label: string;
  placeholder?: string;
  options: Option[];
  value: number[]; // keep as array for both modes
  onChange: (v: number[]) => void;
  error?: string;
  multiple?: boolean; // NEW: default true
};

const MultiSelect = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
  multiple = true,
}: Props) => {
  const t = useTranslations("");
  const [open, setOpen] = useState(false);

  const selected = options.filter((o) => value.includes(o.id));

  const toggle = (id: number) => {
    if (multiple) {
      onChange(
        value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
      );
    } else {
      const next = value.includes(id) ? [] : [id];
      onChange(next);
      setOpen(false); // close on select in single mode
    }
  };

  const clearSingle = () => onChange([]);

  return (
    <div className="w-full">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="mt-2 inline-flex w-full items-center justify-between rounded-md border border-input shadow-xs bg-white px-3 py-2 text-left h-13"
            style={error ? { borderColor: "red" } : {}}
          >
            <div className="flex flex-wrap gap-1 min-h-5">
              {selected.length ? (
                multiple ? (
                  selected.map((s) => (
                    <Badge
                      key={s.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {s.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(s.id);
                        }}
                      />
                    </Badge>
                  ))
                ) : (
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary">{selected[0].name}</Badge>
                    <X
                      className="h-4 w-4 cursor-pointer text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSingle();
                      }}
                    />
                  </div>
                )
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>{t("noRecords")}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = value.includes(opt.id);
                  return (
                    <CommandItem
                      key={opt.id}
                      onSelect={() => toggle(opt.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {opt.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default MultiSelect;
