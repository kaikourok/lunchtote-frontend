import type { NextPage } from 'next';
import { useState } from 'react';
import toast from 'react-hot-toast';

import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SubmenuPage from '@/components/template/SubmenuPage/SubmenuPage';
import mailsSubmenu from 'constants/submenu/mails';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import axios from 'plugins/axios';


const MailsCompose: NextPage = () => {
  const csrfHeader = useCsrfHeader();

  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const [targetCharacter, setTargetCharacter] =
    useState<CharacterInlineSearchResult | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  if (!isAuthenticationTried || !isAuthenticated) {
    return (
      <DefaultPage>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <SubmenuPage menu={mailsSubmenu}>
      <InputForm
        onSubmit={async (e) => {
          e.preventDefault();
          if (csrfHeader == null) return;

          if (targetCharacter == null) {
            toast.error('送信先が指定されていません');
            return;
          }

          try {
            await toast.promise(
              axios.post(
                `/mails`,
                {
                  target: targetCharacter.id,
                  title,
                  message,
                },
                { headers: csrfHeader }
              ),
              {
                error: 'メールの送信中にエラーが発生しました',
                loading: `${targetCharacter.text}にメールを送信しています`,
                success: `${targetCharacter.text}にメールを送信しました`,
              }
            );

            //setTargetCharacter(null);
            //setTitle('');
            //setMessage('');
          } catch (e) {
            console.log(e);
          }
        }}
      >
        <InputForm.CharacterSelect
          id="mail-target"
          label="送信先"
          character={targetCharacter}
          onChange={(target) => {
            if (target) {
              setTargetCharacter(target);
            }
          }}
          help={
            <>
              メールの送信先キャラクターです。登録番号、名前、短縮名で検索できます。
            </>
          }
        />
        <InputForm.Text
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          help={<>メールのタイトルです。</>}
        />
        <InputForm.TextArea
          label="メッセージ"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          help={<>メールの本文です。</>}
        />
        <InputForm.Button>送信</InputForm.Button>
      </InputForm>
    </SubmenuPage>
  );
};

export default MailsCompose;
