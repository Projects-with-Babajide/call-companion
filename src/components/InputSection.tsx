import { Plus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TextChunk, SourceType } from "@/types/call-prep";
import { useRef } from "react";

const SOURCE_OPTIONS: SourceType[] = ["CRM", "Transcript", "Email", "Notes", "Other"];

interface ChunkInputProps {
  chunk: TextChunk;
  index: number;
  canRemove: boolean;
  onUpdate: (id: string, updates: Partial<TextChunk>) => void;
  onRemove: (id: string) => void;
}

function ChunkInput({ chunk, index, canRemove, onUpdate, onRemove }: ChunkInputProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Source {index + 1}</span>
          <Select
            value={chunk.source}
            onValueChange={(v) => onUpdate(chunk.id, { source: v as SourceType })}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canRemove && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onRemove(chunk.id)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <Textarea
        placeholder="Paste customer notes, CRM data, transcript, email thread…"
        className="min-h-[120px] resize-y text-sm"
        value={chunk.text}
        onChange={(e) => onUpdate(chunk.id, { text: e.target.value })}
      />
    </div>
  );
}

interface InputSectionProps {
  chunks: TextChunk[];
  isLoading: boolean;
  onAddChunk: () => void;
  onRemoveChunk: (id: string) => void;
  onUpdateChunk: (id: string, updates: Partial<TextChunk>) => void;
  onFileUpload: (file: File) => void;
  onGenerate: () => void;
  onClear: () => void;
}

export function InputSection({
  chunks,
  isLoading,
  onAddChunk,
  onRemoveChunk,
  onUpdateChunk,
  onFileUpload,
  onGenerate,
  onClear,
}: InputSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
      e.target.value = "";
    }
  };

  return (
    <section className="space-y-4">
      {chunks.map((chunk, i) => (
        <ChunkInput
          key={chunk.id}
          chunk={chunk}
          index={i}
          canRemove={chunks.length > 1}
          onUpdate={onUpdateChunk}
          onRemove={onRemoveChunk}
        />
      ))}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onAddChunk} disabled={isLoading}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add another chunk
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={isLoading}>
          <Upload className="h-3.5 w-3.5 mr-1" /> Upload .txt / .md
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
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
