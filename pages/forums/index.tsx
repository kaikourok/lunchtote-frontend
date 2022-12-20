import classnames from 'classnames';
import { NextPage } from 'next';
import Link from 'next/link';
import useSWR from 'swr';

import AdministratorIcon from '@/components/atoms/AdministratorIcon/AdministratorIcon';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/forums/index.module.scss';
import { stringifyDate } from 'lib/stringifyDate';

type ForumOverview = {
  id: number;
  title: string;
  summary: string;
  lastPost: null | {
    topic: {
      id: number;
      title: string;
    };
    sender:
      | {
          postType: 'ADMINISTRATOR' | 'ANONYMOUS';
          name: string;
          character?: undefined;
        }
      | {
          postType: 'SIGNED_IN';
          name: string;
          character: number;
        };
    postedAt: string;
  };
};

type ForumGroup = {
  id: number;
  title: string;
  forums: ForumOverview[];
};

const Forums: NextPage = () => {
  const { data: forumGroups, error } = useSWR<ForumGroup[]>('/forums');

  if (error) {
    return (
      <DefaultPage>
        <PageData title="フォーラム" />
        <CommentarySection>取得中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!forumGroups) {
    return (
      <DefaultPage>
        <PageData title="フォーラム" />
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="フォーラム" />
      <>
        {forumGroups.map((forumGroup) => {
          return (
            <div className={styles['forum-group']} key={forumGroup.id}>
              <SubHeading>{forumGroup.title}</SubHeading>
              <div className={styles['forums']}>
                {forumGroup.forums.map((forum) => {
                  return (
                    <div className={styles['forum']} key={forum.id}>
                      <div className={styles['forum-data-wrapper']}>
                        <div className={styles['forum-data']}>
                          <Link
                            href={{
                              pathname: '/forums/[forum]',
                              query: { forum: forum.id },
                            }}
                          >
                            <a className={styles['forum-link']}>
                              {forum.title}
                            </a>
                          </Link>
                          {forum.summary != '' && (
                            <div className={styles['forum-summary']}>
                              {forum.summary}
                            </div>
                          )}
                        </div>
                      </div>
                      {!!forum.lastPost && (
                        <div className={styles['forum-last-post']}>
                          <Link
                            href={{
                              pathname: '/forums/[forum]/[topic]',
                              query: {
                                forum: forum.id,
                                topic: forum.lastPost.topic.id,
                              },
                            }}
                          >
                            <a className={styles['last-post-topic']}>
                              {forum.lastPost.topic.title}
                            </a>
                          </Link>
                          {forum.lastPost.sender.postType == 'ANONYMOUS' && (
                            <div className={styles['last-post-sender']}>
                              {forum.lastPost.sender.name}
                            </div>
                          )}
                          {forum.lastPost.sender.postType ==
                            'ADMINISTRATOR' && (
                            <div
                              className={classnames(
                                styles['last-post-sender'],
                                styles['last-post-sender-administrator']
                              )}
                            >
                              {forum.lastPost.sender.name}
                              <AdministratorIcon />
                            </div>
                          )}
                          {forum.lastPost.sender.postType == 'SIGNED_IN' && (
                            <Link
                              href={{
                                pathname: '/characters/[id]',
                                query: { id: forum.lastPost.sender.character },
                              }}
                            >
                              <a
                                className={classnames(
                                  styles['last-post-sender'],
                                  styles['last-post-sender-signed-in']
                                )}
                              >
                                {forum.lastPost.sender.name}
                              </a>
                            </Link>
                          )}
                          <div className={styles['last-post-timestamp']}>
                            {stringifyDate(new Date(forum.lastPost.postedAt))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>
    </DefaultPage>
  );
};

export default Forums;
