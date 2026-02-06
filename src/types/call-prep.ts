export type SourceType = "CRM" | "Transcript" | "Email" | "Notes" | "Other";

export interface TextChunk {
  id: string;
  source: SourceType;
  text: string;
}

export interface Snippet {
  text: string;
  source_label: string;
  chunk_number: number;
}

export type Confidence = "High" | "Med" | "Low";

export interface ThemeCard {
  theme: string;
  summary: string;
  confidence: Confidence;
  snippets: Snippet[];
}

export interface CallPrepResult {
  themes: ThemeCard[];
}
