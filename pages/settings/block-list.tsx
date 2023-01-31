import { NextPage } from 'next';
import useSWR from 'swr';

import Heading from '@/components/atoms/Heading/Heading';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';

const SettingsBlockList: NextPage = () => {
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const csrfHeader = useCsrfHeader();

  const { data, error } = useSWR<CharacterListItem[]>(
    '/characters/main/blocking'
  );

  if (!isAuthenticationTried || !isAuthenticated) {
    return (
      <DefaultPage>
        <Loading />
      </DefaultPage>
    );
  }

  if (error || !csrfHeader) {
    return <DefaultPage>表示中にエラーが発生しました。</DefaultPage>;
  }

  if (!data) {
    return (
      <DefaultPage>
        <Heading>ブロック一覧</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="ブロック一覧" />
      <Heading>ブロック一覧</Heading>
      <>あああ</>
    </DefaultPage>
  );
};

export default SettingsBlockList;
