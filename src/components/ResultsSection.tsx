import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import type { CallPrepResult, Confidence } from "@/types/call-prep";

const confidenceColor: Record<Confidence, string> = {
  High: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Med: "bg-amber-100 text-amber-800 border-amber-200",
  Low: "bg-rose-100 text-rose-800 border-rose-200",
};

interface ResultsSectionProps {
  result: CallPrepResult | null;
  isLoading: boolean;
  onCopy: () => void;
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 pt-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function ResultsSection({ result, isLoading, onCopy }: ResultsSectionProps) {
  if (isLoading) return <LoadingSkeleton />;
  if (!result || result.themes.length === 0) return null;

  return (
    <section className="space-y-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Call Prep Brief</h2>
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy Brief
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {result.themes.map((theme) => (
          <AccordionItem
            key={theme.theme}
            value={theme.theme}
            className="rounded-lg border border-border bg-card px-4"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-3 text-left">
                <span className="font-medium text-foreground">{theme.theme}</span>
                <Badge variant="outline" className={confidenceColor[theme.confidence]}>
                  {theme.confidence}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground mb-3">{theme.summary}</p>
              <ul className="space-y-2">
                {theme.snippets.map((snippet, idx) => (
                  <li key={idx} className="text-sm flex gap-2 items-start">
                    <span className="shrink-0 text-xs font-medium bg-muted text-muted-foreground rounded px-1.5 py-0.5 mt-0.5">
                      {snippet.source_label} #{snippet.chunk_number}
                    </span>
                    <span className="text-foreground">{snippet.text}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
