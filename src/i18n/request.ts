import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { Locale } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  const common = (await import(`../messages/${locale}/common.json`)).default;
  const home = (await import(`../messages/${locale}/home.json`)).default;
  const tools = (await import(`../messages/${locale}/tools.json`)).default;
  const toolUi = (await import(`../messages/${locale}/tool-ui.json`)).default;
  const seo = (await import(`../messages/${locale}/seo.json`)).default;
  const pages = (await import(`../messages/${locale}/pages.json`)).default;

  return {
    locale,
    messages: {
      common,
      home,
      tools,
      toolUi,
      seo,
      pages,
    },
  };
});
