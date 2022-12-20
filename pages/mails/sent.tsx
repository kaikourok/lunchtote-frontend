import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import useSWR from 'swr';

import Loading from '@/components/organisms/Loading/Loading';
import MailList from '@/components/organisms/MailList/MailList';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SubmenuPage from '@/components/template/SubmenuPage/SubmenuPage';
import mailsSubmenu from 'constants/submenu/mails';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';

type Response = {
  mails: {
    id: number;
    receiver: {
      id: number;
      name: string;
    };
    title: string;
    timestamp: string;
    message: string;
  }[];
  isContinue: boolean;
};

const MailsSent: NextPage = () => {
  const router = useRouter();

  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const { data, error, mutate } = useSWR<Response>(
    !router.isReady ? null : `/mails/sent?page=${router.query.page}`
  );

  if (!isAuthenticationTried || !isAuthenticated || !data) {
    return (
      <DefaultPage>
        <Loading />
      </DefaultPage>
    );
  }

  if (error) {
    return <DefaultPage>表示中にエラーが発生しました。</DefaultPage>;
  }

  return (
    <SubmenuPage menu={mailsSubmenu}>
      <MailList
        mails={data.mails.map((mail) => {
          return {
            id: mail.id,
            type: 'sent',
            title: mail.title,
            timestamp: new Date(mail.timestamp),
            message: mail.message,
            receiver: mail.receiver,
            items: [],
          };
        })}
      />
    </SubmenuPage>
  );
};

export default MailsSent;
