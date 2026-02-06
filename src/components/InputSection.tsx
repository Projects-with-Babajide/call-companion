import { X, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { UploadedFile } from "@/types/call-prep";
import { useRef, useState, useCallback } from "react";

interface InputSectionProps {
  pasteLabel: string;
  onPasteLabelChange: (v: string) => void;
  pasteText: string;
  onPasteTextChange: (v: string) => void;
  files: UploadedFile[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (id: string) => void;
  onUpdateFileLabel: (id: string, label: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  onClear: () => void;
}

export function InputSection({
  pasteLabel,
  onPasteLabelChange,
  pasteText,
  onPasteTextChange,
  files,
  onAddFiles,
  onRemoveFile,
  onUpdateFileLabel,
  isLoading,
  onGenerate,
  onClear,
}: InputSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const accepted = Array.from(fileList).filter((f) =>
        /\.(txt|md|csv)$/i.test(f.name)
      );
      if (accepted.length > 0) onAddFiles(accepted);
    },
    [onAddFiles]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  return (
    <section className="space-y-6">
      {/* Option A — Paste */}
      <div className="space-y-2">
        <Input
          placeholder="Context label (optional) — e.g. CRM notes + last call transcript"
          value={pasteLabel}
          onChange={(e) => onPasteLabelChange(e.target.value)}
          className="text-sm"
        />
        <Textarea
          placeholder="Paste all customer context here…"
          className="min-h-[180px] resize-y text-sm"
          value={pasteText}
          onChange={(e) => onPasteTextChange(e.target.value)}
        />
      </div>

      {/* Option B — Drag & Drop */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30"
        }`}
      >
        <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Drag & drop <span className="font-medium">.txt</span>,{" "}
          <span className="font-medium">.md</span>, or{" "}
          <span className="font-medium">.csv</span> files here, or{" "}
          <button
            type="button"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
            onClick={() => fileRef.current?.click()}
          >
            browse
          </button>
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.csv"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[140px]">
                {f.name}
              </span>
              <Input
                placeholder="Context label (optional)"
                value={f.label}
                onChange={(e) => onUpdateFileLabel(f.id, e.target.value)}
                className="h-8 text-xs flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => onRemoveFile(f.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={onGenerate} disabled={isLoading} className="px-6">
          {isLoading ? "Generating…" : "Generate Call Prep"}
        </Button>
        <Button variant="ghost" onClick={onClear} disabled={isLoading}>
          Clear
        </Button>
      </div>
    </section>
  );
}
