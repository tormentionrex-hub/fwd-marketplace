import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    // messages/ está en la raíz del repo: desde src/i18n son dos niveles arriba.
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
