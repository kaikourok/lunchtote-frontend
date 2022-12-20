import classNames from 'classnames';
import {
  ChangeEventHandler,
  FormEventHandler,
  MouseEventHandler,
  ReactNode,
  useState,
} from 'react';
import SelectAsync from 'react-select/async';

import styles from './InputForm.module.scss';

import Button from '@/components/atoms/Button/Button';
import Help from '@/components/molecules/Help/Help';
import useCsrfHeader from 'hooks/useCsrfHeader';
import axios from 'plugins/axios';

/*-------------------------------------------------------------------------------------------------
  InputForm
-------------------------------------------------------------------------------------------------*/

type InputFormProps = {
  children: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

const InputForm = (props: InputFormProps) => {
  return (
    <form className={styles['form']} onSubmit={props.onSubmit}>
      {props.children}
    </form>
  );
};

/*-------------------------------------------------------------------------------------------------
  FormSection (internal)
-------------------------------------------------------------------------------------------------*/

type FormSectionProps = {
  label: string;
  help?: ReactNode;
  showRequiredInformation?: boolean;
  required?: boolean;
};

const FormSection = (props: FormSectionProps & { children: ReactNode }) => {
  return (
    <section className={styles['form-section']}>
      <div className={styles['label-field']}>
        <div className={styles['labels']}>
          <span className={styles['label']}>{props.label}</span>
          {props.help && <Help heading={props.label}>{props.help}</Help>}
        </div>
        {props.showRequiredInformation && (
          <div
            className={classNames(styles['required-information'], {
              [styles['required']]: !!props.required,
              [styles['non-required']]: !props.required,
            })}
          >
            {props.required ? '必須' : '任意'}
          </div>
        )}
      </div>
      <div className={styles['input-field']}>{props.children}</div>
    </section>
  );
};

/*-------------------------------------------------------------------------------------------------
  FormInformation (internal)
-------------------------------------------------------------------------------------------------*/

type FormInformationProps = {
  displayError?: boolean;
  error?: string | null;
  displayCounter?: boolean;
  counterValue?: number;
  counterMax?: number;
  short?: boolean;
};

const FormInformation = (props: FormInformationProps) => {
  if (!props.displayError && !props.displayCounter) {
    return <></>;
  }

  return (
    <div className={styles['information']}>
      <div className={styles['error']}>{props.displayError && props.error}</div>
      <div
        className={classNames(
          styles['count'],
          {
            [styles['mobile-only']]: !!props.short,
          },
          {
            [styles['count-over']]:
              props.counterMax &&
              props.counterValue &&
              props.counterMax < props.counterValue,
          }
        )}
      >
        {props.displayCounter && `${props.counterValue}/${props.counterMax}`}
      </div>
    </div>
  );
};

/*-------------------------------------------------------------------------------------------------
  General
-------------------------------------------------------------------------------------------------*/

type GeneralProps = FormSectionProps & {
  submitTried?: boolean;
  error?: string | null;
};

const InputFormGeneral = (props: GeneralProps & { children: ReactNode }) => {
  return (
    <FormSection {...props}>
      <div className={styles['general-wrapper']}>{props.children}</div>
      <FormInformation displayError={props.submitTried} error={props.error} />
    </FormSection>
  );
};
InputForm.General = InputFormGeneral;

/*-------------------------------------------------------------------------------------------------
  Text
-------------------------------------------------------------------------------------------------*/

type InputFormTextProps = GeneralProps & {
  value: string;
  max?: number;
  short?: boolean;
  placeholder?: string;
  error?: string | null;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const InputFormText = (props: InputFormTextProps) => {
  const [isLeavedOnce, setIsLeavedOnce] = useState(false);
  const displayError = !!((props.submitTried || isLeavedOnce) && props.error);
  const displayCounter = props.max != undefined && 0 < props.max;

  return (
    <FormSection {...props}>
      <div className={styles['input-wrapper']}>
        <input
          type="text"
          className={classNames(
            styles['input-text'],
            { [styles['error']]: displayError && props.error },
            {
              [styles['short']]: !!props.short,
            }
          )}
          placeholder={props.placeholder ?? props.label}
          value={props.value}
          onChange={props.onChange}
          onBlur={() => setIsLeavedOnce(true)}
          spellCheck={false}
        />
        {displayCounter && props.short && (
          <div
            className={classNames(styles['short-count'], {
              [styles['count-over']]:
                props.max && props.max < props.value.length,
            })}
          >
            {props.value.length}/{props.max}
          </div>
        )}
      </div>
      <FormInformation
        displayError={displayError}
        displayCounter={displayCounter}
        error={props.error}
        counterValue={props.value.length}
        counterMax={props.max}
        short={props.short}
      />
    </FormSection>
  );
};
InputForm.Text = InputFormText;

/*-------------------------------------------------------------------------------------------------
  Number
-------------------------------------------------------------------------------------------------*/

type InputFormNumberProps = GeneralProps & {
  value: number;
  min?: number;
  max?: number;
  short?: boolean;
  placeholder?: string;
  error?: string | null;
  onChange: (number: number) => void;
};

const InputFormNumber = (props: InputFormNumberProps) => {
  const [isLeavedOnce, setIsLeavedOnce] = useState(false);
  const displayError = !!((props.submitTried || isLeavedOnce) && props.error);

  return (
    <FormSection {...props}>
      <div className={styles['input-wrapper']}>
        <input
          type="number"
          className={classNames(
            styles['input-text'],
            { [styles['error']]: displayError && props.error },
            {
              [styles['short']]: !!props.short,
            }
          )}
          placeholder={props.placeholder ?? props.label}
          value={props.value}
          onChange={(e) => {
            const valueInput = e.target.value;

            if (valueInput !== '' && !/^-?\d+$/.test(valueInput)) {
              return;
            }

            if (valueInput === '') {
              props.onChange(props.min || 0);
              return;
            }

            const value = Number(valueInput);
            if (props.min !== undefined && value < props.min) {
              props.onChange(props.min);
            } else if (props.max !== undefined && props.max < value) {
              props.onChange(props.max);
            } else {
              props.onChange(value);
            }
          }}
          onBlur={() => setIsLeavedOnce(true)}
          spellCheck={false}
        />
      </div>
      <FormInformation
        displayError={displayError}
        error={props.error}
        short={props.short}
      />
    </FormSection>
  );
};
InputForm.Number = InputFormNumber;

/*-------------------------------------------------------------------------------------------------
  TextConfirm
-------------------------------------------------------------------------------------------------*/

type InputFormTextConfirmProps = GeneralProps & {
  inputValue: string;
  inputPlaceholder: string;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  confirmValue: string;
  confirmPlaceholder: string;
  onConfirmChange: ChangeEventHandler<HTMLInputElement>;
};

const InputFormTextConfirm = (props: InputFormTextConfirmProps) => {
  const [isInputLeavedOnce, setIsInputLeavedOnce] = useState(false);
  const [isConfirmLeavedOnce, setIsConfirmLeavedOnce] = useState(false);

  const isLeavedOnce = isInputLeavedOnce && isConfirmLeavedOnce;
  const displayError = !!((props.submitTried || isLeavedOnce) && props.error);

  return (
    <FormSection {...props}>
      <div className={styles['input-wrapper']}>
        <input
          type="text"
          className={classNames(styles['input-text'], {
            [styles['error']]: displayError && props.error,
          })}
          placeholder={props.inputPlaceholder}
          value={props.inputValue}
          onChange={props.onInputChange}
          onBlur={() => setIsInputLeavedOnce(true)}
          spellCheck={false}
        />
      </div>
      <div className={styles['input-wrapper']}>
        <input
          type="text"
          className={classNames(styles['input-text'], {
            [styles['error']]: displayError && props.error,
          })}
          placeholder={props.confirmPlaceholder}
          value={props.confirmValue}
          onChange={props.onConfirmChange}
          onBlur={() => setIsConfirmLeavedOnce(true)}
          spellCheck={false}
        />
      </div>
      <FormInformation displayError={displayError} error={props.error} />
    </FormSection>
  );
};
InputForm.TextConfirm = InputFormTextConfirm;

/*-------------------------------------------------------------------------------------------------
  Password
-------------------------------------------------------------------------------------------------*/

type InputFormPasswordProps = GeneralProps & {
  value: string;
  short?: boolean;
  placeholder?: string;
  error?: string | null;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const InputFormPassword = (props: InputFormPasswordProps) => {
  const [isLeavedOnce, setIsLeavedOnce] = useState(false);
  const displayError = !!((props.submitTried || isLeavedOnce) && props.error);

  return (
    <FormSection {...props}>
      <div className={styles['input-wrapper']}>
        <input
          type="password"
          className={classNames(
            styles['input-text'],
            { [styles['error']]: displayError && props.error },
            {
              [styles['short']]: !!props.short,
            }
          )}
          placeholder={props.placeholder ?? props.label}
          value={props.value}
          onChange={props.onChange}
          onBlur={() => setIsLeavedOnce(true)}
          spellCheck={false}
        />
      </div>
      <FormInformation
        displayError={displayError}
        error={props.error}
        short={props.short}
      />
    </FormSection>
  );
};
InputForm.Password = InputFormPassword;

/*-------------------------------------------------------------------------------------------------
  PasswordConfirm
-------------------------------------------------------------------------------------------------*/

type InputFormPasswordConfirmProps = GeneralProps & {
  inputValue: string;
  inputPlaceholder: string;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  confirmValue: string;
  confirmPlaceholder: string;
  onConfirmChange: ChangeEventHandler<HTMLInputElement>;
};

const InputFormPasswordConfirm = (props: InputFormPasswordConfirmProps) => {
  const [isInputLeavedOnce, setIsInputLeavedOnce] = useState(false);
  const [isConfirmLeavedOnce, setIsConfirmLeavedOnce] = useState(false);

  const isLeavedOnce = isInputLeavedOnce && isConfirmLeavedOnce;
  const displayError = !!((props.submitTried || isLeavedOnce) && props.error);

  return (
    <FormSection {...props}>
      <div className={styles['input-wrapper']}>
        <input
          type="password"
          className={classNames(styles['input-text'], {
            [styles['error']]: displayError && props.error,
          })}
          placeholder={props.inputPlaceholder}
          value={props.inputValue}
          onChange={props.onInputChange}
          onBlur={() => setIsInputLeavedOnce(true)}
          spellCheck={false}
        />
      </div>
      <div className={styles['input-wrapper']}>
        <input
          type="password"
          className={classNames(styles['input-text'], {
            [styles['error']]: displayError && props.error,
          })}
          placeholder={props.confirmPlaceholder}
          value={props.confirmValue}
          onChange={props.onConfirmChange}
          onBlur={() => setIsConfirmLeavedOnce(true)}
          spellCheck={false}
        />
      </div>
      <FormInformation displayError={displayError} error={props.error} />
    </FormSection>
  );
};
InputForm.PasswordConfirm = InputFormPasswordConfirm;

/*-------------------------------------------------------------------------------------------------
  TextArea
-------------------------------------------------------------------------------------------------*/

type InputFormTextAreaProps = GeneralProps & {
  value: string;
  max?: number;
  short?: boolean;
  placeholder?: string;
  error?: string | null;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
};

const InputFormTextArea = (props: InputFormTextAreaProps) => {
  const [isLeavedOnce, setIsLeavedOnce] = useState(false);
  const displayError = !!((props.submitTried || isLeavedOnce) && props.error);
  const displayCounter = props.max != undefined && 0 < props.max;

  return (
    <FormSection {...props}>
      <div className={styles['input-wrapper']}>
        <textarea
          className={classNames(
            styles['input-textarea'],
            { [styles['error']]: displayError && props.error },
            {
              [styles['short']]: !!props.short,
            }
          )}
          placeholder={props.placeholder ?? props.label}
          value={props.value}
          onChange={props.onChange}
          onBlur={() => setIsLeavedOnce(true)}
          spellCheck={false}
        />
        {displayCounter && props.short && (
          <div
            className={classNames(styles['short-count'], {
              [styles['count-over']]:
                props.max && props.max < props.value.length,
            })}
          >
            {props.value.length}/{props.max}
          </div>
        )}
      </div>
      <FormInformation
        displayError={displayError}
        displayCounter={displayCounter}
        error={props.error}
        counterValue={props.value.length}
        counterMax={props.max}
        short={props.short}
      />
    </FormSection>
  );
};
InputForm.TextArea = InputFormTextArea;

/*-------------------------------------------------------------------------------------------------
  CharacterSelect
-------------------------------------------------------------------------------------------------*/

type SelectOption = {
  value: number;
  label: string;
};

type InputFormCharacterSelectProps = GeneralProps & {
  id: string;
  placeholder?: string;
  character: {
    id: number;
    text: string;
  } | null;
  onChange: (character: CharacterInlineSearchResult | null) => void;
};

const InputFormCharacterSelect = (props: InputFormCharacterSelectProps) => {
  const csrfHeader = useCsrfHeader();

  const [isLeavedOnce, setIsLeavedOnce] = useState(false);
  const displayError = !!((props.submitTried || isLeavedOnce) && props.error);

  const selectedCharacterValue =
    props.character == null
      ? null
      : {
          value: props.character.id,
          label: props.character.text,
        };

  const fetchCharacterInlineSearchResult = (
    inputValue: string,
    callback: (options: SelectOption[]) => any
  ) => {
    if (!csrfHeader || !inputValue) {
      callback([]);
      return;
    }

    (async () => {
      const response = await axios.post<CharacterInlineSearchResult[]>(
        '/characters/inline-search',
        {
          text: inputValue,
          excludeOwn: true,
        },
        {
          headers: csrfHeader,
        }
      );

      callback(
        response.data.map((result) => {
          return {
            value: result.id,
            label: result.text,
          };
        })
      );
    })();
  };

  return (
    <FormSection {...props}>
      <SelectAsync
        id={props.id}
        instanceId={props.id}
        placeholder={props.placeholder || '相手の登録番号もしくは名前で検索'}
        value={selectedCharacterValue}
        onChange={(e) => {
          props.onChange(
            !e
              ? null
              : {
                  id: e.value,
                  text: e.label,
                }
          );
        }}
        loadOptions={fetchCharacterInlineSearchResult}
        loadingMessage={() => '検索中…'}
        noOptionsMessage={() => '該当なし'}
      />
      <FormInformation displayError={displayError} error={props.error} />
    </FormSection>
  );
};

InputForm.CharacterSelect = InputFormCharacterSelect;

/*-------------------------------------------------------------------------------------------------
  Radio
-------------------------------------------------------------------------------------------------*/

type InputFormRadioProps<T extends number | string> = GeneralProps & {
  value: T | null;
  options: {
    label: string;
    value: T;
  }[];
  radioGroup: string;
  onChange: (value: T) => void;
};

const InputFormRadio = <T extends number | string>(
  props: InputFormRadioProps<T>
) => {
  return (
    <FormSection {...props}>
      <div className={styles['radio-container']}>
        {props.options.map((option, index) => {
          return (
            <label className={styles['radio-item']} key={index}>
              <input
                type="radio"
                className={styles['radio-button']}
                name={props.radioGroup}
                value={props.value || undefined}
                onChange={(e) => {
                  props.onChange(props.options[index].value);
                }}
                checked={props.value == props.options[index].value}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </FormSection>
  );
};

InputForm.Radio = InputFormRadio;

/*-------------------------------------------------------------------------------------------------
  Button
-------------------------------------------------------------------------------------------------*/

type InputFormButtonProps = {
  children: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onDisabledClick?: MouseEventHandler<HTMLButtonElement>;
};

const InputFormButton = (props: InputFormButtonProps) => {
  return (
    <div className={styles['button-wrapper']}>
      <Button
        type="submit"
        disabled={props.disabled}
        onClick={props.onClick}
        onDisabledClick={props.onDisabledClick}
      >
        {props.children}
      </Button>
    </div>
  );
};

InputForm.Button = InputFormButton;

export default InputForm;
