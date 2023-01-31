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

  const { data, error } = useSWR<RoomListItem[]>('/rooms/owned');

  if (error) {
    return (
      <DefaultPage>
        <Heading>管理ルーム一覧</Heading>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!data) {
    return (
      <DefaultPage>
        <Heading>管理ルーム一覧</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="管理ルーム一覧" />
      <Heading>管理ルーム一覧</Heading>
      <RoomList
        rooms={data.map((room) => {
          return {
            ...room,
            linkTo: (id) => {
              return { pathname: `/rooms/[id]/control`, query: { id } };
            },
          };
        })}
      />
    </DefaultPage>
  );
};

export default RoomsOwned;
