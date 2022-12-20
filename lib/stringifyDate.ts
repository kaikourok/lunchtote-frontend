export const stringifyDate = (
  date: Date,
  options: {
    withoutDayOfWeek?: boolean;
  } = {}
) => {
  let s = `${date.getMonth() + 1}/${date.getDate()}`;

  if (!options.withoutDayOfWeek) {
    s += `(${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})`;
  }

  s += ` ${('0' + date.getHours()).slice(-2)}:${(
    '00' + date.getMinutes()
  ).slice(-2)}`;

  return s;
};
