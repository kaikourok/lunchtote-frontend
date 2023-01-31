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
import type { NextPage } from 'next';
import Link from 'next/link';
import { Router, useRouter } from 'next/router';
import { MouseEventHandler, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import Button from '@/components/atoms/Button/Button';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import NoItemsMessage from '@/components/atoms/NoItemsMessage/NoItemsMessage';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/characters/lists/index.module.scss';
import Heading from 'components/atoms/Heading/Heading';
import Loading from 'components/organisms/Loading/Loading';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import { findIndexFromUniqueKey } from 'lib/findIndexFromUniqueKey';
import axios from 'plugins/axios';

type ListOverview = {
  id: number;
  name: string;
};

type SortableListItemProps = {
  item: ListOverview;
  onEdit: MouseEventHandler<HTMLDivElement>;
  onRemove: MouseEventHandler<HTMLDivElement>;
};

const SortableListItem = (props: SortableListItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      id={`${props.item.id}`}
      className={styles['item']}
    >
      <div
        {...attributes}
        {...listeners}
        className={styles['item-drag-handle']}
      >
        <Icon path={mdiDragHorizontalVariant} />
      </div>
      <div className={styles['item-name']}>
        <Link
          href={{
            pathname: '/characters/lists/[list]',
            query: { list: props.item.id },
          }}
        >
          <a className={styles['item-link']}>{props.item.name}</a>
        </Link>
      </div>
      <div className={styles['item-action']} onClick={props.onEdit}>
        <Icon path={mdiPencil} />
      </div>
      <div className={styles['item-action']} onClick={props.onRemove}>
        <Icon path={mdiDelete} />
      </div>
    </section>
  );
};

