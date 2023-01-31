import Axios from 'axios';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import toast from 'react-hot-toast';

import Heading from '@/components/atoms/Heading/Heading';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import characterIdFromText from 'lib/characterIdFromText';
import characterIdText from 'lib/characterIdText';
import hashPassword from 'lib/hashPassword';
import axios from 'plugins/axios';

const passwordMin = Number(process.env.NEXT_PUBLIC_PASSWORD_MIN!);

const Wrapper = (props: { children: ReactNode }) => {
  return (
    <DefaultPage>
      <PageData title="パスワード再設定" />
      <Heading>パスワード再設定</Heading>
      <SectionWrapper>{props.children}</SectionWrapper>
    </DefaultPage>
  );
};

const ResetPasswordConfirm: NextPage = () => {
  const router = useRouter();

  const [submitTried, setSubmitTried] = useState(false);
  const [waitingResponse, setWaitingResponse] = useState(false);

  const [idString, setIdString] = useState('');
  const idError = (() => {
    if (!idString) {
      return '登録番号が入力されていません';
    }
    if (isNaN(characterIdFromText(idString))) {
      return '入力されたIDの形式が不正です';
    }
  })();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const passwordError = (() => {
    if (!password) {
      return 'パスワードが入力されていません';
    }
    if (password.length < passwordMin) {
      return 'パスワードは最低8文字入力する必要があります';
    }
    if (password != passwordConfirm) {
      return 'パスワードと再入力の内容が一致しません';
    }
  })();

  const error = idError || passwordError;

  if (!router.isReady) {
    return (
      <Wrapper>
        <Loading />
      </Wrapper>
    );
  }

  if (typeof router.query.code != 'string' || !router.query.code) {
    return (
      <Wrapper>
        <p>URLが無効です。</p>
      </Wrapper>
    );
  }

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
      await axios.post('/characters/main/reset-password-confirm', {
        id: characterIdFromText(idString),
        code: router.query.code,
        password: hashPassword(password),
      });
    } catch (e) {
      if (Axios.isAxiosError(e) && e.response && e.response.status == 403) {
        toast.error(
          'URLや登録番号に誤りがある、もしくは認証URLの期限が切れています'
        );

        // TODO
        // CONFIRM MODALによる強制遷移を実装(OKや閉じるでrouter.push('/signin'))
        toast.success('パスワードを再設定しました');
      } else {
        toast.error('パスワード再設定中にエラーが発生しました');
      }
    } finally {
      setWaitingResponse(false);
    }
  };

  return (
    <Wrapper>
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
        <InputForm.PasswordConfirm
          label="新しいパスワード"
          inputValue={password}
          inputPlaceholder="新しいパスワード (8文字以上)"
          onInputChange={(e) => setPassword(e.target.value)}
          confirmValue={passwordConfirm}
          confirmPlaceholder="パスワード再入力"
          onConfirmChange={(e) => setPasswordConfirm(e.target.value)}
          error={passwordError}
          submitTried={submitTried}
          required
        />
        <InputForm.Button>再設定</InputForm.Button>
      </InputForm>
    </Wrapper>
  );
};

export default ResetPasswordConfirm;
