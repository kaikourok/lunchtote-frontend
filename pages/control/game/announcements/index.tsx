import { NextPage } from 'next';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Button from '@/components/atoms/Button/Button';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import InlineLink from '@/components/atoms/InlineLink/InlineLink';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import Annotations from '@/components/organisms/Annotations/Annotations';
import AnnouncementDetail from '@/components/organisms/AnnouncementDetail/AnnouncementDetail';
import AnnouncementOverview from '@/components/organisms/AnnouncementOverview/AnnouncementOverview';
import InputForm from '@/components/organisms/InputForm/InputForm';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/control/game/announcements/index.module.scss';
import { announcementTemplates } from 'constants/announcement-templates/announcement-templates';
import { announcementTypes } from 'constants/announcement-type/announcement-type';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAdministratorAuthenticated from 'hooks/useRequireAdministratorAuthenticated';
import { getAnnouncementRelatedData } from 'lib/stringifyAnnouncementType';
import { stringifyDate } from 'lib/stringifyDate';
import axios from 'plugins/axios';

const ControlGameAnnouncements: NextPage = () => {
  const csrfHeader = useCsrfHeader();

  const { isAdministratorAuthenticated, isAuthenticationTried } =
    useAuthenticationStatus();
  useRequireAdministratorAuthenticated();

  const [submitTried, setSubmitTried] = useState(false);

  const [applyTempleteIndex, setApplyTemplateIndex] = useState<number | null>(
    null
  );

  const [announcementType, setAnnouncementType] =
    useState<AnnouncementType | null>(null);
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [content, setContent] = useState('');

  const announcementTypeError = (() => {
    if (announcementType == null) {
      return 'お知らせ種別が選択されていません';
    }
  })();

  const titleError = (() => {
    if (title == '') {
      return 'タイトルが入力されていません';
    }
  })();

  const overviewError = (() => {
    if (overview == '') {
      return '概要が入力されていません';
    }
  })();

  const contentError = (() => {
    if (content == '') {
      return '内容が入力されていません';
    }
  })();

  const error =
    announcementTypeError || titleError || overviewError || contentError;

  if (!isAuthenticationTried || !isAdministratorAuthenticated) {
    return <></>;
  }

  const now = new Date();

  return (
    <DefaultPage>
      <PageData title="お知らせ" />
      <section>
        <Heading>お知らせ</Heading>
        <CommentarySection>
          新規お知らせを行います。 過去のお知らせを編集したい場合、
          <InlineLink href="/announcements">こちら</InlineLink>
          から変更したいお知らせを選択し、個別のお知らせ画面から編集を選択してください。
        </CommentarySection>
        <InputForm
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitTried(true);

            if (csrfHeader == null) {
              return;
            }
            if (error != undefined) {
              toast.error(error);
              return;
            }

            try {
              await toast.promise(
                axios.post(
                  '/control/game/announcements',
                  {
                    type: announcementType,
                    title,
                    overview,
                    content,
                  },
                  {
                    headers: csrfHeader,
                  }
                ),
                {
                  error: 'お知らせ処理中にエラーが発生しました',
                  loading: 'お知らせを行っています',
                  success: 'お知らせが完了しました',
                }
              );

              setSubmitTried(false);
              setAnnouncementType(null);
              setTitle('');
              setOverview('');
              setContent('');
            } catch (e) {
              console.log(e);
            }
          }}
        >
          <InputForm.General label="テンプレート挿入">
            <div className={styles['templates']}>
              {announcementTemplates.map((template, index) => {
                return (
                  <div
                    className={styles['template-button-wrapper']}
                    key={index}
                  >
                    <Button onClick={() => setApplyTemplateIndex(index)}>
                      {template.label}
                    </Button>
                  </div>
                );
              })}
            </div>
          </InputForm.General>
          <InputForm.Radio
            label="お知らせ種別"
            radioGroup="ANNOUNCEMENT_TYPE"
            value={announcementType}
            error={announcementTypeError}
            submitTried={submitTried}
            options={announcementTypes.map((t) => {
              const relatedData = getAnnouncementRelatedData(t);

              return {
                label: relatedData.text,
                value: t,
              };
            })}
            onChange={(value) => setAnnouncementType(value)}
            showRequiredInformation
            required
          />
          <InputForm.Text
            label="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            submitTried={submitTried}
            showRequiredInformation
            required
            help={
              <>
                個別のお知らせページで表示されるタイトルです。お知らせ一覧画面には表示されません（代わりに概要が表示されます）。
              </>
            }
            error={titleError}
          />
          <InputForm.Text
            label="概要"
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            submitTried={submitTried}
            showRequiredInformation
            required
            help={
              <>
                個別のお知らせページで表示されるタイトルです。お知らせ一覧画面には表示されません（代わりに概要が表示されます）。
              </>
            }
            error={overviewError}
          />
          <InputForm.TextArea
            label="内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            submitTried={submitTried}
            showRequiredInformation
            required
            placeholder="内容 (markdown)"
            help={
              <>
                個別のお知らせページで表示される内容です。markdown記法で記述します。
              </>
            }
            error={contentError}
          />

          <InputForm.Button>送信</InputForm.Button>
        </InputForm>
      </section>
      <section>
        <Heading>お知らせ一覧画面プレビュー</Heading>
        <AnnouncementOverview
          id={0}
          type={announcementType || 'UPDATE'}
          overview={overview}
          announcedAt={now}
          updatedAt={now}
          preview
        />
      </section>
      <section>
        <Heading>{`[${stringifyDate(now, {
          withoutDayOfWeek: true,
        })}] ${title}`}</Heading>
        <AnnouncementDetail
          id={0}
          type={announcementType || 'UPDATE'}
          title={title}
          content={content}
          announcedAt={now}
          updatedAt={now}
        />
      </section>
      <ConfirmModal
        isOpen={applyTempleteIndex != null}
        onClose={() => setApplyTemplateIndex(null)}
        onCancel={() => setApplyTemplateIndex(null)}
        onOk={() => {
          if (applyTempleteIndex == null) {
            return;
          }

          const template = announcementTemplates[applyTempleteIndex];
          setAnnouncementType(template.type);
          setTitle(template.title);
          setOverview(template.overview);
          setContent(template.content);
          setApplyTemplateIndex(null);
        }}
      >
        {applyTempleteIndex == null ? (
          <></>
        ) : (
          <>
            {announcementTemplates[applyTempleteIndex].label}
            テンプレートを適用しますか？
            <Annotations>
              <Annotations.Item>
                現在記入している内容は上書きされます。
              </Annotations.Item>
            </Annotations>
          </>
        )}
      </ConfirmModal>
    </DefaultPage>
  );
};

export default ControlGameAnnouncements;
