import type { NextPage } from 'next';
import { useState } from 'react';
import toast from 'react-hot-toast';

import Button from '@/components/atoms/Button/Button';
import Heading from '@/components/atoms/Heading/Heading';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import InputForm from '@/components/organisms/InputForm/InputForm';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAdministratorAuthenticated from 'hooks/useRequireAdministratorAuthenticated';

const ControlCharacterDistributeAP: NextPage = () => {
  const csrfHeader = useCsrfHeader();

  const { isAdministratorAuthenticated, isAuthenticationTried } =
    useAuthenticationStatus();
  useRequireAdministratorAuthenticated();

  const [character, setCharacter] =
    useState<CharacterInlineSearchResult | null>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  if (!isAuthenticationTried || !isAdministratorAuthenticated || !csrfHeader) {
    return <></>;
  }

  const submit = async () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <DefaultPage>
      <PageData title="パスワード再発行" />
      <Heading>パスワード再発行</Heading>
      <InputForm
        onSubmit={(e) => {
          e.preventDefault();
          setIsConfirmModalOpen(true);
        }}
      >
        <InputForm.CharacterSelect
          label="対象"
          id="ban-target-selector"
          placeholder="対象の登録番号もしくは名前で検索"
          character={character}
          onChange={setCharacter}
        />
        <InputForm.General label="パスワード自動生成">
          <Button
            onClick={() => {
              const passwordLength = 12;
              const candidates =
                'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/*-+.,!#$%&()~|_';

              const generated = Array.from(
                crypto.getRandomValues(new Uint32Array(passwordLength))
              )
                .map((char) => candidates[char % candidates.length])
                .join('');

              setPassword(generated);
              setConfirm(generated);
            }}
          >
            生成
          </Button>
        </InputForm.General>
        <InputForm.Text
          label="パスワード"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <InputForm.Text
          label="パスワード再入力"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
          }}
        />
        <InputForm.Button
          disabled={
            character == null || !password || !confirm || password != confirm
          }
          onDisabledClick={() => {
            if (character == null) {
              toast.error('キャラクターが指定されていません');
            }
            if (!password) {
              toast.error('パスワードが指定されていません');
            }
            if (!confirm) {
              toast.error('パスワード再入力が行われていません');
            }
            if (password != confirm) {
              toast.error('パスワードと再入力の内容が一致しません');
            }
          }}
        >
          実行
        </InputForm.Button>
      </InputForm>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onCancel={() => setIsConfirmModalOpen(false)}
        onOk={submit}
      >
        パスワードの再発光を行ないますか？
      </ConfirmModal>
    </DefaultPage>
  );
};

export default ControlCharacterDistributeAP;
