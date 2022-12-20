import classNames from 'classnames';
import { ReactNode } from 'react';

import styles from './ConfirmModal.module.scss';

import Modal from '@/components/molecules/Modal/Modal';


type ModalProps = {
  isOpen: boolean;
  heading?: string;
  footer?: ReactNode;
  onClose: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onOk: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onCancel: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  okLabel?: string;
  cancelLabel?: string;
  disabled?: boolean;
  children: ReactNode;
  onDisabledOk?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const ConfirmModal = (props: ModalProps) => {
  const heading = props.heading || '確認';
  const okMessage = props.okLabel || 'OK';
  const cancelMessage = props.cancelLabel || 'キャンセル';

  return (
    <Modal
      {...props}
      heading={heading}
      footer={
        <div className={styles['confirm-mobal-buttons']}>
          <div
            className={classNames(
              styles['confirm-modal-button'],
              styles['confirm-modal-button-cancel']
            )}
            onClick={props.onCancel}
          >
            {cancelMessage}
          </div>
          <div
            className={classNames(
              styles['confirm-modal-button'],
              styles['confirm-modal-button-ok'],
              { [styles['disabled']]: !!props.disabled }
            )}
            onClick={(e) => {
              if (!!props.disabled) {
                if (props.onDisabledOk) {
                  props.onDisabledOk(e);
                }
                return;
              }

              props.onOk(e);
            }}
          >
            {okMessage}
          </div>
        </div>
      }
    />
  );
};

export default ConfirmModal;
