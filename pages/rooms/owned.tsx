import { NextPage } from 'next';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import Loading from '@/components/organisms/Loading/Loading';
import RoomList from '@/components/organisms/RoomList/RoomList';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';

const RoomsOwned: NextPage = () => {
  useRequireAuthenticated();

  const { data, error } = useSWR<RoomListItem[]>('/rooms/owned');

  if (error) {
    return (
      <DefaultPage>
        <SubHeading>管理ルーム一覧</SubHeading>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!data) {
    return (
      <DefaultPage>
        <SubHeading>管理ルーム一覧</SubHeading>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <SubHeading>管理ルーム一覧</SubHeading>
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
