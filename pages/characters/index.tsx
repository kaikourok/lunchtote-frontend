import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import Heading from '@/components/atoms/Heading/Heading';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import CharacterList from '@/components/organisms/CharacterList/CharacterList';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import PageSelector from '@/components/organisms/PageSelector/PageSelector';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useCsrfHeader from 'hooks/useCsrfHeader';
import characterIdText from 'lib/characterIdText';
import axios from 'plugins/axios';

const characterListItemPerPage = Number(
  process.env.NEXT_PUBLIC_CHARACTER_LIST_ITEM_PER_PAGE!
);

type Character = {
  id: number;
  name: string;
  nickname: string;
  summary: string;
  mainicon: string;
  tags: string[];
  isFollowing?: boolean;
  isFollowed?: boolean;
  isMuting?: boolean;
  isBlocking?: boolean;
};

type Response = {
  maxId: number;
  characters: Character[];
};

const Characters: NextPage = () => {
  const router = useRouter();

  const csrfHeader = useCsrfHeader();

  const [pageIndex, setPageIndex] = useState<number | null>(null);
  const [followTarget, setFollowTarget] = useState<Character | null>(null);
  const [unfollowTarget, setUnfollowTarget] = useState<Character | null>(null);

  useEffect(() => {
    if (router.isReady) {
      if (typeof router.query.page == 'string') {
        setPageIndex(Number(router.query.page));
      } else {
        setPageIndex(0);
      }
    }
  }, [router.isReady, router.query.page]);

  const { data, error, mutate } = useSWR<Response>(
    pageIndex == null
      ? null
      : '/characters' + (pageIndex ? `?page=${pageIndex}` : '')
  );

  if (error) {
    return <DefaultPage>表示中にエラーが発生しました。</DefaultPage>;
  }

  if (!data) {
    return (
      <DefaultPage>
        <PageData title="キャラクター一覧" />
        <Heading>キャラクター一覧</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  const pages = new Array<number>();
  let i = 0;
  do {
    pages.push(i);
    i++;
  } while (i * characterListItemPerPage < data.maxId);

  const pageSelector = (
    <PageSelector>
      {pages.map((page) => {
        return (
          <PageSelector.Item
            key={page}
            href={{ pathname: '/characters', query: { page: page } }}
            current={pageIndex == page}
          >
            {page * characterListItemPerPage + 1}-
            {(page + 1) * characterListItemPerPage}
          </PageSelector.Item>
        );
      })}
    </PageSelector>
  );

  return (
    <DefaultPage>
      <PageData title="キャラクター一覧" />
      <Heading>キャラクター一覧</Heading>
      {pageSelector}
      <CharacterList characters={data.characters} />
      {pageSelector}
      <ConfirmModal
        isOpen={!!followTarget}
        onClose={() => setFollowTarget(null)}
        onCancel={() => setFollowTarget(null)}
        onOk={async () => {
          if (!followTarget || !csrfHeader) return;

          try {
            await toast.promise(
              axios.post(`/characters/${followTarget.id}/follow`, null, {
                headers: csrfHeader,
              }),
              {
                error: 'フォロー処理中にエラーが発生しました',
                loading: `${characterIdText(followTarget.id)} ${
                  followTarget.name
                }をフォローしています`,
                success: `${characterIdText(followTarget.id)} ${
                  followTarget.name
                }をフォローしました`,
              }
            );

            const newCharacters = [...data.characters].map((character) => {
              if (character.id == followTarget.id) {
                return { ...character, isFollowing: true };
              } else {
                return character;
              }
            });
            mutate({ ...data, characters: newCharacters }, false);

            setFollowTarget(null);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {followTarget && (
          <>
            {characterIdText(followTarget.id)} {followTarget.name}
            をフォローしますか？
          </>
        )}
      </ConfirmModal>
      <ConfirmModal
        isOpen={!!unfollowTarget}
        onClose={() => setUnfollowTarget(null)}
        onCancel={() => setUnfollowTarget(null)}
        onOk={async () => {
          if (!unfollowTarget || !csrfHeader) return;

          try {
            await toast.promise(
              axios.post(`/characters/${unfollowTarget.id}/unfollow`, null, {
                headers: csrfHeader,
              }),
              {
                error: 'フォロー解除処理中にエラーが発生しました',
                loading: `${characterIdText(unfollowTarget.id)} ${
                  unfollowTarget.name
                }のフォローを解除しています`,
                success: `${characterIdText(unfollowTarget.id)} ${
                  unfollowTarget.name
                }のフォローを解除しました`,
              }
            );

            const newCharacters = [...data.characters].map((character) => {
              if (character.id == unfollowTarget.id) {
                return { ...character, isFollowing: false };
              } else {
                return character;
              }
            });
            mutate({ ...data, characters: newCharacters }, false);

            setUnfollowTarget(null);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {unfollowTarget && (
          <>
            {characterIdText(unfollowTarget.id)} {unfollowTarget.name}
            のフォローを解除しますか？
          </>
        )}
      </ConfirmModal>
    </DefaultPage>
  );
};

export default Characters;
