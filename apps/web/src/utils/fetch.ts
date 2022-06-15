import unfetch from 'unfetch';

export const fetch = window.fetch || unfetch;
