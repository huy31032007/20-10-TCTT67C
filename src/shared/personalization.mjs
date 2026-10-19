// Friendly names are presentation only. Keep the complete input for identity,
// the shared garden and its existing duplicate-name handling.
export function formatGreetingName(fullName) {
  const words = String(fullName ?? '').normalize('NFC').trim().split(/\s+/u).filter(Boolean);
  if (!words.length) return 'cậu';
  return words.slice(-2).map(word => word.toLocaleLowerCase('vi')
    .replace(/(^|[-'’])(\p{L})/gu, (_, prefix, letter) => prefix + letter.toLocaleUpperCase('vi'))).join(' ');
}

export function personalizeText(template, fullName) {
  const name = formatGreetingName(fullName);
  return String(template).replace(/\[tên\]/gu, () => name);
}
