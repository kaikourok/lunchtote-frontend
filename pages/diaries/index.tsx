import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import PageSelector from '@/components/organisms/PageSelector/PageSelector';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import DefaultLayout from '@/layouts/DefaultLayout';
import styles from '@/styles/pages/diaries/index.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import buildQueryString from 'lib/buildQueryString';

type DiaryDetail = {
  character: CharacterOverview;
  title: string;
};

type Response = {
  diaries: DiaryDetail[];
  currentNth: number;
  lastNth: number;
};

const Diaries: NextPage = () => {
  const router = useRouter();

  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const [selectedNth, setSelectedNth] = useState<number | null>(null);

  useEffect(() => {
    if (router.isReady) {
      if (typeof router.query.nth == 'string') {
        setSelectedNth(Number(router.query.nth));
      } else {
        setSelectedNth(0);
      }
    }
  }, [router.isReady, router.query.nth]);

  const { data, error } = useSWR<Response>(
    !isAuthenticated || !router.isReady
      ? null
      : `/diaries${buildQueryString({
          nth: selectedNth,
        })}`
  );

  if (error) {
    return <DefaultLayout>表示中にエラーが発生しました。</DefaultLayout>;
  }

  if (!isAuthenticationTried || !isAuthenticated || !data) {
    return (
      <DefaultLayout>
        <Loading />
      </DefaultLayout>
    );
  }

  const pageSelectorItems: ReactNode[] = [];
  let i = 0;
  while (i < data.lastNth) {
    const targetNth = ++i;
    pageSelectorItems.push(
      <PageSelector.Item
        key={targetNth}
        href={{ pathname: '/diaries', query: { nth: targetNth } }}
        current={targetNth == data.currentNth}
      >
        {targetNth}
      </PageSelector.Item>
    );
  }

  const pageSelector = pageSelectorItems.length ? (
    <PageSelector>{pageSelectorItems}</PageSelector>
  ) : (
    <></>
  );

  return (
    <DefaultPage>
      <PageData title="日記一覧" />
      <Heading>日記一覧</Heading>
      {pageSelector}
      {(() => {
        if (!pageSelectorItems.length) {
          return (
            <CommentarySection>
              まだ日記の更新は行われていません。
            </CommentarySection>
          );
        } else if (!data.diaries.length) {
          return (
            <CommentarySection>
              この更新回に、自分またはフォローしている人の日記はありません。
            </CommentarySection>
          );
        } else {
          return <></>;
        }
      })()}
      {pageSelector}
    </DefaultPage>
  );
};

export default Diaries;
