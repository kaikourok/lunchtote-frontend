import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import SubHeading from '@/components/atoms/SubHeading/SubHeading';
import InputForm from '@/components/organisms/InputForm/InputForm';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import styles from '@/styles/pages/settings/character-delete.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import axios from 'plugins/axios';

const SettingsCharacterDelete: NextPage = () => {
  const router = useRouter();
  const csrfHeader = useCsrfHeader();
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const [confirm, setConfirm] = useState('');

  if (!isAuthenticationTried || !isAuthenticated) {
    return (
      <DefaultPage>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="キャラクター削除" />
      <SubHeading>キャラクター削除</SubHeading>
      <SectionWrapper>
        <InputForm
          onSubmit={(e) => {
            e.preventDefault();

            (async () => {
              if (!csrfHeader) return;

              try {
                await axios.post('/characters/main/delete', null, {
                  headers: csrfHeader,
                });

                window.location.href = '/';
              } catch (e) {
                toast.error('キャラクターの削除処理中にエラーが発生しました');
                console.log(e);
              }
            })();
          }}
        >
          <InputForm.General label="削除確認">
            キャラクターを削除する場合、下の入力欄に半角英数で<b>DELETE</b>
            と入力してキャラクター削除ボタンを押してください。
            <div className={styles['delete-confirm-input-wrapper']}>
              <input
                type="text"
                className={styles['delete-confirm-input']}
                placeholder="DELETE"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
          </InputForm.General>
          <InputForm.Button
            disabled={confirm != 'DELETE'}
            onDisabledClick={() => {
              toast.error('削除確認の内容が不正です');
            }}
          >
            キャラクター削除
          </InputForm.Button>
        </InputForm>
      </SectionWrapper>
    </DefaultPage>
  );
};

export default SettingsCharacterDelete;
