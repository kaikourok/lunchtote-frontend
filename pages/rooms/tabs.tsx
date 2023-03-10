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
} from '@mdi/js';
import Icon from '@mdi/react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MouseEvent, MouseEventHandler, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

import Button from '@/components/atoms/Button/Button';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import NoItemsMessage from '@/components/atoms/NoItemsMessage/NoItemsMessage';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import { NamedMessagesFetchConfig } from '@/components/organisms/MessagesView/types';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/rooms/tabs.module.scss';
import Heading from 'components/atoms/Heading/Heading';
import Loading from 'components/organisms/Loading/Loading';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import { findIndexFromUniqueKey } from 'lib/findIndexFromUniqueKey';
import axios from 'plugins/axios';

type SortableRoleItemProps = {
  tab: NamedMessagesFetchConfig & { id: number };
  onEdit: MouseEventHandler<HTMLDivElement>;
  onRemove: MouseEventHandler<HTMLDivElement>;
};

const SortableRoleItem = (props: SortableRoleItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      style={style}
      id={`${props.tab.id}`}
      className={styles['tab']}
    >
      <div {...attributes} {...listeners} className={styles['tab-drag-handle']}>
        <Icon path={mdiDragHorizontalVariant} />
      </div>
      <div className={styles['tab-name']}>{props.tab.name}</div>
      <div className={styles['tab-action']} onClick={props.onEdit}>
        <Icon path={mdiPencil} />
      </div>
      <div className={styles['tab-action']} onClick={props.onRemove}>
        <Icon path={mdiDelete} />
      </div>
    </section>
  );
};

