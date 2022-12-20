export const findIndexFromUniqueKey = <T, U extends keyof T>(
  key: U,
  value: T[U],
  arr: T[]
): number => {
  for (let i = 0; i < arr.length; i++) {
    if (value === arr[i][key]) {
      return i;
    }
  }
  return -1;
};
