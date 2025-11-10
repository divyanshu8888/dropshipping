export type CountryDialOption = {
  code: string
  name: string
  dialCode: string
}

export const COUNTRY_DIAL_OPTIONS: CountryDialOption[] = [
  { code: 'AU', name: 'Australia', dialCode: '+61' },
  { code: 'US', name: 'United States', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { code: 'CA', name: 'Canada', dialCode: '+1' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64' },
  { code: 'IN', name: 'India', dialCode: '+91' },
  { code: 'SG', name: 'Singapore', dialCode: '+65' },
  { code: 'DE', name: 'Germany', dialCode: '+49' },
  { code: 'FR', name: 'France', dialCode: '+33' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27' },
  { code: 'BR', name: 'Brazil', dialCode: '+55' },
  { code: 'JP', name: 'Japan', dialCode: '+81' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60' },
  { code: 'PH', name: 'Philippines', dialCode: '+63' },
]

export const DEFAULT_COUNTRY_CODE = 'AU'

export const findCountryOption = (code: string): CountryDialOption => {
  return (
    COUNTRY_DIAL_OPTIONS.find((option) => option.code === code) || COUNTRY_DIAL_OPTIONS[0]
  )
}

const SANITISE_LEADING_CODE_REGEX = /^\+?\d+/

export const ensureDialCodePrefix = (value: string, dialCode: string) => {
  const trimmed = value.trim()
  if (!trimmed) return `${dialCode} `
  if (trimmed.startsWith(dialCode)) return trimmed
  const withoutExisting = trimmed.replace(SANITISE_LEADING_CODE_REGEX, '').trim()
  return `${dialCode}${withoutExisting ? ' ' + withoutExisting : ''}`.trim()
}

export const formatDialLabel = (option: CountryDialOption) => `${option.name} (${option.dialCode})`

export const combinePhone = (dialCode: string, localPart: string) => {
  const cleanedLocal = localPart.replace(/^[0]+/, '').trim()
  if (!cleanedLocal) return dialCode
  return `${dialCode} ${cleanedLocal}`.trim()
}

