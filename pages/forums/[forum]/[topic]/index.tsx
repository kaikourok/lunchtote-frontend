import { mdiCancel, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Twemoji from 'react-twemoji';
import useSWR, { useSWRConfig } from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import ForumSender from '@/components/molecules/ForumSender/ForumSender';
import DecorationEditor from '@/components/organisms/DecorationEditor/DecorationEditor';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/forums/[forum]/[topic]/index.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import postTypeToText from 'lib/postTypeToText';
import { stringifyDate } from 'lib/stringifyDate';
import axios from 'plugins/axios';

const EmojiPicker = dynamic(
  () => {
    return import('emoji-picker-react');
  },
  { ssr: false }
);

type TopicPost = {
  id: number;
  sender: ForumSender;
  content: string;
  postedAt: string;
  updatedAt: string | null;
  revisions: {
    content: string;
    postedAt: string;
  }[];
  reactions: {
    emoji: string;
    reactedCounts: number;
    isReacted: boolean;
  }[];
};

type TopicData = {
  topic: {
    id: number;
    forum: number;
    sender: ForumSender;
    title: string;
    status: ForumTopicStatus;
    forcePostType: ForumPostType | null;
  };
  posts: TopicPost[];
};

const ForumTopic: NextPage = () => {
  const router = useRouter();
  const csrfHeader = useCsrfHeader();
  const authenticationStatus = useAuthenticationStatus();

  const { mutate: refetchMutate } = useSWRConfig();
  const { data, error, mutate } = useSWR<TopicData>(
    !router.isReady
      ? null
      : `/forums/${router.query.forum}/topics/${router.query.topic}`
  );

  const [submitTried, setSubmitTried] = useState(false);
  const [postType, setPostType] = useState<ForumPostType | null>(null);
  const [senderName, setSenderName] = useState('匿名');
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordConfirm, setEditPasswordConfirm] = useState('');
  const [content, setContent] = useState('');
  const [reactionAddTarget, setReactionAddTarget] = useState<number | null>(
    null
  );

  if (error) {
    return (
      <DefaultPage>
        <PageData title="フォーラム" />
        <Heading>フォーラム</Heading>
        <CommentarySection>取得中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!data || !authenticationStatus.isAuthenticationTried || !router.isReady) {
    return (
      <DefaultPage>
        <PageData title="フォーラム" />
        <Heading>フォーラム</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  const { topic, posts } = data;

  const postTypeError = (() => {
    if (!postType) {
      return '投稿種別は選択必須です';
    }
  })();

  const senderNameError = (() => {
    if (postType != 'ANONYMOUS') {
      return;
    }
    if (senderName == '') {
      return '匿名投稿の場合、投稿者名は入力必須です';
    }
  })();

  const editPasswordError = (() => {
    if (postType != 'ANONYMOUS') {
      return;
    }
    if (editPassword == '') {
      return '匿名投稿の場合、編集パスワードは入力必須です';
    }
    if (editPassword != editPasswordConfirm) {
      return '編集パスワードと再入力の内容が一致しません';
    }
  })();

  const selectablePostTypes = (() => {
    let pts: ForumPostType[] =
      data.topic.forcePostType != null
        ? [data.topic.forcePostType]
        : ['ANONYMOUS', 'SIGNED_IN', 'ADMINISTRATOR'];

    if (!pts.includes('ADMINISTRATOR')) {
      pts.push('ADMINISTRATOR');
    }
    if (!authenticationStatus.isAdministratorAuthenticated) {
      pts = pts.filter((t) => t != 'ADMINISTRATOR');
    }
    if (!authenticationStatus.isAuthenticated) {
      pts = pts.filter((t) => t != 'SIGNED_IN');
    }

    return pts;
  })();

  const errorMessage = postTypeError || senderNameError || editPasswordError;

  const impostableMessage = (() => {
    if (
      !authenticationStatus.isAdministratorAuthenticated &&
      topic.forcePostType == 'ADMINISTRATOR'
    ) {
      return 'このフォーラムに投稿を行えるのは管理者のみです。';
    }
    if (
      !authenticationStatus.isAuthenticated &&
      topic.forcePostType == 'SIGNED_IN'
    ) {
      return 'このフォーラムに投稿を行うにはログインする必要があります。';
    }
  })();

  const addReaction = async (post: TopicPost, emoji: string) => {
    if (!csrfHeader) return;

    try {
      await axios.post(
        `/forums/${router.query.forum}/topics/${router.query.topic}/posts/${post.id}/reactions`,
        {
          emoji,
          state: true,
        },
        {
          headers: csrfHeader,
        }
      );

      if (
        post.reactions.filter(
          (reaction) => reaction.emoji == emoji && !reaction.isReacted
        ).length
      ) {
        mutate(
          {
            topic,
            posts: posts.map((oldPost) => {
              if (oldPost.id != post.id) {
                return oldPost;
              }
              return {
                ...oldPost,
                reactions: oldPost.reactions.map((oldReaction) => {
                  if (oldReaction.emoji != emoji) {
                    return oldReaction;
                  }
                  return {
                    ...oldReaction,
                    reactedCounts: oldReaction.reactedCounts + 1,
                    isReacted: true,
                  };
                }),
              };
            }),
          },
          false
        );
      } else if (
        !post.reactions.filter((reaction) => reaction.emoji == emoji).length
      ) {
        mutate(
          {
            topic,
            posts: posts.map((oldPost) => {
              if (oldPost.id != post.id) {
                return oldPost;
              }
              return {
                ...oldPost,
                reactions: [
                  ...oldPost.reactions,
                  {
                    emoji,
                    reactedCounts: 1,
                    isReacted: true,
                  },
                ],
              };
            }),
          },
          false
        );
      }
    } catch (e) {
      toast.error('リアクションの追加中にエラーが発生しました');
    }
  };

  const removeReaction = async (post: TopicPost, emoji: string) => {
    if (!csrfHeader) return;

    try {
      await axios.post(
        `/forums/${router.query.forum}/topics/${router.query.topic}/posts/${post.id}/reactions`,
        {
          emoji,
          state: false,
        },
        {
          headers: csrfHeader,
        }
      );

      mutate(
        {
          topic,
          posts: posts.map((oldPost) => {
            if (oldPost.id != post.id) {
              return oldPost;
            }

            return {
              ...oldPost,
              reactions: oldPost.reactions
                .map((oldReaction) => {
                  if (oldReaction.emoji != emoji) {
                    return oldReaction;
                  }
                  return {
                    ...oldReaction,
                    reactedCounts: oldReaction.reactedCounts - 1,
                    isReacted: false,
                  };
                })
                .filter((reaction) => 0 < reaction.reactedCounts),
            };
          }),
        },
        false
      );
    } catch (e) {
      toast.error('リアクションの削除中にエラーが発生しました');
    }
  };

  return (
    <DefaultPage>
      <PageData title={topic.title} />
      <Heading>{topic.title}</Heading>
      <section className={styles['posts']}>
        {posts.map((post) => {
          return (
            <section key={post.id} className={styles['post']}>
              <div className={styles['post-attributes']}>
                <div className={styles['post-id']}>#{post.id}</div>
                <div className={styles['post-sender']}>
                  <ForumSender sender={post.sender} />
                </div>
                <div className={styles['post-timestamp']}>
                  {stringifyDate(new Date(post.postedAt))}
                </div>
              </div>
              <div className={styles['post-content']}>
                <div className={styles['post-content-body']}>
                  {post.content}
                  {!!post.revisions.length && (
                    <span className={styles['post-content-update']}>
                      (編集済み)
                    </span>
                  )}
                </div>
                <div className={styles['reactions']}>
                  <>
                    {post.reactions.map((reaction) => {
                      return (
                        <div
                          key={reaction.emoji}
                          className={classnames(styles['reaction'], {
                            [styles['reacted']]: reaction.isReacted,
                          })}
                          onClick={() => {
                            if (!reaction.isReacted) {
                              addReaction(post, reaction.emoji);
                            } else {
                              removeReaction(post, reaction.emoji);
                            }
                          }}
                        >
                          <Twemoji
                            options={{ className: styles['emoji'] }}
                            tag="div"
                          >
                            {reaction.emoji}
                          </Twemoji>
                          <div className={styles['reaction-counts']}>
                            {reaction.reactedCounts}
                          </div>
                        </div>
                      );
                    })}
                  </>
                  <div
                    className={styles['reaction-add']}
                    onClick={() => {
                      if (!authenticationStatus.isAuthenticated) {
                        return toast.error(
                          'リアクションを追加するにはログインする必要があります'
                        );
                      }

                      setReactionAddTarget(
                        reactionAddTarget != post.id ? post.id : null
                      );
                    }}
                  >
                    <Icon
                      className={styles['reaction-add-icon']}
                      path={reactionAddTarget == post.id ? mdiCancel : mdiPlus}
                    />
                  </div>
                </div>
                {reactionAddTarget == post.id && (
                  <div className={styles['emoji-picker-wrapper']}>
                    <EmojiPicker
                      width="100%"
                      emojiVersion="3.0"
                      autoFocusSearch={false}
                      size={20}
                      previewConfig={{
                        showPreview: false,
                      }}
                      lazyLoadEmojis
                      skinTonesDisabled
                      // @ts-ignore
                      emojiStyle="twitter"
                      onEmojiClick={(emoji) => {
                        setReactionAddTarget(null);
                        addReaction(post, emoji.emoji);
                      }}
                    />
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </section>
      <Heading>投稿</Heading>
      {impostableMessage != undefined && (
        <CommentarySection>{impostableMessage}</CommentarySection>
      )}
      {!impostableMessage && (
        <InputForm
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitTried(true);

            if (errorMessage) {
              toast.error(errorMessage);
              return;
            }

            try {
              const response = await toast.promise(
                axios.post<{ id: number }>(
                  `/forums/${router.query.forum}/topics/${router.query.topic}/posts`,
                  {
                    content,
                    postType,
                    name: postType != 'ANONYMOUS' ? null : senderName,
                    editPassword: postType != 'ANONYMOUS' ? null : editPassword,
                  },
                  { headers: csrfHeader ? { ...csrfHeader } : undefined }
                ),
                {
                  loading: '投稿しています',
                  success: '投稿しました',
                  error: '投稿中にエラーが発生しました',
                }
              );

              refetchMutate(
                `/forums/${router.query.forum}/topics/${router.query.topic}`
              );
            } catch (e) {
              console.log(e);
            }
          }}
        >
          <InputForm.Radio
            label="投稿種別"
            value={postType}
            options={selectablePostTypes.map((pt) => ({
              label: postTypeToText(pt),
              value: pt,
            }))}
            radioGroup="POST_TYPE"
            onChange={(val) => setPostType(val)}
            help={
              <>
                投稿を行う際の投稿者情報の表示を選ぶことができます。ログインユーザーであればどのキャラクターのプレイヤーの投稿かが分かるよう表示され、匿名であれば日替わりで付番されるIDで表示されます。
              </>
            }
            required
            showRequiredInformation
            error={postTypeError}
            submitTried={submitTried}
          />
          {postType == 'ANONYMOUS' && (
            <>
              <InputForm.Text
                label="投稿者名"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
                showRequiredInformation
                error={senderNameError}
                submitTried={submitTried}
              />
              <InputForm.PasswordConfirm
                label="編集パスワード"
                inputValue={editPassword}
                confirmValue={editPasswordConfirm}
                inputPlaceholder="編集パスワード入力"
                confirmPlaceholder="編集パスワード再入力"
                onInputChange={(e) => setEditPassword(e.target.value)}
                onConfirmChange={(e) => setEditPasswordConfirm(e.target.value)}
                help={<>投稿を削除、編集する際に必要となるパスワードです。</>}
                required
                showRequiredInformation
                error={editPasswordError}
                submitTried={submitTried}
              />
            </>
          )}
          <InputForm.General label="投稿内容">
            <DecorationEditor
              initialValue=""
              onChange={(val) => setContent(val)}
              noDice
              noMessage
            />
          </InputForm.General>
          <InputForm.Button>投稿</InputForm.Button>
        </InputForm>
      )}
    </DefaultPage>
  );
};

export default ForumTopic;
