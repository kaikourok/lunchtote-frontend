type AnnouncementRelatedData = {
  text: string;
  cssClassName: string;
};

export const getAnnouncementRelatedData = (
  announcementType: AnnouncementType
): AnnouncementRelatedData => {
  switch (announcementType) {
    case 'UPDATE':
      return {
        text: '更新',
        cssClassName: 'update',
      };
    case 'IMPORTANT':
      return {
        text: '重要',
        cssClassName: 'important',
      };
    case 'ANNOUNCE':
      return {
        text: '告知',
        cssClassName: 'announce',
      };
  }
};
