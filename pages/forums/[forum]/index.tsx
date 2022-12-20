import {
  mdiChevronDoubleLeft,
  mdiChevronDoubleRight,
  mdiChevronLeft,
  mdiChevronRight,
  mdiForumPlus,
  mdiTooltipPlus,
  mdiUpdate,
} from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import useSWR from 'swr';

import AdministratorIcon from '@/components/atoms/AdministratorIcon/AdministratorIcon';
import Button from '@/components/atoms/Button/Button';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import ForumSender from '@/components/molecules/ForumSender/ForumSender';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/forums/[forum]/index.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import { stringifyDate } from 'lib/stringifyDate';

type Forum = {
  id: number;
  title: string;
  summary: string;
  guide: string;
  forcedPostType: ForumPostType | null;
};

type ForumTopic = {
  id: number;
  title: string;
  sender: ForumSender;
  status: ForumTopicStatus;
  posts: number;
  createdAt: string;
  lastPostedAt: string;
  isPinned: boolean;
};

type TopicOverviews = {
  topics: ForumTopic[];
  pages: number;
};

const PagesLinker = (props: {
  forum: string | string[] | undefined;
  pages: number;
  currentPage: number;
}) => {
  if (props.pages == 0) {
    return <></>;
  }

  const additiveLinks = 4;
  const pages = props.pages;
  const currentPage = props.currentPage;

  const elements: ReactNode[] = [];

  elements.push(
    <div className={styles['linker-wrapper']}>
      <Link
        key={-10000}
        href={{
          pathname: '/forums/[forum]',
          query: { forum: props.forum, page: 1 },
        }}
      >
        <a className={styles['linker']}>
          <Icon path={mdiChevronDoubleLeft} />
        </a>
      </Link>
    </div>
  );

  elements.push(
    1 < currentPage ? (
      <div className={styles['linker-wrapper']}>
        <Link
          key={-9999}
          href={{
            pathname: '/forums/[forum]',
            query: { forum: props.forum, page: currentPage - 1 },
          }}
        >
          <a className={styles['linker']}>
            <Icon path={mdiChevronLeft} />
          </a>
        </Link>
      </div>
    ) : (
      <div key={-9999} className={styles['linker-spacer']}></div>
    )
  );

  for (let i = -additiveLinks; i <= additiveLinks; i++) {
    if (1 <= currentPage + i && currentPage + i <= pages) {
      elements.push(
        <div className={styles['linker-wrapper']}>
          <Link
            key={i}
            href={{
              pathname: '/forums/[forum]',
              query: { forum: props.forum, page: currentPage + i },
            }}
          >
            <a
              className={classnames(styles['linker'], {
                [styles['current']]: i == 0,
              })}
            >
              {currentPage + i}
            </a>
          </Link>
        </div>
      );
    } else {
      elements.push(<div key={i} className={styles['linker-spacer']}></div>);
    }
  }

  elements.push(
    currentPage < pages ? (
      <div className={styles['linker-wrapper']}>
        <Link
          key={-9999}
          href={{
            pathname: '/forums/[forum]',
            query: { forum: props.forum, page: currentPage + 1 },
          }}
        >
          <a className={styles['linker']}>
            <Icon path={mdiChevronRight} />
          </a>
        </Link>
      </div>
    ) : (
      <div key={-9999} className={styles['linker-spacer']}></div>
    )
  );

  elements.push(
    <div className={styles['linker-wrapper']}>
      <Link
        key={-10}
        href={{
          pathname: '/forums/[forum]',
          query: { forum: props.forum, page: pages },
        }}
      >
        <a className={styles['linker']}>
          <Icon path={mdiChevronDoubleRight} />
        </a>
      </Link>
    </div>
  );

  return <div className={styles['page-links']}>{elements}</div>;
};

const Forum: NextPage = () => {
  const router = useRouter();
  const authenticationStatus = useAuthenticationStatus();

  const { data: forum, error: forumError } = useSWR<Forum>(
    !router.isReady ? null : `/forums/${router.query.forum}`
  );

  const { data: topicData, error: topicError } = useSWR<TopicOverviews>(
    !router.isReady
      ? null
      : `/forums/${router.query.forum}/topics?page=${router.query.page || 1}`
  );

  if (forumError || topicError) {
    return (
      <DefaultPage>
        <PageData title="フォーラム" />
        <CommentarySection>取得中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (
    !forum ||
    !topicData ||
    !authenticationStatus.isAuthenticationTried ||
    !router.isReady
  ) {
    return (
      <DefaultPage>
        <PageData title="フォーラム" />
        <Loading />
      </DefaultPage>
    );
  }

  const { topics, pages } = topicData;

  const impostableMessage = (() => {
    if (
      !authenticationStatus.isAdministratorAuthenticated &&
      forum.forcedPostType == 'ADMINISTRATOR'
    ) {
      return 'このフォーラムに投稿を行えるのは管理者のみです。';
    }
    if (
      !authenticationStatus.isAuthenticated &&
      forum.forcedPostType == 'SIGNED_IN'
    ) {
      return 'このフォーラムに投稿を行うにはログインする必要があります。';
    }
  })();

  const currentPage =
    typeof router.query.page == 'string' ? Number(router.query.page) || 1 : 1;

  return (
    <DefaultPage>
      <PageData title={`フォーラム | ${forum.title}`} />
      <SubHeading>フォーラム | {forum.title}</SubHeading>
      {!impostableMessage && (
        <div className={styles['actions']}>
          <Link
            href={{
              pathname: '/forums/[forum]/new',
              query: { forum: router.query.forum },
            }}
          >
            <a className={styles['action']}>
              <Button type="button" icon={mdiForumPlus}>
                トピックを新規作成
              </Button>
            </a>
          </Link>
        </div>
      )}
      <PagesLinker
        forum={router.query.forum}
        pages={pages}
        currentPage={currentPage}
      />
      <div className={styles['topics']}>
        {(!topics.length || !!impostableMessage) && (
          <CommentarySection>
            {impostableMessage}
            {!topics.length &&
              'このフォーラムにはまだトピックが立てられていません。'}
          </CommentarySection>
        )}
        <>
          {!!topics.length &&
            topics.map((topic) => {
              return (
                <div key={topic.id} className={styles['topic']}>
                  <div className={styles['topic-overview']}>
                    <div className={styles['topic-title']}>
                      <Link
                        href={{
                          pathname: '/forums/[forum]/[topic]',
                          query: { forum: router.query.forum, topic: topic.id },
                        }}
                      >
                        <a className={styles['topic-link']}>{topic.title}</a>
                      </Link>
                    </div>
                    <div className={styles['topic-subinfos']}>
                      <span className={styles['topic-sender']}>
                        By <ForumSender sender={topic.sender} />
                      </span>
                      <span className={styles['topic-posts']}>
                        {topic.posts}件の投稿
                      </span>
                    </div>
                  </div>
                  <div className={styles['timestamps']}>
                    <div className={styles['timestamp']}>
                      <Icon
                        path={mdiUpdate}
                        className={styles['timestamp-icon']}
                      />
                      {stringifyDate(new Date(topic.lastPostedAt))}
                    </div>
                    <div className={styles['timestamp']}>
                      <Icon
                        path={mdiTooltipPlus}
                        className={styles['timestamp-icon']}
                      />
                      {stringifyDate(new Date(topic.createdAt))}
                    </div>
                  </div>
                </div>
              );
            })}
        </>
      </div>
      <PagesLinker
        forum={router.query.forum}
        pages={pages}
        currentPage={currentPage}
      />
    </DefaultPage>
  );
};

export default Forum;
