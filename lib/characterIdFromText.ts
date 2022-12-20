const characterIdFromText = (characterIdText: string) => {
  if (typeof characterIdText != 'string') {
    return NaN;
  } else if (/^-?\d*$/.test(characterIdText)) {
    return Number(characterIdText);
  } else if (/^#[1-9]\d*$/.test(characterIdText)) {
    return Number(characterIdText.replace('#', ''));
  } else {
    return NaN;
  }
};

export default characterIdFromText;
