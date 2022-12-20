import type { GetServerSideProps, NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import PageData from '@/components/organisms/PageData/PageData';
import Button from 'components/atoms/Button/Button';
import CharacterIcon from 'components/atoms/CharacterIcon/CharacterIcon';
import useCsrfHeader from 'hooks/useCsrfHeader';
import characterIdText from 'lib/characterIdText';
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
    followNumber: number;
    followedNumber: number;
    follow: boolean;
    followed: boolean;
    mute: boolean;
    block: boolean;
    blocked: boolean;
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

  const [follow, setFollow] = useState(data.character.follow);
  const [followed, setFollowed] = useState(data.character.followed);
  const [mute, setMute] = useState(data.character.mute);
  const [block, setBlock] = useState(data.character.block);
  const [isImageLoadEnd, setIsImageLoadEnd] = useState(false);
  const [layoutLevel, setLayoutLevel] = useState(1);
  const [heroViewHeight, setHeroViewHeight] = useState(0);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [isMuteModalOpen, setIsMuteModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isUnfollowModalOpen, setIsUnfollowModalOpen] = useState(false);
  const [isUnmuteModalOpen, setIsUnmuteModalOpen] = useState(false);
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);

  const blocked = data.character.blocked;

  useEffect(() => {
    const handleResize = () => {
      const imageWidth = image.width;
      const imageHeight = image.height;
      const clientWidth = document.body.clientWidth;

      if (clientWidth < imageWidth) {
        setLayoutLevel(0);
        setHeroViewHeight(imageHeight * (clientWidth / imageWidth));
      } else if (imageWidth + 430 < clientWidth * 0.9) {
        setLayoutLevel(2);
      } else {
        setLayoutLevel(1);
      }
    };

    const image = new Image();
    image.onload = () => {
      handleResize();
      setIsImageLoadEnd(true);
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
        <SubHeading>
          {characterIdText(data.character.id)} {data.character.name}
        </SubHeading>
      </div>
      <section
        className={styles['hero-view-wrapper']}
        style={layoutLevel != 0 ? undefined : { height: heroViewHeight }}
      >
        <div className={styles['hero-view']}>
          {layoutLevel == 2 && (
            <section className={styles['profile-summary']}>
              <div className={styles['profile-summary-nickname']}>
                <div className={styles['profile-summary-nickname-inner']}>
                  {data.character.nickname}{' '}
                  <span className={styles['profile-summary-id']}>
                    {characterIdText(data.character.id)}
                  </span>
                </div>
              </div>
              <div className={styles['profile-summary-tags']}>
                {data.character.tags.map((tag, index) => {
                  return (
                    <Link
                      key={index}
                      href={{
                        pathname: '/characters/search',
                        query: { tags: tag },
                      }}
                    >
                      <a className={styles['profile-summary-tag']}>{tag}</a>
                    </Link>
                  );
                })}
              </div>
              <div className={styles['profile-summary-summary']}>
                {data.character.summary}
              </div>
              <div className={styles['profile-summary-details']}>
                <div className={styles['profile-summary-detail']}>
                  <div className={styles['profile-summary-detail-label']}>
                    フォロー
                  </div>
                  <div className={styles['profile-summary-detail-value']}>
                    {data.character.followNumber}
                  </div>
                </div>
                <div className={styles['profile-summary-detail']}>
                  <div className={styles['profile-summary-detail-label']}>
                    フォロワー
                  </div>
                  <div className={styles['profile-summary-detail-value']}>
                    {data.character.followedNumber}
                  </div>
                </div>
              </div>
            </section>
          )}
          <section className={styles['profile-image-wrapper']}>
            <img
              className={styles['profile-image']}
              src={data.character.profileImage}
              style={layoutLevel != 0 ? undefined : { height: heroViewHeight }}
            />
          </section>
        </div>
      </section>
      <section className={styles['body']}>
        <section className={styles['relation-buttons']}>
          {userId != null && (
            <Button
              onClick={() =>
                router.push(
                  `/messages?c=character&cid=${data.character.id}&w=t`
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
                  `/messages?c=character-replied&cid=${data.character.id}&w=t`
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
        {layoutLevel != 2 && (
          <section>
            <div className={styles['body-heading']}>
              <img
                className={styles['body-heading-image']}
                src={'/images/profile/information_subheading.png'}
              />
            </div>
            <section className={styles['information']}>
              <div className={styles['information-main']}>
                <div className={styles['information-nickname']}>
                  <div className={styles['information-nickname-inner']}>
                    {data.character.nickname}{' '}
                    <span className={styles['information-id']}>
                      {characterIdText(data.character.id)}
                    </span>
                  </div>
                </div>
                <div className={styles['information-tags']}>
                  {data.character.tags.map((tag, index) => {
                    return (
                      <Link
                        key={index}
                        href={{
                          pathname: '/characters/search',
                          query: { tags: tag },
                        }}
                      >
                        <a className={styles['information-tag']}>{tag}</a>
                      </Link>
                    );
                  })}
                </div>
                <div className={styles['information-summary']}>
                  {data.character.summary}
                </div>
              </div>
              <div className={styles['information-details']}>
                <div className={styles['information-detail']}>
                  <div className={styles['information-detail-label']}>
                    フォロー
                  </div>
                  <div className={styles['information-detail-value']}>
                    {data.character.followNumber}
                  </div>
                </div>
                <div className={styles['information-detail']}>
                  <div className={styles['information-detail-label']}>
                    フォロワー
                  </div>
                  <div className={styles['information-detail-value']}>
                    {data.character.followedNumber}
                  </div>
                </div>
              </div>
            </section>
          </section>
        )}
        <section>
          <div className={styles['body-heading']}>
            <img
              className={styles['body-heading-image']}
              src={'/images/profile/profile_subheading.png'}
            />
          </div>
          <section className={styles['profile-wrapper']}>
            <div
              className={styles['profile']}
              dangerouslySetInnerHTML={{ __html: data.character.profile }}
            ></div>
          </section>
        </section>
        <section>
          <div className={styles['body-heading']}>
            <img
              className={styles['body-heading-image']}
              src={'/images/profile/icons_subheading.png'}
            />
          </div>
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
