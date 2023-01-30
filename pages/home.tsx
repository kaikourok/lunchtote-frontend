import { NextPage } from 'next';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import AnnouncementOverview from '@/components/organisms/AnnouncementOverview/AnnouncementOverview';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/home.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import characterIdText from 'lib/characterIdText';
import { selectCharacter } from 'store/selector/character';

type Response = {
  nickname: string;
  announcements: {
    id: number;
    type: AnnouncementType;
    overview: string;
    announcedAt: string;
    updatedAt: string;
  }[];
};

const Home: NextPage = () => {
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const character = useSelector(selectCharacter);

  const { data, error } = useSWR<Response>('/characters/main/home');

  if (error) {
    return (
      <DefaultPage>
        <PageData title="ホーム" />
        <SubHeading>ホーム</SubHeading>
        <CommentarySection>
          読み込み中にエラーが発生しました。
        </CommentarySection>
      </DefaultPage>
    );
  }

  if (
    !isAuthenticationTried ||
    !isAuthenticated ||
    character.id == null ||
    !data
  ) {
    return (
      <DefaultPage>
        <PageData title="ホーム" />
        <SubHeading>ホーム</SubHeading>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="ホーム" />
      <section>
        <SubHeading>ホーム</SubHeading>
        <CommentarySection>
          {data.nickname}としてログインしています。あなたの登録番号は
          {characterIdText(character.id)}です。
        </CommentarySection>
      </section>
      {!!data.announcements.length && (
        <>
          <SubHeading>お知らせ一覧</SubHeading>
          <section className={styles['announcements']}>
            {data.announcements.map((announcement) => (
              <AnnouncementOverview
                key={announcement.id}
                id={announcement.id}
                type={announcement.type}
                overview={announcement.overview}
                announcedAt={new Date(announcement.announcedAt)}
                updatedAt={new Date(announcement.updatedAt)}
              />
            ))}
          </section>
          <Link href="/announcements">
            <a className={styles['announcements-link']}>
              すべてのお知らせを確認する
            </a>
          </Link>
        </>
      )}
    </DefaultPage>
  );
};

export default Home;
