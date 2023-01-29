import { NextPage } from 'next';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import SubHeading from '@/components/atoms/SubHeading/SubHeading';
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
        <SubHeading>参加ルーム</SubHeading>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!data) {
    return (
      <DefaultPage>
        <SubHeading>参加ルーム</SubHeading>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="参加ルーム" />
      {!!data.inviteds.length && (
        <>
          <SubHeading>被招待ルーム</SubHeading>
          <RoomList rooms={data.inviteds} />
        </>
      )}
      <SubHeading>参加ルーム</SubHeading>
      <RoomList rooms={data.membereds} />
    </DefaultPage>
  );
};

export default RoomsOwned;
