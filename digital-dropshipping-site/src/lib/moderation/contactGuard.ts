// lib/moderation/contactGuard.ts

const NUMBER_WORDS: Record<string, string> = {
  zero: '0', one: '1', two: '2', three: '3', four: '4',
  five: '5', six: '6', seven: '7', eight: '8', nine: '9',
  ten: '10', eleven: '11', twelve: '12', thirteen: '13',
  fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17',
  eighteen: '18', nineteen: '19', twenty: '20', thirty: '30',
  forty: '40', fifty: '50', sixty: '60', seventy: '70',
  eighty: '80', ninety: '90', hundred: '100'
};

function wordsToDigits(input: string): string {
  const tokens = input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const out: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    if (t === 'double' && NUMBER_WORDS[tokens[i + 1]]) {
      out.push(NUMBER_WORDS[tokens[i + 1]]);
      out.push(NUMBER_WORDS[tokens[i + 1]]);
      i++;
      continue;
    }
    if (t === 'triple' && NUMBER_WORDS[tokens[i + 1]]) {
      out.push(NUMBER_WORDS[tokens[i + 1]]);
      out.push(NUMBER_WORDS[tokens[i + 1]]);
      out.push(NUMBER_WORDS[tokens[i + 1]]);
      i++;
      continue;
    }
    out.push(NUMBER_WORDS[t] ?? t);
  }
  return out.join('');
}

function normalize(s: string): string {
  const digitsFromWords = wordsToDigits(s);
  return digitsFromWords
    .toLowerCase()
    .replace(/[\s\-\(\)\.\,_]/g, '')    // remove separators
    .replace(/[^\x20-\x7E]/g, '');      // drop emoji/unicode
}

const re = {
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  url: /(https?:\/\/|www\.)\S+/i,
  // generic international phone: we also check digit count
  phoneLike: /(?:\+?\d[\s-]?){8,}\d/i,
  // common social/payment keywords
  social: /\b(whats?app|telegram|discord|signal|wechat|instagram|facebook|snapchat|skype)\b/i,
  payment: /\b(upi|gpay|googlepay|phonepe|paytm|iban|swift|ifsc|routing|account\s?no|bank\s?account|venmo|cashapp|paypal)\b/i,
  handle: /@[a-z0-9_.]{3,}/i
};

export type GuardResult = 
  | { allowed: true } 
  | { allowed: false; reasons: string[]; detectedContent?: string };

export function guardMessage(raw: string): GuardResult {
  const reasons: string[] = [];
  const detectedContent: string[] = [];

  // Quick checks on raw text
  if (re.email.test(raw)) {
    reasons.push('Email addresses are not allowed');
    const matches = raw.match(re.email);
    if (matches) detectedContent.push(...matches);
  }
  
  if (re.url.test(raw)) {
    reasons.push('External links are not allowed');
    const matches = raw.match(re.url);
    if (matches) detectedContent.push(...matches);
  }
  
  if (re.social.test(raw)) {
    reasons.push('External messenger IDs are not allowed');
    const matches = raw.match(re.social);
    if (matches) detectedContent.push(...matches);
  }
  
  if (re.payment.test(raw)) {
    reasons.push('Payment/Bank details are not allowed');
    const matches = raw.match(re.payment);
    if (matches) detectedContent.push(...matches);
  }
  
  if (re.handle.test(raw)) {
    reasons.push('External handles are not allowed');
    const matches = raw.match(re.handle);
    if (matches) detectedContent.push(...matches);
  }

  // Normalized (handles obfuscation & number words)
  const n = normalize(raw);

  // Phone detection (>= 9 digits after normalization)
  const digitsOnly = n.replace(/\D/g, '');
  if (digitsOnly.length >= 9) {
    reasons.push('Phone numbers are not allowed');
    // Try to extract the phone number from original text
    const phoneMatch = raw.match(/(?:\+?\d[\s-]?){8,}\d/);
    if (phoneMatch) detectedContent.push(phoneMatch[0]);
  } else if (re.phoneLike.test(raw)) {
    reasons.push('Phone numbers are not allowed');
    const matches = raw.match(re.phoneLike);
    if (matches) detectedContent.push(...matches);
  } else {
    // Check for split number patterns (e.g., "2 2" or multiple small numbers)
    // Count all digits in the original message
    const allDigits = raw.replace(/\D/g, '');
    const digitCount = allDigits.length;
    
    // Check for multiple small numbers (1-2 digits) separated by spaces
    const smallNumberPattern = /\b\d{1,2}\b/g;
    const smallNumbers = raw.match(smallNumberPattern);
    
    if (smallNumbers && smallNumbers.length >= 2) {
      const totalDigitsFromSmallNumbers = smallNumbers.join('').replace(/\D/g, '').length;
      // If we have 2+ small numbers that together form 8-15 digits (phone number range)
      if (totalDigitsFromSmallNumbers >= 8 && totalDigitsFromSmallNumbers <= 15) {
        // Check if it's not a payment context
        const hasPaymentContext = /\b(pay|paying|paid|payment|price|cost|fee|charge|invoice|budget|rate|dollar|dollars|usd|eur|gbp|inr|rupee|rupees)\b/gi.test(raw);
        // Check if it's not a date or time
        const isDateOrTime = /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{1,2}:\d{2}\b/gi.test(raw);
        if (!hasPaymentContext && !isDateOrTime) {
          reasons.push('Phone numbers are not allowed');
          detectedContent.push(smallNumbers.join(' '));
        }
      }
    }
    
    // Final check: if message has 8-15 digits total and digits are separated
    if (digitCount >= 8 && digitCount <= 15) {
      const hasPaymentContext = /\b(pay|paying|paid|payment|price|cost|fee|charge|invoice|budget|rate|dollar|dollars|usd|eur|gbp|inr|rupee|rupees)\b/gi.test(raw);
      const isDateOrTime = /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{1,2}:\d{2}\b/gi.test(raw);
      if (!hasPaymentContext && !isDateOrTime) {
        // Check if digits are separated into groups (potential bypass attempt)
        const digitGroups = raw.match(/\b\d{1,4}\b/g);
        if (digitGroups && digitGroups.length >= 2) {
          reasons.push('Phone numbers are not allowed');
          detectedContent.push(digitGroups.join(' '));
        }
      }
    }
  }

  if (reasons.length) {
    return { 
      allowed: false, 
      reasons,
      detectedContent: detectedContent.length > 0 ? detectedContent.join(', ') : undefined
    };
  }
  
  return { allowed: true };
}

