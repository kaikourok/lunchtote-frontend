import type { NextPage } from 'next';
import { useState } from 'react';
import toast from 'react-hot-toast';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import InputForm from '@/components/organisms/InputForm/InputForm';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAdministratorAuthenticated from 'hooks/useRequireAdministratorAuthenticated';

const ControlCharacterDistributeAP: NextPage = () => {
  const csrfHeader = useCsrfHeader();

  const { isAdministratorAuthenticated, isAuthenticationTried } =
    useAuthenticationStatus();
  useRequireAdministratorAuthenticated();

  const [targetCharacter, setTargetCharacter] =
    useState<CharacterInlineSearchResult | null>(null);
  const [character, setCharacter] = useState<null | {}>(null);

  if (!isAuthenticationTried || !isAdministratorAuthenticated || !csrfHeader) {
    return <></>;
  }

  const retrieve = async () => {};

  return (
    <DefaultPage>
      <PageData title="情報確認" />
      <Heading>情報確認</Heading>
      <InputForm
        onSubmit={(e) => {
          e.preventDefault();
          retrieve();
        }}
      >
        <InputForm.CharacterSelect
          label="対象"
          id="info-target-selector"
          placeholder="対象の登録番号もしくは名前で検索"
          character={targetCharacter}
          onChange={setTargetCharacter}
        />
        <InputForm.Button
          disabled={targetCharacter == null}
          onDisabledClick={() => {
            toast.error('キャラクターが指定されていません');
          }}
        >
          取得
        </InputForm.Button>
      </InputForm>
      <Heading>キャラクター情報</Heading>
      {character == null && (
        <CommentarySection>
          キャラクター情報を表示するには、まず対象キャラクターを選択し取得を行ってください。
        </CommentarySection>
      )}
      {character != null && <SectionWrapper>Retrieved.</SectionWrapper>}
    </DefaultPage>
  );
};

export default ControlCharacterDistributeAP;
