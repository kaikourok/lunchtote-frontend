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
import {
  CompositeDecorator,
  ContentBlock,
  ContentState,
  Editor,
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js';
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

const insertTag = (state: EditorState, startTag: string, endTag?: string) => {
  const currentSelection = state.getSelection();
  const currentContent = state.getCurrentContent();
  const startKey = currentSelection.getStartKey();
  const endKey = currentSelection.getEndKey();
  const startBlock = currentContent.getBlockForKey(startKey);
  const endBlock = currentContent.getBlockForKey(endKey);
  const startOffset = currentSelection.getStartOffset();
  const endOffset = currentSelection.getEndOffset();

  let endState: ContentState | null = null;
  if (endTag != undefined) {
    const selection = new SelectionState({
      anchorKey: endKey,
      anchorOffset: endOffset,
      focusKey: endKey,
      focusOffset: endOffset,
    });
    endState = Modifier.insertText(currentContent, selection, endTag);
  }

  const selection = new SelectionState({
    anchorKey: startKey,
    anchorOffset: startOffset,
    focusKey: startKey,
    focusOffset: startOffset,
  });
  const resultContent = Modifier.insertText(
    endState ?? currentContent,
    selection,
    startTag
  );

  return EditorState.push(state, resultContent, 'insert-characters');
};

type InsertTagButtonProps =
  | {
      path: string;
      startTag: string;
      endTag?: undefined;
      singleTag: true;
      style?: CSSProperties;
      onClick?: (state: EditorState) => void;
      editorState: EditorState;
      label?: string;
    }
  | {
      path: string;
      startTag: string;
      endTag: string;
      singleTag?: false;
      style?: CSSProperties;
      onClick?: (state: EditorState) => void;
      editorState: EditorState;
      label?: string;
    };

const InsertTagButton = (props: InsertTagButtonProps) => {
  return (
    <ControllerButton
      path={props.path}
      style={props.style}
      label={props.label}
      onClick={() => {
        if (props.onClick == undefined) {
          return;
        }

        props.onClick(
          insertTag(props.editorState, props.startTag, props.endTag)
        );
      }}
    />
  );
};

type DecorationEditorProps = {
  initialValue: string;
  onChange?: (s: string) => void;
  noDice?: boolean;
  noMessage?: boolean;
  noHorizonLine?: boolean;
  selectableIcons?: string[];
  thin?: boolean;
  onSend?: React.MouseEventHandler<HTMLDivElement>;
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
];

const Decorated = ({ children }: { children: ReactNode }) => {
  return <span className={styles['editor-tag']}>{children}</span>;
};

function findWithRegex(
  words: RegExp[],
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void
) {
  const text = contentBlock.getText();

  words.forEach((word) => {
    const matches = [...text.matchAll(word)];
    matches.forEach((match) =>
      callback(match.index!, match.index! + match[0].length)
    );
  });
}

function handleStrategy(
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void
) {
  findWithRegex(words, contentBlock, callback);
}

const createDecorator = () =>
  new CompositeDecorator([
    {
      strategy: handleStrategy,
      component: Decorated,
    },
  ]);

const DecorationEditor = (props: DecorationEditorProps) => {
  const csrfHeader = useCsrfHeader();
  const editorRef = useRef<Editor>(null);

  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(createDecorator())
  );

  useEffect(() => {
    if (props.onChange) {
      props.onChange(
        editorState
          .getCurrentContent()
          .getBlocksAsArray()
          .map((block) => block.getText())
          .join('\n')
      );
    }
  }, [editorState]);

  useEffect(() => {
    setEditorState(
      EditorState.createWithContent(
        ContentState.createFromText(props.initialValue),
        createDecorator()
      )
    );
  }, [props.initialValue]);

  const [isImageInsertModalOpen, setIsImageInsertModalOpen] = useState(false);
  const [insertImage, setInsertImage] = useState<File | null>(null);
  const [insertImagePosition, setInsertImagePosition] =
    useState<InsertImagePosition>('CENTER');

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

  return (
    <div className={styles['editor-wrapper']}>
      <div
        className={classnames(styles['wrapper'], {
          [styles['thin']]: props.thin,
        })}
      >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={setEditorState}
        />
      </div>
      <div className={styles['controller-buttons']}>
        <div className={styles['controller-buttons-left']}>
          <InsertTagButton
            editorState={editorState}
            startTag="[+]"
            endTag="[/+]"
            path={mdiFormatAnnotationPlus}
            onClick={setEditorState}
            label="字を大きく"
          />
          <InsertTagButton
            editorState={editorState}
            startTag="[-]"
            endTag="[/-]"
            path={mdiFormatAnnotationMinus}
            onClick={setEditorState}
            label="字を小さく"
          />
          <InsertTagButton
            editorState={editorState}
            startTag="[b]"
            endTag="[/b]"
            path={mdiFormatBold}
            onClick={setEditorState}
            label="太字"
          />
          <InsertTagButton
            editorState={editorState}
            startTag="[i]"
            endTag="[/i]"
            path={mdiFormatItalic}
            onClick={setEditorState}
            label="斜体"
          />
          <InsertTagButton
            editorState={editorState}
            startTag="[u]"
            endTag="[/u]"
            path={mdiFormatUnderline}
            onClick={setEditorState}
            label="下線"
          />
          <InsertTagButton
            editorState={editorState}
            startTag="[s]"
            endTag="[/s]"
            path={mdiFormatStrikethrough}
            onClick={setEditorState}
            label="取り消し線"
          />
          <InsertTagButton
            editorState={editorState}
            startTag="[rt]"
            endTag="[/rt][rb][/rb]"
            path={mdiFuriganaHorizontal}
            onClick={setEditorState}
            label="ルビ"
          />
          <div className={styles['controller-separator']} />
          {!props.noDice && (
            <InsertTagButton
              editorState={editorState}
              startTag="[d6]"
              singleTag
              path={mdiDice2}
              onClick={setEditorState}
              label="6面ダイス"
            />
          )}
          {!props.noDice && (
            <InsertTagButton
              editorState={editorState}
              startTag="[d100]"
              singleTag
              path={mdiDiceMultiple}
              onClick={setEditorState}
              label="100面ダイス"
            />
          )}
          {!props.noHorizonLine && (
            <InsertTagButton
              editorState={editorState}
              startTag="[hr]"
              singleTag
              path={mdiMinus}
              onClick={setEditorState}
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

              setEditorState(insertTag(editorState, tag));
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
