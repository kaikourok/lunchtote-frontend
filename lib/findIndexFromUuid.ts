export const findIndexFromUuid = (uuid: string, arr: { uuid: string }[]) => {
  for (let i = 0; i < arr.length; i++) {
    if (uuid === arr[i].uuid) {
      return i;
    }
  }
  return -1;
};
