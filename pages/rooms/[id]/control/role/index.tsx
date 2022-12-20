import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  mdiCheck,
  mdiDelete,
  mdiDragHorizontalVariant,
  mdiPencil,
  mdiPlus,
} from '@mdi/js';
import Icon from '@mdi/react';
import classNames from 'classnames';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MouseEventHandler, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import Button from '@/components/atoms/Button/Button';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import Loading from '@/components/organisms/Loading/Loading';
import SubmenuPage from '@/components/template/SubmenuPage/SubmenuPage';
import styles from '@/styles/pages/rooms/[id]/control/role.module.scss';
import roomControlsSubmenu from 'constants/submenu/roomsControl';
import useCsrfHeader from 'hooks/useCsrfHeader';
import { findIndexFromUniqueKey } from 'lib/findIndexFromUniqueKey';
import roleName from 'lib/roleName';
import roomIdText from 'lib/roomIdText';
import axios from 'plugins/axios';





type Role = {
  id: number;
  prioriry: number;
  name: string;
  read: boolean | null;
  write: boolean | null;
  ban: boolean | null;
  invite: boolean | null;
  useReply: boolean | null;
  useSecret: boolean | null;
  deleteOtherMessage: boolean | null;
  color: string | null;
  type: RoleType;
  members: {
    id: number;
    name: string;
    mainicon: string;
  }[];
};

type Response = {
  title: string;
  roles: Role[];
};

type SortableRoleItemProps = {
  role: Role;
  onRemove: MouseEventHandler<HTMLDivElement>;
};

const SortableRoleItem = (props: SortableRoleItemProps) => {
  const router = useRouter();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.role.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      id={`${props.role.id}`}
      className={styles['role']}
    >
      <div
        {...attributes}
        {...listeners}
        className={styles['role-drag-handle']}
      >
        <Icon path={mdiDragHorizontalVariant} />
      </div>
      <div className={styles['role-name']}>
        {roleName(props.role.name, props.role.type)}
      </div>
      <Link
        href={{
          pathname: '/rooms/[id]/control/role/[role]',
          query: { id: router.query.id, role: props.role.id },
        }}
      >
        <a className={styles['role-action']}>
          <Icon path={mdiPencil} />
        </a>
      </Link>
      <div className={styles['role-action']} onClick={props.onRemove}>
        <Icon path={mdiDelete} />
      </div>
    </section>
  );
};

