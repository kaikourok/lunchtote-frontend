import { mdiHelpCircle } from '@mdi/js';
import Icon from '@mdi/react';
import classNames from 'classnames';
import { ReactNode, useState } from 'react';

import styles from './Help.module.scss';

import Modal from '@/components/molecules/Modal/Modal';

type HelpButtonProps = {
  heading?: string;
  mini?: boolean;
  children: ReactNode;
};

const HelpButton = (props: HelpButtonProps) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className={styles['help']}>
      <div
        className={classNames(styles['icon-wrapper'], {
          [styles['icon-wrapper-mini']]: !!props.mini,
        })}
        onClick={() => setIsHelpOpen(true)}
      >
        <Icon
          className={classNames(styles['icon'], {
            [styles['icon-mini']]: !!props.mini,
          })}
          path={mdiHelpCircle}
        />
      </div>
      <Modal
        heading={props.heading ?? 'ヘルプ'}
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      >
        {props.children}
      </Modal>
    </div>
  );
};

export default HelpButton;
