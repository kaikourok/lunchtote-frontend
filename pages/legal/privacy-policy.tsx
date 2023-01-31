import Heading from '@/components/atoms/Heading/Heading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/legal/terms.module.scss';

const inquiryEmail = process.env.NEXT_PUBLIC_PRIVACY_POLICY_INQUIRY_EMAIL;

const Terms = () => {
  let sectionCount = 0;

  return (
    <DefaultPage>
      <PageData title="プライバシーポリシー" />
      <section>
        <Heading>プライバシーポリシー</Heading>
        <div className={styles['terms-wrapper']}>プライバシーポリシー</div>
      </section>
      <section>
        <Heading>第{++sectionCount}条 条項名</Heading>
        <div className={styles['terms-wrapper']}>条項内容</div>
      </section>
      <section className={styles['terms-end-wrapper']}>以上</section>
    </DefaultPage>
  );
};

export default Terms;
