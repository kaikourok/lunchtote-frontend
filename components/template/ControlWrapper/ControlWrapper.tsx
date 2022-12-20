import { ReactNode } from 'react';

import styles from './ControlWrapper.module.scss';

type ControlWrapperProps = {
  className?: string;
  children: ReactNode;
};

const ControlWrapper = (props: ControlWrapperProps) => {
  return (
    <section className={styles['control-wrapper']}>{props.children}</section>
  );
};

export default ControlWrapper;
