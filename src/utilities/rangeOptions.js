import { getDay } from './formatters';

export const RANGE_OPTIONS = {
  all_time: {
    label: 'Всички',
    startDate: null,
    endDate: null,
  },
  today: {
    label: 'Днес',
    startDate: getStartDays(0),
    endDate: null,
  },
  last_7_days: {
    label: 'Последните 7 дни',
    startDate: getStartDays(6),
    endDate: null,
  },
  last_30_days: {
    label: 'Последните 30 дни',
    startDate: getStartDays(29),
    endDate: null,
  },
  last_90_days: {
    label: 'Последните 90 дни',
    startDate: getStartDays(89),
    endDate: null,
  },
  last_365_days: {
    label: 'Последните 365 дни',
    startDate: getStartDays(364),
    endDate: null,
  },
};

/**
 * @description Retrieves the range option based on the provided range value, start date, and end date.
 * @param {string} [range] - The range value.
 * @param {string} [from] - The start date.
 * @param {string} [to] - The end date.
 * @returns {RangeOption | undefined} The range option object.
 */
export function getRangeOption(range, from, to) {
  if (range) return RANGE_OPTIONS[range];

  const startDate = new Date(from || '');
  const endDate = new Date(to || '');

  if (!isValid(startDate) || !isValid(endDate)) return;

  return {
    label: `${getDay(startDate)} - ${getDay(endDate)}`,
    startDate,
    endDate,
  };
}

/**
 * @description Returns the start date for a given offset.
 * @param {number} offset - The number of days to subtract from the current date.
 * @returns {Date} The start date.
 */
function getStartDays(offset) {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  date.setHours(0, 0, 0, 0);

  return date;
}

/**
 * @description Checks if a given value is a valid date.
 * @param {any} date - The value to be checked.
 * @returns {boolean} Returns true if the value is a valid date, otherwise false.
 */
function isValid(date) {
  const isDate = date instanceof Date ||
    (typeof date === 'object' && Object.prototype.toString.call(date) === '[object Date]');

  if (!isDate && typeof date !== 'number') return false;

  return !isNaN(Number(new Date(date)));
}

/**
 * @typedef {object} RangeOption The range option object.
 * @property {string} label - The label for the range option.
 * @property {Date | null} startDate - The start date for the range option.
 * @property {Date | null} endDate - The end date for the range option.
 */