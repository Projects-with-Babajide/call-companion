import { useCallPrep } from "@/hooks/use-call-prep";
import { InputSection } from "@/components/InputSection";
import { ResultsSection } from "@/components/ResultsSection";

const Index = () => {
  const {
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
  } = useCallPrep();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Call Prep Brief
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste customer context or drop files, generate a scannable brief in seconds.
          </p>
        </header>

        <InputSection
          pasteLabel={pasteLabel}
          onPasteLabelChange={setPasteLabel}
          pasteText={pasteText}
          onPasteTextChange={setPasteText}
          files={files}
          onAddFiles={addFiles}
          onRemoveFile={removeFile}
          onUpdateFileLabel={updateFileLabel}
          isLoading={isLoading}
          onGenerate={generate}
          onClear={clear}
        />

        <ResultsSection result={result} isLoading={isLoading} onCopy={copyBrief} />
      </div>
    </div>
  );
};

export default Index;
