import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import DecorationEditor from '@/components/organisms/DecorationEditor/DecorationEditor';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import postTypeToText from 'lib/postTypeToText';
import axios from 'plugins/axios';

const ForumNew: NextPage = () => {
  const router = useRouter();
  const csrfHeader = useCsrfHeader();
  const authenticationStatus = useAuthenticationStatus();

  const { data, error: retrieveError } = useSWR<{
    forcedPostType: ForumPostType | null;
  }>(!router.isReady ? null : `/forums/${router.query.forum}/post-type`);

  const [submitTried, setSubmitTried] = useState(false);
  const [title, setTitle] = useState('');
  const [postType, setPostType] = useState<ForumPostType | null>(null);
  const [senderName, setSenderName] = useState('匿名');
  const [editPassword, setEditPassword] = useState('');
  const [editPasswordConfirm, setEditPasswordConfirm] = useState('');
  const [content, setContent] = useState('');

  if (retrieveError) {
    return (
      <DefaultPage>
        <PageData title="新規トピック" />
        <Heading>新規トピック</Heading>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!data || !authenticationStatus.isAuthenticationTried) {
    return (
      <DefaultPage>
        <PageData title="新規トピック" />
        <Heading>新規トピック</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  if (
    !authenticationStatus.isAuthenticated &&
    data.forcedPostType == 'SIGNED_IN'
  ) {
    return (
      <DefaultPage>
        <PageData title="新規トピック" />
        <Heading>新規トピック</Heading>
        <CommentarySection>
          このフォーラムにトピックを立てるにはログインする必要があります。
        </CommentarySection>
      </DefaultPage>
    );
  }

  if (
    !authenticationStatus.isAdministratorAuthenticated &&
    data.forcedPostType == 'ADMINISTRATOR'
  ) {
    return (
      <DefaultPage>
        <PageData title="新規トピック" />
        <Heading>新規トピック</Heading>
        <CommentarySection>
          このフォーラムにトピックを立てられるのは管理者のみです。
        </CommentarySection>
      </DefaultPage>
    );
  }

  const selectablePostTypes = (() => {
    let pts: ForumPostType[] = data.forcedPostType
      ? [data.forcedPostType]
      : ['ANONYMOUS', 'SIGNED_IN', 'ADMINISTRATOR'];

    if (!pts.includes('ADMINISTRATOR')) {
      pts.push('ADMINISTRATOR');
    }
    if (!authenticationStatus.isAdministratorAuthenticated) {
      pts = pts.filter((t) => t != 'ADMINISTRATOR');
    }
    if (!authenticationStatus.isAuthenticated) {
      pts = pts.filter((t) => t != 'SIGNED_IN');
    }

    return pts;
  })();

  const titleError = (() => {
    if (!title) {
      return 'タイトルは入力必須です';
    }
  })();

  const postTypeError = (() => {
    if (!postType) {
      return '投稿種別は選択必須です';
    }
  })();

  const senderNameError = (() => {
    if (postType != 'ANONYMOUS') {
      return;
    }
    if (senderName == '') {
      return '匿名投稿の場合、投稿者名は入力必須です';
    }
  })();

  const editPasswordError = (() => {
    if (postType != 'ANONYMOUS') {
      return;
    }
    if (editPassword == '') {
      return '匿名投稿の場合、編集パスワードは入力必須です';
    }
    if (editPassword != editPasswordConfirm) {
      return '編集パスワードと再入力の内容が一致しません';
    }
  })();

  const contentError = (() => {
    if (content == '') {
      return '投稿内容が入力されていません';
    }
  })();

  const error =
    titleError ||
    postTypeError ||
    senderNameError ||
    editPasswordError ||
    contentError;

  return (
    <DefaultPage>
      <PageData title="新規トピック" />
      <Heading>新規トピック</Heading>
      <InputForm
        onSubmit={async (e) => {
          e.preventDefault();
          setSubmitTried(true);

          if (error) {
            toast.error(error);
            return;
          }

          try {
            const response = await toast.promise(
              axios.post<{ id: number }>(
                `/forums/${router.query.forum}/topics`,
                {
                  title,
                  content,
                  postType,
                  name: postType != 'ANONYMOUS' ? null : senderName,
                  editPassword: postType != 'ANONYMOUS' ? null : editPassword,
                },
                { headers: csrfHeader ? { ...csrfHeader } : undefined }
              ),
              {
                loading: 'トピックを作成しています',
                success: 'トピックを作成しました',
                error: 'トピックの作成中にエラーが発生しました',
              }
            );

            router.push({
              pathname: '/forums/[forum]/[topic]',
              query: { forum: router.query.forum, topic: response.data.id },
            });
          } catch (e) {
            console.log(e);
          }
        }}
      >
        <InputForm.Text
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          showRequiredInformation
          error={titleError}
          submitTried={submitTried}
        />
        <InputForm.Radio
          label="投稿種別"
          value={postType}
          options={selectablePostTypes.map((pt) => ({
            label: postTypeToText(pt),
            value: pt,
          }))}
          radioGroup="POST_TYPE"
          onChange={(val) => setPostType(val)}
          help={
            <>
              投稿を行う際の投稿者情報の表示を選ぶことができます。ログインユーザーであればどのキャラクターのプレイヤーの投稿かが分かるよう表示され、匿名であれば日替わりで付番されるIDで表示されます。
            </>
          }
          required
          showRequiredInformation
          error={postTypeError}
          submitTried={submitTried}
        />
        {postType == 'ANONYMOUS' && (
          <>
            <InputForm.Text
              label="投稿者名"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
              showRequiredInformation
              error={senderNameError}
              submitTried={submitTried}
            />
            <InputForm.PasswordConfirm
              label="編集パスワード"
              inputValue={editPassword}
              confirmValue={editPasswordConfirm}
              inputPlaceholder="編集パスワード入力"
              confirmPlaceholder="編集パスワード再入力"
              onInputChange={(e) => setEditPassword(e.target.value)}
              onConfirmChange={(e) => setEditPasswordConfirm(e.target.value)}
              help={<>投稿を削除、編集する際に必要となるパスワードです。</>}
              required
              showRequiredInformation
              error={editPasswordError}
              submitTried={submitTried}
            />
          </>
        )}
        <InputForm.General label="投稿内容">
          <DecorationEditor
            initialValue=""
            onChange={(val) => setContent(val)}
            noDice
            noMessage
          />
        </InputForm.General>
        <InputForm.Button>投稿</InputForm.Button>
      </InputForm>
    </DefaultPage>
  );
};

export default ForumNew;
