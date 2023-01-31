import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import CheckBox from '@/components/atoms/CheckBox/CheckBox';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import Button from 'components/atoms/Button/Button';
import Loading from 'components/organisms/Loading/Loading';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import { stringifyDate } from 'lib/stringifyDate';
import axios from 'plugins/axios';
import styles from 'styles/pages/settings/uploaded-images.module.scss';

const uploaderPath = process.env.NEXT_PUBLIC_UPLOADER_PATH!;

type UploadedImage = {
  id: number;
  path: string;
  uploadedAt: Date;
  selected: boolean;
};

type UploadedImageResponse = {
  id: number;
  path: string;
  uploadedAt: string;
};

const Index: NextPage = () => {
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const csrfHeader = useCsrfHeader();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get<UploadedImageResponse[]>(
          '/characters/main/settings/uploaded-images'
        );

        setUploadedImages(
          response.data.map((image) => {
            return {
              id: image.id,
              path: image.path,
              uploadedAt: new Date(image.uploadedAt),
              selected: false,
            };
          })
        );

        setFetched(true);
      } catch (e) {
        console.log(e);
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

  if (!csrfHeader) {
    return <DefaultPage>表示中にエラーが発生しました。</DefaultPage>;
  }

  if (!fetched) {
    return (
      <DefaultPage>
        <Heading>アップロード画像管理</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  const deleteImages = async () => {
    toast.promise(
      (async () => {
        const targets = uploadedImages
          .filter((image) => image.selected)
          .map((image) => image.id);
        await axios.post<UploadedImageResponse[]>(
          '/characters/main/settings/uploaded-images/delete',
          { targets: targets },
          { headers: csrfHeader }
        );

        setUploadedImages(
          [...uploadedImages].filter((image) => !image.selected)
        );
      })(),
      {
        loading: '選択した画像を削除しています',
        success: '選択した画像を削除しました',
        error: '選択した画像の削除中にエラーが発生しました',
      }
    );
  };

  return (
    <DefaultPage>
      <PageData title="アップロード画像管理" />
      <Heading>アップロード画像管理</Heading>
      <CommentarySection>
        <p>
          削除したい画像にチェックを付け、削除ボタンを押すことでサーバーから画像を削除できます。
          画像を削除しても、その画像を利用しているアイコンやプロフィール画像等の設定は解除されませんのでご注意ください。
        </p>
      </CommentarySection>
      {!uploadedImages.length && (
        <section className={styles['noimages-message']}>
          現在、アップロードされている画像はありません。
        </section>
      )}
      {!!uploadedImages.length && (
        <>
          <div className={styles['button-wrapper']}>
            <Button
              disabled={
                !uploadedImages.filter((image) => image.selected).length
              }
              onClick={deleteImages}
            >
              削除
            </Button>
          </div>
          <section className={styles['images-list']}>
            {uploadedImages.map((image, index) => {
              return (
                <div
                  key={image.id}
                  className={styles['image-list-item']}
                  onClick={(e) => {
                    const newUploadedImages = [...uploadedImages];
                    newUploadedImages[index].selected =
                      !newUploadedImages[index].selected;
                    setUploadedImages(newUploadedImages);
                  }}
                >
                  <div className={styles['image-wrapper']}>
                    <img
                      className={styles['image']}
                      src={uploaderPath + image.path}
                    />
                  </div>
                  <div className={styles['uploaded-at']}>
                    <span className={styles['uploaded-at-label']}>
                      アップロード日時
                    </span>
                    <br />
                    {stringifyDate(image.uploadedAt)}
                  </div>
                  <div className={styles['checkbox-wrapper']}>
                    <CheckBox checked={image.selected} />
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        onClose={() => setIsConfirmModalOpen(false)}
        onOk={() => setIsConfirmModalOpen(false)}
      >
        選択した画像を削除しますか？
        <br />
        注意：削除した画像は元に戻せません！
      </ConfirmModal>
    </DefaultPage>
  );
};

export default Index;
