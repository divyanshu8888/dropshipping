import { NextApiRequest, NextApiResponse } from 'next';
import { moderateText } from '../../src/lib/moderation/aiModeration';

/**
 * DEV-ONLY diagnostic: GET /api/test-moderation
 * Confirms whether the AI moderation provider is configured and responding.
 * Never exposes key values — only booleans and the verdict for a test phrase.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Why: diagnostic endpoints must never ship to production.
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const started = Date.now();
  // A phrase any moderation model must flag (violent threat).
  const verdict = await moderateText('I will find you and kill you, you worthless piece of garbage.');

  return res.status(200).json({
    keysConfigured: {
      OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
      ANTHROPIC_API_KEY: Boolean(process.env.ANTHROPIC_API_KEY),
    },
    providerResponded: verdict.available,
    testPhraseFlagged: verdict.flagged,
    categories: verdict.categories,
    durationMs: Date.now() - started,
    interpretation: !process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY
      ? 'No key loaded — check .env.local spelling and restart the dev server.'
      : !verdict.available
        ? 'Key is loaded but the provider call FAILED — check the terminal for "[ai-moderation] provider error" (now includes the HTTP response body).'
        : verdict.flagged
          ? 'Working correctly — the AI pass is active.'
          : 'Provider responded but did not flag an obvious threat — unexpected; check the terminal.',
  });
}
