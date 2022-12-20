import * as EmailValidator from 'email-validator';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';

import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import LabeledCheckbox from '@/components/molecules/LabeledCheckbox/LabeledCheckbox';
import ModalNotes from '@/components/molecules/ModalNotes/ModalNotes';
import InputForm from '@/components/organisms/InputForm/InputForm';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import validationUsername from 'lib/validationUsername';
import axios from 'plugins/axios';
import { signUpRequest } from 'store/actions/character';

const usernameMin = Number(process.env.NEXT_PUBLIC_USERNAME_MIN!);
const usernameMax = Number(process.env.NEXT_PUBLIC_USERNAME_MAX!);
const nameMax = Number(process.env.NEXT_PUBLIC_CHARACTER_NAME_MAX!);
const nicknameMax = Number(process.env.NEXT_PUBLIC_CHARACTER_NICKNAME_MAX!);
const passwordMin = Number(process.env.NEXT_PUBLIC_PASSWORD_MIN!);

const SignUp: NextPage = () => {
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const nameError = (() => {
    if (!name || !/\S/.test(name)) {
      return 'キャラクター名は入力必須です';
    }
    if (0 < nameMax && nameMax < name.length) {
      return `キャラクター名は${nameMax}文字までです`;
    }
    return null;
  })();

  const [nickname, setNickname] = useState('');
  const nicknameError = (() => {
    if (!nickname || !/\S/.test(nickname)) {
      return '短縮名が入力されていません';
    }
    if (0 < nicknameMax && nicknameMax < nickname.length) {
      return `短縮名は${nicknameMax}文字までです`;
    }
    return null;
  })();

  const [email, setEmail] = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const emailError = (() => {
    if (!email && !emailConfirm) {
      return null;
    }
    if (!EmailValidator.validate(email)) {
      return '入力されたEメールは有効なメールアドレスではありません';
    }
    if (email != emailConfirm) {
      return 'Eメールと再入力の内容が一致しません';
    }
    return null;
  })();

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const passwordError = (() => {
    if (!password) {
      return 'パスワードが入力されていません';
    }
    if (password.length < passwordMin) {
      return `パスワードは最低${passwordMin}文字入力する必要があります`;
    }
    if (password != passwordConfirm) {
      return 'パスワードと再入力の内容が一致しません';
    }
    return null;
  })();

  const [termsConfirm, setTermsConfirm] = useState(false);
  const termsError = (() => {
    if (!termsConfirm) {
      return '登録する場合、規約に同意する必要があります';
    }
    return null;
  })();

  const [submitTried, setSubmitTried] = useState(false);

  const error =
    usernameError ||
    nameError ||
    nicknameError ||
    emailError ||
    passwordError ||
    termsError;

  const submit = async () => {
    setSubmitTried(true);

    if (error) {
      return toast.error(error);
    }

    dispatch(
      signUpRequest({
        name: name,
        nickname: nickname,
        username: username,
        password: password,
        email: email || null,
      })
    );
  };

  const checkUsernameExists = async (username: string) => {
    const checkUsername = username;

    const response = await axios.post<{ exists: boolean }>(
      '/characters/exists',
      { username: checkUsername }
    );

    if (response.data.exists) {
      return `${checkUsername}はすでに登録されています`;
    }

    return null;
  };

  const checkUsername = async (username: string) => {
    const validationError = validationUsername(username);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    const existsError = await checkUsernameExists(username);
    if (existsError) {
      setUsernameError(existsError);
      return;
    } else {
      setUsernameError(null);
    }
  };

  useEffect(() => {
    setUsernameError(validationUsername(username) || null);
  }, []);

  return (
    <DefaultPage>
      <PageData title="キャラクター登録" />
      <SubHeading>キャラクター登録</SubHeading>
      <SectionWrapper>
        <InputForm
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <InputForm.Text
            label="ユーザーID"
            value={username}
            error={usernameError}
            submitTried={submitTried}
            onChange={(e) => {
              setUsername(e.target.value);
              checkUsername(e.target.value);
            }}
            showRequiredInformation
            required
            help={
              <>
                ログインの際などに使用できるIDです。
                {usernameMin}～{usernameMax != 0 ? usernameMax : ''}
                文字入力でき、半角英数及びアンダースコアが利用可能です。
                <ModalNotes>
                  <ModalNotes.Note>
                    この項目は後から変更可能です。
                  </ModalNotes.Note>
                  <ModalNotes.Note>
                    ユーザーIDはフォーラムなどで表示される場合があります。
                  </ModalNotes.Note>
                </ModalNotes>
              </>
            }
          />
          <InputForm.Text
            label="キャラクター名"
            max={nameMax}
            value={name}
            error={nameError}
            submitTried={submitTried}
            onChange={(e) => setName(e.target.value)}
            showRequiredInformation
            required
            help={
              <>
                プロフィールなどに表示されるキャラクターの名前です。
                {0 < nameMax && nameMax + '文字まで入力できます。'}
                <ModalNotes>
                  <ModalNotes.Note>
                    この項目は後から変更可能です。
                  </ModalNotes.Note>
                </ModalNotes>
              </>
            }
          />
          <InputForm.Text
            label="短縮名"
            max={nicknameMax}
            value={nickname}
            error={nicknameError}
            submitTried={submitTried}
            onChange={(e) => setNickname(e.target.value)}
            showRequiredInformation
            required
            short
            help={
              <>
                キャラクターリストなどに表示されるキャラクターの名前です。
                {0 < nicknameMax && nicknameMax + '文字まで入力できます。'}
                <ModalNotes>
                  <ModalNotes.Note>
                    この項目は後から変更可能です。
                  </ModalNotes.Note>
                </ModalNotes>
              </>
            }
          />
          <InputForm.PasswordConfirm
            label="パスワード"
            inputValue={password}
            inputPlaceholder="パスワード (8文字以上)"
            onInputChange={(e) => setPassword(e.target.value)}
            confirmValue={passwordConfirm}
            confirmPlaceholder="パスワード再入力"
            onConfirmChange={(e) => setPasswordConfirm(e.target.value)}
            error={passwordError}
            submitTried={submitTried}
            showRequiredInformation
            required
            help={
              <>
                パスワードは最低{passwordMin}文字必要です。
                <ModalNotes>
                  <ModalNotes.Note>
                    この項目は後から変更可能です。
                  </ModalNotes.Note>
                </ModalNotes>
              </>
            }
          />
          <InputForm.TextConfirm
            label="Eメール"
            inputValue={email}
            inputPlaceholder="Eメール"
            onInputChange={(e) => setEmail(e.target.value)}
            confirmValue={emailConfirm}
            confirmPlaceholder="Eメール再入力"
            onConfirmChange={(e) => setEmailConfirm(e.target.value)}
            error={emailError}
            submitTried={submitTried}
            showRequiredInformation
            help={
              <>
                メールアドレスです。登録するとパスワードを紛失した際にも再発行を行えます。また、ログインIDとしても使用可能です。
                <ModalNotes>
                  <ModalNotes.Note>
                    この項目は後から変更可能です。
                  </ModalNotes.Note>
                </ModalNotes>
              </>
            }
          />
          <InputForm.General
            label="規約同意"
            error={termsError}
            submitTried={submitTried}
            showRequiredInformation
            required
          >
            <LabeledCheckbox
              value={termsConfirm}
              onToggle={(value) => setTermsConfirm(value)}
            >
              <a href="/legal/terms" target="_blank">
                利用規約
              </a>
              及び
              <a href="/legal/privacy-policy" target="_blank">
                プライバシーポリシー
              </a>
              を読み同意しました
            </LabeledCheckbox>
          </InputForm.General>
          <InputForm.Button>登録</InputForm.Button>
        </InputForm>
      </SectionWrapper>
    </DefaultPage>
  );
};

export default SignUp;
