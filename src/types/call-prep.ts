export interface TextChunk {
  id: string;
  label: string;
  text: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  label: string;
  text: string;
}

export interface Snippet {
  text: string;
  context_label: string;
  snippet_number: number;
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
