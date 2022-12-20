import classNames from 'classnames';
import { DetailedHTMLProps, InputHTMLAttributes } from 'react';

import styles from './CheckBox.module.scss';

const CheckBox = (
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) => {
  return (
    <input
      type="checkbox"
      className={classNames(styles['checkbox'], props.className)}
      {...props}
    />
  );
};

export default CheckBox;
