import { ReactNode } from 'react';

import styles from './Annotations.module.scss';

type AnnotationsProps = {
  children: ReactNode;
};

const Annotations = (props: AnnotationsProps) => {
  return <aside className={styles['annotations']}>{props.children}</aside>;
};

type AnnotationsItemProps = {
  children: ReactNode;
};

const AnnotationsItem = (props: AnnotationsItemProps) => {
  return (
    <section className={styles['annotation']}>
      <div className={styles['mark']}>※</div>
      <div className={styles['body']}>{props.children}</div>
    </section>
  );
};

Annotations.Item = AnnotationsItem;

export default Annotations;
