/**
 * The country list offered on the contact form.
 *
 * Deliberately short and NOT translated: country names here are the endonym-free ISO English
 * short names, which is a common real-world choice. Sorted by code so the option order is
 * byte-stable across builds rather than depending on collation.
 */
export const COUNTRY_OPTIONS = [
  { code: 'CA', label: 'Canada' },
  { code: 'DE', label: 'Germany' },
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
] as const;