const CharacterLists: NextPage = () => {
  const router = useRouter();
  const csrfHeader = useCsrfHeader();

  useRequireAuthenticated();

  const [lists, setLists] = useState<ListOverview[]>([]);
  const [error, setError] = useState(false);
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [isFetchConfigOrderAppliable, setIsFetchConfigOrderAppliable] =
    useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    (async () => {
      if (router.isReady) {
        try {
          const response = await axios.get<ListOverview[]>(
            '/characters/main/lists'
          );
          setLists(response.data);
        } catch (e) {
          console.log(e);
          setError(true);
        }
      }
    })();
  }, [router.isReady]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragTagEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      setLists((lists) => {
        const oldIndex = findIndexFromUniqueKey(
          'id',
          active.id as number,
          lists
        );
        const newIndex = findIndexFromUniqueKey('id', over.id as number, lists);

        return arrayMove(lists, oldIndex, newIndex);
      });
      setIsFetchConfigOrderAppliable(true);
    }
  };

  if (error) {
    return (
      <DefaultPage>
        <PageData title="リスト管理" />
        <Heading>リスト管理</Heading>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!lists) {
    return (
      <DefaultPage>
        <PageData title="リスト管理" />
        <Heading>リスト管理</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  const editTarget = lists.filter((config) => config.id == editTargetId).length
    ? lists.filter((config) => config.id == editTargetId)[0]
    : null;

  const deleteTarget = lists.filter((config) => config.id == deleteTargetId)
    .length
    ? lists.filter((config) => config.id == deleteTargetId)[0]
    : null;

  return (
    <DefaultPage>
      <PageData title="リスト管理" />
      <Heading>リスト管理</Heading>
      <section className={styles['actions']}>
        <Button
          className={styles['action']}
          icon={mdiCheck}
          disabled={!isFetchConfigOrderAppliable}
          highlight={isFetchConfigOrderAppliable}
          onDisabledClick={() => toast.error('まだ並び替えられていません')}
          onClick={async () => {
            if (!csrfHeader) return;

            try {
              await toast.promise(
                axios.post(
                  '/rooms/fetch-configs/orders',
                  {
                    orders: lists.map((config, index) => ({
                      config: config.id,
                      order: index,
                    })),
                  },
                  {
                    headers: csrfHeader,
                  }
                ),
                {
                  loading: 'リストの並び替えを適用しています',
                  success: 'リストの並び替えを適用しました',
                  error: 'リストの並び替え中にエラーが発生しました',
                }
              );

              setIsFetchConfigOrderAppliable(false);
            } catch (e) {
              console.log(e);
            }
          }}
        >
          並び替えの適用
        </Button>
        <Button
          className={styles['action']}
          icon={mdiPlus}
          onClick={() => setIsNewListModalOpen(true)}
        >
          リストの作成
        </Button>
      </section>
      {!lists.length && <NoItemsMessage>リストがありません。</NoItemsMessage>}
      {!!lists.length && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragTagEnd}
        >
          <section className={styles['items']}>
            <SortableContext
              items={lists.map((config) => config.id)}
              strategy={verticalListSortingStrategy}
            >
              {lists.map((config) => {
                return (
                  <SortableListItem
                    key={config.id}
                    item={config}
                    onEdit={() => setEditTargetId(config.id)}
                    onRemove={() => setDeleteTargetId(config.id)}
                  />
                );
              })}
            </SortableContext>
          </section>
        </DndContext>
      )}
      <ConfirmModal
        heading="リストの削除"
        isOpen={deleteTarget != null}
        onClose={() => setDeleteTargetId(null)}
        onCancel={() => setDeleteTargetId(null)}
        onOk={async () => {
          if (!csrfHeader || !deleteTarget) return;

          try {
            await toast.promise(
              axios.post(
                `/characters/main/lists/${deleteTarget.id}/delete`,
                null,
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'リストを削除しています',
                success: 'リストを削除しました',
                error: 'リストの削除中にエラーが発生しました',
              }
            );

            setLists(lists.filter((config) => config.id != deleteTarget.id));
            setDeleteTargetId(null);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {deleteTarget != null && <>本当に{deleteTarget.name}を削除しますか？</>}
      </ConfirmModal>
      <ConfirmModal
        heading="リストのリネーム"
        isOpen={editTarget != null}
        onClose={() => {
          setEditTargetId(null);
          setNewListName('');
        }}
        onCancel={() => {
          setEditTargetId(null);
          setNewListName('');
        }}
        onOk={async () => {
          if (!csrfHeader || !editTarget) return;

          try {
            await toast.promise(
              axios.post(
                `/characters/main/lists/${editTarget.id}/rename`,
                {
                  name: newListName,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'リストをリネームしています',
                success: 'リストをリネームしました',
                error: 'リストのリネーム中にエラーが発生しました',
              }
            );

            setLists(
              lists.map((config) => {
                if (config.id != editTarget.id) {
                  return config;
                } else {
                  return {
                    ...config,
                    name: newListName,
                  };
                }
              })
            );
            setEditTargetId(null);
            setNewListName('');
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {editTarget != null && (
          <div className={styles['input-modal-inner']}>
            <div className={styles['input-modal-text']}>
              {editTarget.name}の新しい名前を入力してください。
            </div>
            <div className={styles['input-modal-input-wrapper']}>
              <input
                className={styles['input-modal-input']}
                placeholder={editTarget.name}
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
          </div>
        )}
      </ConfirmModal>
      <ConfirmModal
        heading="リストの作成"
        isOpen={isNewListModalOpen}
        disabled={newListName == ''}
        onClose={() => {
          setIsNewListModalOpen(false);
          setNewListName('');
        }}
        onCancel={() => {
          setIsNewListModalOpen(false);
          setNewListName('');
        }}
        onOk={async () => {
          if (!csrfHeader) return;

          try {
            const response = await toast.promise(
              axios.post<{ listId: number }>(
                `/characters/main/lists`,
                {
                  name: newListName,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'リストを作成しています',
                success: 'リストを作成しました',
                error: 'リストの作成中にエラーが発生しました',
              }
            );

            setLists([
              ...lists,
              { id: response.data.listId, name: newListName },
            ]);
            setIsNewListModalOpen(false);
            setNewListName('');
          } catch (e) {
            console.log(e);
          }
        }}
      >
        <div className={styles['input-modal-inner']}>
          <div className={styles['input-modal-text']}>
            作成するリストの名前を入力してください。
          </div>
          <div className={styles['input-modal-input-wrapper']}>
            <input
              className={styles['input-modal-input']}
              placeholder="リスト名"
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
          </div>
        </div>
      </ConfirmModal>
    </DefaultPage>
  );
};

export default CharacterLists;
