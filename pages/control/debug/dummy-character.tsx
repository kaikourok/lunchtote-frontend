import { NextPage } from 'next';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Heading from '@/components/atoms/Heading/Heading';
import DecorationEditor from '@/components/organisms/DecorationEditor/DecorationEditor';
import InputForm from '@/components/organisms/InputForm/InputForm';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAdministratorAuthenticated from 'hooks/useRequireAdministratorAuthenticated';
import hashPassword from 'lib/hashPassword';
import axios from 'plugins/axios';

const nameMax = Number(process.env.NEXT_PUBLIC_CHARACTER_NAME_MAX!);
const nicknameMax = Number(process.env.NEXT_PUBLIC_CHARACTER_NICKNAME_MAX!);
const summaryMax = Number(process.env.NEXT_PUBLIC_CHARACTER_SUMMARY_MAX!);
const passwordMin = Number(process.env.NEXT_PUBLIC_PASSWORD_MIN!);

const ControlDummyCharacter: NextPage = () => {
  const csrfHeader = useCsrfHeader();

  const { isAdministratorAuthenticated, isAuthenticationTried } =
    useAuthenticationStatus();
  useRequireAdministratorAuthenticated();

  const [number, setNumber] = useState(1);
  const [name, setName] = useState('ダミーキャラ');
  const [nickname, setNickname] = useState('ダミー');
  const [password, setPassword] = useState('password');
  const [summary, setSummary] = useState(
    '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。'
  );
  const [profile, setProfile] = useState(
    '吾輩は猫である。名前はまだ無い。どこで生れたかとんと見当がつかぬ。何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。'
  );

  const [submitTried, setSubmitTried] = useState(false);

  if (!isAuthenticationTried || !isAdministratorAuthenticated || !csrfHeader) {
    return <></>;
  }

  const nameError = (() => {
    if (!name || !/\S/.test(name)) {
      return '名前は入力必須です';
    }
    if (0 < nameMax && nameMax < name.length) {
      return `名前は${nameMax}文字までです`;
    }
  })();

  const nicknameError = (() => {
    if (!nickname || !/\S/.test(nickname)) {
      return '短縮名が入力されていません';
    }
    if (0 < nicknameMax && nicknameMax < nickname.length) {
      return `短縮名は${nicknameMax}文字までです`;
    }
  })();

  const summaryError = (() => {
    if (0 < summaryMax && summaryMax < summary.length) {
      return `サマリーは${summaryMax}文字までです`;
    }
  })();

  const passwordError = (() => {
    if (!password) {
      return 'パスワードが入力されていません';
    }
    if (password.length < passwordMin) {
      return 'パスワードは最低8文字入力する必要があります';
    }
  })();

  const error = nameError || nicknameError || summaryError || passwordError;

  const submit = async () => {
    setSubmitTried(true);

    if (error) {
      return toast.error(error);
    }

    try {
      await toast.promise(
        axios.post(
          '/control/debug/dummy-character',
          {
            number,
            name,
            nickname,
            password: hashPassword(password),
            summary,
            profile,
          },
          {
            headers: csrfHeader,
          }
        ),
        {
          error: 'ダミーキャラの作成時にエラーが発生しました',
          loading: 'ダミーキャラを作成しています',
          success: 'ダミーキャラを作成しました',
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <DefaultPage>
      <PageData title="ダミーキャラ作成" />
      <Heading>ダミーキャラ作成</Heading>
      <SectionWrapper>
        <InputForm
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <InputForm.Number
            label="作成数"
            value={number}
            min={1}
            max={10000}
            submitTried={submitTried}
            onChange={(number) => setNumber(number)}
            showRequiredInformation
            required
            short
            help={<>作成するダミーキャラの数です。</>}
          />
          <InputForm.Text
            label="名前"
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
              </>
            }
          />
          <InputForm.Text
            label="パスワード"
            value={password}
            error={passwordError}
            submitTried={submitTried}
            onChange={(e) => setPassword(e.target.value)}
            showRequiredInformation
            required
            help={<>パスワードは最低{passwordMin}文字必要です。</>}
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
              </>
            }
          />
          <InputForm.Text
            label="サマリー"
            max={summaryMax}
            value={summary}
            error={summaryError}
            submitTried={submitTried}
            onChange={(e) => setSummary(e.target.value)}
            help={
              <>
                キャラクターリストなどに表示されるキャラクターの概要です。
                {0 < summaryMax && summaryMax + '文字まで入力できます。'}
              </>
            }
          />
          <InputForm.General
            label="プロフィール"
            help={
              <>
                キャラクターやプレイヤーの属性などを表すタグです。複数設定できます。追加する場合はタグ追加を押してください。
              </>
            }
          >
            <DecorationEditor
              value={profile}
              onChange={(s) => {
                setProfile(s);
              }}
              noDice
            />
          </InputForm.General>
          <InputForm.Button>作成</InputForm.Button>
        </InputForm>
      </SectionWrapper>
    </DefaultPage>
  );
};

export default ControlDummyCharacter;
