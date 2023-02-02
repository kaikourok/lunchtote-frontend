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
import { mdiClose, mdiMinus, mdiPlus } from '@mdi/js';
import ProfileImage from '@mdi/react';
import axiosBase from 'axios';
import classNames from 'classnames';
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
import FileInputButton from 'components/atoms/FileInputButton/FileInputButton';
import Loading from 'components/organisms/Loading/Loading';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import { findIndexFromUuid } from 'lib/findIndexFromUuid';
import axios from 'plugins/axios';
import styles from 'styles/pages/settings/image.module.scss';

const uploaderPath = process.env.NEXT_PUBLIC_UPLOADER_PATH!;

type ProfileImagePreviewProps = {
  nonUploaded?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  path: string;
};

const ProfileImagePreview = (props: ProfileImagePreviewProps) => {
  const isDataUri = props.path.startsWith('data:');

  return (
    <div
      onClick={props.onClick}
      style={{
        height: 150,
        width: 150,
        border: '1px solid gray',
        background: `url(${(isDataUri ? '' : uploaderPath) + props.path})`,
        backgroundSize: 'cover',
        opacity: props.nonUploaded ? 0.6 : 1,
      }}
    />
  );
};

type CharacterProfileImage = {
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

type SortableEditProfileImageItemProps = {
  profileImage: ImageEditItem;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

const SortableEditProfileImageItem = (
  props: SortableEditProfileImageItemProps
) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.profileImage.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (props.profileImage.uploaded) {
    if (!props.profileImage.removeFlag) {
      return (
        <div
          ref={setNodeRef}
          style={style}
          id={props.profileImage.uuid}
          className={styles['image']}
        >
          <div className={styles['remove-control']} onClick={props.onClick}>
            <ProfileImage path={mdiMinus} />
          </div>
          <div {...attributes} {...listeners}>
            <ProfileImagePreview path={props.profileImage.path} />
          </div>
        </div>
      );
    } else {
      return (
        <div
          ref={setNodeRef}
          style={style}
          id={props.profileImage.uuid}
          className={styles['image']}
        >
          <div className={styles['remove-control']} onClick={props.onClick}>
            <ProfileImage path={mdiPlus} />
          </div>
          <div className={styles['remove-flaged']}>
            <div className={styles['remove-flaged-inner-icon']}>
              <ProfileImage path={mdiMinus} color="white" />
            </div>
          </div>
          <div {...attributes} {...listeners}>
            <ProfileImagePreview path={props.profileImage.path} />
          </div>
        </div>
      );
    }
  } else {
    return (
      <div
        ref={setNodeRef}
        style={style}
        id={props.profileImage.uuid}
        className={styles['image']}
      >
        <div className={styles['remove-control']} onClick={props.onClick}>
          <ProfileImage path={mdiClose} />
        </div>
        <div {...attributes} {...listeners}>
          <ProfileImagePreview nonUploaded path={props.profileImage.path} />
        </div>
      </div>
    );
  }
};

const SettingsProfileImages: NextPage = () => {
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const csrfHeader = useCsrfHeader();

  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState(false);
  const [profileImages, setProfileImages] = useState<ImageEditItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<CharacterProfileImage[]>(
          '/characters/main/settings/profile-images'
        );

        setProfileImages(
          response.data.map((profileImage) => {
            return {
              uuid: uuidv4(),
              uploaded: true,
              path: profileImage.path,
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
        <Heading>プロフィール画像設定</Heading>
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

  const handleSelectUploadProfileImages = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      setProfileImages([...profileImages, ...merge]);

      e.target.value = '';
    })();
  };

  const toggleRemoveFlagToProfileImage = (index: number) => {
    const newProfileImages = [...profileImages];

    if (newProfileImages[index].uploaded === true) {
      newProfileImages[index].removeFlag = !newProfileImages[index].removeFlag;
    }

    setProfileImages(newProfileImages);
  };

  const removeProfileImage = (index: number) => {
    const newProfileImages = [...profileImages];
    newProfileImages.splice(index, 1);
    setProfileImages(newProfileImages);
  };

  const handleDragProfileImageEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      setProfileImages((profileImages) => {
        const oldIndex = findIndexFromUuid(String(active.id), profileImages);
        const newIndex = findIndexFromUuid(String(over.id), profileImages);

        return arrayMove(profileImages, oldIndex, newIndex);
      });
    }
  };

  const updateProfileImages = async () => {
    const currentProfileImages = profileImages;

    type UploadingImage = {
      profileImagesIndex: number;
      file: File;
    };

    let uploadingProfileImages = Array<UploadingImage>();
    for (let i = 0; i < currentProfileImages.length; i++) {
      const profileImage = currentProfileImages[i];
      if (!profileImage.uploaded) {
        uploadingProfileImages.push({
          profileImagesIndex: i,
          file: profileImage.file,
        });
      }
    }

    if (uploadingProfileImages.length) {
      const submitData = new FormData();
      for (let i = 0; i < uploadingProfileImages.length; i++) {
        submitData.append(`images[]`, uploadingProfileImages[i].file);
      }

      let paths = Array<string>();
      try {
        const { data } = await axios.post<{ paths: string[] }>(
          '/characters/main/upload?type=profile-image',
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

      for (let i = 0; i < uploadingProfileImages.length; i++) {
        currentProfileImages[uploadingProfileImages[i].profileImagesIndex] = {
          uuid: currentProfileImages[
            uploadingProfileImages[i].profileImagesIndex
          ].uuid,
          uploaded: true,
          path: paths[i],
          removeFlag: false,
        };
      }
    }

    const request = {
      profileImages: currentProfileImages
        .filter((profileImage) => !profileImage.removeFlag)
        .map((profileImage) => {
          return {
            path: profileImage.path,
          };
        }),
    };

    try {
      await axios.post('/characters/main/settings/profile-images', request, {
        headers: csrfHeader,
      });

      setProfileImages(
        request.profileImages.map((profileImage) => {
          return {
            uuid: uuidv4(),
            uploaded: true,
            path: profileImage.path,
            removeFlag: false,
          };
        })
      );

      toast.success('プロフィール画像を更新しました');
    } catch (e) {
      console.log(e);
      toast.error('プロフィール画像設定の更新中にエラーが発生しました');
    }
  };

  return (
    <DefaultPage>
      <PageData title="プロフィール画像設定" />
      <Heading>プロフィール画像設定</Heading>
      <CommentarySection>
        <p>
          プロフィール画像はプロフィール表示時に設定されているものがランダムで表示されます。
        </p>
        <p>
          プロフィール画像はドラッグアンドドロップで並び替えられます。
          また、対象の画像を選択時に表示されるボタンを押すことでプロフィール画像をリストから削除できます。
          すでにアップロードされたプロフィール画像はリストから削除してもサーバーからは削除されません。
          ファイル自体の削除は
          <Link href="./uploaded-images">
            <a>こちら</a>
          </Link>
          より行えます。
        </p>
        <p>一度にアップロードできるのは合計で約20MBまでです。</p>
      </CommentarySection>
      <section className={styles['button-wrapper']}>
        <FileInputButton
          className={styles['button']}
          accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif"
          multiple
          onChange={handleSelectUploadProfileImages}
        >
          画像選択
        </FileInputButton>
        <Button className={styles['button']} onClick={updateProfileImages}>
          更新
        </Button>
      </section>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragProfileImageEnd}
      >
        <div className={classNames(styles['images-area'])}>
          <SortableContext
            items={profileImages.map((profileImage) => profileImage.uuid)}
            strategy={rectSortingStrategy}
          >
            {profileImages.map((profileImage: ImageEditItem, index) => {
              return (
                <SortableEditProfileImageItem
                  key={profileImage.uuid}
                  profileImage={profileImage}
                  onClick={
                    profileImage.uploaded
                      ? () => toggleRemoveFlagToProfileImage(index)
                      : () => removeProfileImage(index)
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

export default SettingsProfileImages;
