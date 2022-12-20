const generateParamString = (key: string, value: string) => {
  return '' + key + '=' + encodeURIComponent(value);
};

const buildQueryString = (
  obj: Record<string, string | number | null | undefined>
) => {
  const builder: string[] = [];

  for (const prop in obj) {
    const value = obj[prop];

    if (typeof value == 'string') {
      builder.push(generateParamString(prop, value));
    } else if (typeof value == 'number' && !isNaN(value)) {
      builder.push(generateParamString(prop, String(value)));
    }
  }

  const result = builder.join('&');

  return result ? '?' + result : '';
};

export default buildQueryString;
