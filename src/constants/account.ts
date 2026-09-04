import type { LocaleId } from '@/types/locale';

export interface AccountSnapshot {
  readonly plan: string;
  readonly seats: string;
  readonly renewal: string;
  readonly invoiceNumber: string;
  readonly invoiceAmount: string;
  readonly invoiceDate: string;
}

/**
 * The signed-in user's account figures, pre-formatted per locale.
 *
 * Not computed with Intl at render time, for the same reason the pricing table is not: the
 * manifest asserts exact strings for the account-page format defects, and ICU output varies
 * across Node versions in ways that would silently break those assertions.
 */
export const ACCOUNT_SNAPSHOT: Readonly<Record<LocaleId, AccountSnapshot>> = {
  'en-US': {
    plan: 'Team',
    seats: '86 of 120',
    renewal: '1 April 2026',
    invoiceNumber: 'INV-2026-0311',
    invoiceAmount: '$1,349.00',
    invoiceDate: '1 March 2026',
  },
  'de-DE': {
    plan: 'Team',
    seats: '86 von 120',
    renewal: '1. April 2026',
    invoiceNumber: 'INV-2026-0311',
    invoiceAmount: '1.349,00 €',
    invoiceDate: '1. März 2026',
  },
  'hi-IN': {
    plan: 'Team',
    seats: '120 में से 86',
    renewal: '1 अप्रैल 2026',
    invoiceNumber: 'INV-2026-0311',
    invoiceAmount: '₹1,03,900.00',
    invoiceDate: '1 मार्च 2026',
  },
};
