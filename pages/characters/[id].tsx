import { mdiTag } from '@mdi/js';
import Icon from '@mdi/react';
import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

import Heading from '@/components/atoms/Heading/Heading';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import PageData from '@/components/organisms/PageData/PageData';
import Button from 'components/atoms/Button/Button';
import CharacterIcon from 'components/atoms/CharacterIcon/CharacterIcon';
import useCsrfHeader from 'hooks/useCsrfHeader';
import characterIdText from 'lib/characterIdText';
import { stylizeTextEntry } from 'lib/stylize';
import axios from 'plugins/axios';
import { selectCharacter } from 'store/selector/character';
import styles from 'styles/pages/characters/[id].module.scss';

const uploaderPath = process.env.NEXT_PUBLIC_UPLOADER_PATH!;

type RelationActions =
  | 'follow'
  | 'unfollow'
  | 'mute'
  | 'unmute'
  | 'block'
  | 'unblock';

type Response = {
  character: {
    id: number;
    name: string;
    nickname: string;
    summary: string;
    profile: string;
    mainicon: {
      url: string;
    };
    icons: {
      url: string;
    }[];
    profileImage: string;
    profileImages: string[];
    tags: string[];
    followingNumber: number;
    followedNumber: number;
    isFollowing: boolean;
    isFollowed: boolean;
    isMuting: boolean;
    isBlocking: boolean;
    isBlocked: boolean;
    exhibit: string | null;
    existingDiaries: {
      nth: number;
      title: string;
    }[];
  };
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const idString = context.query.id;
  if (typeof idString != 'string') throw new Error();
  const id = Number(idString);

  const response = await axios.get<Response>(`/characters/${id}`, {
    headers: {
      Cookie: context.req.headers.cookie || '',
    },
  });

  const data = response.data;
  data.character.profileImage = !data.character.profileImages.length
    ? '/images/profile/no_image.png'
    : uploaderPath +
      data.character.profileImages[
        Math.floor(Math.random() * data.character.profileImages.length)
      ];

  return {
    props: data,
  };
};

