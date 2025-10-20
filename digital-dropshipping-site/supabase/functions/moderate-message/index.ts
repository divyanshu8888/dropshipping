import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ModerationResult {
  shouldBlock: boolean;
  violations: Violation[];
  redactedText: string;
  originalText: string;
}

interface Violation {
  ruleCode: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'warn' | 'redact' | 'block';
  matched: boolean;
  matchedText?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { message, conversationId, userId } = await req.json()

    if (!message || !conversationId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Run moderation check
    const moderationResult = await moderateMessage(message)

    // If message should be blocked, log the attempt and return error
    if (moderationResult.shouldBlock) {
      // Log violation attempt
      await logViolationAttempt(supabaseClient, {
        userId,
        conversationId,
        message,
        violations: moderationResult.violations,
        blocked: true
      })

      return new Response(
        JSON.stringify({
          success: false,
          error: 'POLICY_BLOCKED',
          reason: 'Message blocked by moderation policy',
          violations: moderationResult.violations,
          tips: [
            'Please keep pricing discussions out of chat',
            'Use "Request Quote" for pricing inquiries',
            'Avoid sharing contact information',
            'Upload files through the platform instead of sharing links'
          ]
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If violations found but not blocked, log them
    if (moderationResult.violations.length > 0) {
      await logViolationAttempt(supabaseClient, {
        userId,
        conversationId,
        message,
        violations: moderationResult.violations,
        blocked: false
      })
    }

    // Return success with redacted text
    return new Response(
      JSON.stringify({
        success: true,
        message: moderationResult.redactedText,
        violations: moderationResult.violations,
        redacted: moderationResult.redactedText !== moderationResult.originalText
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Moderation function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function moderateMessage(text: string): Promise<ModerationResult> {
  const violations: Violation[] = []
  let redactedText = text
  let shouldBlock = false

  // Define moderation patterns
  const patterns = {
    pricing: {
      regex: /(?i)(\$|€|£|₹|AUD|USD|EUR)\s*\d+|\b(per\s*(hour|hr|day|week|month)|rate|quote|price|discount|invoice|payment)\b|\b\d{2,}(\.\d{1,2})?\s*(k|per\s*hour|/hr|/month)\b/g,
      severity: 'high' as const,
      action: 'redact' as const,
      code: 'PRICING'
    },
    contact: {
      regex: /(?i)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}|\b(whatsapp|telegram|discord|wechat|signal|meet|zoom|skype)\b/g,
      severity: 'critical' as const,
      action: 'block' as const,
      code: 'CONTACT'
    },
    urls: {
      regex: /https?:\/\/[^\s]+|www\.[^\s]+/gi,
      severity: 'medium' as const,
      action: 'redact' as const,
      code: 'URLS'
    },
    pii: {
      regex: /(?i)\b(ssn|social security|passport|license|address|street|avenue|road)\b/g,
      severity: 'critical' as const,
      action: 'redact' as const,
      code: 'PII'
    }
  }

  // Check each pattern
  for (const [key, pattern] of Object.entries(patterns)) {
    const matches = [...text.matchAll(pattern.regex)]
    
    if (matches.length > 0) {
      violations.push({
        ruleCode: pattern.code,
        severity: pattern.severity,
        action: pattern.action,
        matched: true,
        matchedText: matches.map(m => m[0]).join(', ')
      })

      // Apply action based on pattern
      switch (pattern.action) {
        case 'redact':
          redactedText = redactedText.replace(pattern.regex, `[redacted: ${pattern.code}]`)
          break
        case 'block':
          shouldBlock = true
          break
        case 'warn':
          // Just flag, no text modification
          break
      }
    }
  }

  // Block if critical violations or too many violations
  if (violations.some(v => v.severity === 'critical') || violations.length >= 3) {
    shouldBlock = true
  }

  return {
    shouldBlock,
    violations,
    redactedText,
    originalText: text
  }
}

async function logViolationAttempt(
  supabaseClient: any,
  data: {
    userId: string;
    conversationId: string;
    message: string;
    violations: Violation[];
    blocked: boolean;
  }
) {
  try {
    // Log moderation event
    await supabaseClient
      .from('moderation_events')
      .insert({
        user_id: data.userId,
        conversation_id: data.conversationId,
        event_type: data.blocked ? 'blocked_attempt' : 'violation',
        details: {
          message: data.message,
          violations: data.violations,
          blocked: data.blocked,
          timestamp: new Date().toISOString()
        }
      })

    // If blocked, check for repeat offender pattern
    if (data.blocked) {
      const { data: recentViolations } = await supabaseClient
        .from('moderation_events')
        .select('*')
        .eq('user_id', data.userId)
        .eq('event_type', 'blocked_attempt')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .limit(5)

      // If user has 3+ blocked attempts in 24 hours, flag for admin review
      if (recentViolations && recentViolations.length >= 3) {
        await supabaseClient
          .from('moderation_events')
          .insert({
            user_id: data.userId,
            conversation_id: data.conversationId,
            event_type: 'escalation',
            details: {
              reason: 'repeat_offender',
              blocked_attempts_24h: recentViolations.length + 1,
              auto_escalated: true
            }
          })
      }
    }
  } catch (error) {
    console.error('Error logging violation attempt:', error)
  }
}
