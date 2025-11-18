export const normalizeOptions = (options) =>
  Array.isArray(options) ? options : Object.values(options || {});

export const normalizeSelectedOptions = (selectedOptions) =>
  Array.isArray(selectedOptions) ? selectedOptions : Object.values(selectedOptions || {});

export default {
  normalizeOptions,
  normalizeSelectedOptions,
};