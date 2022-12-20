import { mdiCheck, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import classNames from 'classnames';
import { ReactNode } from 'react';

import styles from './ItemAddButton.module.scss';
type ItemAddButtonProps = {
  added?: boolean;
  children: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const ItemAddButton = (props: ItemAddButtonProps) => {
  return (
    <div
      onClick={(e) => {
        if (props.onClick) {
          props.onClick(e);
        }
      }}
      className={classNames(styles['button'], {
        [styles['added']]: !!props.added,
      })}
    >
      <div className={styles['icon-wrapper']}>
        <Icon path={props.added ? mdiCheck : mdiPlus} />
      </div>
      <div className={styles['label']}>{props.children}</div>
    </div>
  );
};

export default ItemAddButton;
