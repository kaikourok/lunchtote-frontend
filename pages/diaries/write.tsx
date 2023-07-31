import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import InlineLink from '@/components/atoms/InlineLink/InlineLink';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import Annotations from '@/components/organisms/Annotations/Annotations';
import DecorationEditor from '@/components/organisms/DecorationEditor/DecorationEditor';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import DefaultLayout from '@/layouts/DefaultLayout';
import styles from '@/styles/pages/diaries/write.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import axios from 'plugins/axios';

const titleMax = Number(process.env.NEXT_PUBLIC_DIARY_TITLE_MAX!);

type Response = {
  title: string;
  diary: string;
  selectableIcons: string[];
};

const DiariesWrite: NextPage = () => {
  const csrfHeader = useCsrfHeader();

  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const [title, setTitle] = useState('');
  const titleError = (() => {
    if (!title || !/\S/.test(title)) {
      return 'タイトルが入力されていません';
    }
    if (0 < titleMax && titleMax < title.length) {
      return `タイトルは${titleMax}文字までです`;
    }
  })();

  const [diary, setDiary] = useState('');
  const diaryError = (() => {
    if (!diary) {
      return '本文が入力されていません';
    }
  })();

  const inputError = titleError || diaryError;

  const [selectableIcons, setSelectableIcons] = useState<string[]>([]);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const [error, setError] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [submitTried, setSubmitTried] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        const response = await axios.get<Response>('/diaries/write');
        setTitle(response.data.title);
        setDiary(response.data.diary);
        setSelectableIcons(response.data.selectableIcons);
        setFetched(true);
      } catch (e) {
        console.log(e);
        setError(true);
      }
    })();
  }, [isAuthenticated]);

  if (error) {
    return (
      <DefaultPage>
        <PageData title="日記作成" />
        <Heading>日記作成</Heading>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!isAuthenticationTried || !isAuthenticated || !csrfHeader || !fetched) {
    return (
      <DefaultPage>
        <PageData title="日記作成" />
        <Heading>日記作成</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  const submit = async () => {
    if (inputError) {
      toast.error(inputError);
      return;
    }

    await toast.promise(
      axios.post(
        '/diaries/write',
        {
          title,
          diary,
        },
        {
          headers: csrfHeader,
        }
      ),
      {
        loading: '日記の投稿予約をしています',
        success: '日記の投稿予約をしました',
        error: '日記の投稿予約中にエラーが発生しました',
      }
    );
  };

  return (
    <DefaultPage>
      <PageData title="日記作成" />
      <Heading>日記作成</Heading>
      <CommentarySection>
        作成した日記は即時に公開されるのではなく、
        <InlineLink href="#">更新タイミング</InlineLink>
        で公開されます。次回更新時、日記がどのように公開されるかは
        <InlineLink href="/diaries/preview">こちら</InlineLink>
        から確認できます。
      </CommentarySection>
      <div className={styles['reset-diary-wrapper']}>
        <span
          className={styles['reset-diary']}
          onClick={() => setIsClearModalOpen(true)}
        >
          日記の内容をリセットする
        </span>
      </div>
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
            help={
              <>
                日記のタイトルです。
                {0 < titleMax && titleMax + '文字まで入力できます。'}
              </>
            }
          />
          <InputForm.General label="本文" help={<>日記の本文です。</>}>
            <DecorationEditor
              value={diary}
              onChange={(s) => {
                setDiary(s);
              }}
              noDice
            />
          </InputForm.General>
          <InputForm.Button>作成</InputForm.Button>
        </InputForm>
      </SectionWrapper>
      <ConfirmModal
        isOpen={isClearModalOpen}
        onCancel={() => {
          setIsClearModalOpen(false);
        }}
        onClose={() => {
          setIsClearModalOpen(false);
        }}
        onOk={async () => {
          await toast.promise(
            axios.post('/diaries/write/clear', null, {
              headers: csrfHeader,
            }),
            {
              loading: '日記をリセットしています',
              success: '日記をリセットしました',
              error: 'リセット中にエラーが発生しました',
            }
          );

          setTitle('');
          setDiary('');
          setIsClearModalOpen(false);
        }}
      >
        日記の内容をリセットしますか？
        <Annotations>
          <Annotations.Item>この操作は元には戻せません</Annotations.Item>
        </Annotations>
      </ConfirmModal>
    </DefaultPage>
  );
};

export default DiariesWrite;
