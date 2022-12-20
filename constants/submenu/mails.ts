import { SubmenuItem } from '.';

const mailsSubmenu: SubmenuItem[] = [
  { label: 'メール作成', link: '/mails/compose' },
  { label: '受信トレー', link: '/mails' },
  { label: '送信済みメール', link: '/mails/sent' },
];

export default mailsSubmenu;
