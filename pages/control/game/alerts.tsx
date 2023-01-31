import { NextPage } from 'next';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Heading from '@/components/atoms/Heading/Heading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAdministratorAuthenticated from 'hooks/useRequireAdministratorAuthenticated';

const ControlGameAlerts: NextPage = () => {
  const { isAdministratorAuthenticated, isAuthenticationTried } =
    useAuthenticationStatus();
  useRequireAdministratorAuthenticated();

  if (!isAuthenticationTried || !isAdministratorAuthenticated) {
    return <></>;
  }

  return (
    <DefaultPage>
      <PageData title="違反疑惑ログ" />
      <Heading>違反疑惑ログ</Heading>
      <CommentarySection>
        管理上の理由により、この機能の実装は秘匿されています。
      </CommentarySection>
    </DefaultPage>
  );
};

export default ControlGameAlerts;
