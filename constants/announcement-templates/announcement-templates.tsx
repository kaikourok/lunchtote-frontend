export const announcementTemplates: {
  label: string;
  type: AnnouncementType;
  title: string;
  overview: string;
  content: string;
}[] = [
  {
    label: '更新',
    type: 'UPDATE',
    title: '更新が行われました',
    overview: '更新が行われました',
    content: `# 機能追加
- A
- B
- C

# 変更
- A
- B
- C

# 修正
- A
- B
- C

# 対応予定
- A
- B
- C`,
  },
];
