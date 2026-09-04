import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Container from '@/ui/Container';
import Card from '@/ui/Card';
import Input from '@/ui/Input';
import Button from '@/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { postLoginPath } from '@/services/auth.service';
import { parseLocation } from '@/utils/routeMatch';

export default function LoginPage() {
  const { t } = useTranslation('auth');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathLocale } = parseLocation(location.pathname);

  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? null;

  return (
    <Container className="py-16" as="section">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold" data-rgt-id="login-title">
          {t('login.title')}
        </h1>
        <p className="mt-2 text-sm text-[var(--rgt-text-muted)]">{t('login.lead')}</p>

        <Card className="mt-6">
          <form
            noValidate
            data-rgt-id="login-form"
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              const result = signIn(email, passcode);
              if (!result.ok) {
                setError(
                  result.reason === 'empty' ? t('login.errorEmpty') : t('login.errorInvalid'),
                );
                return;
              }
              setError(null);
              // The one place the "locale is lost after sign-in" defect can take effect.
              navigate(postLoginPath(pathLocale, from));
            }}
          >
            <Input
              label={t('login.emailLabel')}
              type="email"
              placeholder={t('login.emailPlaceholder')}
              value={email}
              data-rgt-id="login-email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label={t('login.passcodeLabel')}
              type="password"
              placeholder={t('login.passcodePlaceholder')}
              value={passcode}
              data-rgt-id="login-passcode"
              onChange={(e) => setPasscode(e.target.value)}
            />

            {error && (
              <p
                role="alert"
                data-rgt-id="login-error"
                className="text-[13px] text-[var(--rgt-danger)]"
              >
                {error}
              </p>
            )}

            <Button type="submit" data-rgt-id="login-submit">
              {t('login.submit')}
            </Button>
          </form>

          <p
            className="mt-4 text-[12px] text-[var(--rgt-text-muted)]"
            data-rgt-id="login-demo-hint"
          >
            {t('login.demoHint')}
          </p>
        </Card>
      </div>
    </Container>
  );
}
