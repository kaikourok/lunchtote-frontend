import classnames from 'classnames';
import Link from 'next/link';
import { Fragment, MouseEvent, ReactNode, useState } from 'react';
import toast from 'react-hot-toast';

import { toParsedUrlQueryInput } from './FetchOptionManager';
import { MessagesFetchConfig, RoomMessage } from './types';

import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Modal from '@/components/molecules/Modal/Modal';
import DecorationEditor from '@/components/organisms/DecorationEditor/DecorationEditor';
import useCsrfHeader from 'hooks/useCsrfHeader';
import characterIdText from 'lib/characterIdText';
import roomClassName from 'lib/roomClassName';
import { stringifyDate } from 'lib/stringifyDate';
import { stylizeMessagePreview } from 'lib/stylize';
import axios from 'plugins/axios';



type EditorMode = 'UNOPENED' | 'MESSAGE';

const PERMISSION_NAMES: {
  [key in RelationPermission]: string;
} = {
  DISALLOW: '返信不可',
  FOLLOW: 'フォロー',
  FOLLOWED: '被フォロー限定',
  MUTUAL_FOLLOW: '相互フォロー限定',
  ALL: '返信可',
};

const MessageEditor = (props: {
  editorMode: EditorMode;
  message: string;
  name: string;
  icon: string | null;
  selectableIcons: string[];
  replyPermission: RelationPermission;
  onReplyPermissionChange: (permission: RelationPermission) => void;
  onEditorModeChange: (mode: EditorMode) => void;
  onMessageChange: (message: string) => void;
  onNameChange: (name: string) => void;
  onIconSelect: (icon: string | null) => void;
  onSend: () => void;
}) => {
  const [isIconSelectModalOpen, setIsIconSelectModalOpen] = useState(false);

  return (
    <>
      {props.editorMode == 'MESSAGE' && (
        <div className={roomClassName('message-editor')}>
          <div
            className={roomClassName('message-editor-icon-wrapper')}
            onClick={() => setIsIconSelectModalOpen(true)}
          >
            <CharacterIcon url={props.icon} />
          </div>
          <div className={roomClassName('message-editor-inputs-wrapper')}>
            <div className={roomClassName('message-editor-inputs-top')}>
              <input
                type="text"
                className={roomClassName('message-editor-name-input')}
                placeholder="名前"
                value={props.name}
                onChange={(e) => props.onNameChange(e.target.value)}
              />
              <select
                value={props.replyPermission}
                onChange={(e) => {
                  props.onReplyPermissionChange(
                    e.target.value as RelationPermission
                  );
                }}
                className={roomClassName('message-editor-permission-select')}
              >
                <option value="ALL">{PERMISSION_NAMES['ALL']}</option>
                <option value="FOLLOW">{PERMISSION_NAMES['FOLLOW']}</option>
                <option value="FOLLOWED">{PERMISSION_NAMES['FOLLOWED']}</option>
                <option value="MUTUAL_FOLLOW">
                  {PERMISSION_NAMES['MUTUAL_FOLLOW']}
                </option>
                <option value="DISALLOW">{PERMISSION_NAMES['DISALLOW']}</option>
              </select>
            </div>
            <DecorationEditor
              value={props.message}
              onSend={props.onSend}
              onChange={props.onMessageChange}
              noMessage
              noHorizonLine
              thin
            />
          </div>
        </div>
      )}
      <Modal
        heading="アイコン選択"
        isOpen={isIconSelectModalOpen}
        onClose={() => setIsIconSelectModalOpen(false)}
      >
        <div className={roomClassName('modal-selectable-icons')}>
          <CharacterIcon
            className={roomClassName('modal-selectable-icon')}
            onClick={() => {
              props.onIconSelect(null);
              setIsIconSelectModalOpen(false);
            }}
          />
          <>
            {props.selectableIcons.map((icon, index) => {
              return (
                <CharacterIcon
                  key={index}
                  url={icon}
                  className={roomClassName('modal-selectable-icon')}
                  onClick={() => {
                    props.onIconSelect(icon);
                    setIsIconSelectModalOpen(false);
                  }}
                />
              );
            })}
          </>
        </div>
      </Modal>
    </>
  );
};

