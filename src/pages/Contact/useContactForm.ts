import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ContactValues {
  name: string;
  email: string;
  phone: string;
  postal: string;
  country: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMPTY: ContactValues = {
  name: '',
  email: '',
  phone: '',
  postal: '',
  country: '',
  message: '',
};

/** Per-country rules, so a valid German PLZ is accepted on the German form and a US ZIP is not. */
const POSTAL_PATTERNS: Record<string, RegExp> = {
  DE: /^\d{5}$/,
  IN: /^\d{6}$/,
  US: /^\d{5}(-\d{4})?$/,
  CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
};

const PHONE_PATTERNS: Record<string, RegExp> = {
  DE: /^\+49[\s\d]{6,}$/,
  IN: /^\+91[\s\d]{8,}$/,
  US: /^\+1[\s\d]{9,}$/,
  CA: /^\+1[\s\d]{9,}$/,
};

/**
 * Hand-rolled rather than react-hook-form: validation messages are one of the surfaces a
 * localization sweep most often misses, so the fixture needs them to be plain, predictable
 * DOM with a stable anchor rather than a library's internal render timing.
 */
export function useContactForm() {
  const { t } = useTranslation('contact');
  const [values, setValues] = useState<ContactValues>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const setField = useCallback((field: keyof ContactValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validate = useCallback((): ContactErrors => {
    const next: ContactErrors = {};
    if (!values.name.trim()) next.name = t('validation.nameRequired');
    if (!values.email.trim()) next.email = t('validation.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      next.email = t('validation.emailInvalid');
    }

    const country = values.country || 'DE';
    if (values.phone.trim() && !PHONE_PATTERNS[country]?.test(values.phone.trim())) {
      next.phone = t('validation.phoneInvalid');
    }
    if (values.postal.trim() && !POSTAL_PATTERNS[country]?.test(values.postal.trim())) {
      next.postal = t('validation.postalInvalid');
    }
    if (!values.message.trim()) next.message = t('validation.messageRequired');
    return next;
  }, [values, t]);

  const submit = useCallback(() => {
    const found = validate();
    setErrors(found);
    const ok = Object.keys(found).length === 0;
    setSubmitted(ok);
    return ok;
  }, [validate]);

  return { values, errors, submitted, setField, submit };
}
