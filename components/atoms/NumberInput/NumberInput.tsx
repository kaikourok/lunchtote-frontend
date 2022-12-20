import { mdiFastForward, mdiPlay } from '@mdi/js';
import Icon from '@mdi/react';
import classNames from 'classnames';
import { ReactNode } from 'react';

import styles from './NumberInput.module.scss';

type NumberControlButtonProps = {
  disabled?: boolean;
  onDispatch: () => void;
  children: ReactNode;
};

const NumberControlButton = (props: NumberControlButtonProps) => {
  return (
    <div
      className={classNames(styles['button-control'], {
        [styles['disabled']]: !!props.disabled,
      })}
      onClick={(e) => {
        e.preventDefault();
        props.onDispatch();
      }}
    >
      {props.children}
    </div>
  );
};

type NumberInputProps = {
  value: number | null;
  min?: number;
  max?: number;
  onChange: (value: number | null) => void;
  placeholder?: string;
};

const limit = (
  value: number,
  min: number | undefined,
  max: number | undefined
) => {
  if (max !== undefined && max < value) return max;
  if (min !== undefined && value < min) return min;
  return value;
};

const NumberInput: React.FC<NumberInputProps> = (props) => {
  return (
    <div className={styles['number-input']}>
      <NumberControlButton
        disabled={(props.value || 0) === props.min}
        onDispatch={() => {
          const value = props.value || 0;
          props.onChange(limit(value - 10, props.min, props.max));
        }}
      >
        <Icon path={mdiFastForward} rotate={180} />
      </NumberControlButton>

      <NumberControlButton
        disabled={(props.value || 0) === props.min}
        onDispatch={() => {
          const value = props.value || 0;
          props.onChange(limit(value - 1, props.min, props.max));
        }}
      >
        <Icon path={mdiPlay} rotate={180} />
      </NumberControlButton>

      <input
        className={styles['input']}
        type="number"
        value={props.value === null ? '' : props.value}
        min={props.min}
        max={props.max}
        onChange={(e) => {
          if (e.target.value) {
            props.onChange(limit(Number(e.target.value), props.min, props.max));
          } else {
            props.onChange(null);
          }
        }}
        placeholder={props.placeholder}
      />

      <NumberControlButton
        disabled={(props.value || 0) === props.max}
        onDispatch={() => {
          const value = props.value || 0;
          props.onChange(limit(value + 1, props.min, props.max));
        }}
      >
        <Icon path={mdiPlay} />
      </NumberControlButton>

      <NumberControlButton
        disabled={(props.value || 0) === props.max}
        onDispatch={() => {
          const value = props.value || 0;
          props.onChange(limit(value + 10, props.min, props.max));
        }}
      >
        <Icon path={mdiFastForward} />
      </NumberControlButton>
    </div>
  );
};

export default NumberInput;
