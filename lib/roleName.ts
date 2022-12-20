const roleName = (roleName: string, roleType: RoleType) => {
  switch (roleType) {
    case 'VISITOR':
      return 'ビジター';
    case 'INVITED':
      return '招待者';
    case 'DEFAULT':
      return 'メンバー';
    case 'MASTER':
      return '管理者';
    case 'MEMBER':
      return roleName;
  }
};

export default roleName;
