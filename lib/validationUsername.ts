const usernameMin = Number(process.env.NEXT_PUBLIC_USERNAME_MIN!);
const usernameMax = Number(process.env.NEXT_PUBLIC_USERNAME_MAX!);
const disallowUsernames =
  process.env.NEXT_PUBLIC_DISALLOW_USERNAMES!.split(',');

const validationUsername = (username: string) => {
  if (!username) {
    return 'ユーザーIDが入力されていません';
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