const Message = (props: {
  message: RoomMessage;
  currentFetchConfig: MessagesFetchConfig;
  onClickReply?: () => void;
  preview?: boolean;
}) => {
  return (
    <div
      id={`ms${props.message.id}`}
      className={classnames(roomClassName('message'), {
        [roomClassName('preview')]: props.preview,
      })}
    >
      <div className={classnames(roomClassName('message-main'))}>
        <div className={classnames(roomClassName('message-icon-wrapper'))}>
          <CharacterIcon url={props.message.icon} />
        </div>
        <div className={classnames(roomClassName('message-content-wrapper'))}>
          <Link
            href={{
              pathname: '/characters/[id]',
              query: { id: props.message.id },
            }}
          >
            <a className={classnames(roomClassName('message-sender'))}>
              <span
                className={classnames(roomClassName('message-sender-name'))}
              >
                {props.message.name}
              </span>
              <span className={classnames(roomClassName('message-sender-id'))}>
                {characterIdText(props.message.character)}
              </span>
            </a>
          </Link>
          <div
            className={classnames(roomClassName('message-content'))}
            dangerouslySetInnerHTML={{
              __html: stylizeMessagePreview(props.message.message),
            }}
          />
        </div>
      </div>
      <div className={classnames(roomClassName('message-aside'))}>
        <Link
          href={{
            pathname: '/rooms/messages',
            query: toParsedUrlQueryInput({
              ...props.currentFetchConfig,
              room: props.message.room.id,
            }),
          }}
        >
          <a className={classnames(roomClassName('message-aside-room'))}>
            #{props.message.room.title}
          </a>
        </Link>
        {props.message.postedAt && (
          <div className={classnames(roomClassName('message-aside-date'))}>
            {stringifyDate(new Date(props.message.postedAt))}
          </div>
        )}
      </div>
    </div>
  );
};

const MessagesViewMainColumn = (props: {
  room: {
    id: number;
    title: string;
  } | null;
  character: {
    id: number;
    name: string;
    icons: string[];
  };
  currentFetchConfig: MessagesFetchConfig;
  messages: RoomMessage[] | undefined;
  fetchConfigError: string | undefined;
  isContinueFollowing: boolean;
  isContinuePrevious: boolean;
  onRefreshRequired: () => void;
}) => {
  const csrfHeader = useCsrfHeader();

  const [editorMode, setEditorMode] = useState<EditorMode>('UNOPENED');
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [replyPermission, setReplyPermission] =
    useState<RelationPermission>('ALL');

  const messageName = name || props.character.name;

  const fetchError =
    props.fetchConfigError ||
    (props.messages == undefined ? '読み込み中です' : undefined);

  const messageActions: ReactNode[] = [];
  if (editorMode == 'UNOPENED') {
    messageActions.push(
      <div
        className={classnames(roomClassName('main-column-button'), {
          [roomClassName('disabled')]: false,
        })}
        onClick={() => setEditorMode('MESSAGE')}
      >
        メッセージを送信する
      </div>
    );
  }
  if (!props.isContinuePrevious) {
    messageActions.push(
      <div
        className={classnames(roomClassName('main-column-button'), {
          [roomClassName('disabled')]: false,
        })}
        onClick={props.onRefreshRequired}
      >
        更新する
      </div>
    );
  }

  return (
    <div className={roomClassName('main-column')}>
      {props.room && (
        <>
          <MessageEditor
            editorMode={editorMode}
            icon={icon}
            name={name}
            message={message}
            selectableIcons={props.character.icons}
            replyPermission={replyPermission}
            onSend={async () => {
              if (!message) {
                toast.error('メッセージが入力されていません');
                return;
              }

              if (!props.room || !csrfHeader) return;

              await toast.promise(
                axios.post(
                  `/rooms/${props.room.id}/messages`,
                  {
                    room: props.room.id,
                    icon: icon || '',
                    name: name,
                    message: message,
                    refer: null,
                    directReply: null,
                    replyPermission: replyPermission,
                    secret: false,
                  },
                  {
                    headers: csrfHeader,
                  }
                ),
                {
                  loading: 'メッセージを送信中です',
                  success: 'メッセージを送信しました',
                  error: 'メッセージの送信中にエラーが発生しました',
                }
              );

              setMessage('');
              setEditorMode('UNOPENED');
              props.onRefreshRequired();
            }}
            onIconSelect={setIcon}
            onNameChange={setName}
            onEditorModeChange={setEditorMode}
            onMessageChange={setMessage}
            onReplyPermissionChange={setReplyPermission}
          />
          {editorMode == 'MESSAGE' && (
            <Message
              message={{
                id: 0,
                character: props.character.id,
                refer: null,
                referRoot: null,
                secret: false,
                icon: icon,
                name: messageName,
                message: message,
                repliedCount: 0,
                postedAt: new Date().toString(),
                replyPermission: 'ALL',
                replyable: true,
                room: props.room,
                recipients: [
                  {
                    id: props.character.id,
                    name: props.character.name,
                  },
                ],
              }}
              currentFetchConfig={props.currentFetchConfig}
              preview
            />
          )}
        </>
      )}
      {!!fetchError && (
        <CommentarySection noMargin>{fetchError}</CommentarySection>
      )}
      {!fetchError && !!props.messages && (
        <>
          {!!messageActions.length && (
            <div className={classnames(roomClassName('main-column-buttons'))}>
              {messageActions.map((node, index) => {
                return <Fragment key={index}>{node}</Fragment>;
              })}
            </div>
          )}
          {props.messages.length == 0 && (
            <CommentarySection>メッセージがありません。</CommentarySection>
          )}
          {0 < props.messages.length && (
            <div className={roomClassName('messages')}>
              {props.messages.map((message) => {
                return (
                  <Message
                    key={message.id}
                    message={message}
                    currentFetchConfig={props.currentFetchConfig}
                  />
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessagesViewMainColumn;
