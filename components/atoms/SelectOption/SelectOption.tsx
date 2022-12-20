import classNames from 'classnames';

import styles from './SelectOption.module.scss';

const SelectOption = <T,>(props: {
  options: {
    label: string;
    value: T;
    isPlaceholder?: boolean;
  }[];
  onChange: (value: T) => void;
  value: T;
  highlight?: boolean;
}) => {
  let label: string | null = null;
  let isPlaceholder = true;
  let value: number | null = null;

  for (let i = 0; i < props.options.length; i++) {
    if (props.value === props.options[i].value) {
      label = props.options[i].label;
      value = i;
      isPlaceholder = !!props.options[i].isPlaceholder;
      break;
    }
  }

  return (
    <div
      className={classNames(styles['options-wrapper'], {
        [styles['highlight']]: !!props.highlight,
        [styles['placeholder']]: isPlaceholder,
      })}
    >
      <div className={styles['option-arrow-wrapper']}>
        <div className={styles['option-arrow']} />
      </div>
      <select
        className={classNames(styles['options'])}
        onChange={(e) => {
          props.onChange(props.options[Number(e.target.value)].value);
        }}
        value={value == null ? undefined : value}
      >
        {props.options.map((option, index) => {
          return (
            <option key={index} value={index} className={styles['option']}>
              {option.label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectOption;
