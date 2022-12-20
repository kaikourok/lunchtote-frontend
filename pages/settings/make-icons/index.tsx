import { mdiDelete, mdiPencil, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import Button from '@/components/atoms/Button/Button';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/settings/make-icons/index.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import axios from 'plugins/axios';


type LayeringGroup = {
  id: number;
  name: string;
};

type Response = {
  layeringGroups: LayeringGroup[];
};

const SettingsMakeIcons: NextPage = () => {
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const router = useRouter();
  const csrfHeader = useCsrfHeader();

  const { data, error, mutate } = useSWR<Response>(
    !router.isReady ? null : '/characters/main/settings/layerings'
  );

  const [newLayeringGroupName, setNewLayeringGroupName] = useState('');
  const [isNewLayeringGroupModalOpen, setIsNewLayeringGroupModalOpen] =
    useState(false);

  const [rename, setRename] = useState('');
  const [renameTargetIndex, setRenameTargetIndex] = useState<number | null>(
    null
  );
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(
    null
  );

  if (error) {
    return (
      <DefaultPage>
        <PageData title="アイコンレイヤリング" />
        <SubHeading>アイコンレイヤリング</SubHeading>
        <CommentarySection>
          ページの読み込み中にエラーが発生しました。
        </CommentarySection>
      </DefaultPage>
    );
  }

  if (!isAuthenticated || !isAuthenticationTried || !data) {
    return (
      <DefaultPage>
        <PageData title="アイコンレイヤリング" />
        <SubHeading>アイコンレイヤリング</SubHeading>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="アイコンレイヤリング" />
      <SubHeading>アイコンレイヤリング</SubHeading>
      <CommentarySection>
        重ね合わせ合成を行うことで新規アイコンを生成します。
      </CommentarySection>
      <section className={styles['actions']}>
        <Button
          icon={mdiPlus}
          onClick={() => setIsNewLayeringGroupModalOpen(true)}
        >
          レイヤリンググループの追加
        </Button>
      </section>
      <section className={styles['layering-groups-wrapper']}>
        {!data.layeringGroups.length && (
          <section className={styles['no-groups']}>
            レイヤリンググループがありません。
          </section>
        )}
        {!!data.layeringGroups.length && (
          <section className={styles['layering-groups']}>
            {data.layeringGroups.map((layeringGroup, index) => {
              return (
                <section
                  key={layeringGroup.id}
                  className={styles['layering-group']}
                >
                  <div className={styles['layering-group-name']}>
                    <Link
                      href={{
                        pathname: '/settings/make-icons/[group]',
                        query: { group: layeringGroup.id },
                      }}
                    >
                      <a className={styles['layering-group-name-link']}>
                        {layeringGroup.name}
                      </a>
                    </Link>
                  </div>
                  <div className={styles['layering-group-actions']}>
                    <div
                      className={styles['layering-group-action']}
                      onClick={() => {
                        setRename(layeringGroup.name);
                        setRenameTargetIndex(index);
                      }}
                    >
                      <Icon path={mdiPencil} />
                    </div>
                    <div
                      className={styles['layering-group-action']}
                      onClick={() => setDeleteTargetIndex(index)}
                    >
                      <Icon path={mdiDelete} />
                    </div>
                  </div>
                </section>
              );
            })}
          </section>
        )}
      </section>
      <ConfirmModal
        heading="レイヤリンググループの作成"
        isOpen={isNewLayeringGroupModalOpen}
        onClose={() => setIsNewLayeringGroupModalOpen(false)}
        onCancel={() => setIsNewLayeringGroupModalOpen(false)}
        onOk={async () => {
          if (!csrfHeader) return;

          setIsNewLayeringGroupModalOpen(false);

          try {
            const createLayeringGroupName = newLayeringGroupName;

            const result = await toast.promise(
              axios.post<{ id: number }>(
                '/characters/main/settings/layerings',
                {
                  name: newLayeringGroupName,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'レイヤリンググループを作成しています',
                success: 'レイヤリンググループを作成しました',
                error: 'レイヤリンググループの作成中にエラーが発生しました',
              }
            );

            mutate(
              {
                layeringGroups: [
                  ...data.layeringGroups,
                  {
                    id: result.data.id,
                    name: createLayeringGroupName,
                  },
                ],
              },
              false
            );
          } catch (e) {
            console.log(e);
          }
        }}
        disabled={!newLayeringGroupName}
      >
        <div className={styles['input-modal-inner']}>
          <div className={styles['input-modal-text']}>
            新しいレイヤリンググループの名前を入力してください
          </div>
          <div className={styles['input-modal-input-wrapper']}>
            <input
              className={styles['input-modal-input']}
              type="text"
              placeholder="レイヤリンググループ名"
              onChange={(e) => setNewLayeringGroupName(e.target.value)}
              value={newLayeringGroupName}
            />
          </div>
        </div>
      </ConfirmModal>
      <ConfirmModal
        heading="レイヤリンググループのリネーム"
        isOpen={renameTargetIndex != null}
        onClose={() => setRenameTargetIndex(null)}
        onCancel={() => setRenameTargetIndex(null)}
        onOk={async () => {
          if (!csrfHeader || renameTargetIndex == null) return;

          const newName = rename;
          const targetIndex = renameTargetIndex;

          setRenameTargetIndex(null);

          try {
            await toast.promise(
              axios.put(
                `/characters/main/settings/layerings/${data.layeringGroups[targetIndex].id}`,
                {
                  name: rename,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'リネームしています',
                success: 'リネームしました',
                error: 'リネーム中にエラーが発生しました',
              }
            );

            mutate(
              {
                layeringGroups: data.layeringGroups.map((group, index) => {
                  if (index == targetIndex) {
                    return {
                      ...group,
                      name: newName,
                    };
                  } else {
                    return { ...group };
                  }
                }),
              },
              false
            );
          } catch (e) {
            console.log(e);
          }
        }}
        disabled={!rename}
      >
        <div className={styles['input-modal-inner']}>
          <div className={styles['input-modal-text']}>
            新しい名前を入力してください
          </div>
          <div className={styles['input-modal-input-wrapper']}>
            <input
              className={styles['input-modal-input']}
              type="text"
              placeholder="レイヤリンググループ名"
              onChange={(e) => setRename(e.target.value)}
              value={rename}
            />
          </div>
        </div>
      </ConfirmModal>
      <ConfirmModal
        heading="レイヤリンググループの削除"
        isOpen={deleteTargetIndex != null}
        onClose={() => setDeleteTargetIndex(null)}
        onCancel={() => setDeleteTargetIndex(null)}
        onOk={async () => {
          if (!csrfHeader || deleteTargetIndex == null) return;

          const targetIndex = deleteTargetIndex;
          setDeleteTargetIndex(null);

          try {
            await toast.promise(
              axios.post(
                `/characters/main/settings/layerings/${data.layeringGroups[targetIndex].id}/delete`,
                null,
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: '削除しています',
                success: '削除しました',
                error: '削除中にエラーが発生しました',
              }
            );

            mutate(
              {
                layeringGroups: data.layeringGroups.filter(
                  (group, index) => index != targetIndex
                ),
              },
              false
            );
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {deleteTargetIndex != null && (
          <>
            本当に<b>{data.layeringGroups[deleteTargetIndex].name}</b>
            を削除しますか？ この操作は元に戻せません。
          </>
        )}
      </ConfirmModal>
    </DefaultPage>
  );
};

export default SettingsMakeIcons;
