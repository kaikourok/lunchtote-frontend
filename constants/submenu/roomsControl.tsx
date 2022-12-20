import { SubmenuItem } from '.';

const roomControlsSubmenu = (roomId: number): SubmenuItem[] => {
  if (isNaN(roomId)) return [];

  return [
    {
      label: '全般',
      link: { pathname: '/rooms/[id]/control', query: { id: roomId } },
    },
    {
      label: '権限',
      link: {
        pathname: '/rooms/[id]/control/role',
        query: { id: roomId },
      },
    },
    {
      label: 'メンバー',
      link: {
        pathname: '/rooms/[id]/control/member',
        query: { id: roomId },
      },
    },
    {
      label: '招待',
      link: {
        pathname: '/rooms/[id]/control/invite',
        query: { id: roomId },
      },
    },
    {
      label: 'BAN',
      link: {
        pathname: '/rooms/[id]/control/ban',
        query: { id: roomId },
      },
    },
    {
      label: 'ルーム削除',
      link: {
        pathname: '/rooms/[id]/control/delete',
        query: { id: roomId },
      },
    },
  ];
};

export default roomControlsSubmenu;
