import classnames from 'classnames';
import { ReactNode } from 'react';

import styles from './SectionWrapper.module.scss';

type SectionWrapperProps = {
  className?: string;
  children: ReactNode;
};

const SectionWrapper = (props: SectionWrapperProps) => {
  return (
    <section className={classnames(props.className, styles['section-wrapper'])}>
      {props.children}
    </section>
  );
};

export default SectionWrapper;
