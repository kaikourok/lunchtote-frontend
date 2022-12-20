import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import useSWR from 'swr';

import LoadContinuationButton from '@/components/molecules/LoadContinuationButton/LoadContinuationButton';
import Loading from '@/components/organisms/Loading/Loading';
import MailList from '@/components/organisms/MailList/MailList';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SubmenuPage from '@/components/template/SubmenuPage/SubmenuPage';
import mailsSubmenu from 'constants/submenu/mails';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import axios from 'plugins/axios';
import { readAllMails } from 'store/actions/character';


type Mail = {
  id: number;
  sender: {
    id: number | null;
    name: string;
  };
  title: string;
  timestamp: string;
  message: string;
  read: boolean;
};

type Response = {
  mails: Mail[];
  isContinue: boolean;
};

const Mails: NextPage = () => {
  const csrfHeader = useCsrfHeader();
  const dispatch = useDispatch();
  const router = useRouter();

  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState(false);
  const [mails, setMails] = useState<Mail[]>([]);
  const [isContinue, setIsContinue] = useState(false);
  const [isContinuationLoading, setIsContinuationLoading] = useState(false);

  useEffect(() => {
    if (router.isReady && isAuthenticated) {
      (async () => {
        try {
          const response = await axios.get<Response>('/mails');

          setMails(response.data.mails);
          setIsContinue(response.data.isContinue);
          setFetched(true);
        } catch (e) {
          console.log(e);
          setError(true);
        }
      })();
    }
  }, [router.isReady, isAuthenticated]);

  if (!isAuthenticationTried || !isAuthenticated || !csrfHeader || !fetched) {
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
        mails={mails.map((mail) => {
          return {
            id: mail.id,
            type: 'received',
            title: mail.title,
            timestamp: new Date(mail.timestamp),
            message: mail.message,
            sender: mail.sender,
            read: mail.read,
            collected: true,
            items: [],
          };
        })}
        onRead={async (id) => {
          const newMails = [...mails];

          for (let i = 0; i < newMails.length; i++) {
            if (newMails[i].id == id) {
              newMails[i].read = true;
              break;
            }
          }

          setMails(newMails);

          try {
            const response = await axios.post<{ existsUnreadMail: boolean }>(
              `/mails/${id}/set-read`,
              null,
              {
                headers: csrfHeader,
              }
            );

            if (!response.data.existsUnreadMail) {
              dispatch(readAllMails());
            }
          } catch (e) {
            console.log(e);
          }
        }}
      />
      {isContinue && (
        <LoadContinuationButton
          message={isContinuationLoading ? 'Loading...' : undefined}
          onClick={async () => {
            if (!isContinuationLoading) {
              setIsContinuationLoading(true);

              try {
                const response = await axios.get<Response>(
                  `/mails?start=${mails[mails.length - 1].id}`
                );

                setMails([...mails, ...response.data.mails]);
                setIsContinue(response.data.isContinue);
              } catch (e) {
                toast.error('メールのロード中にエラーが発生しました');
                console.log(e);
              } finally {
                setIsContinuationLoading(false);
              }
            }
          }}
        />
      )}
    </SubmenuPage>
  );
};

export default Mails;
