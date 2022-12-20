import classNames from 'classnames';
import { DetailedHTMLProps, InputHTMLAttributes } from 'react';

import styles from './ToggleButton.module.scss';

const ToggleButton = (
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) => {
  return (
    <input
      type="checkbox"
      className={classNames(styles['togglebox'], props.className)}
      {...props}
    />
  );
};

export default ToggleButton;
