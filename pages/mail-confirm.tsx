import Axios from 'axios';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';

import Heading from '@/components/atoms/Heading/Heading';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import axios from 'plugins/axios';

const Wrapper = (props: { children: ReactNode }) => {
  return (
    <DefaultPage>
      <PageData title="メールアドレス認証" />
      <Heading>メールアドレス認証</Heading>
      <SectionWrapper>{props.children}</SectionWrapper>
    </DefaultPage>
  );
};

const MailConfirm: NextPage = () => {
  useRequireAuthenticated();

  const router = useRouter();
  const csrfHeader = useCsrfHeader();
  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();

  const [confirmStatus, setConfirmStatus] = useState(0);

  useEffect(() => {
    if (!csrfHeader) return;

    if (router.isReady && isAuthenticated) {
      (async () => {
        try {
          await axios.post(
            '/characters/main/mail-confirm',
            {
              code: router.query.code,
            },
            {
              headers: csrfHeader,
            }
          );
          setConfirmStatus(200);
        } catch (e) {
          if (Axios.isAxiosError(e) && e.response) {
            setConfirmStatus(e.response.status);
          } else {
            setConfirmStatus(500);
          }
        }
      })();
    }
  }, [router.isReady, isAuthenticated]);

  const result = (() => {
    switch (confirmStatus) {
      case 0:
        return <p>メールアドレスを認証しています。</p>;
      case 200:
        return <p>メールアドレスが正常に登録されました。</p>;
      case 400:
        return <p>URLに誤りがあります。</p>;
      case 403:
        return <p>コードに誤りがある、もしくは認証URLの期限が切れています。</p>;
      default:
        return <p>メールアドレスの認証中に不明なエラーが発生しました。</p>;
    }
  })();

  if (!router.isReady || !isAuthenticationTried || !isAuthenticated) {
    return (
      <Wrapper>
        <Loading />
      </Wrapper>
    );
  }

  return <Wrapper>{result}</Wrapper>;
};

export default MailConfirm;
