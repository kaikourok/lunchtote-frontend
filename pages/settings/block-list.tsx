import { NextPage } from 'next';
import useSWR from 'swr';

import SubHeading from '@/components/atoms/SubHeading/SubHeading';
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
        <SubHeading>ブロック一覧</SubHeading>
        <Loading />
      </DefaultPage>
    );
  }

  return (
    <DefaultPage>
      <PageData title="ブロック一覧" />
      <SubHeading>ブロック一覧</SubHeading>
      <>あああ</>
    </DefaultPage>
  );
};

export default SettingsBlockList;
