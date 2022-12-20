const postTypeToText = (postType: ForumPostType) => {
  switch (postType) {
    case 'ADMINISTRATOR':
      return '管理者';
    case 'SIGNED_IN':
      return 'ログインユーザー';
    case 'ANONYMOUS':
      return '匿名';
  }
};

export default postTypeToText;
