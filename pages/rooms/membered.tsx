import { NextPage } from 'next';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import RoomList from '@/components/organisms/RoomList/RoomList';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';

const RoomsOwned: NextPage = () => {
  useRequireAuthenticated();

  const { data, error } = useSWR<{
    membereds: RoomListItem[];
    inviteds: RoomListItem[];
  }>('/rooms/membered');

  if (error) {
    return (
      <DefaultPage>
        <Heading>参加ルーム</Heading>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!data) {
    return (
      <DefaultPage>
        <Heading>参加ルーム</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="参加ルーム" />
      {!!data.inviteds.length && (
        <>
          <Heading>被招待ルーム</Heading>
          <RoomList rooms={data.inviteds} />
        </>
      )}
      <Heading>参加ルーム</Heading>
      <RoomList rooms={data.membereds} />
    </DefaultPage>
  );
};

export default RoomsOwned;
