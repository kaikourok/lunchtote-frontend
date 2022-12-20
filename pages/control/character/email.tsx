import type { NextPage } from 'next';
import { useState } from 'react';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
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

  const [targetType, setTargetType] = useState<null | 'general' | 'specific'>(
    null
  );
  const [character, setCharacter] =
    useState<CharacterInlineSearchResult | null>(null);
  const [title, setTitle] = useState('');
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
      <PageData title="電子メール送信" />
      <SubHeading>電子メール送信</SubHeading>
      <InputForm
        onSubmit={(e) => {
          e.preventDefault();
          setIsConfirmModalOpen(true);
        }}
      >
        <InputForm.Radio
          label="対象"
          value={targetType}
          options={[
            { label: '全体', value: 'general' },
            { label: '個人', value: 'specific' },
          ]}
          radioGroup="distribute-ap-targets"
          onChange={(value) => {
            setTargetType(value);
          }}
        />
        {targetType == 'specific' && (
          <InputForm.CharacterSelect
            label="対象"
            id="distribute-ap-target-selector"
            placeholder="対象の登録番号もしくは名前で検索"
            character={character}
            onChange={setCharacter}
          />
        )}
        <InputForm.Text
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <InputForm.TextArea
          label="本文"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <InputForm.Button disabled={!title || !message}>送信</InputForm.Button>
      </InputForm>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onCancel={() => setIsConfirmModalOpen(false)}
        onOk={submit}
      >
        メールを送信しますか？
      </ConfirmModal>
    </DefaultPage>
  );
};

export default ControlCharacterDistributeAP;
