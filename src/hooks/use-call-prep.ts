import { useState, useCallback } from "react";
import type { TextChunk, CallPrepResult, SourceType } from "@/types/call-prep";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

let chunkIdCounter = 0;

export function createChunk(source: SourceType = "Notes", text = ""): TextChunk {
  return { id: String(++chunkIdCounter), source, text };
}

export function useCallPrep() {
  const [chunks, setChunks] = useState<TextChunk[]>([createChunk()]);
  const [result, setResult] = useState<CallPrepResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const addChunk = useCallback(() => {
    setChunks((prev) => [...prev, createChunk()]);
  }, []);

  const removeChunk = useCallback((id: string) => {
    setChunks((prev) => (prev.length <= 1 ? prev : prev.filter((c) => c.id !== id)));
  }, []);

  const updateChunk = useCallback((id: string, updates: Partial<TextChunk>) => {
    setChunks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setChunks((prev) => [...prev, createChunk("Other", text)]);
      }
    };
    reader.readAsText(file);
  }, []);

  const generate = useCallback(async () => {
    const nonEmpty = chunks.filter((c) => c.text.trim());
    if (nonEmpty.length === 0) {
      toast({ title: "No input", description: "Paste some text before generating.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("call-prep", {
        body: { chunks: nonEmpty.map((c) => ({ source: c.source, text: c.text })) },
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
  }, [chunks]);

  const clear = useCallback(() => {
    chunkIdCounter = 0;
    setChunks([createChunk()]);
    setResult(null);
  }, []);

  const copyBrief = useCallback(() => {
    if (!result) return;
    const text = result.themes
      .map((t) => {
        const bullets = t.snippets.map((s) => `  • ${s.text} [${s.source_label} #${s.chunk_number}]`).join("\n");
        return `## ${t.theme} (${t.confidence})\n${t.summary}\n${bullets}`;
      })
      .join("\n\n");
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Brief copied to clipboard." });
  }, [result]);

  return {
    chunks,
    result,
    isLoading,
    addChunk,
    removeChunk,
    updateChunk,
    handleFileUpload,
    generate,
    clear,
    copyBrief,
  };
}
