import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import classNames from 'classnames';
import { ReactNode, useState } from 'react';

import styles from './CommentarySection.module.scss';

type CommentarySectionProps = {
  className?: string;
  children: ReactNode;
  noMargin?: boolean;
  closeable?: boolean;
};

const CommentarySection = (props: CommentarySectionProps) => {
  const [isClosed, setIsClosed] = useState(false);

  return (
    <section
      className={classNames(
        styles['commentary-section'],
        props.className,
        {
          [styles['no-margin']]: !!props.noMargin,
        },
        {
          [styles['closeable']]: !!props.closeable,
        },
        {
          [styles['closed']]: isClosed,
        }
      )}
    >
      {props.closeable && (
        <div
          className={styles['close-icon-wrapper']}
          onClick={() => setIsClosed(true)}
        >
          <Icon path={mdiClose} className={styles['close-icon']} />
        </div>
      )}
      <div className={styles['content']}>{props.children}</div>
    </section>
  );
};

export default CommentarySection;
