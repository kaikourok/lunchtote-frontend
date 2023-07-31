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
import { CSSProperties, useRef, useState } from 'react';
import {
  RichTextarea,
  createRegexRenderer,
  RichTextareaHandle,
} from 'rich-textarea';

import styles from './DecorationEditor.module.scss';

import Button from '@/components/atoms/Button/Button';
import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import FileInputButton from '@/components/atoms/FileInputButton/FileInputButton';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import Modal from '@/components/molecules/Modal/Modal';
import useCsrfHeader from 'hooks/useCsrfHeader';
import axios from 'plugins/axios';

type InsertImagePosition =
  | 'CENTER'
  | 'LEFT'
  | 'RIGHT'
  | 'CENTER-B'
  | 'LEFT-B'
  | 'RIGHT-B';

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
      textareaRef: React.RefObject<RichTextareaHandle>;
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
      textareaRef: React.RefObject<RichTextareaHandle>;
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
  value: string;
  onChange: (s: string) => void;
  noDice?: boolean;
  noMessage?: boolean;
  noHorizonLine?: boolean;
  enableBigImage?: boolean;
  selectableIcons?: string[];
  thin?: boolean;
  onSend?: () => void;
  postConfirm?: boolean;
};

const words = [
  /\[\+\]/gi,
  /\[\/\+\]/gi,
  /\[\-\]/gi,
  /\[\/\-\]/gi,
  /\[b\]/gi,
  /\[\/b\]/gi,
  /\[i\]/gi,
  /\[\/i\]/gi,
  /\[u\]/gi,
  /\[\/u\]/gi,
  /\[s\]/gi,
  /\[\/s\]/gi,
  /\[rt\]/gi,
  /\[\/rt\]/gi,
  /\[rb\]/gi,
  /\[\/rb\]/gi,
  /\[d6\]/gi,
  /\[d100\]/gi,
  /\[hr\]/gi,
  /\[img\]/gi,
  /\[\/img\]/gi,
  /\[img\-r\]/gi,
  /\[\/img\-r\]/gi,
  /\[img\-l\]/gi,
  /\[\/img\-l\]/gi,
  /\[img\-b\]/gi,
  /\[\/img\-b\]/gi,
  /\[img\-rb\]/gi,
  /\[\/img\-rb\]/gi,
  /\[img\-lb\]/gi,
  /\[\/img\-lb\]/gi,
  /\[message\]/gi,
  /\[\/message\]/gi,
  /\[name\]/gi,
  /\[\/name\]/gi,
  /\[icon\]/gi,
  /\[\/icon\]/gi,
];

const renderer = createRegexRenderer(
  words.map((word) => {
    return [word, { color: '#777881' }];
  })
);

