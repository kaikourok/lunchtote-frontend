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

  const [targetType, setTargetType] = useState<null | 'general' | 'specific'>(
    null
  );
  const [distributeAp, setDistributeAp] = useState(0);
  const [character, setCharacter] =
    useState<CharacterInlineSearchResult | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  if (!isAuthenticationTried || !isAdministratorAuthenticated || !csrfHeader) {
    return <></>;
  }

  const submit = async () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <DefaultPage>
      <PageData title="AP配布" />
      <Heading>AP配布</Heading>
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
        <InputForm.Number
          label="配布AP数"
          value={distributeAp}
          onChange={setDistributeAp}
        />
        <InputForm.Button
          disabled={
            distributeAp <= 0 || (targetType == 'specific' && character == null)
          }
          onDisabledClick={() => {
            if (distributeAp <= 0) {
              toast.error('配布AP数が指定されていません');
            }
            if (targetType == 'specific' && character == null) {
              toast.error(
                '個人対象での配布が指定されていますが、キャラクターが指定されていません'
              );
            }
          }}
        >
          配布
        </InputForm.Button>
      </InputForm>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onCancel={() => setIsConfirmModalOpen(false)}
        onOk={submit}
      >
        アイテム配布を実行しますか？
      </ConfirmModal>
    </DefaultPage>
  );
};

export default ControlCharacterDistributeAP;
