import * as EmailValidator from 'email-validator';
import type { NextPage } from 'next';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import InputForm from '@/components/organisms/InputForm/InputForm';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import styles from '@/styles/pages/signin.module.scss';
import characterIdFromText from 'lib/characterIdFromText';
import validationUsername from 'lib/validationUsername';
import { signInRequest } from 'store/actions/character';

const passwordMin = Number(process.env.NEXT_PUBLIC_PASSWORD_MIN!);

type OAuthButtonProps = {
  icon: string;
  link: string;
  children: ReactNode;
};

const OAuthButton = (props: OAuthButtonProps) => {
  return (
    <a className={styles['oauth-button']} href={props.link}>
      <div className={styles['oauth-button-items-wrapper']}>
        <img className={styles['oauth-icon']} src={props.icon} />
        <div className={styles['oauth-label']}>{props.children}</div>
      </div>
    </a>
  );
};

const SignIn: NextPage = () => {
  const dispatch = useDispatch();

  const [key, setKey] = useState('');
  const keyError = (() => {
    if (!key) {
      return 'ログインキーが入力されていません';
    }
    if (
      !EmailValidator.validate(key) &&
      isNaN(characterIdFromText(key)) &&
      validationUsername(key)
    ) {
      return '入力されたログインキーの形式が不正です';
    }
  })();

  const [password, setPassword] = useState('');
  const passwordError = (() => {
    if (!password) {
      return 'パスワードが入力されていません';
    }
    if (password.length < passwordMin) {
      return 'パスワードは最低8文字入力する必要があります';
    }
  })();

  const [submitTried, setSubmitTried] = useState(false);

  const error = keyError || passwordError;

  const submit = async () => {
    setSubmitTried(true);

    if (error) {
      return toast.error(error);
    }

    const sendKey = isNaN(characterIdFromText(key))
      ? key
      : String(characterIdFromText(key));

    dispatch(
      signInRequest({
        key: sendKey,
        password: password,
      })
    );
  };

  return (
    <DefaultPage>
      <PageData title="ログイン" />
      <section>
        <SubHeading>ログイン</SubHeading>
        <SectionWrapper>
          <div className={styles['reset-password-link-wrapper']}>
            <Link href="/reset-password">
              <a className={styles['reset-password-link']}>
                　メールでパスワードを再設定する
              </a>
            </Link>
          </div>
          <InputForm
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <InputForm.Text
              label="ログインキー"
              value={key}
              error={keyError}
              submitTried={submitTried}
              placeholder="登録番号もしくはメールアドレス"
              onChange={(e) => setKey(e.target.value)}
              required
              help={
                <>
                  登録番号、メールアドレス、ユーザーID、のいずれかでログインできます。
                </>
              }
            />
            <InputForm.Password
              label="パスワード"
              value={password}
              error={passwordError}
              submitTried={submitTried}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <InputForm.Button>ログイン</InputForm.Button>
          </InputForm>
        </SectionWrapper>
      </section>
      <section>
        <SubHeading>SNSログイン</SubHeading>
        <section className={styles['oauth-buttons']}>
          <OAuthButton
            icon="/images/brand-icons/twitter.svg"
            link="/api/oauth/twitter?mode=signin"
          >
            Twitterでログイン
          </OAuthButton>
          <OAuthButton
            icon="/images/brand-icons/google.svg"
            link="/api/oauth/google?mode=signin"
          >
            Googleでログイン
          </OAuthButton>
        </section>
      </section>
    </DefaultPage>
  );
};

export default SignIn;
