import classNames from 'classnames';
import {
  ChangeEventHandler,
  FormEventHandler,
  MouseEventHandler,
  ReactNode,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import styles from './SearchForm.module.scss';

import NumberInput from '@/components/atoms/NumberInput/NumberInput';
import SelectOption from '@/components/atoms/SelectOption/SelectOption';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import HelpButton from '@/components/molecules/Help/Help';

/*-------------------------------------------------------------------------------------------------
  SearchForm
-------------------------------------------------------------------------------------------------*/

type SearchFormProps = {
  children: ReactNode;
  onSearch: FormEventHandler<HTMLFormElement>;
};

const SearchForm = (props: SearchFormProps) => {
  return (
    <form
      className={styles['form']}
      onSubmit={(e) => {
        e.preventDefault();
        props.onSearch(e);
      }}
    >
      {props.children}
    </form>
  );
};

/*-------------------------------------------------------------------------------------------------
  SearchFormOptionGroup
-------------------------------------------------------------------------------------------------*/

type SearchFormOptionGroupProps = {
  children: ReactNode;
};

const SearchFormOptionGroup = (props: SearchFormOptionGroupProps) => {
  return <section className={styles['option-group']} {...props} />;
};

SearchForm.OptionGroup = SearchFormOptionGroup;

/*-------------------------------------------------------------------------------------------------
  SearchFormOptions
-------------------------------------------------------------------------------------------------*/

type SearchFormOptionsProps<T> = {
  options: {
    label: string;
    value: T;
  }[];
  onChange: (value: T) => void;
  value: T;
  enabled?: boolean;
};

const SearchFormOptions = <T,>(props: SearchFormOptionsProps<T>) => {
  let label: string | null = null;

  for (let i = 0; i < props.options.length; i++) {
    if (props.value === props.options[i].value) {
      label = props.options[i].label;
      break;
    }
  }

  return <SelectOption {...props} highlight={props.enabled} />;
};

SearchForm.Options = SearchFormOptions;

/*-------------------------------------------------------------------------------------------------
  SearchFormNumberRanges
-------------------------------------------------------------------------------------------------*/

type SearchFormNumberRangesProps = {
  children: ReactNode;
};

const SearchFormNumberRanges = (props: SearchFormNumberRangesProps) => {
  return <section className={styles['number-ranges']} {...props} />;
};

SearchForm.NumberRanges = SearchFormNumberRanges;

/*-------------------------------------------------------------------------------------------------
  SearchFormNumberRange
-------------------------------------------------------------------------------------------------*/

type SearchFormNumberRangeProps = {
  label: string;
  modalLabel?: string;
  valueMin: number | null;
  valueMax: number | null;
  min?: number;
  max?: number;
  onChangeMin: (value: number | null) => void;
  onChangeMax: (value: number | null) => void;
  enabled?: boolean;
};

const SearchFormNumberRange = (props: SearchFormNumberRangeProps) => {
  const [changeState, setChangeState] = useState<{
    min: number | null;
    max: number | null;
  } | null>(null);

  const hasError =
    props.valueMin !== null &&
    props.valueMax !== null &&
    props.valueMax < props.valueMin;

  let label = props.label;

  if (hasError) {
    label += ` ERR`;
  } else if (props.valueMin !== null && props.valueMax !== null) {
    if (props.valueMin === props.valueMax) {
      label += ` ${props.valueMin}`;
    } else {
      label += ` ${props.valueMin}～${props.valueMax}`;
    }
  } else if (props.valueMin !== null) {
    label += ` ${props.valueMin}～`;
  } else if (props.valueMax !== null) {
    label += ` ～${props.valueMax}`;
  }

  return (
    <div className={styles['number-range']}>
      <div
        className={classNames(
          styles['label-wrapper'],
          {
            [styles['stable']]: props.enabled === undefined,
          },
          {
            [styles['enabled']]: !!props.enabled,
          },
          {
            [styles['error']]: hasError,
          }
        )}
        onClick={() => {
          setChangeState({
            min: props.valueMin,
            max: props.valueMax,
          });
        }}
      >
        <div className={styles['label']}>{label}</div>
      </div>
      <ConfirmModal
        heading={props.label}
        isOpen={!!changeState}
        onClose={() => {
          if (!changeState) return;

          props.onChangeMax(changeState.max);
          props.onChangeMin(changeState.min);
          setChangeState(null);
        }}
        onCancel={() => {
          if (!changeState) return;

          props.onChangeMax(changeState.max);
          props.onChangeMin(changeState.min);
          setChangeState(null);
        }}
        onOk={() => {
          setChangeState(null);
        }}
        disabled={hasError}
        onDisabledOk={() => toast.error('最小値が最大値を超えています')}
      >
        <div className={styles['input-line']}>
          <div className={styles['input-label']}>最小</div>
          <NumberInput
            value={props.valueMin}
            min={props.min}
            max={props.max}
            onChange={props.onChangeMin}
          />
        </div>
        <div className={styles['input-line']}>
          <div className={styles['input-label']}>最大</div>
          <NumberInput
            value={props.valueMax}
            min={props.min}
            max={props.max}
            onChange={props.onChangeMax}
          />
        </div>
      </ConfirmModal>
    </div>
  );
};

SearchForm.NumberRange = SearchFormNumberRange;

/*-------------------------------------------------------------------------------------------------
  SearchFormTextFields
-------------------------------------------------------------------------------------------------*/

type SearchFormTextFieldsProps = {
  children: ReactNode;
};

const SearchFormTextFields = (props: SearchFormTextFieldsProps) => {
  return <section className={styles['textfields']} {...props} />;
};

SearchForm.TextFields = SearchFormTextFields;

/*-------------------------------------------------------------------------------------------------
  SearchFormTextField
-------------------------------------------------------------------------------------------------*/

type SearchFormTextFieldProps = {
  label: string;
  value: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  help?: ReactNode;
};

const SearchFormTextField = (props: SearchFormTextFieldProps) => {
  return (
    <div className={styles['textfield']}>
      <div className={styles['textfield-label-wrapper']}>
        <div className={styles['textfield-label']}>{props.label}</div>
        {!!props.help && (
          <HelpButton heading={props.label}>{props.help}</HelpButton>
        )}
      </div>
      <div className={styles['textfield-input-wrapper']}>
        <input
          className={styles['textfield-input']}
          type="text"
          value={props.value}
          onChange={props.onChange}
        />
      </div>
    </div>
  );
};

SearchForm.TextField = SearchFormTextField;

/*-------------------------------------------------------------------------------------------------
  SearchFormButtons
-------------------------------------------------------------------------------------------------*/

type SearchFormButtons = {
  children: ReactNode;
};

const SearchFormButtons = (props: SearchFormButtons) => {
  return <section className={styles['buttons']} {...props} />;
};

SearchForm.Buttons = SearchFormButtons;

/*-------------------------------------------------------------------------------------------------
  SearchFormSearchButton
-------------------------------------------------------------------------------------------------*/

type SearchFormSearchButton = {
  children?: ReactNode;
};

const SearchFormSearchButton = (props: SearchFormSearchButton) => {
  return (
    <button className={styles['button']} type="submit">
      {props.children || '検索'}
    </button>
  );
};

SearchForm.SearchButton = SearchFormSearchButton;

/*-------------------------------------------------------------------------------------------------
  SearchFormButton
-------------------------------------------------------------------------------------------------*/

type SearchFormButton = {
  children: ReactNode;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

const SearchFormButton = (props: SearchFormButton) => {
  return <button className={styles['button']} type="button" {...props} />;
};

SearchForm.Button = SearchFormButton;

export default SearchForm;
