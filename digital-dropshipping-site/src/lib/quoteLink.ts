import type { UrlObject } from 'url';
import { QuoteRequestContext } from '../components/QuoteRequestForm';

export const buildQuoteHref = (
  context?: QuoteRequestContext
): UrlObject => {
  if (!context) {
    return { pathname: '/request-quote' };
  }

  const query: Record<string, string> = {};

  Object.entries(context).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query[key] = String(value);
    }
  });

  return {
    pathname: '/request-quote',
    query
  };
};

