/**
 * Utility functions for formatting data
 */

/**
 * Format a date into a string with specified format
 * @param date Date to format
 * @param format Optional format string (defaults to 'MM/DD/YYYY')
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, format: string = 'MM/DD/YYYY'): string => {
  const d = new Date(date);
  
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();

  let formatted = format
    .replace('MM', month)
    .replace('DD', day)
    .replace('YYYY', year.toString());

  return formatted;
};

/**
 * Format a number as currency
 * @param amount Number to format
 * @param currency Currency code (defaults to 'USD') 
 * @param locale Locale string (defaults to 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format a number with thousand separators and decimal places
 * @param num Number to format
 * @param decimals Number of decimal places (defaults to 2)
 * @param locale Locale string (defaults to 'en-US') 
 * @returns Formatted number string
 */
export const formatNumber = (
  num: number,
  decimals: number = 2,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Truncate text to specified length with ellipsis
 * @param text Text to truncate
 * @param length Maximum length (defaults to 100)
 * @param suffix Suffix to append (defaults to '...')
 * @returns Truncated text string
 */
export const truncateText = (
  text: string,
  length: number = 100,
  suffix: string = '...'
): string => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
};