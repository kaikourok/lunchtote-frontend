import type { NextPage } from 'next';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';

const RoomDetail: NextPage = () => {
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const { data, error } = useSWR<Response>(!isAuthenticated ? null : `/rooms`);

  if (error) {
    return <DefaultPage>表示中にエラーが発生しました。</DefaultPage>;
  }

  if (!isAuthenticationTried || !isAuthenticated || !data) {
    return (
      <DefaultPage>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="ルーム一覧" />
      <Heading>ルーム一覧</Heading>
      <CommentarySection>参加しているルームの一覧です。</CommentarySection>
    </DefaultPage>
  );
};

export default RoomDetail;