const RoomsControlRole: NextPage = () => {
  const csrfHeader = useCsrfHeader();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);

  const [isFetched, setIsFetched] = useState(false);
  const [error, setError] = useState(false);

  const [newRoleName, setNewRoleName] = useState('');
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);

  const [roleDeleteTargetID, setRoleDeleteTargetID] = useState<number | null>(
    null
  );

  const [isRoleOrderAppliable, setIsRoleOrderAppliable] = useState(false);

  const roleDeleteTargetIndex = (() => {
    for (let i = 0; i < roles.length; i++) {
      if (roles[i].id == roleDeleteTargetID) {
        return i;
      }
    }
    return null;
  })();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    (async () => {
      if (router.isReady) {
        try {
          const response = await axios.get<Response>(
            `/rooms/${router.query.id}/control/role`
          );

          setTitle(response.data.title);
          setRoles(response.data.roles);
        } catch (e) {
          console.log(e);
          setError(true);
        } finally {
          setIsFetched(true);
        }
      }
    })();
  }, [router.isReady]);

  if (!isFetched) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <Loading />
      </SubmenuPage>
    );
  }

  if (error) {
    return (
      <SubmenuPage menu={roomControlsSubmenu(Number(router.query.id))}>
        <CommentarySection noMargin>
          表示中にエラーが発生しました。
        </CommentarySection>
      </SubmenuPage>
    );
  }

  const handleDragTagEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      setRoles((roles) => {
        const oldIndex = findIndexFromUniqueKey(
          'id',
          active.id as number,
          roles
        );
        const newIndex = findIndexFromUniqueKey('id', over.id as number, roles);

        return arrayMove(roles, oldIndex, newIndex);
      });
      setIsRoleOrderAppliable(true);
    }
  };

  const memberRoles = roles.filter((role) => role.type == 'MEMBER');

  return (
    <SubmenuPage
      title={`権限設定 | ${roomIdText(Number(router.query.id))} ${title}`}
      menu={roomControlsSubmenu(Number(router.query.id))}
    >
      <CommentarySection noMargin>
        複数の権限が設定されている場合、各設定に関してより上位（リスト上側）に設定されている権限のものが優先されます。
      </CommentarySection>
      <section className={styles['role-actions']}>
        <Button
          className={styles['role-action']}
          icon={mdiCheck}
          disabled={!isRoleOrderAppliable}
          highlight={isRoleOrderAppliable}
          onClick={async () => {
            if (!csrfHeader) return;

            try {
              await toast.promise(
                axios.post(
                  `/rooms/${router.query.id}/control/role/update-priorities`,
                  {
                    priorities: memberRoles.map((role, index) => ({
                      role: role.id,
                      priority: index,
                    })),
                  },
                  {
                    headers: csrfHeader,
                  }
                ),
                {
                  loading: '権限の優先順を変更しています',
                  success: '権限の優先順を変更しました',
                  error: '権限の並び替え中にエラーが発生しました',
                }
              );
              setIsRoleOrderAppliable(false);
            } catch (e) {
              console.log(e);
            }
          }}
        >
          並び替えの適用
        </Button>
        <Button
          className={styles['role-action']}
          icon={mdiPlus}
          onClick={() => setIsNewRoleModalOpen(true)}
        >
          権限設定の追加
        </Button>
      </section>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragTagEnd}
      >
        {!!memberRoles.length && (
          <section className={styles['roles']}>
            <SortableContext
              items={memberRoles.map((role) => role.id)}
              strategy={verticalListSortingStrategy}
            >
              {memberRoles.map((role) => {
                return (
                  <SortableRoleItem
                    key={role.id}
                    role={role}
                    onRemove={() => setRoleDeleteTargetID(role.id)}
                  />
                );
              })}
            </SortableContext>
          </section>
        )}
        {!memberRoles.length && (
          <section className={styles['no-roles']}>
            追加の権限設定がありません。
          </section>
        )}
      </DndContext>
      <hr />
      <CommentarySection noMargin>
        以下は対応するキャラクターへのデフォルトの権限設定となります。削除はできません。
      </CommentarySection>
      <section className={styles['roles']}>
        {roles
          .filter((role) => role.type != 'MEMBER' && role.type != 'MASTER')
          .map((role, index) => {
            return (
              <section key={role.id} className={styles['role']}>
                <div
                  className={classNames(
                    styles['role-drag-handle'],
                    styles['invalid']
                  )}
                >
                  <Icon path={mdiDragHorizontalVariant} />
                </div>
                <div className={styles['role-name']}>
                  {roleName(role.name, role.type)}
                </div>
                <Link
                  href={{
                    pathname: '/rooms/[id]/control/role/[role]',
                    query: { id: router.query.id, role: role.id },
                  }}
                >
                  <a className={styles['role-action']}>
                    <Icon path={mdiPencil} />
                  </a>
                </Link>
                <div
                  className={classNames(
                    styles['role-action'],
                    styles['invalid']
                  )}
                  onClick={() => setRoleDeleteTargetID(role.id)}
                >
                  <Icon path={mdiDelete} />
                </div>
              </section>
            );
          })}
      </section>
      <ConfirmModal
        heading="権限設定の追加"
        isOpen={isNewRoleModalOpen}
        onClose={() => setIsNewRoleModalOpen(false)}
        onCancel={() => setIsNewRoleModalOpen(false)}
        onOk={async () => {
          if (!csrfHeader) return;

          setIsNewRoleModalOpen(false);

          try {
            const createRoleName = newRoleName;

            const result = await toast.promise(
              axios.post<{ id: number }>(
                `/rooms/${Number(router.query.id)}/control/role/create`,
                {
                  name: newRoleName,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: '権限を作成しています',
                success: '権限を作成しました',
                error: '権限の作成中にエラーが発生しました',
              }
            );

            setRoles([
              {
                id: result.data.id,
                prioriry:
                  roles.reduce((a, b) => (a.prioriry > b.prioriry ? a : b))
                    .prioriry + 1,
                name: createRoleName,
                read: null,
                write: null,
                ban: null,
                invite: null,
                useReply: null,
                useSecret: null,
                deleteOtherMessage: null,
                color: null,
                type: 'MEMBER',
                members: [],
              },
              ...roles,
            ]);
          } catch (e) {
            console.log(e);
          }
        }}
        disabled={!newRoleName}
      >
        <div className={styles['new-role-modal-inner']}>
          <div className={styles['new-role-modal-text']}>
            新しい権限の名前を入力してください
          </div>
          <div className={styles['new-role-modal-input-wrapper']}>
            <input
              className={styles['new-role-modal-input']}
              type="text"
              placeholder="権限名"
              onChange={(e) => setNewRoleName(e.target.value)}
              value={newRoleName}
            />
          </div>
        </div>
      </ConfirmModal>
      <ConfirmModal
        heading="権限設定の削除"
        isOpen={roleDeleteTargetIndex != null}
        onClose={() => setRoleDeleteTargetID(null)}
        onCancel={() => setRoleDeleteTargetID(null)}
        onOk={async () => {
          if (!csrfHeader) return;
          setIsNewRoleModalOpen(false);

          try {
            const targetId = roleDeleteTargetID;
            await toast.promise(
              axios.post(
                `/rooms/${Number(router.query.id)}/control/role/delete`,
                {
                  role: roleDeleteTargetID,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: '権限を削除しています',
                success: '権限を削除しました',
                error: '権限の削除中にエラーが発生しました',
              }
            );

            setRoles(roles.filter((role) => role.id != targetId));
            setRoleDeleteTargetID(null);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {roleDeleteTargetIndex != null && (
          <>本当に権限「{roles[roleDeleteTargetIndex].name}」を削除しますか？</>
        )}
      </ConfirmModal>
    </SubmenuPage>
  );
};

export default RoomsControlRole;
