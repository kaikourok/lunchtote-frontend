import type { NextPage } from 'next';
import Link from 'next/link';

import Heading from '@/components/atoms/Heading/Heading';
import PageData from '@/components/organisms/PageData/PageData';
import PanelLinks from '@/components/organisms/PanelLinks/PanelLinks';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';

const Guide: NextPage = () => {
  return (
    <DefaultPage>
      <PageData title="ガイド" />
      <Heading>交流ガイド</Heading>
      <PanelLinks>
        <PanelLinks.Item
          href="/guide/manner"
          title="交流のマナー"
          summary="交流において留意するべき事項"
        />
        <PanelLinks.Item
          href="/guide/words"
          title="交流用語集"
          summary="このゲーム付近で用いられる用語"
        />
      </PanelLinks>
    </DefaultPage>
  );
};

export default Guide;
