import { query } from '../mysql';

/**
 * ============================================================================
 * AI moderation pass (SERVER-ONLY — imports mysql; never import client-side)
 * ============================================================================
 * Second line of defense behind the word/pattern filter (contentFilter.ts).
 * Scores text BY MEANING: hate, harassment, sexual content, violence,
 * self-harm, and PII-style leakage that keyword lists miss.
 *
 * Providers (first configured key wins):
 *   - OPENAI_API_KEY     → omni-moderation-latest (free moderation endpoint)
 *   - ANTHROPIC_API_KEY  → claude-3-5-haiku judging with a strict JSON rubric
 *
 * Fail-open by design: if no key is configured, the call times out, or the
 * provider errors, content is NOT blocked (the word filter already ran) —
 * but availability problems are logged so you notice.
 * ============================================================================
 */

export interface ModerationResult {
  available: boolean; // was a provider actually consulted?
  flagged: boolean;
  categories: string[];
}

const TIMEOUT_MS = 5000;
const MAX_CHARS = 8000;

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function moderateWithOpenAI(text: string, apiKey: string): Promise<ModerationResult> {
  const res = await fetchWithTimeout('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'omni-moderation-latest', input: text.slice(0, MAX_CHARS) }),
  });
  // Why: include the response body — "401 Incorrect API key" vs "429 rate limit" needs no guessing.
  if (!res.ok) throw new Error(`OpenAI moderation HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = await res.json();
  const result = data?.results?.[0];
  if (!result) throw new Error('OpenAI moderation: empty result');
  const categories = Object.entries(result.categories || {})
    .filter(([, v]) => v === true)
    .map(([k]) => k);
  return { available: true, flagged: Boolean(result.flagged), categories };
}

async function moderateWithAnthropic(text: string, apiKey: string): Promise<ModerationResult> {
  const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 200,
      system:
        'You are a strict content moderator for a professional freelance marketplace. ' +
        'Evaluate the user text for: hate (incl. religious/ethnic), harassment, sexual content, ' +
        'violence, self-harm, scams/fraud, and attempts to share contact/payment details. ' +
        'Respond with ONLY minified JSON: {"flagged":boolean,"categories":string[]} — no prose.',
      messages: [{ role: 'user', content: text.slice(0, MAX_CHARS) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic moderation HTTP ${res.status}`);
  const data = await res.json();
  const raw = data?.content?.[0]?.text ?? '';
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Anthropic moderation: no JSON in response');
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    available: true,
    flagged: Boolean(parsed.flagged),
    categories: Array.isArray(parsed.categories) ? parsed.categories.map(String) : [],
  };
}

export async function moderateText(text: string): Promise<ModerationResult> {
  const trimmed = (text || '').trim();
  if (!trimmed) return { available: false, flagged: false, categories: [] };

  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  try {
    // Why: Anthropic preferred — OpenAI's "free" moderation endpoint 429s on
    // zero-billing accounts, so Claude is the reliable primary when configured.
    if (anthropicKey) return await moderateWithAnthropic(trimmed, anthropicKey);
    if (openaiKey) return await moderateWithOpenAI(trimmed, openaiKey);
    // Why: a missing key fails open SILENTLY — make the skip visible in server logs.
    console.warn('[ai-moderation] no OPENAI_API_KEY / ANTHROPIC_API_KEY configured — AI pass skipped');
    return { available: false, flagged: false, categories: [] };
  } catch (error) {
    // Why: moderation outages must not take down profile saves or chat — fail open, loudly.
    console.error('[ai-moderation] provider error (failing open):', error);
    return { available: false, flagged: false, categories: [] };
  }
}

/**
 * Moderates named fields as one document; if flagged, queues an admin review
 * entry (type 'ai_content_flagged') holding the categories and an excerpt so
 * moderators see exactly what was attempted. Returns the verdict.
 */
export async function moderateAndQueue(
  scope: string, // e.g. 'profile', 'message', 'proposal'
  userId: number,
  fields: Record<string, string | undefined | null>,
): Promise<ModerationResult> {
  const combined = Object.entries(fields)
    .filter(([, v]) => typeof v === 'string' && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n\n');

  const verdict = await moderateText(combined);

  if (verdict.flagged) {
    try {
      await query(
        `INSERT INTO admin_notifications (type, title, message, metadata, user_id, severity, is_read, created_at)
         VALUES ('ai_content_flagged', ?, ?, ?, ?, 'high', 'FALSE', NOW())`,
        [
          `AI flagged ${scope} content`,
          `User #${userId}: ${scope} content flagged for ${verdict.categories.join(', ') || 'policy violation'}`,
          JSON.stringify({ scope, categories: verdict.categories, excerpt: combined.slice(0, 1500) }),
          userId,
        ],
      );
    } catch (e) {
      console.error('[ai-moderation] failed to queue admin review:', e);
    }
  }

  return verdict;
}
