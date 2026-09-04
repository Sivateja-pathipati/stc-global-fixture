import { useTranslation } from 'react-i18next';
import Card from '@/ui/Card';
import Input from '@/ui/Input';
import Button from '@/ui/Button';
import { useContactForm } from './useContactForm';
import { COUNTRY_OPTIONS } from '@/constants/countries';
import { HARDCODED_CONTACT_CTA_EN } from '@/constants/labels/hardcoded';
import { D_EN_CONTACT_CTA_HARDCODED } from '@/constants/generated/activeDefects';

export default function ContactForm() {
  const { t } = useTranslation('contact');
  const { values, errors, submitted, setField, submit } = useContactForm();

  return (
    <Card testId="contact-form-card">
      <h2 className="text-lg font-semibold text-[var(--rgt-text-strong)]">{t('form.heading')}</h2>

      {submitted && (
        <div
          role="status"
          data-rgt-id="contact-success"
          className="mt-4 rounded-lg bg-[var(--rgt-success-soft)] p-4"
        >
          <p className="text-sm font-semibold text-[var(--rgt-success)]">
            {t('form.successTitle')}
          </p>
          <p className="mt-1 text-sm text-[var(--rgt-text-muted)]">{t('form.successBody')}</p>
        </div>
      )}

      <form
        noValidate
        className="mt-5 grid gap-4 sm:grid-cols-2"
        data-rgt-id="contact-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Input
          label={t('form.nameLabel')}
          // Placeholder text is invisible to text-node extraction — a deliberate probe for
          // detectors that only walk rendered text and never read attributes.
          placeholder={t('form.namePlaceholder')}
          value={values.name}
          error={errors.name}
          data-rgt-id="contact-name"
          onChange={(e) => setField('name', e.target.value)}
        />
        <Input
          label={t('form.emailLabel')}
          type="email"
          placeholder={t('form.emailPlaceholder')}
          value={values.email}
          error={errors.email}
          data-rgt-id="contact-email"
          onChange={(e) => setField('email', e.target.value)}
        />
        <Input
          label={t('form.phoneLabel')}
          type="tel"
          placeholder={t('form.phonePlaceholder')}
          value={values.phone}
          error={errors.phone}
          data-rgt-id="contact-phone"
          onChange={(e) => setField('phone', e.target.value)}
        />
        <Input
          label={t('form.postalLabel')}
          placeholder={t('form.postalPlaceholder')}
          value={values.postal}
          error={errors.postal}
          data-rgt-id="contact-postal"
          onChange={(e) => setField('postal', e.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="contact-country"
            className="text-[13px] font-semibold text-[var(--rgt-text-strong)]"
          >
            {t('form.countryLabel')}
          </label>
          <select
            id="contact-country"
            data-rgt-id="contact-country"
            value={values.country}
            onChange={(e) => setField('country', e.target.value)}
            className="h-10 rounded-lg border border-[var(--rgt-border-strong)] bg-[var(--rgt-surface)] px-3 text-sm"
          >
            <option value="">{t('form.countryPlaceholder')}</option>
            {COUNTRY_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="contact-message"
            className="text-[13px] font-semibold text-[var(--rgt-text-strong)]"
          >
            {t('form.messageLabel')}
          </label>
          <textarea
            id="contact-message"
            rows={4}
            data-rgt-id="contact-message"
            placeholder={t('form.messagePlaceholder')}
            value={values.message}
            onChange={(e) => setField('message', e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            className="rounded-lg border border-[var(--rgt-border-strong)] bg-[var(--rgt-surface)] p-3 text-sm"
          />
          {errors.message && (
            <p role="alert" className="text-[12px] text-[var(--rgt-danger)]">
              {errors.message}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" data-rgt-id="contact-submit">
            {/* Seeded: an English literal in the component, so the submit button stays English
                on every locale while the labels around it are translated. */}
            {D_EN_CONTACT_CTA_HARDCODED ? HARDCODED_CONTACT_CTA_EN : t('form.submit')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
