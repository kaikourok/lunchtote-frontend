const usernameMin = Number(process.env.NEXT_PUBLIC_USERNAME_MIN!);
const usernameMax = Number(process.env.NEXT_PUBLIC_USERNAME_MAX!);
const disallowUsernames =
  process.env.NEXT_PUBLIC_DISALLOW_USERNAMES!.split(',');

const validationUsername = (username: string) => {
  if (!username) {
    return 'ユーザーIDが入力されていません';
  }
  if (username.match(/[^_0-9a-zA-Z]/) != null) {
    return 'ユーザーIDに使用できるのは半角英数と半角アンダーバーのみです';
  }
  if (username.match(/[a-zA-Z]/) == null) {
    return 'ユーザーIDには少なくとも1文字以上のアルファベットが含まれている必要があります';
  }
  if (username.length < usernameMin) {
    return `ユーザーIDは最低${usernameMin}文字入力する必要があります`;
  }
  if (0 < usernameMax && usernameMax < username.length) {
    return `ユーザーIDは${usernameMax}文字までです`;
  }
  for (const checker of disallowUsernames) {
    if (username.toLowerCase().indexOf(checker.toLowerCase()) !== -1) {
      return `${checker}を含むユーザーIDは登録できません`;
    }
  }
};

export default validationUsername;
