export type OfficialTag = {
  tag: string;
  description: string;
};

export const officialCharacterTags: OfficialTag[] = [
  {
    tag: '初心者',
    description:
      'まだ慣れていなかったり、始めたばかりであることを表すタグです。',
  },
  {
    tag: '交流初心者',
    description:
      'まだ交流に慣れていなかったり、始めたばかりであることを表すタグです。',
  },
  {
    tag: 'フォローフリー',
    description:
      '自由にフォローしてもいいことをアピールするタグです。なおこれはアピールのためのタグであり、このタグがないからといって勝手にフォローしてはいけないというわけではありません。',
  },
  {
    tag: 'ログ公開フリー',
    description:
      '悪意的利用でなければ交流ログを自由に公開してもいいことを表すタグです。',
  },
  {
    tag: '置きレス',
    description: '時間を置いて返信を返すことが多いことを表すタグです。',
  },
  {
    tag: '交流歓迎',
    description: '交流にて会話歓迎であることを表すタグです。',
  },
];

export const officialRoomTags: OfficialTag[] = [
  {
    tag: '訪問歓迎',
    description: '誰でも訪問歓迎であることを表すタグです。',
  },
  {
    tag: 'パブリック',
    description: 'お店や公共施設など、公共的な場であることを表すタグです。',
  },
  {
    tag: 'プライベート',
    description: '個人や組織の建物など、私的な場であることを表すタグです。',
  },
  {
    tag: 'イベント',
    description: '一時的なイベントのためのルームであることを表すタグです。',
  },
  {
    tag: '置きレス進行',
    description:
      '時間を置いて返信を返しながら交流することの多いルームであることを表すタグです。',
  },
  {
    tag: 'リアルタイム進行',
    description:
      'チャットのようにリアルタイムに発言を行いながら交流することの多いルームであることを表すタグです。',
  },
  {
    tag: '戦闘推奨',
    description:
      'キャラクター同士で戦闘するロールを行うためのルームであることを表すタグです。',
  },
];
