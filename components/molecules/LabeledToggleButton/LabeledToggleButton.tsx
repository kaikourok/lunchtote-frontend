import { ReactNode } from 'react';

import styles from './LabeledToggleButton.module.scss';

import ToggleButton from '@/components/atoms/ToggleButton/ToggleButton';
import Help from '@/components/molecules/Help/Help';

type LabeledToggleButtonProps = {
  value?: boolean;
  onToggle?: (value: boolean) => void;
  help?: ReactNode;
  children: ReactNode;
};

const LabeledToggleButton = (props: LabeledToggleButtonProps) => {
  return (
    <div className={styles['wrapper']}>
      <label className={styles['label']}>
        <div className={styles['togglebutton-wrapper']}>
          <ToggleButton
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
      {props.help && (
        <Help mini heading="ヘルプ">
          {props.help}
        </Help>
      )}
    </div>
  );
};

export default LabeledToggleButton;
