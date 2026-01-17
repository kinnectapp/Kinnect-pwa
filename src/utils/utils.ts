
export const hashString = (value: string) =>
  btoa(unescape(encodeURIComponent(value)));