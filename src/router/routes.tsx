import { Route, Routes } from 'react-router-dom';
import LocaleShell from '@/layout/LocaleShell';
import LocaleGate from '@/layout/LocaleGate';
import RequireAuth from '@/components/RequireAuth';
import HomePage from '@/pages/Home/HomePage';
import AboutPage from '@/pages/About/AboutPage';
import ServicesPage from '@/pages/Services/ServicesPage';
import PricingPage from '@/pages/Pricing/PricingPage';
import EventsPage from '@/pages/Events/EventsPage';
import ContactPage from '@/pages/Contact/ContactPage';
import BlogListPage from '@/pages/Blog/BlogListPage';
import ArticlePage from '@/pages/Blog/ArticlePage';
import LoginPage from '@/pages/Login/LoginPage';
import AccountPage from '@/pages/Account/AccountPage';
import NotFoundPage from '@/pages/NotFound/NotFoundPage';
import ServerErrorPage from '@/pages/ServerError/ServerErrorPage';
import { SUPPORTED_LOCALES } from '@/constants/locales';
import { childPath } from '@/constants/routes';

/**
 * Declarative <Routes>, not createBrowserRouter. A data router adds loader/action async
 * boundaries and a hydrate-fallback state — gratuitous non-determinism for an app that fetches
 * nothing, and a needless difference from the sibling FE repo's routing.
 *
 * NOTE the literal locale routes. React Router 6 puts no regex constraint on a param, so
 * <Route path=":locale"> would also match '/about' and make LocaleGate unreachable. Mapping
 * SUPPORTED_LOCALES to sibling routes avoids that, and passing the locale as a compile-time
 * prop means nothing downstream has to ask "is this segment a locale?".
 */
const localeChildren = (
  <>
    <Route index element={<HomePage />} />
    <Route path={childPath('about')} element={<AboutPage />} />
    <Route path={childPath('services')} element={<ServicesPage />} />
    <Route path={childPath('pricing')} element={<PricingPage />} />
    <Route path={childPath('events')} element={<EventsPage />} />
    <Route path={childPath('contact')} element={<ContactPage />} />
    <Route path={childPath('blog')} element={<BlogListPage />} />
    <Route path={childPath('blog.article')} element={<ArticlePage />} />
    <Route path={childPath('login')} element={<LoginPage />} />
    <Route
      path={childPath('account')}
      element={
        <RequireAuth>
          <AccountPage />
        </RequireAuth>
      }
    />
    <Route path={childPath('serverError')} element={<ServerErrorPage />} />
    <Route path={childPath('notFound')} element={<NotFoundPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </>
);

export default function AppRoutes() {
  return (
    <Routes>
      {SUPPORTED_LOCALES.map((locale) => (
        <Route key={locale} path={locale} element={<LocaleShell locale={locale} />}>
          {localeChildren}
        </Route>
      ))}
      <Route path="*" element={<LocaleGate />} />
    </Routes>
  );
}
