import { ReactNode } from 'react';

import styles from './SubHeading.module.scss';

type SubHeadingProps = {
  className?: string;
  children: ReactNode;
};

const SubHeading = (props: SubHeadingProps) => {
  return <div className={styles['sub-heading']}>{props.children}</div>;
};

export default SubHeading;
