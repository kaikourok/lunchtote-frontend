import { ReactNode } from 'react';

import Heading from '@/components/atoms/Heading/Heading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/legal/license.module.scss';

type LicenseItemProps = {
  title: string;
  link?: string;
  children?: ReactNode;
};

const LicenseItem = (props: LicenseItemProps) => {
  return (
    <section>
      <Heading>{props.title}</Heading>
      <div className={styles['license-wrapper']}>
        <div className={styles['license']}>{props.children}</div>
        {
          <div className={styles['license-link-wrapper']}>
            <a
              href={props.link}
              className={styles['license-link']}
              target="_blank"
              rel="noreferrer"
            >
              {props.link}
            </a>
          </div>
        }
      </div>
    </section>
  );
};

const License = () => {
  return (
    <DefaultPage>
      <PageData title="ライセンス" />
      <LicenseItem
        title="morisawa-biz-ud-gothic"
        link="https://github.com/googlefonts/morisawa-biz-ud-mincho/blob/main/OFL.txt"
      ></LicenseItem>
      <LicenseItem
        title="noto-cjk"
        link="https://github.com/googlefonts/noto-cjk/blob/main/Sans/LICENSE"
      ></LicenseItem>
      <LicenseItem
        title="opensource-website"
        link="https://github.com/twitter/opensource-website/blob/main/LICENSE"
      ></LicenseItem>
    </DefaultPage>
  );
};

export default License;
