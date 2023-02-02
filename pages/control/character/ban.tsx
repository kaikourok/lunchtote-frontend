import type { NextPage } from 'next';
import { useState } from 'react';
import toast from 'react-hot-toast';

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
  const [reason, setReason] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  if (!isAuthenticationTried || !isAdministratorAuthenticated || !csrfHeader) {
    return <></>;
  }

  const submit = async () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <DefaultPage>
      <PageData title="BAN" />
      <Heading>BAN</Heading>
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
        <InputForm.Text
          label="事由"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
          }}
        />
        <InputForm.Button
          disabled={character == null || !reason}
          onDisabledClick={() => {
            if (character == null) {
              toast.error('キャラクターが指定されていません');
            }
            if (!reason) {
              toast.error('事由が指定されていません');
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
        BANを行ないますか？
      </ConfirmModal>
    </DefaultPage>
  );
};

export default ControlCharacterDistributeAP;