const RoomsTabs: NextPage = () => {
  const router = useRouter();
  const csrfHeader = useCsrfHeader();

  const [fetchConfigs, setFetchConfigs] = useState<
    (NamedMessagesFetchConfig & { id: number })[]
  >([]);
  const [error, setError] = useState(false);
  const [isFetchConfigOrderAppliable, setIsFetchConfigOrderAppliable] =
    useState(false);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [newTabName, setNewTabName] = useState('');

  useEffect(() => {
    (async () => {
      if (router.isReady) {
        try {
          const response = await axios.get<
            (NamedMessagesFetchConfig & { id: number })[]
          >('/rooms/fetch-configs');

          setFetchConfigs(response.data);
        } catch (e) {
          console.log(e);
          setError(true);
        }
      }
    })();
  }, [router.isReady]);

  useRequireAuthenticated();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragTagEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      setFetchConfigs((configs) => {
        const oldIndex = findIndexFromUniqueKey(
          'id',
          active.id as number,
          configs
        );
        const newIndex = findIndexFromUniqueKey(
          'id',
          over.id as number,
          configs
        );

        return arrayMove(configs, oldIndex, newIndex);
      });
      setIsFetchConfigOrderAppliable(true);
    }
  };

  if (error) {
    return (
      <DefaultPage>
        <PageData title="????????????" />
        <Heading>????????????</Heading>
        <CommentarySection>?????????????????????????????????????????????</CommentarySection>
      </DefaultPage>
    );
  }

  if (!fetchConfigs) {
    return (
      <DefaultPage>
        <PageData title="????????????" />
        <Heading>????????????</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  if (!fetchConfigs.length) {
    return (
      <DefaultPage>
        <PageData title="????????????" />
        <Heading>????????????</Heading>
        <NoItemsMessage>
          ???????????????????????????
          <br />
          ????????????????????????????????????????????????
        </NoItemsMessage>
      </DefaultPage>
    );
  }

  const editTarget = fetchConfigs.filter((config) => config.id == editTargetId)
    .length
    ? fetchConfigs.filter((config) => config.id == editTargetId)[0]
    : null;

  const deleteTarget = fetchConfigs.filter(
    (config) => config.id == deleteTargetId
  ).length
    ? fetchConfigs.filter((config) => config.id == deleteTargetId)[0]
    : null;

  return (
    <DefaultPage>
      <PageData title="????????????" />
      <Heading>????????????</Heading>
      <section className={styles['actions']}>
        <Button
          className={styles['action']}
          icon={mdiCheck}
          disabled={!isFetchConfigOrderAppliable}
          highlight={isFetchConfigOrderAppliable}
          onDisabledClick={() => toast.error('???????????????????????????????????????')}
          onClick={async () => {
            if (!csrfHeader) return;

            try {
              await toast.promise(
                axios.post(
                  '/rooms/fetch-configs/orders',
                  {
                    orders: fetchConfigs.map((config, index) => ({
                      config: config.id,
                      order: index,
                    })),
                  },
                  {
                    headers: csrfHeader,
                  }
                ),
                {
                  loading: '?????????????????????????????????????????????',
                  success: '??????????????????????????????????????????',
                  error: '?????????????????????????????????????????????????????????',
                }
              );

              setIsFetchConfigOrderAppliable(false);
            } catch (e) {
              console.log(e);
            }
          }}
        >
          ?????????????????????
        </Button>
      </section>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragTagEnd}
      >
        {!!fetchConfigs.length && (
          <section className={styles['tabs']}>
            <SortableContext
              items={fetchConfigs.map((config) => config.id)}
              strategy={verticalListSortingStrategy}
            >
              {fetchConfigs.map((config) => {
                return (
                  <SortableRoleItem
                    key={config.id}
                    tab={config}
                    onEdit={() => setEditTargetId(config.id)}
                    onRemove={() => setDeleteTargetId(config.id)}
                  />
                );
              })}
            </SortableContext>
          </section>
        )}
      </DndContext>
      <ConfirmModal
        heading="???????????????"
        isOpen={deleteTarget != null}
        onClose={() => setDeleteTargetId(null)}
        onCancel={() => setDeleteTargetId(null)}
        onOk={async () => {
          if (!csrfHeader || !deleteTarget) return;

          try {
            await toast.promise(
              axios.post(
                '/rooms/fetch-configs/delete',
                {
                  config: deleteTarget.id,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: '??????????????????????????????',
                success: '???????????????????????????',
                error: '???????????????????????????????????????????????????',
              }
            );

            setFetchConfigs(
              fetchConfigs.filter((config) => config.id != deleteTarget.id)
            );
            setDeleteTargetId(null);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {deleteTarget != null && <>?????????{deleteTarget.name}????????????????????????</>}
      </ConfirmModal>
      <ConfirmModal
        heading="?????????????????????"
        isOpen={editTarget != null}
        onClose={() => {
          setEditTargetId(null);
          setNewTabName('');
        }}
        onCancel={() => {
          setEditTargetId(null);
          setNewTabName('');
        }}
        onOk={async () => {
          if (!csrfHeader || !editTarget) return;

          try {
            await toast.promise(
              axios.post(
                '/rooms/fetch-configs/rename',
                {
                  config: editTarget.id,
                  name: newTabName,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: '????????????????????????????????????',
                success: '?????????????????????????????????',
                error: '?????????????????????????????????????????????????????????',
              }
            );

            setFetchConfigs(
              fetchConfigs.map((config) => {
                if (config.id != editTarget.id) {
                  return config;
                } else {
                  return {
                    ...config,
                    name: newTabName,
                  };
                }
              })
            );
            setEditTargetId(null);
            setNewTabName('');
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {editTarget != null && (
          <div className={styles['input-modal-inner']}>
            <div className={styles['input-modal-text']}>
              {editTarget.name}????????????????????????????????????????????????
            </div>
            <div className={styles['input-modal-input-wrapper']}>
              <input
                className={styles['input-modal-input']}
                placeholder={editTarget.name}
                type="text"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
              />
            </div>
          </div>
        )}
      </ConfirmModal>
    </DefaultPage>
  );
};

export default RoomsTabs;
