"use client";

import { useCallback, useRef, useState } from "react";

/**
 * AI auto-fill hooks for the listing creation form.
 *
 * Primary path: POST to `/api/ai/listing-autofill`, which (once the AI
 * service is wired up) returns suggested field values derived from the
 * draft title/category. If the endpoint is not yet available (404/501) or
 * fails, we degrade gracefully to a deterministic local heuristic so the
 * UX never dead-ends. Swapping in a real provider later requires no UI
 * changes — only this module's transport layer.
 */

export type AiSuggestion = {
  title?: string;
  description?: string;
  price?: number;
  categoryId?: string;
};

export type AiAutofillStatus = "idle" | "loading" | "success" | "fallback" | "error";

export type AiAutofillInput = {
  title: string;
  categoryId?: string;
};

const AUTOFILL_ENDPOINT = "/api/ai/listing-autofill";

/** Deterministic offline suggestion used when the AI service is unavailable. */
function heuristicSuggest(input: AiAutofillInput): AiSuggestion {
  const t = input.title.trim();
  if (!t) return {};
  return {
    description:
      `Pārdodu: ${t}. Priekšmets ir lieliskā stāvoklī, bez defektiem. ` +
      `Sazinieties ar mani, lai vienotos par pārņemšanu un maksājumu.`,
  };
}

export function useAiAutofill() {
  const [status, setStatus] = useState<AiAutofillStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const inflight = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    inflight.current?.abort();
    inflight.current = null;
    setStatus("idle");
    setMessage("");
  }, []);

  /**
   * Request suggestions. Resolves with whatever could be derived
   * (`{}` when nothing was), plus sets `status`/`message` for the UI.
   */
  const suggest = useCallback(
    async (input: AiAutofillInput): Promise<AiSuggestion> => {
      inflight.current?.abort();
      const controller = new AbortController();
      inflight.current = controller;
      setStatus("loading");
      setMessage("");

      try {
        const res = await fetch(AUTOFILL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data: AiSuggestion = json?.data ?? json ?? {};

        // Never let the AI clobber a title the user has already typed well —
        // only accept it when the caller sent an empty title.
        const safe: AiSuggestion = { ...data };
        if (input.title.trim()) delete safe.title;

        setStatus("success");
        setMessage("AI ieteikumi piemēroti");
        return safe;
      } catch (err) {
        if (controller.signal.aborted) return {};
        // Graceful degradation: endpoint missing or errored → local heuristic.
        const suggestion = heuristicSuggest(input);
        setStatus(Object.keys(suggestion).length > 0 ? "fallback" : "error");
        setMessage(
          Object.keys(suggestion).length > 0
            ? "AI serviss nav pieejams — izmantota automātiska veidne"
            : "AI aizpilde neizdevās"
        );
        return suggestion;
      } finally {
        if (inflight.current === controller) inflight.current = null;
      }
    },
    []
  );

  return { suggest, status, message, reset };
}
