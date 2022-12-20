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
import {
  ChangeEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
} from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import Button from '@/components/atoms/Button/Button';
import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import FileInputButton from '@/components/atoms/FileInputButton/FileInputButton';
import InlineLink from '@/components/atoms/InlineLink/InlineLink';
import ItemAddButton from '@/components/atoms/ItemAddButton/ItemAddButton';
import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import Annotations from '@/components/organisms/Annotations/Annotations';
import DecorationEditor from '@/components/organisms/DecorationEditor/DecorationEditor';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import styles from '@/styles/pages/settings/profile.module.scss';
import { officialCharacterTags } from 'constants/tags/official';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import { findIndexFromUuid } from 'lib/findIndexFromUuid';
import axios from 'plugins/axios';

const nameMax = Number(process.env.NEXT_PUBLIC_CHARACTER_NAME_MAX!);
const nicknameMax = Number(process.env.NEXT_PUBLIC_CHARACTER_NICKNAME_MAX!);
const summaryMax = Number(process.env.NEXT_PUBLIC_CHARACTER_SUMMARY_MAX!);

type Tag = {
  uuid: string;
  tag: string;
};

type SortableEditTagItemProps = {
  tag: Tag;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onRemove: MouseEventHandler<HTMLDivElement>;
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

type ImageEditItemUploaded = {
  uploaded: true;
  file?: undefined;
  url: string;
};

type ImageEditItemNonUploaded = {
  uploaded: false;
  file: File;
  url: string;
};

type ImageEditItem = ImageEditItemUploaded | ImageEditItemNonUploaded;

const SettingsProfile: NextPage = () => {
  const csrfHeader = useCsrfHeader();
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [profile, setProfile] = useState('');
  const [mainicon, setMainicon] = useState<ImageEditItem | null>(null);
  const [selectableIcons, setSelectableIcons] = useState<string[]>([]);
  const [submitTried, setSubmitTried] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        type Response = {
          name: string;
          nickname: string;
          summary: string;
          profile: string;
          mainicon: string | null;
          tags: string[];
          selectableIcons: string[];
        };

        const response = await axios.get<Response>(
          '/characters/main/settings/profile'
        );
        setName(response.data.name);
        setNickname(response.data.nickname);
        setSummary(response.data.summary);
        setProfile(response.data.profile);
        setTags(
          response.data.tags.map((tag) => {
            return { uuid: uuidv4(), tag: tag };
          })
        );
        if (response.data.mainicon) {
          setMainicon({
            uploaded: true,
            url: response.data.mainicon,
          });
        }
        setSelectableIcons(response.data.selectableIcons);

        setFetched(true);
      } catch (e) {
        console.log(e);
        setFetchError(true);
      }
    })();
  }, [isAuthenticated]);

  if (!isAuthenticationTried || !isAuthenticated) {
    return (
      <DefaultPage>
        <Loading />
      </DefaultPage>
    );
  }

  if (fetchError || !csrfHeader) {
    return <DefaultPage>表示中にエラーが発生しました。</DefaultPage>;
  }

  if (!fetched) {
    return (
      <DefaultPage>
        <SubHeading>プロフィール設定</SubHeading>
        <Loading />
      </DefaultPage>
    );
  }

  const nameError = (() => {
    if (!name || !/\S/.test(name)) {
      return '名前は入力必須です';
    }
    if (0 < nameMax && nameMax < name.length) {
      return `名前は${nameMax}文字までです`;
    }
  })();

  const nicknameError = (() => {
    if (!nickname || !/\S/.test(nickname)) {
      return '短縮名が入力されていません';
    }
    if (0 < nicknameMax && nicknameMax < nickname.length) {
      return `短縮名は${nicknameMax}文字までです`;
    }
  })();

  const summaryError = (() => {
    if (0 < summaryMax && summaryMax < summary.length) {
      return `サマリーは${summaryMax}文字までです`;
    }
  })();

  const error = nameError || nicknameError || summaryError;

  const submit = async () => {
    setSubmitTried(true);

    if (error) {
      return toast.error(error);
    }

    const currentProfile = {
      name: name,
      nickname: nickname,
      summary: summary,
      profile: profile,
      mainicon: '',
      tags: tags.map((tag) => tag.tag).filter((tag) => tag.length),
    };

    let uploadedPath = '';
    if (mainicon?.uploaded === false) {
      try {
        const submitData = new FormData();
        submitData.append(`images[]`, mainicon.file);

        const { data } = await axios.post<{ paths: string[] }>(
          '/characters/main/upload?type=icon',
          submitData,
          {
            headers: Object.assign(
              {
                'content-type': 'multipart/form-data',
              },
              csrfHeader
            ),
          }
        );
        uploadedPath = data.paths[0];
        currentProfile.mainicon = uploadedPath;
      } catch {
        return toast.error(`アイコンのアップロード中にエラーが発生しました`);
      }
    } else {
      currentProfile.mainicon = mainicon ? mainicon.url : '';
    }

    await axios.post('/characters/main/settings/profile', currentProfile, {
      headers: csrfHeader,
    });

    if (uploadedPath) {
      setMainicon({
        uploaded: true,
        url: uploadedPath,
      });
    }
    setTags(
      currentProfile.tags.map((tag) => {
        return { uuid: uuidv4(), tag: tag };
      })
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

  const readerOnLoadEnd = async (file: File): Promise<FileReader> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        resolve(fileReader);
      };
      fileReader.readAsDataURL(file);
    });
  };

  const handleSelectUploadIcon = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) {
      setMainicon(null);
      return;
    }

    (async () => {
      const file: File = files[0];
      const fileReader: FileReader = await readerOnLoadEnd(file);

      if (fileReader.result != null) {
        setMainicon({
          uploaded: false,
          file: file,
          url: fileReader.result.toString(),
        });
      }
    })();

    e.target.value = '';
  };

  return (
    <DefaultPage>
      <PageData title="プロフィール設定" />
      <SubHeading>プロフィール設定</SubHeading>
      <SectionWrapper>
        <InputForm
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <InputForm.Text
            label="名前"
            max={nameMax}
            value={name}
            error={nameError}
            submitTried={submitTried}
            onChange={(e) => setName(e.target.value)}
            showRequiredInformation
            required
            help={
              <>
                プロフィールなどに表示されるキャラクターの名前です。
                {0 < nameMax && nameMax + '文字まで入力できます。'}
              </>
            }
          />
          <InputForm.Text
            label="短縮名"
            max={nicknameMax}
            value={nickname}
            error={nicknameError}
            submitTried={submitTried}
            onChange={(e) => setNickname(e.target.value)}
            showRequiredInformation
            required
            short
            help={
              <>
                キャラクターリストなどに表示されるキャラクターの名前です。
                {0 < nicknameMax && nicknameMax + '文字まで入力できます。'}
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
                キャラクターリストなどに表示されるキャラクターの概要です。
                {0 < summaryMax && summaryMax + '文字まで入力できます。'}
              </>
            }
          />
          <InputForm.General
            label="メインアイコン"
            help={<>キャラクターリストなどに表示されるアイコンです。</>}
          >
            <div className={styles['icon-controls']}>
              <CharacterIcon url={mainicon?.url} />
              <FileInputButton
                className={styles['icon-control-button']}
                accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif"
                onChange={handleSelectUploadIcon}
              >
                アイコン選択
              </FileInputButton>
              <Button
                className={styles['icon-control-button']}
                onClick={() => setMainicon(null)}
              >
                解除
              </Button>
            </div>
          </InputForm.General>
          <InputForm.General
            label="タグ"
            help={
              <>
                キャラクターやプレイヤーの属性などを表すタグです。複数設定できます。追加する場合はタグ追加を押してください。
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
                {officialCharacterTags.map((tag) => {
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
            label="プロフィール"
            help={
              <>
                キャラクターやプレイヤーの属性などを表すタグです。複数設定できます。追加する場合はタグ追加を押してください。
              </>
            }
          >
            <DecorationEditor
              value={profile}
              onChange={(s) => {
                setProfile(s);
              }}
              selectableIcons={selectableIcons}
              noDice
            />
          </InputForm.General>
          <InputForm.Button>更新</InputForm.Button>
        </InputForm>
      </SectionWrapper>
    </DefaultPage>
  );
};

export default SettingsProfile;