const DecorationEditor = (props: DecorationEditorProps) => {
  const csrfHeader = useCsrfHeader();
  const editorRef = useRef<RichTextareaHandle>(null);
  const [isImageInsertModalOpen, setIsImageInsertModalOpen] = useState(false);
  const [isIconSelectModalOpen, setIsIconSelectModalOpen] = useState(false);
  const [insertImage, setInsertImage] = useState<File | null>(null);
  const [insertImagePosition, setInsertImagePosition] =
    useState<InsertImagePosition>('CENTER');
  const [isPostConfirmModalOpen, setIsPostConfirmModalOpen] = useState(false);

  const onChange = (s: string) => {
    if (props.onChange) {
      props.onChange(s);
    }
  };

  const handleSelectInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) {
      setInsertImage(null);
      return;
    }

    const file: File = files[0];
    setInsertImage(file);
    e.target.value = '';
  };

  const selectableIcons = props.selectableIcons || [];

  return (
    <div className={styles['editor-wrapper']}>
      <RichTextarea
        value={props.value}
        ref={editorRef}
        style={{
          width: '100%',
          height: 'auto',
          minHeight: props.thin ? 100 : 200,
          border: '1px solid gray',
          borderRadius: 2,
          resize: 'vertical',
          fontSize: '14px',
          wordBreak: 'break-all',
          outline: 'none',
          padding: '4px 6px',
          margin: 0,
        }}
        spellCheck={false}
        onChange={(e) => props.onChange(e.target.value)}
        //onSelectionChange={(pos, value) => setSelection({ pos, value })}
      >
        {renderer}
      </RichTextarea>
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
              onClick={() => setIsIconSelectModalOpen(true)}
              label="メッセージ挿入"
            />
          )}
        </div>
        <div className={styles['controller-buttons-right']}>
          {!!props.onSend && (
            <ControllerButton
              path={mdiSend}
              onClick={
                props.postConfirm
                  ? () => setIsPostConfirmModalOpen(true)
                  : props.onSend
              }
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
            {props.enableBigImage && (
              <>
                <option value="CENTER-B">中央寄せ(大)</option>
                <option value="LEFT-B">左寄せ(大)</option>
                <option value="RIGHT-B">右寄せ(大)</option>
              </>
            )}
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
                case 'CENTER-B':
                  tag = '[img-b]' + imagePath + '[/img-b]';
                  break;
                case 'LEFT-B':
                  tag = '[img-lb]' + imagePath + '[/img-lb]';
                  break;
                case 'RIGHT-B':
                  tag = '[img-rb]' + imagePath + '[/img-rb]';
                  break;
              }

              if (editorRef.current?.selectionStart != null) {
                onChange(
                  props.value.slice(0, editorRef.current.selectionStart) +
                    tag +
                    props.value.slice(editorRef.current.selectionStart)
                );
              } else {
                onChange(props.value + tag);
              }

              setInsertImage(null);
              setIsImageInsertModalOpen(false);
            }}
          >
            アップロードして挿入
          </Button>
        </div>
      </Modal>
      <Modal
        heading="アイコン選択"
        isOpen={isIconSelectModalOpen}
        onClose={() => setIsIconSelectModalOpen(false)}
      >
        <div className={styles['modal-selectable-icons']}>
          <CharacterIcon
            className={styles['modal-selectable-icon']}
            onClick={() => {
              if (editorRef.current?.selectionStart != null) {
                onChange(
                  props.value.slice(0, editorRef.current.selectionStart) +
                    '[message]\n[name][/name]\n\n[/message]' +
                    props.value.slice(editorRef.current.selectionStart)
                );
              } else {
                onChange(
                  props.value + '[message]\n[name][/name]\n\n[/message]'
                );
              }
              setIsIconSelectModalOpen(false);
            }}
          />
          <>
            {selectableIcons.map((icon, index) => {
              return (
                <CharacterIcon
                  key={index}
                  url={icon}
                  className={styles['modal-selectable-icon']}
                  onClick={() => {
                    if (editorRef.current?.selectionStart != null) {
                      onChange(
                        props.value.slice(0, editorRef.current.selectionStart) +
                          '[message]\n[icon]' +
                          icon +
                          '[/icon]\n[name][/name]\n\n[/message]' +
                          props.value.slice(editorRef.current.selectionStart)
                      );
                    } else {
                      onChange(
                        props.value +
                          '[message]\n[icon]' +
                          icon +
                          '[/icon]\n[name][/name]\n\n[/message]'
                      );
                    }
                    setIsIconSelectModalOpen(false);
                  }}
                />
              );
            })}
          </>
        </div>
      </Modal>
      <ConfirmModal
        isOpen={isPostConfirmModalOpen}
        onCancel={() => setIsPostConfirmModalOpen(false)}
        onClose={() => setIsPostConfirmModalOpen(false)}
        onOk={() => {
          if (props.onSend) {
            props.onSend();
          }
          setIsPostConfirmModalOpen(false);
        }}
      >
        本当に送信しますか？
      </ConfirmModal>
    </div>
  );
};

export default DecorationEditor;
