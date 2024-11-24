export const dateFormats = [
  'MM/dd/yyyy', // United States, Canada (English)
  'dd/MM/yyyy', // Europe, Australia, UK, Mexico, Brazil, Indonesia
  'yyyy/MM/dd', // Japan, China, South Africa
  'yyyy. MM. dd.', // South Korea
  'yyyy-MM-dd', // Canada (French), Sweden
  'dd-MM-yyyy', // India
  'dd.MM.yyyy', // Russia, Germany, Norway
  'dd. MM. yyyy', // Slovakia
  'dd. MM. yyyy.', // Hungary
  'yyyy年MM月dd日', // Macao, Singapore (Chinese)
  'dd‏/MM‏/yyyy', // Arabic
  'dd‏/MM‏/yyyy هـ', // (Saudi Arabia)
  'dd.MM.yyyy г.', // Bulgaria
  'dd.MM.yyyy.', // Latvia
];

export function getDateFormatFromLocale(locale: string) {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  } as const;
  const dateTimeFormat = new Intl.DateTimeFormat(locale, options);

  const parts = dateTimeFormat.formatToParts(new Date());
  const formatMap: Record<string, string> = {
    year: 'yyyy',
    month: 'MM',
    day: 'dd',
  };

  // Reconstruct the date format pattern
  return parts.map((part) => formatMap[part.type] || part.value).join('');
}
