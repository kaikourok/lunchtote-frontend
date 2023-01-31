import type { NextPage } from 'next';
import { useState } from 'react';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
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

  const [message, setMessage] = useState('');
  const [announceType, setAnnounceType] = useState<
    'notification' | 'notice-only'
  >('notification');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  if (!isAuthenticationTried || !isAdministratorAuthenticated || !csrfHeader) {
    return <></>;
  }

  const submit = async () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <DefaultPage>
      <PageData title="アナウンス" />
      <Heading>アナウンス</Heading>
      <InputForm
        onSubmit={(e) => {
          e.preventDefault();
          setIsConfirmModalOpen(true);
        }}
      >
        <InputForm.Radio
          label="タイプ"
          radioGroup="announce-type"
          value={announceType}
          onChange={setAnnounceType}
          options={[
            { label: 'トースト通知と通知履歴に残す', value: 'notification' },
            { label: '接続者にトースト通知のみ行う', value: 'notice-only' },
          ]}
        />
        <InputForm.Text
          label="アナウンス内容"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <InputForm.Button disabled={!message}>実行</InputForm.Button>
      </InputForm>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onCancel={() => setIsConfirmModalOpen(false)}
        onOk={submit}
      >
        アナウンスを実行しますか？
      </ConfirmModal>
    </DefaultPage>
  );
};

export default ControlCharacterDistributeAP;
