
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';

import PageData from '@/components/organisms/PageData/PageData';
import styles from '@/styles/pages/index.module.scss';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';

const title = process.env.NEXT_PUBLIC_TITLE!;

const Index: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthenticationStatus();

  if (isAuthenticated) {
    router.replace('/home');
    return (
      <>
        <PageData />
      </>
    );
  }

  return (
    <main className={styles['page']}>
      <PageData />
      <div className={styles['content']}>
        <div className={styles['title']}>{title}</div>
        <div className={styles['links']}>
          <Link href="./signup">
            <a className={styles['link']}>登録</a>
          </Link>
          <Link href="./signin">
            <a className={styles['link']}>ログイン</a>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Index;
