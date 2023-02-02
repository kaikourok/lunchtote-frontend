import { ReactNode } from 'react';

import styles from './Heading.module.scss';

type HeadingProps = {
  className?: string;
  children: ReactNode;
};

const Heading = (props: HeadingProps) => {
  return <div className={styles['heading']}>{props.children}</div>;
};

export default Heading;
