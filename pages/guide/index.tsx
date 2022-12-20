import type { NextPage } from 'next';
import Link from 'next/link';

import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';

const Rulebook: NextPage = () => {
  return (
    <DefaultPage>
      <PageData title="遊び方" />
      <div>
        <Link href="/guide/beginner">
          <a>ビギナーガイド</a>
        </Link>
      </div>
      <div>
        <Link href="/guide/difference">
          <a>類似のゲームとの相違点</a>
        </Link>
      </div>
      <div>
        <Link href="/guide/manner">
          <a>交流のマナー</a>
        </Link>
      </div>
      <div>
        <Link href="/guide/word">
          <a>交流用語集</a>
        </Link>
      </div>
    </DefaultPage>
  );
};

export default Rulebook;
