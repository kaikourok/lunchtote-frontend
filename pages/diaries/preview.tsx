import { NextPage } from 'next';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import InlineLink from '@/components/atoms/InlineLink/InlineLink';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import DiaryPage from '@/components/template/DiaryPage/DiaryPage';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';

type Response = {
  character: {
    id: number;
    name: string;
    mainicon: string;
  };
  title: string;
  diary: string;
};

const DiariesPreview: NextPage = () => {
  const { isAuthenticated } = useAuthenticationStatus();
  useRequireAuthenticated();

  const { data, error } = useSWR<Response>(
    !isAuthenticated ? null : `/diaries/write/preview`
  );

  if (error) {
    return (
      <DefaultPage>
        <PageData title="日記プレビュー" />
        <Heading>日記プレビュー</Heading>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!data) {
    return (
      <DefaultPage>
        <PageData title="日記プレビュー" />
        <Heading>日記プレビュー</Heading>
        <CommentarySection>
          まだ日記の投稿予約が行われていません。日記の投稿予約は
          <InlineLink href="/diaries/write">こちら</InlineLink>から行えます。
        </CommentarySection>
      </DefaultPage>
    );
  }

  return (
    <DiaryPage
      title={data.title}
      diary={data.diary}
      character={data.character}
      diaryExistings={[]}
    />
  );
};

export default DiariesPreview;
