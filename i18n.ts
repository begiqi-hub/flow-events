import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

const locales = ['sq', 'en', 'mk', 'cg'];

export default getRequestConfig(async ({requestLocale}) => {
  // Presim që sistemi të na japë gjuhën nga URL-ja
  let locale = await requestLocale;

  // Nëse nuk ka gjuhë, ose gjuha nuk është në listën tonë, jep error 404
  if (!locale || !locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale, // TS kërkon me detyrim që ta kthejmë edhe këtë fushë tani!
    messages: (await import(`./messages/${locale}.json`)).default
  };
});