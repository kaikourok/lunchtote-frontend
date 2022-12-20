const replaceArrayPosition = <T>(
  array: T[],
  indexA: number,
  indexB: number
): T[] => {
  return array.map((item, index) => {
    if (index == indexA) {
      return array[indexB];
    } else if (index == indexB) {
      return array[indexA];
    } else {
      return item;
    }
  });
};

export default replaceArrayPosition;
