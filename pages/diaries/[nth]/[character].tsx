import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import InlineLink from '@/components/atoms/InlineLink/InlineLink';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import DiaryPage from '@/components/template/DiaryPage/DiaryPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';

type Response = {
  author: CharacterOverview;
  existingDiaries: number[];
  title: string;
  diary: string;
  nth: number;
};

const Diary: NextPage = () => {
  const router = useRouter();

  const { isAuthenticated } = useAuthenticationStatus();
  useRequireAuthenticated();

  const { data, error } = useSWR<Response>(
    !isAuthenticated || !router.isReady
      ? null
      : `/diaries/${router.query.nth}/${router.query.character}`
  );

  if (error) {
    return (
      <DefaultPage>
        <PageData title="日記" />
        <Heading>日記</Heading>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!data) {
    return (
      <DefaultPage>
        <PageData title="日記" />
        <Heading>日記</Heading>
        <SectionWrapper>
          <Loading />
        </SectionWrapper>
      </DefaultPage>
    );
  }

  return (
    <DiaryPage
      title={data.title}
      diary={data.diary}
      author={data.author}
      diaryExistings={data.existingDiaries}
    />
  );
};

export default Diary;
