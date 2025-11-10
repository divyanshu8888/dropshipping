import { z } from 'zod'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const budgetField = z
  .string()
  .optional()
  .transform((val: string | undefined) => {
    const trimmed = (val ?? '').trim()
    if (!trimmed) return null
    const num = Number(trimmed)
    return Number.isFinite(num) ? num : NaN
  })
  .refine((val: number | null) => val === null || !Number.isNaN(val), {
    message: 'Budget must be a number',
  })
  .refine((val: number | null) => val === null || val >= 0, {
    message: 'Budget must be a number ≥ 0',
  })

const projectQuoteBaseSchema = z.object({
  clientName: z.string().trim().min(2, 'Name is too short'),
  clientEmail: z.string().trim().email('Invalid email format'),
  clientPhone: z.string().trim().min(6, 'Enter a valid phone number'),
  phoneCountryCode: z.string().trim().min(2, 'Select a country code'),
  projectTitle: z.string().trim().min(3, 'Project title is too short'),
  projectDescription: z.string().trim().min(20, 'Please add a bit more detail'),
  budget: budgetField,
  timeline: z.string().trim().optional(),
  category: z.string().trim().min(2, 'Choose a category'),
  notes: z.string().trim().optional(),
})

type ProjectQuoteShape = z.infer<typeof projectQuoteBaseSchema>

export const projectQuoteSchema = projectQuoteBaseSchema.superRefine((data: ProjectQuoteShape, ctx: z.RefinementCtx) => {
    try {
      const phone = parsePhoneNumberFromString(data.clientPhone, data.phoneCountryCode as any)
      if (!phone || !phone.isValid()) {
        ctx.addIssue({
          path: ['clientPhone'],
          code: z.ZodIssueCode.custom,
          message: 'Invalid phone number',
        })
      }
    } catch (_err) {
      ctx.addIssue({
        path: ['clientPhone'],
        code: z.ZodIssueCode.custom,
        message: 'Invalid phone number',
      })
    }
  })

export type ProjectQuoteInput = z.infer<typeof projectQuoteSchema>

type ProjectQuoteClientShape = ProjectQuoteShape & { phoneLocal: string }

export const projectQuoteClientSchema = projectQuoteBaseSchema
  .extend({
    phoneLocal: z.string().trim().min(3, 'Enter a phone number'),
  })
  .superRefine((data: ProjectQuoteClientShape, ctx: z.RefinementCtx) => {
    try {
      const phone = parsePhoneNumberFromString(data.clientPhone, data.phoneCountryCode as any)
      if (!phone || !phone.isValid()) {
        ctx.addIssue({
          path: ['clientPhone'],
          code: z.ZodIssueCode.custom,
          message: 'Invalid phone number',
        })
      }
    } catch (_err) {
      ctx.addIssue({
        path: ['clientPhone'],
        code: z.ZodIssueCode.custom,
        message: 'Invalid phone number',
      })
    }
  })

export const formatZodErrors = (error: z.ZodError) => {
  const formatted: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    if (!formatted[key]) {
      formatted[key] = issue.message
    }
  }
  return formatted
}

