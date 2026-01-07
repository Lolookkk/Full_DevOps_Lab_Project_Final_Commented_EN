export function isE164 (value) {
  // E.164: + followed by 7 to 15 digits
  return typeof value === 'string' && /^\+[1-9]\d{6,14}$/.test(value)
}
