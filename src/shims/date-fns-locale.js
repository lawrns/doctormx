/**
 * Shim for date-fns/locale
 */

// Spanish locale
export const es = {
  code: 'es',
  formatLong: {
    date: () => 'DD/MM/YYYY',
    time: () => 'HH:mm',
    dateTime: () => 'DD/MM/YYYY HH:mm'
  },
  formatRelative: () => '',
  localize: {
    month: () => '',
    day: () => '',
    dayPeriod: () => ''
  },
  match: {
    ordinalNumber: () => ({ match: [] }),
    era: () => ({ match: [] }),
    quarter: () => ({ match: [] }),
    month: () => ({ match: [] }),
    day: () => ({ match: [] }),
    dayPeriod: () => ({ match: [] })
  },
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 1
  }
};

// US English locale
export const enUS = {
  code: 'en-US',
  formatLong: {
    date: () => 'MM/DD/YYYY',
    time: () => 'HH:mm',
    dateTime: () => 'MM/DD/YYYY HH:mm'
  },
  formatRelative: () => '',
  localize: {
    month: () => '',
    day: () => '',
    dayPeriod: () => ''
  },
  match: {
    ordinalNumber: () => ({ match: [] }),
    era: () => ({ match: [] }),
    quarter: () => ({ match: [] }),
    month: () => ({ match: [] }),
    day: () => ({ match: [] }),
    dayPeriod: () => ({ match: [] })
  },
  options: {
    weekStartsOn: 0,
    firstWeekContainsDate: 1
  }
};

export default {
  es,
  enUS
};
