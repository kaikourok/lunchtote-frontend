import { ReactNode } from 'react';

import styles from './LabeledCheckbox.module.scss';

import CheckBox from '@/components/atoms/CheckBox/CheckBox';

type LabeledCheckboxProps = {
  value?: boolean;
  onToggle?: (value: boolean) => void;
  children: ReactNode;
};

const LabeledCheckbox = (props: LabeledCheckboxProps) => {
  return (
    <div className={styles['wrapper']}>
      <label className={styles['label']}>
        <div className={styles['checkbox-wrapper']}>
          <CheckBox
            checked={props.value}
            onChange={() => {
              if (props.onToggle) {
                props.onToggle(!props.value);
              }
            }}
          />
        </div>

        {props.children}
      </label>
    </div>
  );
};

export default LabeledCheckbox;
