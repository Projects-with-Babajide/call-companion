import { useState, useCallback } from "react";
import type { UploadedFile, CallPrepResult } from "@/types/call-prep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

let fileIdCounter = 0;

export function useCallPrep() {
  const [pasteLabel, setPasteLabel] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [result, setResult] = useState<CallPrepResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addFiles = useCallback((newFiles: File[]) => {
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          setFiles((prev) => [
            ...prev,
            { id: String(++fileIdCounter), name: file.name, label: "", text },
          ]);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const updateFileLabel = useCallback((id: string, label: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, label } : f)));
  }, []);

  const generate = useCallback(async () => {
    const chunks: { label: string; text: string }[] = [];

    if (pasteText.trim()) {
      chunks.push({ label: pasteLabel.trim() || "Pasted context", text: pasteText.trim() });
    }

    files.forEach((f) => {
      if (f.text.trim()) {
        chunks.push({ label: f.label.trim() || f.name, text: f.text.trim() });
      }
    });

    if (chunks.length === 0) {
      toast({ title: "No input", description: "Paste some text or upload files before generating.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("call-prep", {
        body: { chunks },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast({ title: "Error", description: error.message || "Something went wrong.", variant: "destructive" });
        return;
      }

      if (data?.error) {
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }

      setResult(data as CallPrepResult);
    } catch (err) {
      console.error("Generate error:", err);
      toast({ title: "Error", description: "Failed to generate brief. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [pasteText, pasteLabel, files]);

  const clear = useCallback(() => {
    setPasteLabel("");
    setPasteText("");
    setFiles([]);
    setResult(null);
  }, []);

  const copyBrief = useCallback(() => {
    if (!result) return;
    const text = result.themes
      .map((t) => {
        const bullets = t.snippets
          .map((s) => `  • ${s.text} [${s.context_label}, Snippet ${s.snippet_number}]`)
          .join("\n");
        return `## ${t.theme} (${t.confidence})\n${t.summary}\n${bullets}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Brief copied to clipboard." });
  }, [result]);

  return {
    pasteLabel,
    setPasteLabel,
    pasteText,
    setPasteText,
    files,
    addFiles,
    removeFile,
    updateFileLabel,
    result,
    isLoading,
    generate,
    clear,
    copyBrief,
  };
}
