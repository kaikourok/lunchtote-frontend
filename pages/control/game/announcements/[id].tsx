import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import LabeledToggleButton from '@/components/molecules/LabeledToggleButton/LabeledToggleButton';
import AnnouncementDetail from '@/components/organisms/AnnouncementDetail/AnnouncementDetail';
import AnnouncementOverview from '@/components/organisms/AnnouncementOverview/AnnouncementOverview';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import { announcementTypes } from 'constants/announcement-type/announcement-type';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAdministratorAuthenticated from 'hooks/useRequireAdministratorAuthenticated';
import { getAnnouncementRelatedData } from 'lib/stringifyAnnouncementType';
import { stringifyDate } from 'lib/stringifyDate';
import axios from 'plugins/axios';

const ControlGameAnnouncement: NextPage = () => {
  const router = useRouter();
  const csrfHeader = useCsrfHeader();

  const { isAdministratorAuthenticated, isAuthenticationTried } =
    useAuthenticationStatus();
  useRequireAdministratorAuthenticated();

  const [submitTried, setSubmitTried] = useState(false);

  const [announcementType, setAnnouncementType] =
    useState<AnnouncementType | null>(null);
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [content, setContent] = useState('');
  const [announcedAt, setAnnouncedAt] = useState('');
  const [silentUpdate, setSilentUpdate] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!router.isReady || !isAdministratorAuthenticated) return;

    (async () => {
      try {
        type Response = {
          type: AnnouncementType;
          title: string;
          overview: string;
          content: string;
          announcedAt: string;
        };

        const response = await axios.get<Response>(
          `/control/game/announcements/${router.query.id}`
        );

        setAnnouncementType(response.data.type);
        setTitle(response.data.title);
        setOverview(response.data.overview);
        setContent(response.data.content);
        setAnnouncedAt(response.data.announcedAt);
        setFetched(true);
      } catch (e) {
        console.log(e);
        setFetchError(true);
      }
    })();
  }, [router.isReady, isAdministratorAuthenticated]);

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

  if (fetchError) {
    return (
      <DefaultPage>
        <PageData title="お知らせ編集" />
        <Heading>お知らせ編集</Heading>
        <CommentarySection>読み込み中にエラーが発生しました</CommentarySection>
      </DefaultPage>
    );
  }

  if (!isAuthenticationTried || !isAdministratorAuthenticated || !fetched) {
    return (
      <DefaultPage>
        <PageData title="お知らせ編集" />
        <Heading>お知らせ編集</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  const now = new Date();

  return (
    <DefaultPage>
      <PageData title="お知らせ編集" />
      <section>
        <Heading>お知らせ編集</Heading>
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
                  `/control/game/announcements/${router.query.id}/update`,
                  {
                    type: announcementType,
                    title,
                    overview,
                    content,
                    silentUpdate,
                  },
                  {
                    headers: csrfHeader,
                  }
                ),
                {
                  error: 'お知らせ更新中にエラーが発生しました',
                  loading: 'お知らせ更新を行っています',
                  success: 'お知らせ更新が完了しました',
                }
              );
            } catch (e) {
              console.log(e);
            }
          }}
        >
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
          <InputForm.General label="その他設定">
            <LabeledToggleButton
              value={silentUpdate}
              onToggle={(e) => setSilentUpdate(e)}
              help={
                <>
                  オンにすると更新時刻が変更されません。誤字修正など、軽微な修正に対してはオンにしたほうがよいでしょう。
                </>
              }
            >
              サイレント更新を行う
            </LabeledToggleButton>
          </InputForm.General>

          <InputForm.Button>編集</InputForm.Button>
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
        <Heading>{`[${stringifyDate(
          silentUpdate ? new Date(announcedAt) : now,
          {
            withoutDayOfWeek: true,
          }
        )}] ${title}`}</Heading>
        <AnnouncementDetail
          id={0}
          type={announcementType || 'UPDATE'}
          title={title}
          content={content}
          announcedAt={new Date(announcedAt)}
          updatedAt={silentUpdate ? new Date(announcedAt) : now}
        />
      </section>
    </DefaultPage>
  );
};

export default ControlGameAnnouncement;
