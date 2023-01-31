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
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mdiClose, mdiDownload, mdiMinus, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import axiosBase from 'axios';
import classNames from 'classnames';
import fileSaver from 'file-saver';
import JSZip from 'jszip';
import type { NextPage } from 'next';
import Link from 'next/link';
import { MouseEventHandler, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import Button from 'components/atoms/Button/Button';
import CharacterIcon from 'components/atoms/CharacterIcon/CharacterIcon';
import FileInputButton from 'components/atoms/FileInputButton/FileInputButton';
import Loading from 'components/organisms/Loading/Loading';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import { findIndexFromUuid } from 'lib/findIndexFromUuid';
import axios from 'plugins/axios';
import styles from 'styles/pages/settings/image.module.scss';

const uploaderPath = process.env.NEXT_PUBLIC_UPLOADER_PATH!;

type CharacterIcon = {
  path: string;
};

type ImageEditItemUploaded = {
  uuid: string;
  uploaded: true;
  file?: undefined;
  path: string;
  removeFlag: boolean;
};

type ImageEditItemNonUploaded = {
  uuid: string;
  uploaded: false;
  file: File;
  path: string;
  removeFlag?: undefined;
};

type ImageEditItem = ImageEditItemUploaded | ImageEditItemNonUploaded;

type SortableEditIconItemProps = {
  icon: ImageEditItem;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

const SortableEditIconItem = (props: SortableEditIconItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.icon.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (props.icon.uploaded) {
    if (!props.icon.removeFlag) {
      return (
        <div
          ref={setNodeRef}
          style={style}
          id={props.icon.uuid}
          className={styles['image']}
        >
          <div className={styles['remove-control']} onClick={props.onClick}>
            <Icon path={mdiMinus} />
          </div>
          <div {...attributes} {...listeners}>
            <CharacterIcon url={props.icon.path} />
          </div>
        </div>
      );
    } else {
      return (
        <div
          ref={setNodeRef}
          style={style}
          id={props.icon.uuid}
          className={styles['image']}
        >
          <div className={styles['remove-control']} onClick={props.onClick}>
            <Icon path={mdiPlus} />
          </div>
          <div className={styles['remove-flaged']}>
            <div className={styles['remove-flaged-inner-icon']}>
              <Icon path={mdiMinus} color="white" />
            </div>
          </div>
          <div {...attributes} {...listeners}>
            <CharacterIcon url={props.icon.path} />
          </div>
        </div>
      );
    }
  } else {
    return (
      <div
        ref={setNodeRef}
        style={style}
        id={props.icon.uuid}
        className={styles['image']}
      >
        <div className={styles['remove-control']} onClick={props.onClick}>
          <Icon path={mdiClose} />
        </div>
        <div {...attributes} {...listeners}>
          <CharacterIcon
            className={styles['non-uploaded']}
            url={props.icon.path}
          />
        </div>
      </div>
    );
  }
};

const SettingsIcons: NextPage = () => {
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const csrfHeader = useCsrfHeader();

  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState(false);
  const [icons, setIcons] = useState<ImageEditItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<CharacterIcon[]>(
          '/characters/main/settings/icons'
        );

        setIcons(
          response.data.map((icon) => {
            return {
              uuid: uuidv4(),
              uploaded: true,
              path: icon.path,
              removeFlag: false,
            };
          })
        );

        setFetched(true);
      } catch (e) {
        console.log(e);
        setError(true);
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

  if (error || !csrfHeader) {
    return <DefaultPage>表示中にエラーが発生しました。</DefaultPage>;
  }

  if (!fetched) {
    return (
      <DefaultPage>
        <Heading>アイコン設定</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  const readerOnLoadEnd = async (file: File): Promise<FileReader> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => {
        resolve(fileReader);
      };
      fileReader.readAsDataURL(file);
    });
  };

  const handleSelectUploadIcons = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    (async () => {
      const merge: Array<ImageEditItemNonUploaded> = [];
      await Promise.all(
        Object.keys(files).map(async (key) => {
          const file: File = files[Number(key)];
          const fileReader: FileReader = await readerOnLoadEnd(file);

          if (fileReader.result != null) {
            merge.push({
              uuid: uuidv4(),
              uploaded: false,
              file: file,
              path: fileReader.result.toString(),
            });
          }
        })
      );
      setIcons([...icons, ...merge]);

      e.target.value = '';
    })();
  };

  const toggleRemoveFlagToIcon = (index: number) => {
    const newIcons = [...icons];

    if (newIcons[index].uploaded === true) {
      newIcons[index].removeFlag = !newIcons[index].removeFlag;
    }

    setIcons(newIcons);
  };

  const removeIcon = (index: number) => {
    const newIcons = [...icons];
    newIcons.splice(index, 1);
    setIcons(newIcons);
  };

  const handleDragIconEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      setIcons((icons) => {
        const oldIndex = findIndexFromUuid(String(active.id), icons);
        const newIndex = findIndexFromUuid(String(over.id), icons);

        return arrayMove(icons, oldIndex, newIndex);
      });
    }
  };

  const updateIcons = async () => {
    const currentIcons = icons;

    type UploadingImage = {
      iconsIndex: number;
      file: File;
    };

    let uploadingIcons = Array<UploadingImage>();
    for (let i = 0; i < currentIcons.length; i++) {
      const icon = currentIcons[i];
      if (!icon.uploaded) {
        uploadingIcons.push({
          iconsIndex: i,
          file: icon.file,
        });
      }
    }

    if (uploadingIcons.length) {
      const submitData = new FormData();
      for (let i = 0; i < uploadingIcons.length; i++) {
        submitData.append(`images[]`, uploadingIcons[i].file);
      }

      let paths = Array<string>();
      try {
        const { data } = await axios.post<{ paths: string[] }>(
          '/characters/main/upload?type=icon',
          submitData,
          {
            headers: {
              'content-type': 'multipart/form-data',
              ...csrfHeader,
            },
          }
        );
        paths = data.paths;
      } catch (e) {
        if (axiosBase.isAxiosError(e) && e.response) {
          const statusCode: number = e.response.status;

          switch (statusCode) {
            case 413:
              toast.error('アップロード容量が大きすぎます');
              break;
            default:
              toast.error('画像の処理中にエラーが発生しました');
          }
        }

        console.log(e);
        return;
      }

      for (let i = 0; i < uploadingIcons.length; i++) {
        currentIcons[uploadingIcons[i].iconsIndex] = {
          uuid: currentIcons[uploadingIcons[i].iconsIndex].uuid,
          uploaded: true,
          path: paths[i],
          removeFlag: false,
        };
      }
    }

    const request = {
      icons: currentIcons
        .filter((icon) => !icon.removeFlag)
        .map((icon) => {
          return {
            path: icon.path,
          };
        }),
    };

    try {
      await axios.post('/characters/main/settings/icons', request, {
        headers: csrfHeader,
      });

      setIcons(
        request.icons.map((icon) => {
          return {
            uuid: uuidv4(),
            uploaded: true,
            path: icon.path,
            removeFlag: false,
          };
        })
      );

      toast.success('アイコンを更新しました');
    } catch (e) {
      console.log(e);
      toast.error('アイコン設定の更新中にエラーが発生しました');
    }
  };

  const iconsZipDownload = async () => {
    const paths = Array.from(
      new Set(icons.filter((icon) => icon.uploaded).map((icon) => icon.path))
    );

    const zip = new JSZip();
    const iconsFolder = zip.folder('icons');
    if (!iconsFolder) {
      throw Error('zipの生成に失敗しました');
    }

    const loadBlobWithTimeout = (
      url: string,
      timeoutMilliseconds: number
    ): Promise<{
      url: string;
      blob: Blob;
    }> =>
      new Promise((resolve, reject) => {
        setTimeout(reject, timeoutMilliseconds);

        fetch(url)
          .then((response) => {
            if (response.status != 200) {
              reject();
            } else {
              response
                .blob()
                .then((blob) => {
                  resolve({ url, blob });
                })
                .catch(() => {
                  reject();
                });
            }
          })
          .catch(() => {
            reject();
          });
      });

    const loadResult = await Promise.allSettled(
      paths.map((path) => {
        return loadBlobWithTimeout(uploaderPath + path, 20000);
      })
    );

    const loadedBlobs = loadResult
      .filter((result) => result.status == 'fulfilled')
      .map((result) => {
        return (
          result as unknown as {
            value: {
              blob: Blob;
            };
          }
        ).value.blob;
      });

    if (!loadedBlobs.length) {
      throw Error();
    }

    const errorCounts = loadResult.filter(
      (result) => result.status == 'rejected'
    ).length;

    if (errorCounts) {
      toast(
        `${errorCounts}個の画像の読み込みに失敗したため成功した画像のみをDLします`
      );
    }

    for (let i = 0; i < loadedBlobs.length; i++) {
      const extention = loadedBlobs[i].type.substring('image/'.length);
      iconsFolder.file(
        `${String(i + 1).padStart(4, '0')}.${extention}`,
        loadedBlobs[i],
        {
          binary: true,
        }
      );
    }

    const content = await zip.generateAsync({ type: 'blob' });
    fileSaver.saveAs(content, 'icons.zip');
  };

  return (
    <DefaultPage>
      <PageData title="アイコン設定" />
      <Heading>アイコン設定</Heading>
      <CommentarySection>
        <p>
          アイコンは以下のリストから先頭30件を上限としてプロフィール欄に表示されます。
        </p>
        <p>
          アイコンはドラッグアンドドロップで並び替えられます。
          また、対象のアイコンを選択時に表示されるボタンを押すことでアイコンをリストから削除できます。
          すでにアップロードされたアイコンはリストから削除してもサーバーからは削除されません。
          ファイル自体の削除は
          <Link href="./uploaded-images">
            <a>こちら</a>
          </Link>
          より行えます。
        </p>
        <p>一度にアップロードできるのは合計で約20MBまでです。</p>
      </CommentarySection>
      <section className={styles['button-wrapper']}>
        <Button
          className={styles['button']}
          onClick={async () => {
            toast.promise(iconsZipDownload(), {
              loading: 'ZIPを生成しています',
              success: 'ZIPの生成が完了しました',
              error: 'ZIPの生成中にエラーが発生しました',
            });
          }}
          icon={mdiDownload}
        >
          一括ダウンロード
        </Button>
        <FileInputButton
          className={styles['button']}
          accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif"
          multiple
          onChange={handleSelectUploadIcons}
        >
          画像選択
        </FileInputButton>
        <Button className={styles['button']} onClick={updateIcons}>
          更新
        </Button>
      </section>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragIconEnd}
      >
        <div className={classNames(styles['images-area'])}>
          <SortableContext
            items={icons.map((icon) => icon.uuid)}
            strategy={rectSortingStrategy}
          >
            {icons.map((icon: ImageEditItem, index) => {
              return (
                <SortableEditIconItem
                  key={icon.uuid}
                  icon={icon}
                  onClick={
                    icon.uploaded
                      ? () => toggleRemoveFlagToIcon(index)
                      : () => removeIcon(index)
                  }
                />
              );
            })}
          </SortableContext>
        </div>
      </DndContext>
    </DefaultPage>
  );
};

export default SettingsIcons;
