import { ReactNode } from 'react';

import styles from './NoItemsMessage.module.scss';

const NoItemsMessage = (props: { children: ReactNode }) => {
  return <section className={styles['no-items']}>{props.children}</section>;
};

export default NoItemsMessage;
