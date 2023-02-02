import Axios from 'axios';
import * as EmailValidator from 'email-validator';
import type { NextPage } from 'next';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Heading from '@/components/atoms/Heading/Heading';
import InputForm from '@/components/organisms/InputForm/InputForm';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import characterIdFromText from 'lib/characterIdFromText';
import characterIdText from 'lib/characterIdText';
import axios from 'plugins/axios';

const ResetPassword: NextPage = () => {
  const [idString, setIdString] = useState('');
  const idError = (() => {
    if (!idString) {
      return '登録番号が入力されていません';
    }
    if (isNaN(characterIdFromText(idString))) {
      return '入力されたIDの形式が不正です';
    }
  })();

  const [email, setEmail] = useState('');
  const emailError = (() => {
    if (!email) {
      return 'Eメールが入力されていません';
    }
    if (!EmailValidator.validate(email)) {
      return '入力されたEメールは有効なメールアドレスではありません';
    }
  })();

  const [submitTried, setSubmitTried] = useState(false);
  const [waitingResponse, setWaitingResponse] = useState(false);

  const error = idError || emailError;

  const submit = async () => {
    setSubmitTried(true);

    if (error) {
      return toast.error(error);
    }

    if (waitingResponse) {
      toast.error('しばらくお待ち下さい');
      return;
    }

    setWaitingResponse(true);

    try {
      await axios.post('/characters/main/reset-password', {
        id: characterIdFromText(idString),
        email: email,
      });

      toast.success('パスワード再設定URLをメールアドレスに送りました');
    } catch (e) {
      if (Axios.isAxiosError(e) && e.response && e.response.status == 403) {
        toast.error('登録番号もしくはメールアドレスに誤りがあります');
      } else {
        toast.error('パスワード再設定申請中にエラーが発生しました');
      }
    } finally {
      setWaitingResponse(false);
    }
  };

  return (
    <DefaultPage>
      <PageData title="パスワード再設定申請" />
      <section>
        <Heading>パスワード再設定申請</Heading>
        <SectionWrapper>
          <p>
            メールアドレスを登録している場合、登録しているメールアドレスにパスワード再設定URLを送付できます。
          </p>
          <InputForm
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <InputForm.Text
              label="登録番号"
              value={idString}
              error={idError}
              submitTried={submitTried}
              onChange={(e) => setIdString(e.target.value)}
              required
              help={
                <>
                  {characterIdText(0)}
                  のように表示される、キャラクター固有の番号です。
                </>
              }
            />
            <InputForm.Text
              label="Eメール"
              value={email}
              error={emailError}
              submitTried={submitTried}
              onChange={(e) => setEmail(e.target.value)}
              required
              help={<>登録したメールアドレスを指定してください。</>}
            />
            <InputForm.Button>再設定URL送付</InputForm.Button>
          </InputForm>
        </SectionWrapper>
      </section>
    </DefaultPage>
  );
};

export default ResetPassword;
