import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import Loading from '@/components/organisms/Loading/Loading';
import SubmenuPage from '@/components/template/SubmenuPage/SubmenuPage';
import styles from '@/styles/pages/rooms/[id]/control/ban.module.scss';
import roomControlsSubmenu from 'constants/submenu/roomsControl';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import characterIdText from 'lib/characterIdText';
import axios from 'plugins/axios';

const MembersControl: NextPage = () => {
  const csrfHeader = useCsrfHeader();
  const router = useRouter();

  useRequireAuthenticated();

  const {
    data: bannedStates,
    error,
    mutate,
  } = useSWR<
    {
      banned: CharacterOverview;
      banner: CharacterOverview;
      bannedAt: string;
    }[]
  >(!router.isReady ? null : `/rooms/${router.query.id}/control/ban`);

  const [unbanTarget, setUnbanTarget] = useState<number | null>(null);

  if (error) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </SubmenuPage>
    );
  }

  if (!bannedStates) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <Loading />
      </SubmenuPage>
    );
  }

  const unbanTargetState = bannedStates.filter(
    (state) => state.banned.id == unbanTarget
  ).length
    ? bannedStates.filter((state) => state.banned.id == unbanTarget)[0]
    : null;

  return (
    <SubmenuPage
      title={'BAN管理'}
      menu={roomControlsSubmenu(Number(router.query.id))}
    >
      {!bannedStates.length ? (
        <CommentarySection>BANされているユーザーはいません</CommentarySection>
      ) : (
        <section className={styles['characters']}>
          {bannedStates.map((state) => {
            return (
              <div className={styles['character']} key={state.banned.id}>
                <div className={styles['character-icon-wrapper']}>
                  <CharacterIcon url={state.banned.mainicon} />
                </div>
                <div className={styles['character-data']}>
                  <div className={styles['character-heading']}>
                    <Link
                      href={{
                        pathname: '/characters/[id]',
                        query: {
                          id: state.banned.id,
                        },
                      }}
                    >
                      <a className={styles['character-link']}>
                        <span className={styles['character-name']}>
                          {state.banned.name}
                        </span>
                        <span className={styles['character-id']}>
                          {characterIdText(state.banned.id)}
                        </span>
                      </a>
                    </Link>
                    <div
                      className={styles['ban-button']}
                      onClick={() => setUnbanTarget(state.banned.id)}
                    >
                      BAN解除
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
      <ConfirmModal
        isOpen={unbanTargetState != null}
        onClose={() => setUnbanTarget(null)}
        onOk={async () => {
          if (!csrfHeader || !unbanTargetState) return;

          const targetName = unbanTargetState.banned.name;

          await toast.promise(
            axios.post(
              `/rooms/${router.query.id}/control/cancel-ban`,
              {
                target: unbanTarget,
              },
              {
                headers: csrfHeader,
              }
            ),
            {
              loading: `${targetName}のBANを解除しています`,
              success: `${targetName}のBANを解除しました`,
              error: 'BAN解除中にエラーが発生しました',
            }
          );

          mutate(
            bannedStates.filter(
              (bannedStates) => bannedStates.banned.id != unbanTarget
            )
          );
          setUnbanTarget(null);
        }}
        onCancel={() => setUnbanTarget(null)}
      >
        {unbanTargetState != null && (
          <>本当に{unbanTargetState.banned.name}のBANを解除しますか？</>
        )}
      </ConfirmModal>
    </SubmenuPage>
  );
};

export default MembersControl;
