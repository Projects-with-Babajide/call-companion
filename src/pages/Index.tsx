import { useCallPrep } from "@/hooks/use-call-prep";
import { InputSection } from "@/components/InputSection";
import { ResultsSection } from "@/components/ResultsSection";

const Index = () => {
  const {
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
  } = useCallPrep();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Call Prep Brief
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste customer context, generate a scannable brief in seconds.
          </p>
        </header>

        <InputSection
          chunks={chunks}
          isLoading={isLoading}
          onAddChunk={addChunk}
          onRemoveChunk={removeChunk}
          onUpdateChunk={updateChunk}
          onFileUpload={handleFileUpload}
          onGenerate={generate}
          onClear={clear}
        />

        <ResultsSection result={result} isLoading={isLoading} onCopy={copyBrief} />
      </div>
    </div>
  );
};

export default Index;
