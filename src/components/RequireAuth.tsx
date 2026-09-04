import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { APP_ROUTES } from '@/constants/routes';
import type { RequireAuthProps } from '@/types/components';

export default function RequireAuth({ children }: RequireAuthProps) {
  const { session } = useAuth();
  const { localePath } = useLocale();
  const location = useLocation();

  if (!session) {
    return (
      <Navigate to={localePath(APP_ROUTES.login)} state={{ from: location.pathname }} replace />
    );
  }
  return children;
}
