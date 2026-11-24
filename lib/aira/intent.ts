/**
 * Order-only intent router for Aira.
 *
 * Phase 1 uses deterministic rules so the guardrail is testable and cheap.
 * Phase 3 replaces the item extraction with a model call, but the contract
 * stays the same: Aira only ever handles orders, status, and repeats.
 */

export type Intent =
  | { kind: "order"; items: string[] }
  | { kind: "status" }
  | { kind: "repeat" }
  | { kind: "off_topic" };

const STATUS_PATTERNS = [
  /\bwhere (is|are) my\b/i,
  /\btrack\b/i,
  /\bstatus\b/i,
  /\bkahan\b/i,
  /\bkab\s+aayega\b/i,
];

const REPEAT_PATTERNS = [
  /\bsame (as|order|thing)\b/i,
  /\brepeat\b/i,
  /\blast order\b/i,
  /\bphir se\b/i,
];

const ORDER_CUES = [
  /\bi need\b/i,
  /\bi want\b/i,
  /\bdeliver\b/i,
  /\bbuy\b/i,
  /\border\b/i,
  /\bget me\b/i,
  /\bmujhe\b/i,
  /\bchahiye\b/i,
  /\bchahie\b/i,
];

// Words that carry no item meaning when a customer speaks naturally.
const FILLER =
  /^((please|pls|can you|could you|i need|i want|get me|mujhe|chahiye|chahie|a|an|one|two|three|some)\b\s*)+/i;

const SPLIT = /\s*(?:,| and | aur | \+ |&)\s*/i;

/** Pull item phrases out of a natural sentence. Ignores delivery-address tails. */
export function extractItems(utterance: string): string[] {
  const body = utterance
    .split(/\b(?:deliver(?:y)?\s+to|to my|at my)\b/i)[0]
    .replace(/[.?!]+$/g, "")
    .trim();

  return body
    .split(SPLIT)
    .map((part) => part.replace(FILLER, "").trim())
    .filter((part) => part.length > 1);
}

export function routeUtterance(utterance: string): Intent {
  const text = utterance.trim();
  if (text.length === 0) return { kind: "off_topic" };

  if (STATUS_PATTERNS.some((p) => p.test(text))) return { kind: "status" };
  if (REPEAT_PATTERNS.some((p) => p.test(text))) return { kind: "repeat" };

  const items = extractItems(text);
  const hasOrderCue = ORDER_CUES.some((p) => p.test(text));

  if (items.length > 0 && hasOrderCue) return { kind: "order", items };

  return { kind: "off_topic" };
}

/** The only off-topic reply Aira is allowed to give. */
export const GUARDRAIL_REPLY =
  "I can only help with orders. What do you want to order today?";
