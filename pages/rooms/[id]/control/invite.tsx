import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import SelectAsync from 'react-select/async';
import useSWR, { useSWRConfig } from 'swr';

import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import SubmenuPage from '@/components/template/SubmenuPage/SubmenuPage';
import styles from '@/styles/pages/rooms/[id]/control/invite.module.scss';
import roomControlsSubmenu from 'constants/submenu/roomsControl';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import characterIdText from 'lib/characterIdText';
import axios from 'plugins/axios';

type SelectOption = {
  value: number;
  label: string;
};

const MembersControl: NextPage = () => {
  const csrfHeader = useCsrfHeader();
  const router = useRouter();

  useRequireAuthenticated();

  const { mutate } = useSWRConfig();
  const { data: invitedStates, error } = useSWR<
    {
      invited: CharacterOverview;
      inviter: CharacterOverview;
      invitedAt: string;
    }[]
  >(!router.isReady ? null : `/rooms/${router.query.id}/control/invite`);

  const [unbanTarget, setUnbanTarget] = useState<number | null>(null);
  const [selectedCharacter, setSelectedCharacter] =
    useState<SelectOption | null>(null);
  const [isInviteConfirmModalOpen, setIsInviteConfirmModalOpen] =
    useState(false);

  if (error) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </SubmenuPage>
    );
  }

  if (!invitedStates) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <Loading />
      </SubmenuPage>
    );
  }

  const uninviteTargetState = invitedStates.filter(
    (state) => state.invited.id == unbanTarget
  ).length
    ? invitedStates.filter((state) => state.invited.id == unbanTarget)[0]
    : null;

  const fetchInviteTargetSearchResult = (
    inputValue: string,
    callback: (options: SelectOption[]) => any
  ) => {
    if (!csrfHeader || !inputValue) {
      callback([]);
      return;
    }

    (async () => {
      const response = await axios.post<CharacterInlineSearchResult[]>(
        `/rooms/${router.query.id}/control/search-invite-target`,
        {
          text: inputValue,
        },
        {
          headers: csrfHeader,
        }
      );

      callback(
        response.data.map((result) => {
          return {
            value: result.id,
            label: result.text,
          };
        })
      );
    })();
  };

  return (
    <SubmenuPage
      title={'招待管理'}
      menu={roomControlsSubmenu(Number(router.query.id))}
      noHeading
    >
      <SubHeading>新規招待</SubHeading>
      <section className={styles['new-invite']}>
        <InputForm
          onSubmit={(e) => {
            e.preventDefault();
            if (selectedCharacter) {
              setIsInviteConfirmModalOpen(true);
            } else {
              toast.error('招待する相手を選択してください');
            }
          }}
        >
          <InputForm.General label="招待対象">
            <SelectAsync
              id="room-invite"
              instanceId="room-invite"
              placeholder="相手の登録番号もしくは名前で検索"
              value={selectedCharacter}
              onChange={(e) => {
                setSelectedCharacter(e);
              }}
              loadOptions={fetchInviteTargetSearchResult}
              loadingMessage={() => '検索中…'}
              noOptionsMessage={() => '該当なし'}
            />
          </InputForm.General>
          <InputForm.Button>招待を送る</InputForm.Button>
        </InputForm>
      </section>
      <SubHeading>招待管理</SubHeading>
      {!invitedStates.length ? (
        <CommentarySection>招待されているユーザーはいません</CommentarySection>
      ) : (
        <section className={styles['characters']}>
          {invitedStates.map((state) => {
            return (
              <div className={styles['character']} key={state.invited.id}>
                <div className={styles['character-icon-wrapper']}>
                  <CharacterIcon url={state.invited.mainicon} />
                </div>
                <div className={styles['character-data']}>
                  <div className={styles['character-heading']}>
                    <Link
                      href={{
                        pathname: '/characters/[id]',
                        query: {
                          id: state.invited.id,
                        },
                      }}
                    >
                      <a className={styles['character-link']}>
                        <span className={styles['character-name']}>
                          {state.invited.name}
                        </span>
                        <span className={styles['character-id']}>
                          {characterIdText(state.invited.id)}
                        </span>
                      </a>
                    </Link>
                    <div
                      className={styles['ban-button']}
                      onClick={() => setUnbanTarget(state.invited.id)}
                    >
                      招待キャンセル
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
      <ConfirmModal
        isOpen={uninviteTargetState != null}
        onClose={() => setUnbanTarget(null)}
        onOk={async () => {
          if (!csrfHeader || !uninviteTargetState) return;

          const targetName = uninviteTargetState.invited.name;

          await toast.promise(
            axios.post(
              `/rooms/${router.query.id}/control/cancel-invite`,
              {
                target: unbanTarget,
              },
              {
                headers: csrfHeader,
              }
            ),
            {
              loading: `${targetName}への招待をキャンセルしています`,
              success: `${targetName}への招待をキャンセルしました`,
              error: '招待のキャンセル中にエラーが発生しました',
            }
          );

          mutate(`/rooms/${router.query.id}/control/invite`);
          setUnbanTarget(null);
        }}
        onCancel={() => setUnbanTarget(null)}
      >
        {uninviteTargetState != null && (
          <>
            本当に{uninviteTargetState.invited.name}
            への招待をキャンセルしますか？
          </>
        )}
      </ConfirmModal>
      <ConfirmModal
        heading="招待の送信"
        isOpen={isInviteConfirmModalOpen}
        onCancel={() => setIsInviteConfirmModalOpen(false)}
        onClose={() => setIsInviteConfirmModalOpen(false)}
        onOk={async () => {
          if (!csrfHeader || !selectedCharacter) return;

          try {
            await toast.promise(
              axios.post(
                `/rooms/${router.query.id}/control/invite`,
                {
                  target: selectedCharacter.value,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: '招待を送っています',
                success: '招待を送りました',
                error: '招待の送信中にエラーが発生しました',
              }
            );

            setSelectedCharacter(null);
            setIsInviteConfirmModalOpen(false);
            mutate(`/rooms/${router.query.id}/control/invite`);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {selectedCharacter && (
          <>{selectedCharacter.label}に招待を送りますか？</>
        )}
      </ConfirmModal>
    </SubmenuPage>
  );
};

export default MembersControl;
