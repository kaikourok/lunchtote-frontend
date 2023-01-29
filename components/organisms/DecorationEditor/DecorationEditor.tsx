import {
  mdiDice2,
  mdiDiceMultiple,
  mdiFormatAnnotationMinus,
  mdiFormatAnnotationPlus,
  mdiFormatBold,
  mdiFormatItalic,
  mdiFormatStrikethrough,
  mdiFormatUnderline,
  mdiFuriganaHorizontal,
  mdiImage,
  mdiMessageOutline,
  mdiMinus,
  mdiSend,
} from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import { CSSProperties, ReactNode, useEffect, useRef, useState } from 'react';

import styles from './DecorationEditor.module.scss';

import Button from '@/components/atoms/Button/Button';
import FileInputButton from '@/components/atoms/FileInputButton/FileInputButton';
import Modal from '@/components/molecules/Modal/Modal';
import useCsrfHeader from 'hooks/useCsrfHeader';
import axios from 'plugins/axios';

type InsertImagePosition = 'CENTER' | 'LEFT' | 'RIGHT';

type ControllerButtonTooltipProps = {
  label?: string;
};

const ControllerButtonTooltip = (props: ControllerButtonTooltipProps) => {
  return props.label ? (
    <div className={styles['tooltip']}>{props.label}</div>
  ) : (
    <></>
  );
};

type ControllerButtonProps = {
  path: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  style?: CSSProperties;
  label?: string;
};

const ControllerButton = (props: ControllerButtonProps) => {
  return (
    <div className={styles['controller-button']} onClick={props.onClick}>
      <Icon
        path={props.path}
        style={props.style}
        className={styles['controller-button-icon']}
      />
      <ControllerButtonTooltip label={props.label} />
    </div>
  );
};

type InsertTagButtonProps =
  | {
      path: string;
      startTag: string;
      singleTag: true;
      style?: CSSProperties;
      onClick?: (
        s: string,
        selectionStart: number,
        selectionEnd: number
      ) => void;
      textareaRef: React.RefObject<HTMLTextAreaElement>;
      label?: string;
    }
  | {
      path: string;
      startTag: string;
      endTag: string;
      singleTag?: false;
      style?: CSSProperties;
      onClick?: (
        s: string,
        selectionStart: number,
        selectionEnd: number
      ) => void;
      textareaRef: React.RefObject<HTMLTextAreaElement>;
      label?: string;
    };

const InsertTagButton = (props: InsertTagButtonProps) => {
  return (
    <ControllerButton
      path={props.path}
      style={props.style}
      label={props.label}
      onClick={() => {
        if (props.onClick == undefined || props.textareaRef.current == null) {
          return;
        }

        const target = props.textareaRef.current;
        const currentSelectionStart = target.selectionStart;
        const currentSelectionEnd = target.selectionEnd;

        if (props.singleTag) {
          const s =
            target.value.slice(0, currentSelectionEnd) +
            props.startTag +
            target.value.slice(currentSelectionEnd);
          props.onClick(
            s,
            currentSelectionStart + props.startTag.length,
            currentSelectionEnd + props.startTag.length
          );
        } else {
          const s =
            target.value.slice(0, target.selectionStart) +
            props.startTag +
            target.value.slice(target.selectionStart, target.selectionEnd) +
            props.endTag +
            target.value.slice(target.selectionEnd);
          props.onClick(
            s,
            currentSelectionStart + props.startTag.length,
            currentSelectionEnd + props.startTag.length
          );
        }
      }}
    />
  );
};

type DecorationEditorProps = {
  value?: string;
  onChange?: (s: string) => void;
  noDice?: boolean;
  noMessage?: boolean;
  noHorizonLine?: boolean;
  selectableIcons?: string[];
  thin?: boolean;
  onSend?: React.MouseEventHandler<HTMLDivElement>;
};

