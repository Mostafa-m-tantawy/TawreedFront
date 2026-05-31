"use client";

import { ExportCurve } from "iconsax-reactjs";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";
import FileInput from "./file-input";
import { Download } from "lucide-react";

const ImportDialog: React.FC = () => {
  const t = useTranslations("");

  // optional local state for file
  const [file, setFile] = React.useState<File | null>(null);

  const handleImport = () => {
    // TODO: implement your import logic
    // you can access `file` here
    console.log("Importing file:", file);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          size="md"
          className="rounded-md font-normal"
        >
          <ExportCurve size={24} />
          <span className="ml-2">{t("Import")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader>
          <DialogTitle className="border-b border-neutral-white-300 p-4">
            <span className="ty-body-md-2 text-primary-900">
              {t("Import data")}
            </span>
          </DialogTitle>
          <DialogDescription className="hiddem" />
        </DialogHeader>

        <div className="grid gap-4 py-2 px-4">
          <p className="ty-body-sm text-secondary-500">
            {t("importDescription")}
          </p>

          <div>
            <Button variant={"link"} className="text-primary-500 px-0 py-0">
              <Download size={16} />
              {t("downloadSampleFile")}
            </Button>
          </div>

          <FileInput
            value={[]}
            onChange={(arr) => setFile(arr[0] ?? null)}
            accept="csv/*"
            multiple={false}
            maxFiles={1}
            maxSizeMB={50}
            label={""}
            description={t("importFileDescription")}
            browseLabel={() => t("browseFile")}
            filesSelectedText={({ count }) => t("filesSelected", { count })}
          />
        </div>

        <DialogFooter className="p-4">
          <DialogClose asChild>
            <Button variant="outline">{t("Cancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              onClick={handleImport}
              disabled={!file}
              className="min-w-24"
            >
              {t("Import")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