const Characters: NextPage<Response> = (data: Response) => {
  const userId = useSelector(selectCharacter).id;
  const csrfHeader = useCsrfHeader();
  const router = useRouter();

  const [follow, setFollow] = useState(data.character.isFollowing);
  const [followed, setFollowed] = useState(data.character.isFollowed);
  const [mute, setMute] = useState(data.character.isMuting);
  const [block, setBlock] = useState(data.character.isBlocking);
  const [layoutLevel, setLayoutLevel] = useState<1 | 2>(1);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [isMuteModalOpen, setIsMuteModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [isUnmuteModalOpen, setIsUnmuteModalOpen] = useState(false);
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);

  const blocked = data.character.isBlocked;

  useEffect(() => {
    const handleResize = () => {
      const imageWidth = image.width;
      const clientWidth = document.body.clientWidth;

      if (imageWidth + 400 < clientWidth) {
        setLayoutLevel(1);
      } else {
        setLayoutLevel(2);
      }
    };

    const image = new Image();
    image.onload = () => {
      handleResize();
    };
    image.src = data.character.profileImage;

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const idString = router.query.id;
  if (typeof idString != 'string') return <></>;
  const id = Number(idString);

  let waitingResponse = false;

  const changeRelation = async (action: RelationActions) => {
    if (waitingResponse) {
      toast('しばらくお待ち下さい');
      return;
    }

    if (!csrfHeader) return;
    const axiosConfig = { headers: csrfHeader };

    waitingResponse = true;

    try {
      switch (action) {
        case 'follow':
          await axios.post(`/characters/${id}/follow`, null, axiosConfig);
          toast.success('フォローしました');
          setFollow(true);
          break;
        case 'unfollow':
          await axios.post(`/characters/${id}/unfollow`, null, axiosConfig);
          toast.success('フォロー解除しました');
          setFollow(false);
          break;
        case 'mute':
          await axios.post(`/characters/${id}/mute`, null, axiosConfig);
          toast.success('ミュートしました');
          setMute(true);
          break;
        case 'unmute':
          await axios.post(`/characters/${id}/unmute`, null, axiosConfig);
          toast.success('ミュート解除しました');
          setMute(false);
          break;
        case 'block':
          await axios.post(`/characters/${id}/block`, null, axiosConfig);
          toast.success('ブロックしました');
          setFollow(false);
          setFollowed(false);
          setBlock(true);
          break;
        case 'unblock':
          await axios.post(`/characters/${id}/unblock`, null, axiosConfig);
          toast.success('ブロック解除しました');
          setBlock(false);
          break;
      }
    } catch {
      toast.error('エラーが発生しました');
    }

    waitingResponse = false;
  };

  const relationActionable = userId != null && userId != data.character.id;

  return (
    <section className={styles['character-layout']}>
      <PageData
        title={`${characterIdText(data.character.id)} ${data.character.name}`}
        description={data.character.summary}
      />
      <div className={styles['top-spacer']}>
        <Heading>
          {characterIdText(data.character.id)} {data.character.name}
        </Heading>
      </div>
      <section className={styles['hero-view-wrapper']}>
        <div className={styles['hero-view']}>
          <div className={styles['hero-view-internal']}>
            {layoutLevel == 1 && (
              <div className={styles['character-data']}>
                <div className={styles['character-names']}>
                  <div className={styles['character-id']}>
                    {characterIdText(data.character.id)}
                  </div>
                  <div className={styles['character-name']}>
                    {data.character.name}
                  </div>
                </div>
                {!!data.character.tags.length && (
                  <div className={styles['character-tags']}>
                    {data.character.tags.map((tag, index) => {
                      return (
                        <div className={styles['character-tag']} key={index}>
                          <div className={styles['character-tag-icon-wrapper']}>
                            <Icon path={mdiTag} />
                          </div>
                          <div className={styles['character-tag-text']}>
                            {tag}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className={styles['character-follows']}>
                  <div className={styles['character-follow-info']}>
                    <div className={styles['character-follow-info-label']}>
                      Follows
                    </div>
                    <div className={styles['character-follow-info-value']}>
                      {data.character.followingNumber}
                    </div>
                  </div>
                  <div className={styles['character-follow-info']}>
                    <div className={styles['character-follow-info-label']}>
                      Followed
                    </div>
                    <div className={styles['character-follow-info-value']}>
                      {data.character.followedNumber}
                    </div>
                  </div>
                </div>
                <div className={styles['character-summary']}>
                  {data.character.summary}
                </div>
              </div>
            )}
            <section className={styles['profile-image-wrapper']}>
              <img
                className={styles['profile-image']}
                src={data.character.profileImage}
              />
            </section>
          </div>
        </div>
      </section>
      <section className={styles['body']}>
        <Heading>
          {characterIdText(data.character.id)} {data.character.name}
        </Heading>
        <section className={styles['relation-buttons']}>
          {userId != null && (
            <Button
              onClick={() =>
                router.push(
                  `/rooms/messages?category=character&character=${data.character.id}&relates=false`
                )
              }
            >
              発言
            </Button>
          )}
          {userId != null && (
            <Button
              onClick={() =>
                router.push(
                  `/rooms/messages?category=character-replied&character=${data.character.id}&relates=false`
                )
              }
            >
              関連発言
            </Button>
          )}
          {relationActionable && !follow && !block && !blocked && (
            <Button onClick={() => setIsFollowModalOpen(true)}>フォロー</Button>
          )}
          {relationActionable && follow && (
            <Button onClick={() => setIsUnfollowModalOpen(true)}>
              フォロー解除
            </Button>
          )}
          {relationActionable && !mute && (
            <Button onClick={() => setIsMuteModalOpen(true)}>ミュート</Button>
          )}
          {relationActionable && mute && (
            <Button onClick={() => setIsUnmuteModalOpen(true)}>
              ミュート解除
            </Button>
          )}
          {relationActionable && !block && (
            <Button onClick={() => setIsBlockModalOpen(true)}>ブロック</Button>
          )}
          {relationActionable && block && (
            <Button onClick={() => setIsUnblockModalOpen(true)}>
              ブロック解除
            </Button>
          )}
        </section>
        <section className={styles['profile-wrapper']}>
          <div
            className={styles['profile']}
            dangerouslySetInnerHTML={{
              __html: stylizeTextEntry(data.character.profile),
            }}
          />
        </section>
        {!!data.character.existingDiaries.length && (
          <>
            <Heading>日記</Heading>
            <section className={styles['diaries']}>
              {data.character.existingDiaries.map((diary) => {
                return (
                  <Link
                    href={{
                      pathname: '/diaries/[nth]/[character]',
                      query: { nth: diary.nth, character: data.character.id },
                    }}
                    key={diary.nth}
                  >
                    <a className={styles['diary-link']}>
                      第{diary.nth + 1}更新 {diary.title}
                    </a>
                  </Link>
                );
              })}
            </section>
          </>
        )}
        {!!data.character.icons.length && (
          <>
            <Heading>アイコン</Heading>
            <section>
              <section className={styles['icons']}>
                {data.character.icons.map((icon, index) => {
                  return (
                    <div key={index} className={styles['icon-wrapper']}>
                      <CharacterIcon url={icon.url} />
                    </div>
                  );
                })}
              </section>
            </section>
          </>
        )}
      </section>
      <ConfirmModal
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        onCancel={() => setIsFollowModalOpen(false)}
        onOk={() => {
          changeRelation('follow');
          setIsFollowModalOpen(false);
        }}
      >
        フォローしますか？
      </ConfirmModal>
      <ConfirmModal
        isOpen={isMuteModalOpen}
        onClose={() => setIsMuteModalOpen(false)}
        onCancel={() => setIsMuteModalOpen(false)}
        onOk={() => {
          changeRelation('mute');
          setIsMuteModalOpen(false);
        }}
      >
        ミュートしますか？
      </ConfirmModal>
      <ConfirmModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onCancel={() => setIsBlockModalOpen(false)}
        onOk={() => {
          changeRelation('block');
          setIsBlockModalOpen(false);
        }}
      >
        ブロックしますか？
      </ConfirmModal>
      <ConfirmModal
        isOpen={isUnfollowModalOpen}
        onClose={() => setIsUnfollowModalOpen(false)}
        onCancel={() => setIsUnfollowModalOpen(false)}
        onOk={() => {
          changeRelation('unfollow');
          setIsUnfollowModalOpen(false);
        }}
      >
        フォローを解除しますか？
      </ConfirmModal>
      <ConfirmModal
        isOpen={isUnmuteModalOpen}
        onClose={() => setIsUnmuteModalOpen(false)}
        onCancel={() => setIsUnmuteModalOpen(false)}
        onOk={() => {
          changeRelation('unmute');
          setIsUnmuteModalOpen(false);
        }}
      >
        ミュートを解除しますか？
      </ConfirmModal>
      <ConfirmModal
        isOpen={isUnblockModalOpen}
        onClose={() => setIsUnblockModalOpen(false)}
        onCancel={() => setIsUnblockModalOpen(false)}
        onOk={() => {
          changeRelation('unblock');
          setIsUnblockModalOpen(false);
        }}
      >
        ブロックを解除しますか？
      </ConfirmModal>
    </section>
  );
};

export default Characters;
