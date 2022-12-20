import type { NextPage } from 'next';
import { useState } from 'react';
import toast from 'react-hot-toast';

import SubHeading from '@/components/atoms/SubHeading/SubHeading';
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
  const [message, setMessage] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  if (!isAuthenticationTried || !isAdministratorAuthenticated || !csrfHeader) {
    return <></>;
  }

  const submit = async () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <DefaultPage>
      <PageData title="警告" />
      <SubHeading>警告</SubHeading>
      <InputForm
        onSubmit={(e) => {
          e.preventDefault();
          setIsConfirmModalOpen(true);
        }}
      >
        <InputForm.CharacterSelect
          label="対象"
          id="distribute-ap-target-selector"
          placeholder="対象の登録番号もしくは名前で検索"
          character={character}
          onChange={setCharacter}
        />
        <InputForm.TextArea
          label="警告メッセージ"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
        <InputForm.Button
          disabled={character == null}
          onDisabledClick={() => {
            toast.error('キャラクターが指定されていません');
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
        警告を行ないますか？
      </ConfirmModal>
    </DefaultPage>
  );
};

export default ControlCharacterDistributeAP;
