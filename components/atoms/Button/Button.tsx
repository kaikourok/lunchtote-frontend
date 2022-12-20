import Icon from '@mdi/react';
import classNames from 'classnames';
import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  MouseEventHandler,
} from 'react';

import styles from './Button.module.scss';

const Button = (
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    onDisabledClick?: MouseEventHandler<HTMLButtonElement>;
    icon?: string;
    highlight?: boolean;
  }
) => {
  const type = props.type || 'button';

  const onDisabledClick = props.onDisabledClick;
  const passObject = {
    ...props,
  };
  delete passObject.onDisabledClick;

  return (
    <button
      {...passObject}
      disabled={onDisabledClick ? false : props.disabled}
      onClick={(e) => {
        if (props.disabled) {
          if (onDisabledClick) {
            e.preventDefault();
            onDisabledClick(e);
          }
        } else if (props.onClick) {
          props.onClick(e);
        }
      }}
      className={classNames(
        styles['button'],
        {
          [styles['disabled']]: !!props.disabled,
        },
        {
          [styles['highlight']]: !!props.highlight,
        },
        props.className
      )}
      type={type}
    >
      {props.icon && (
        <div className={styles['icon-wrapper']}>
          <Icon path={props.icon} />
        </div>
      )}
      <div className={styles['button-text']}>{props.children}</div>
    </button>
  );
};

export default Button;
