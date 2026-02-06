

# Redesign Call Prep Brief — Input Overhaul

## What Changes

The current app uses source-type dropdowns and multiple text chunks. The new design replaces this with two simpler input methods side by side:

### Option A — Single Paste Area
- One large textarea for pasting all context at once
- A small optional free-text field above it: "Context label (optional)" (e.g., "CRM notes + last call transcript")

### Option B — Drag-and-Drop File Upload
- A drag-and-drop zone accepting multiple `.txt` and `.md` files
- Each uploaded file appears in a list showing:
  - File name
  - Free-text "Context label" field
  - Remove (X) button

### Backend / AI Changes
- Update the `TextChunk` type: replace the fixed `SourceType` enum with a free-text `label` string
- Update the edge function's system prompt and tool schema to use `context_label` (free text) instead of `source_label` (enum)
- Snippet attribution in results will show the user's context label (or file name as fallback) instead of "CRM #1"

### Results Section
- Minor update: snippet badges show the free-text context label instead of the old source type
- Copy brief output updated to use context labels

## Files Modified

1. **`src/types/call-prep.ts`** — Remove `SourceType` enum, change `TextChunk.source` to `TextChunk.label` (optional string), update `Snippet.source_label` to `context_label`
2. **`src/hooks/use-call-prep.ts`** — Rewrite to manage a single paste input + a list of uploaded files (with labels), send both to the edge function
3. **`src/components/InputSection.tsx`** — Full redesign: single paste area with optional label field, drag-and-drop zone with file list, generate/clear buttons
4. **`src/components/ResultsSection.tsx`** — Update snippet display to show `context_label` instead of `source_label #chunk_number`
5. **`src/pages/Index.tsx`** — Update props to match new hook interface
6. **`supabase/functions/call-prep/index.ts`** — Update tool schema and prompt to use `context_label` (free text) instead of fixed source types

## Technical Details

- Drag-and-drop uses native HTML5 `onDragOver`/`onDrop` events (no extra library needed)
- Files read via `FileReader.readAsText()` — same as current approach but supporting multiple files
- The edge function receives an array of `{ label: string, text: string }` objects (paste content becomes one item, each file becomes one item)
- The AI tool schema's `source_label` field changes from an enum to a free-text string with description guidance

