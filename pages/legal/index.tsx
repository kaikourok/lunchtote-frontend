import Link from 'next/link';

import Heading from '@/components/atoms/Heading/Heading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SectionWrapper from '@/components/template/SectionWrapper/SectionWrapper';
import styles from '@/styles/pages/legal/index.module.scss';

const Guideline = () => {
  return (
    <DefaultPage>
      <PageData title="法的情報" />
      <Heading>法的情報</Heading>
      <SectionWrapper>
        <div className={styles['link-wrapper']}>
          <Link href="/legal/terms">
            <a className={styles['link']}>利用規約</a>
          </Link>
          <div className={styles['link-description']}>
            利用する際のルール等を確認できます。
          </div>
        </div>
        <div className={styles['link-wrapper']}>
          <Link href="/legal/privacy-policy">
            <a className={styles['link']}>プライバシーポリシー</a>
          </Link>
          <div className={styles['link-description']}>
            個人情報がどのように取り扱われるか等を確認できます。
          </div>
        </div>
        <div className={styles['link-wrapper']}>
          <Link href="/legal/license">
            <a className={styles['link']}>ライセンス</a>
          </Link>
          <div className={styles['link-description']}>
            本サービスが利用している成果物のライセンス情報を確認できます。
          </div>
        </div>
      </SectionWrapper>
    </DefaultPage>
  );
};

export default Guideline;
