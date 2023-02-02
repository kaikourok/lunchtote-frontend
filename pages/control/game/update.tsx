import { NextPage } from 'next';
import { useState } from 'react';
import toast from 'react-hot-toast';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import InputForm from '@/components/organisms/InputForm/InputForm';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAdministratorAuthenticated from 'hooks/useRequireAdministratorAuthenticated';
import axios from 'plugins/axios';

const ControlGameUpdate: NextPage = () => {
  const csrfHeader = useCsrfHeader();

  const { isAdministratorAuthenticated, isAuthenticationTried } =
    useAuthenticationStatus();
  useRequireAdministratorAuthenticated();

  const [submitTried, setSubmitTried] = useState(false);
  const [confirmer, setConfirmer] = useState('');

  const error = (() => {
    if (confirmer != 'UPDATE') {
      return '確認用入力の内容が正しくありません';
    }
  })();

  if (!isAuthenticationTried || !isAdministratorAuthenticated) {
    return <></>;
  }

  return (
    <DefaultPage>
      <PageData title="更新" />
      <Heading>更新</Heading>
      <CommentarySection>
        半角大文字でUPDATEと入力し更新ボタンを押すことで更新が実行されます。
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
              axios.post('/control/game/update', null, {
                headers: csrfHeader,
              }),
              {
                error: '更新処理中にエラーが発生しました',
                loading: `更新を行っています`,
                success: `更新が完了しました`,
              }
            );

            setSubmitTried(false);
            setConfirmer('');
          } catch (e) {
            console.log(e);
          }
        }}
      >
        <InputForm.Text
          label="確認用入力"
          value={confirmer}
          onChange={(e) => setConfirmer(e.target.value)}
          placeholder="UPDATE"
          showRequiredInformation
          required
          submitTried={submitTried}
          error={error}
        />
        <InputForm.Button>更新</InputForm.Button>
      </InputForm>
    </DefaultPage>
  );
};

export default ControlGameUpdate;
