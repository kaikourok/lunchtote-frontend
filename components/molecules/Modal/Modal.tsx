import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { ReactNode } from 'react';
import ReactModal from 'react-modal';

import styles from './Modal.module.scss';

type ModalProps = {
  isOpen: boolean;
  heading?: string;
  footer?: ReactNode;
  onClose: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  children: ReactNode;
};

const Modal = (props: ModalProps) => {
  return (
    <ReactModal
      isOpen={props.isOpen}
      ariaHideApp={false}
      className={styles['wrapper']}
      overlayClassName={styles['overlay']}
    >
      <div className={styles['modal']}>
        <div className={styles['header']}>
          <div className={styles['heading']}>{props.heading}</div>
          <div className={styles['close-button']} onClick={props.onClose}>
            <Icon path={mdiClose} />
          </div>
        </div>
        <div className={styles['body-wrapper']}>
          <div className={styles['body']}>{props.children}</div>
        </div>
        {props.footer && <div className={styles['footer']}>{props.footer}</div>}
      </div>
    </ReactModal>
  );
};

const Button = () => {
  return <div>ボタン</div>;
};
Modal.Button = Button;

export default Modal;
