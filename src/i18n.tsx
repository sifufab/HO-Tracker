import { createContext, useContext, type ReactNode } from 'react';

import { formatNumber, type Language } from './logic';

const de = {
  weekdays: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  settings: 'Einstellungen',
  previousMonth: 'Vorheriger Monat',
  nextMonth: 'Nächster Monat',
  dayTitle: (day: number, month: string, year: number) => `${day}. ${month} ${year}`,
  dayA11y: (day: number) => `Tag ${day}`,
  legendOffice: 'Büro',
  legendHomeFull: 'HO ganz',
  legendHomePartial: 'HO teilweise',
  legendAbsent: 'Abwesend',
  absentShort: 'frei',
  // Day editor
  target: (hours: string) => `Soll: ${hours} h`,
  office: 'Büro',
  fullDayHome: (hours: string) => `Ganzer Tag Homeoffice (${hours} h)`,
  absent: 'Abwesend (Urlaub, Feiertag, krank)',
  partialHome: 'Teilweise Homeoffice',
  hoursPlaceholder: 'Stunden, z. B. 4',
  homeHoursA11y: 'Homeoffice-Stunden',
  save: 'Speichern',
  cancel: 'Abbrechen',
  hoursRangeError: (max: string) => `Bitte eine Zahl zwischen 0 und ${max} eingeben.`,
  // Stats
  homeShare: (limit: string) => `Homeoffice-Anteil (max. ${limit} %)`,
  targetHours: 'Soll-Arbeitszeit',
  homeOffice: 'Homeoffice',
  remaining: (hours: string) => `Noch ${hours} h Homeoffice möglich`,
  exceeded: (hours: string) => `Limit um ${hours} h überschritten`,
  // Settings
  language: 'Sprache',
  languageAuto: 'Automatisch',
  maxHomeShare: 'Maximaler Homeoffice-Anteil',
  maxHomeShareA11y: 'Maximaler Homeoffice-Anteil in Prozent',
  hoursPerWeekday: 'Soll-Stunden pro Wochentag',
  hoursPerWeekdayA11y: (day: string) => `Soll-Stunden ${day}`,
  zeroHoursHint: 'Tage mit 0 h gelten als arbeitsfrei.',
  adPrivacy: 'Datenschutz-Einstellungen für Werbung',
};

export type Strings = typeof de;

const en: Strings = {
  weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  settings: 'Settings',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  dayTitle: (day, month, year) => `${month} ${day}, ${year}`,
  dayA11y: (day) => `Day ${day}`,
  legendOffice: 'Office',
  legendHomeFull: 'Home full',
  legendHomePartial: 'Home partial',
  legendAbsent: 'Absent',
  absentShort: 'off',
  target: (hours) => `Target: ${hours} h`,
  office: 'Office',
  fullDayHome: (hours) => `Full day home office (${hours} h)`,
  absent: 'Absent (vacation, holiday, sick)',
  partialHome: 'Partial home office',
  hoursPlaceholder: 'Hours, e.g. 4',
  homeHoursA11y: 'Home office hours',
  save: 'Save',
  cancel: 'Cancel',
  hoursRangeError: (max) => `Please enter a number between 0 and ${max}.`,
  homeShare: (limit) => `Home office share (max. ${limit} %)`,
  targetHours: 'Target working time',
  homeOffice: 'Home office',
  remaining: (hours) => `${hours} h of home office left`,
  exceeded: (hours) => `Limit exceeded by ${hours} h`,
  language: 'Language',
  languageAuto: 'Automatic',
  maxHomeShare: 'Maximum home office share',
  maxHomeShareA11y: 'Maximum home office share in percent',
  hoursPerWeekday: 'Target hours per weekday',
  hoursPerWeekdayA11y: (day) => `Target hours ${day}`,
  zeroHoursHint: 'Days with 0 h count as days off.',
  adPrivacy: 'Privacy settings for ads',
};

const STRINGS: Record<Language, Strings> = { de, en };

type I18n = { t: Strings; lang: Language; num: (value: number) => string };

const I18nContext = createContext<I18n>({ t: de, lang: 'de', num: (v) => formatNumber(v, 'de') });

export function I18nProvider({ lang, children }: { lang: Language; children: ReactNode }) {
  const value: I18n = { t: STRINGS[lang], lang, num: (v) => formatNumber(v, lang) };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}

export function deviceLocale(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    return 'en';
  }
}
