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
import { mdiClose, mdiDragHorizontalVariant, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { NextPage } from 'next';
import { ChangeEventHandler, MouseEventHandler, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import InlineLink from '@/components/atoms/InlineLink/InlineLink';
import ItemAddButton from '@/components/atoms/ItemAddButton/ItemAddButton';
import SelectOption from '@/components/atoms/SelectOption/SelectOption';
import LabeledToggleButton from '@/components/molecules/LabeledToggleButton/LabeledToggleButton';
import Annotations from '@/components/organisms/Annotations/Annotations';
import DecorationEditor from '@/components/organisms/DecorationEditor/DecorationEditor';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import styles from '@/styles/pages/rooms/create.module.scss';
import { officialRoomTags } from 'constants/tags/official';
import useCsrfHeader from 'hooks/useCsrfHeader';
import { findIndexFromUuid } from 'lib/findIndexFromUuid';
import axios from 'plugins/axios';

const titleMax = Number(process.env.NEXT_PUBLIC_ROOM_TITLE_MAX!);
const summaryMax = Number(process.env.NEXT_PUBLIC_ROOM_SUMMARY_MAX!);

type Tag = {
  uuid: string;
  tag: string;
};

type SortableEditTagItemProps = {
  tag: Tag;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onRemove: MouseEventHandler<HTMLDivElement>;
};

type RoomCreateData = {
  childrenCreatableRooms: {
    id: number;
    title: string;
  }[];
};

const SortableEditTagItem = (props: SortableEditTagItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.tag.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={props.tag.uuid}
      className={styles['tag']}
    >
      <div {...attributes} {...listeners} className={styles['tag-drag-handle']}>
        <Icon path={mdiDragHorizontalVariant} />
      </div>
      <input
        type="text"
        className={styles['tag-input']}
        value={props.tag.tag}
        onChange={props.onChange}
      />
      <div className={styles['tag-remove']} onClick={props.onRemove}>
        <Icon path={mdiClose} />
      </div>
    </div>
  );
};

const SettingsProfile: NextPage = () => {
  const csrfHeader = useCsrfHeader();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [title, setTitle] = useState('');
  const titleError = (() => {
    if (!title) {
      return 'タイトルは入力必須です';
    }
    if (0 < titleMax && titleMax < title.length) {
      return `名前は${titleMax}文字までです`;
    }
  })();

  const [summary, setSummary] = useState('');
  const summaryError = (() => {
    if (0 < summaryMax && summaryMax < summary.length) {
      return `サマリーは${summaryMax}文字までです`;
    }
  })();

  const [tags, setTags] = useState<Tag[]>([]);
  const [description, setDescription] = useState('');
  const [searchable, setSearchable] = useState(true);
  const [allowRecommendation, setAllowRecommendation] = useState(true);
  const [childrenReferable, setChildrenReferable] = useState(true);
  const [submitTried, setSubmitTried] = useState(false);
  const [parentRoom, setParentRoom] = useState<number | null>(null);

  const { data: createData, error: createDataFetchError } =
    useSWR<RoomCreateData>('/rooms/create-data');

  if (!createData) {
    return (
      <DefaultPage>
        <PageData title="ルーム作成" />
        <Heading>ルーム作成</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  if (createDataFetchError) {
    return (
      <DefaultPage>
        <PageData title="ルーム作成" />
        <Heading>ルーム作成</Heading>
        <CommentarySection>
          ルーム作成に関わる情報の取得中にエラーが発生しました。
        </CommentarySection>
      </DefaultPage>
    );
  }

  const error = titleError || summaryError;

  const submit = async () => {
    if (!csrfHeader) return;

    setSubmitTried(true);

    if (error) {
      return toast.error(error);
    }

    await toast.promise(
      axios.post<{ id: number }>(
        '/rooms',
        {
          title,
          tags: tags.map((tagObject) => tagObject.tag),
          summary,
          description,
          searchable,
          allowRecommendation,
          parentRoom,
        },
        {
          headers: csrfHeader,
        }
      ),
      {
        loading: 'ルームを作成しています',
        success: (response) => {
          return `#${response.data.id}でルームを作成しました`;
        },
        error: 'ルームの作成中にエラーが発生しました',
      }
    );
  };

  const handleChangeTag = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newTags = [...tags];
    newTags[index] = {
      uuid: newTags[index].uuid,
      tag: e.target.value,
    };
    setTags(newTags);
  };

  const handleDragTagEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      setTags((tags) => {
        const oldIndex = findIndexFromUuid(active.id as string, tags);
        const newIndex = findIndexFromUuid(over.id as string, tags);

        return arrayMove(tags, oldIndex, newIndex);
      });
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  const addTag = () => {
    const newTags = [...tags];
    newTags.push({
      uuid: uuidv4(),
      tag: '',
    });
    setTags(newTags);
  };

  return (
    <DefaultPage>
      <PageData title="ルーム作成" />
      <Heading>ルーム作成</Heading>
      <SectionWrapper>
        <InputForm
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <InputForm.Text
            label="タイトル"
            max={titleMax}
            value={title}
            error={titleError}
            submitTried={submitTried}
            onChange={(e) => setTitle(e.target.value)}
            showRequiredInformation
            required
            help={
              <>
                ルームリストなどに表示されるルームの概要です。
                {0 < titleMax && titleMax + '文字まで入力できます。'}
              </>
            }
          />
          <InputForm.Text
            label="サマリー"
            max={summaryMax}
            value={summary}
            error={summaryError}
            submitTried={submitTried}
            onChange={(e) => setSummary(e.target.value)}
            help={
              <>
                ルームリストなどに表示されるルームの簡易な説明文です。
                {0 < summaryMax && summaryMax + '文字まで入力できます。'}
              </>
            }
          />
          <InputForm.General
            label="所属ルーム"
            help={
              <>
                <p>
                  他のルームの所属ルームとしてルームを作成することができます。無選択の場合はどこのルームにも所属させずにルームを作成します。
                </p>
                <p>対象となるのは所属ルーム作成権限のあるルームのみです。</p>
              </>
            }
          >
            <SelectOption
              options={[
                { label: '所属なし', value: null, isPlaceholder: true },
                ...createData.childrenCreatableRooms.map((room) => ({
                  label: `${room.id}. ${room.title}`,
                  value: room.id,
                })),
              ]}
              onChange={setParentRoom}
              value={parentRoom}
            />
          </InputForm.General>
          <InputForm.General
            label="タグ"
            help={
              <>
                ルームの属性などを表すタグです。複数設定できます。追加する場合はタグ追加を押してください。
              </>
            }
          >
            <section>
              共通で利用しやすいよう、公式でいくつかのタグを用意しています。条件に合うものがあったら公式タグを設定してみましょう。
              <Annotations>
                <Annotations.Item>
                  各公式タグの詳しい意味は
                  <InlineLink href="#">遊び方</InlineLink>
                  より確認できます
                </Annotations.Item>
              </Annotations>
              <div>
                {officialRoomTags.map((tag) => {
                  return (
                    <ItemAddButton
                      key={tag.tag}
                      onClick={() => {
                        if (tags.find((addedTag) => addedTag.tag == tag.tag)) {
                          setTags(
                            tags.filter((addedTag) => addedTag.tag != tag.tag)
                          );
                        } else {
                          setTags([...tags, { uuid: uuidv4(), tag: tag.tag }]);
                        }
                      }}
                      added={!!tags.find((addedTag) => addedTag.tag == tag.tag)}
                    >
                      {tag.tag}
                    </ItemAddButton>
                  );
                })}
              </div>
            </section>
            <section>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragTagEnd}
              >
                <div className={styles['tags']}>
                  <SortableContext
                    items={tags.map((tag) => tag.uuid)}
                    strategy={verticalListSortingStrategy}
                  >
                    {tags.map((tag, index) => {
                      return (
                        <SortableEditTagItem
                          key={tag.uuid}
                          tag={tag}
                          onChange={(e) => {
                            handleChangeTag(e, index);
                          }}
                          onRemove={() => {
                            removeTag(index);
                          }}
                        />
                      );
                    })}
                  </SortableContext>
                  <div className={styles['tag-add']} onClick={addTag}>
                    <Icon className={styles['tag-add-icon']} path={mdiPlus} />
                    タグ追加
                  </div>
                </div>
              </DndContext>
            </section>
          </InputForm.General>
          <InputForm.General
            label="説明文"
            help={<>ルーム内で確認することのできるルームの説明文です。</>}
          >
            <DecorationEditor
              value={description}
              onChange={(s) => {
                setDescription(s);
              }}
              noDice
            />
          </InputForm.General>
          <InputForm.General label="その他設定">
            <LabeledToggleButton
              value={searchable}
              onToggle={(e) => setSearchable(e)}
              help={
                <>
                  オフにするとルーム検索の検索結果に出なくなります。オフにしていても検索に出ないのみで、URL等からのアクセスは可能です。
                </>
              }
            >
              ルーム検索で検索可能にする
            </LabeledToggleButton>
            <LabeledToggleButton
              value={allowRecommendation}
              onToggle={(e) => setAllowRecommendation(e)}
              help={<>オフにするとルームがおすすめ表示されなくなります。</>}
            >
              おすすめ表示を許可する
            </LabeledToggleButton>
            <LabeledToggleButton
              value={childrenReferable}
              onToggle={(e) => setChildrenReferable(e)}
              help={
                <>
                  <p>
                    メッセージ画面にて、このルームに所属するルームが相互にリスト表示されるかどうかを選べます。
                  </p>
                  <p>
                    基本的にはオンで構いません。所属ルーム間の関連性が薄い場合にのみオフにすることを推奨します。
                  </p>
                </>
              }
            >
              所属ルーム間の相互参照を行う
            </LabeledToggleButton>
          </InputForm.General>
          <InputForm.Button>作成</InputForm.Button>
        </InputForm>
      </SectionWrapper>
    </DefaultPage>
  );
};

export default SettingsProfile;