const DecorationEditor = (props: DecorationEditorProps) => {
  const csrfHeader = useCsrfHeader();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const [selectionStart, setSelectionStart] = useState(-1);
  const [selectionEnd, setSelectionEnd] = useState(-1);
  const [isImageInsertModalOpen, setIsImageInsertModalOpen] = useState(false);
  const [insertImage, setInsertImage] = useState<File | null>(null);
  const [insertImagePosition, setInsertImagePosition] =
    useState<InsertImagePosition>('CENTER');

  useEffect(() => {
    if (selectionStart == -1 || selectionEnd == -1) return;
    if (!editorRef || !editorRef.current) return;

    editorRef.current.focus();
    editorRef.current.selectionStart = selectionStart;
    editorRef.current.selectionEnd = selectionEnd;
  }, [props.value, selectionStart, selectionEnd]);

  const onChange = (
    s: string,
    selectionStart: number,
    selectionEnd: number
  ) => {
    if (props.onChange) {
      props.onChange(s);
      setSelectionStart(selectionStart);
      setSelectionEnd(selectionEnd);
    }
  };

  const handleSelectInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    console.log(files);
    if (!files) {
      setInsertImage(null);
      return;
    }

    (async () => {
      const file: File = files[0];
      //const fileReader: FileReader = await readerOnLoadEnd(file);

      //if (fileReader.result != null) {
      setInsertImage(file);
      //}
    })();

    e.target.value = '';
  };

  return (
    <div className={styles['editor-wrapper']}>
      <textarea
        value={props.value}
        ref={editorRef}
        spellCheck={false}
        className={classnames(styles['editor'], {
          [styles['thin']]: props.thin,
        })}
        onChange={(e) => {
          onChange(e.target.value, -1, -1);
        }}
      />
      <div className={styles['controller-buttons']}>
        <div className={styles['controller-buttons-left']}>
          <InsertTagButton
            textareaRef={editorRef}
            startTag="[+]"
            endTag="[/+]"
            path={mdiFormatAnnotationPlus}
            onClick={onChange}
            label="字を大きく"
          />
          <InsertTagButton
            textareaRef={editorRef}
            startTag="[-]"
            endTag="[/-]"
            path={mdiFormatAnnotationMinus}
            onClick={onChange}
            label="字を小さく"
          />
          <InsertTagButton
            textareaRef={editorRef}
            startTag="[b]"
            endTag="[/b]"
            path={mdiFormatBold}
            onClick={onChange}
            label="太字"
          />
          <InsertTagButton
            textareaRef={editorRef}
            startTag="[i]"
            endTag="[/i]"
            path={mdiFormatItalic}
            onClick={onChange}
            label="斜体"
          />
          <InsertTagButton
            textareaRef={editorRef}
            startTag="[u]"
            endTag="[/u]"
            path={mdiFormatUnderline}
            onClick={onChange}
            label="下線"
          />
          <InsertTagButton
            textareaRef={editorRef}
            startTag="[s]"
            endTag="[/s]"
            path={mdiFormatStrikethrough}
            onClick={onChange}
            label="取り消し線"
          />
          <InsertTagButton
            textareaRef={editorRef}
            startTag="[rt]"
            endTag="[/rt][rb][/rb]"
            path={mdiFuriganaHorizontal}
            onClick={onChange}
            label="ルビ"
          />
          <div className={styles['controller-separator']} />
          {!props.noDice && (
            <InsertTagButton
              textareaRef={editorRef}
              startTag="[d6]"
              singleTag
              path={mdiDice2}
              onClick={onChange}
              label="6面ダイス"
            />
          )}
          {!props.noDice && (
            <InsertTagButton
              textareaRef={editorRef}
              startTag="[d100]"
              singleTag
              path={mdiDiceMultiple}
              onClick={onChange}
              label="100面ダイス"
            />
          )}
          {!props.noHorizonLine && (
            <InsertTagButton
              textareaRef={editorRef}
              startTag="[hr]"
              singleTag
              path={mdiMinus}
              onClick={onChange}
              label="水平線"
            />
          )}
          <ControllerButton
            path={mdiImage}
            onClick={() => setIsImageInsertModalOpen(true)}
            label="画像挿入"
          />
          {!props.noMessage && (
            <ControllerButton
              path={mdiMessageOutline}
              onClick={undefined}
              label="メッセージ挿入"
            />
          )}
        </div>
        <div className={styles['controller-buttons-left']}>
          {!!props.onSend && (
            <ControllerButton
              path={mdiSend}
              onClick={props.onSend}
              label="送信"
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isImageInsertModalOpen}
        heading="画像選択"
        onClose={() => setIsImageInsertModalOpen(false)}
      >
        <div className={styles['insert-image-position']}>
          <div className={styles['insert-image-position-label']}>表示位置</div>
          <select
            className={styles['insert-image-position-select']}
            value={insertImagePosition}
            onChange={(e) =>
              setInsertImagePosition(e.target.value as InsertImagePosition)
            }
          >
            <option value="CENTER">中央寄せ</option>
            <option value="LEFT">左寄せ</option>
            <option value="RIGHT">右寄せ</option>
          </select>
        </div>
        <div className={styles['insert-image-buttons']}>
          <FileInputButton
            className={styles['insert-image-button']}
            accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif"
            onChange={handleSelectInsertImage}
          >
            画像選択
          </FileInputButton>
          <Button
            className={styles['insert-image-button']}
            disabled={insertImage == null}
            onClick={async () => {
              if (!csrfHeader) return;
              if (!editorRef.current) return;
              if (insertImage == null) return;

              const submitData = new FormData();
              submitData.append(`images[]`, insertImage);

              const response = await axios.post<{ paths: string[] }>(
                '/characters/main/upload?type=general',
                submitData,
                {
                  headers: {
                    'content-type': 'multipart/form-data',
                    ...csrfHeader,
                  },
                }
              );

              if (!response.data.paths.length) {
                return;
              }

              const imagePath = response.data.paths[0];
              let tag = '';
              switch (insertImagePosition) {
                case 'CENTER':
                  tag = '[img]' + imagePath + '[/img]';
                  break;
                case 'LEFT':
                  tag = '[img-l]' + imagePath + '[/img-l]';
                  break;
                case 'RIGHT':
                  tag = '[img-r]' + imagePath + '[/img-r]';
                  break;
              }

              const s =
                editorRef.current.value.slice(0, selectionEnd) +
                tag +
                editorRef.current.value.slice(selectionEnd);

              onChange(
                s,
                selectionStart + tag.length,
                selectionEnd + tag.length
              );

              setInsertImage(null);
              setIsImageInsertModalOpen(false);
            }}
          >
            アップロードして挿入
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DecorationEditor;
