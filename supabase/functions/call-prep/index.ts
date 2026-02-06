import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a sales call preparation analyst. You receive labeled text chunks about a customer and extract structured insights for a salesperson to review in 60-90 seconds before a call.

Analyze ALL provided text chunks carefully. For each theme, find supporting evidence from the source material. Only include themes that have real evidence — do not fabricate or speculate.

Be concise and actionable. Use bullet points. Avoid long paragraphs. Write as if the salesperson will glance at this while walking to the meeting room.

For each snippet, use the context_label provided by the user (e.g., "CRM notes", "Call transcript 2026-02-01"). Preserve labels exactly as given.`;

const TOOL_DEFINITION = {
  type: "function" as const,
  function: {
    name: "extract_call_prep",
    description:
      "Extract structured theme cards from customer text for a sales call prep brief.",
    parameters: {
      type: "object",
      properties: {
        themes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              theme: {
                type: "string",
                enum: [
                  "Pain Points",
                  "Problems",
                  "Objections",
                  "Goals / Priorities",
                  "Open Questions",
                  "Risks / Blockers",
                  "Next Steps",
                  "Other",
                ],
              },
              summary: {
                type: "string",
                description:
                  "1-2 sentence summary of the theme. Concise and actionable.",
              },
              confidence: {
                type: "string",
                enum: ["High", "Med", "Low"],
                description:
                  "High = multiple strong signals, Med = some evidence, Low = inferred or weak signal.",
              },
              snippets: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string",
                      description:
                        "A short quote or excerpt from the source material supporting this theme.",
                    },
                    context_label: {
                      type: "string",
                      description:
                        "The context label provided by the user for this chunk, e.g. 'CRM notes', 'Call transcript 2026-02-01'. Use the label exactly as given.",
                    },
                    snippet_number: {
                      type: "number",
                      description: "Sequential snippet number within this theme (1-indexed).",
                    },
                  },
                  required: ["text", "context_label", "snippet_number"],
                  additionalProperties: false,
                },
                description: "3-6 supporting snippets with context label attribution.",
              },
            },
            required: ["theme", "summary", "confidence", "snippets"],
            additionalProperties: false,
          },
        },
      },
      required: ["themes"],
      additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { chunks } = await req.json();

    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return new Response(
        JSON.stringify({ error: "Please provide at least one text chunk." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build user prompt from chunks
    const userPrompt = chunks
      .map(
        (c: { label: string; text: string }, i: number) =>
          `--- ${c.label} (chunk ${i + 1}) ---\n${c.text}`
      )
      .join("\n\n");

    console.log(`Processing ${chunks.length} chunks, total length: ${userPrompt.length}`);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          tools: [TOOL_DEFINITION],
          tool_choice: {
            type: "function",
            function: { name: "extract_call_prep" },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Failed to process your request. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response received successfully");

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI did not return structured output. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log(`Extracted ${result.themes?.length || 0} themes`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("call-prep error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
