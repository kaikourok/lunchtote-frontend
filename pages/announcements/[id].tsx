import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import Heading from '@/components/atoms/Heading/Heading';
import AnnouncementDetail from '@/components/organisms/AnnouncementDetail/AnnouncementDetail';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/announcements/[id].module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import { stringifyDate } from 'lib/stringifyDate';

type AnnouncementGuide = {
  id: number;
  title: string;
} | null;

type Response = {
  announcement: {
    id: number;
    type: AnnouncementType;
    announcedAt: string;
    updatedAt: string;
    title: string;
    content: string;
  };
  prevGuide: AnnouncementGuide;
  nextGuide: AnnouncementGuide;
};

const AnnouncementGuide = (props: {
  announcement: AnnouncementGuide;
  type: 'PREV' | 'NEXT';
}) => {
  return (
    <div className={styles['announcement-guide-wrapper']}>
      {!!props.announcement && (
        <Link
          href={{
            pathname: '/announcements/[id]',
            query: { id: props.announcement.id },
          }}
        >
          <a
            className={classnames(
              styles['announcement-guide'],
              styles[`announcement-guide-${props.type.toLocaleLowerCase()}`]
            )}
          >
            {props.type == 'PREV' && (
              <Icon
                className={styles['announcement-guide-icon']}
                path={mdiChevronLeft}
              />
            )}
            {props.announcement.title}
            {props.type == 'NEXT' && (
              <Icon
                className={styles['announcement-guide-icon']}
                path={mdiChevronRight}
              />
            )}
          </a>
        </Link>
      )}
    </div>
  );
};

const Announcement: NextPage = () => {
  const { isAdministratorAuthenticated } = useAuthenticationStatus();

  const router = useRouter();
  const { data, error } = useSWR<Response>(
    router.isReady ? `/announcements/${router.query.id}` : null
  );

  if (error) {
    return (
      <DefaultPage>
        <PageData title="お知らせ" />
        表示中にエラーが発生しました。
      </DefaultPage>
    );
  }

  if (!data) {
    return (
      <DefaultPage>
        <PageData title="お知らせ" />
        <Loading />
      </DefaultPage>
    );
  }

  const announcementGuides = (
    <section className={styles['announcement-guides']}>
      <AnnouncementGuide announcement={data.prevGuide} type="PREV" />
      <AnnouncementGuide announcement={data.nextGuide} type="NEXT" />
    </section>
  );

  const announcedDate = new Date(data.announcement.announcedAt);

  const displayTitle = `[${stringifyDate(announcedDate, {
    withoutDayOfWeek: true,
  })}] ${data.announcement.title}`;

  return (
    <DefaultPage>
      <PageData title={displayTitle} />
      <Heading>{displayTitle}</Heading>
      {isAdministratorAuthenticated && (
        <div className={styles['announcement-edit-link-wrapper']}>
          <Link
            href={{
              pathname: '/control/game/announcements/[id]',
              query: { id: router.query.id },
            }}
          >
            <a className={styles['announcement-edit-link']}>編集する</a>
          </Link>
        </div>
      )}
      {announcementGuides}
      <AnnouncementDetail
        id={data.announcement.id}
        type={data.announcement.type}
        announcedAt={new Date(data.announcement.announcedAt)}
        updatedAt={new Date(data.announcement.updatedAt)}
        title={data.announcement.title}
        content={data.announcement.content}
      />
      {announcementGuides}
    </DefaultPage>
  );
};

export default Announcement;
