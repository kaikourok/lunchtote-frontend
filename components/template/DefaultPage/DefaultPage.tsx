import { ReactNode } from 'react';

import styles from './DefaultPage.module.scss';

type DefaultPageProps = {
  children: ReactNode;
};

const DefaultPage = (props: DefaultPageProps) => {
  return <main className={styles['page']}>{props.children}</main>;
};

export default DefaultPage;
