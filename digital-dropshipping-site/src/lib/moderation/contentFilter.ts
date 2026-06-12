/**
 * ============================================================================
 * Profile / public-text content filter
 * ============================================================================
 * Pure functions (no server imports) so the SAME rules run client-side
 * (instant feedback in forms) and server-side (real enforcement).
 *
 * Two tiers:
 *  - "blocked":      abusive/explicit language — never accepted.
 *  - "questionable": scammy/adult/violent terms — also rejected from public
 *    profiles, and the attempt is logged for admin review server-side.
 * ============================================================================
 */

export type ContentTier = 'blocked' | 'questionable' | 'confidential';

export type ContentCheck =
  | { ok: true }
  | { ok: false; tier: ContentTier; match: string };

// Why: normalize leetspeak/symbol substitutions so "f0ck"/"sh!t" don't bypass the list.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@]/g, 'a')
    .replace(/[$5]/g, 's')
    .replace(/[0]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[7]/g, 't')
    .replace(/(.)\1{2,}/g, '$1$1'); // collapse looong repeats: "fuuuuck" -> "fuuck"
}

// Hard-blocked: profanity, slurs, sexual abuse terms.
const BLOCKED = [
  'fuck', 'fucker', 'fucking', 'motherfucker', 'shit', 'bullshit', 'bitch',
  'asshole', 'arsehole', 'bastard', 'cunt', 'dickhead', 'prick', 'slut',
  'whore', 'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded',
  'rape', 'rapist', 'pedophile', 'paedophile',
  // common Hindi/Urdu abuse seen on freelance platforms (incl. split-phrase + spelling variants)
  'madarchod', 'behenchod', 'bhenchod', 'chutiya', 'chutiye', 'gandu', 'gaandu',
  'harami', 'haramkhor', 'randi', 'raand',
  'behen ke lode', 'bhen ke lode', 'behen ke laude', 'maa ke lode',
  'lode', 'loda', 'lauda', 'laude', 'lund', 'lavde', 'lavda',
  'bhosdike', 'bhosadike', 'bhosda', 'bhosdi', 'bsdk',
  'chod', 'chodu', 'gaand', 'jhant', 'jhaat', 'madarjaat', 'kamina', 'kamine',
  // religious / ethnic hate slurs and violent-intent phrases
  'kafir scum', 'islamophobe', 'jihadi', 'christ killer', 'kike', 'raghead',
  'towelhead', 'infidel dogs', 'kill all muslims', 'kill all hindus',
  'kill all christians', 'kill all jews', 'ethnic cleansing', 'gas the',
  'lynch', 'go back to your country',
];

// Why: public profiles must never leak contact/payment/ID data — that's how
// deals move off-platform and how users get scammed. Pattern-based (not list).
const CONFIDENTIAL_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, label: 'email address' },
  { re: /(?:\+?\d[\s\-().]?){9,15}\d/, label: 'phone number' },
  { re: /(https?:\/\/|www\.)\S+/i, label: 'external link' },
  { re: /\b(whats?app|telegram|signal|wechat|skype|discord)\b[\s:]*[+\d@a-z]/i, label: 'messaging handle' },
  { re: /\b(upi|gpay|paytm|phonepe|venmo|cashapp|paypal|zelle|iban|swift|ifsc)\b/i, label: 'payment detail' },
  { re: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{1,4}\b/, label: 'card/ID number' },
  { re: /\b[A-Z]{5}\d{4}[A-Z]\b/, label: 'PAN number' },
  { re: /\b\d{4}\s?\d{4}\s?\d{4}\b/, label: 'Aadhaar-like number' },
  { re: /\b(sk|pk)[-_](live|test)[-_][a-z0-9]{8,}\b/i, label: 'API key' },
];

// Questionable: not profane, but has no place on a professional profile —
// scam signals, adult services, drugs, violence, gambling.
const QUESTIONABLE = [
  'scam', 'scammer', 'fraud', 'ponzi', 'pyramid scheme', 'get rich quick',
  'guaranteed returns', 'double your money', 'escort', 'porn', 'pornography',
  'onlyfans', 'nude', 'nudes', 'xxx', 'sex chat', 'sexting',
  'cocaine', 'heroin', 'meth', 'weed delivery', 'drug dealer',
  'kill', 'murder', 'terrorist', 'bomb making', 'weapon sales',
  'casino hack', 'betting tips', 'match fixing', 'fake reviews', 'fake followers',
  'stolen accounts', 'hacked accounts', 'carding', 'cvv', 'darkweb', 'dark web',
];

function findMatch(normalized: string, list: string[]): string | null {
  for (const term of list) {
    // Why: word boundaries prevent false hits like "assassin" or "Scunthorpe".
    const re = new RegExp(`(?:^|[^a-z])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:[^a-z]|$)`, 'i');
    if (re.test(normalized)) return term;
  }
  return null;
}

export function checkContent(text: string): ContentCheck {
  if (!text) return { ok: true };
  const normalized = normalize(text);

  const blocked = findMatch(normalized, BLOCKED);
  if (blocked) return { ok: false, tier: 'blocked', match: blocked };

  // Why: contact/payment/ID patterns run on the RAW text — normalization
  // would mangle digits ("0"->"o") and hide real phone numbers.
  for (const { re, label } of CONFIDENTIAL_PATTERNS) {
    if (re.test(text)) return { ok: false, tier: 'confidential', match: label };
  }

  const questionable = findMatch(normalized, QUESTIONABLE);
  if (questionable) return { ok: false, tier: 'questionable', match: questionable };

  return { ok: true };
}

/** Checks several named fields at once; returns the first problem found. */
export function checkFields(
  fields: Record<string, string | undefined | null>,
): { ok: true } | { ok: false; field: string; tier: ContentTier; match: string } {
  for (const [field, value] of Object.entries(fields)) {
    if (typeof value !== 'string' || !value) continue;
    const result = checkContent(value);
    if (!result.ok) return { ok: false, field, tier: result.tier, match: result.match };
  }
  return { ok: true };
}
