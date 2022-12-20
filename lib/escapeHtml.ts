const escapeHtml = (str: string) => {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll("'", '&#x27;')
    .replaceAll('`', '&#x60;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
};

export default escapeHtml;
