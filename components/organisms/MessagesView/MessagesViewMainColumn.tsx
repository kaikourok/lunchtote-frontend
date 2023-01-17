import {
  mdiAccountPlus,
  mdiChevronDoubleRight,
  mdiMessageOutline,
} from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import Link from 'next/link';
import { Fragment, ReactNode, useState } from 'react';
import toast from 'react-hot-toast';

import { toParsedUrlQueryInput, toQueryString } from './FetchOptionManager';
import { MessagesFetchConfig, RoomMessage, RoomOwnPermissions } from './types';

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

type ReplyTarget =
  | {
      type: 'MESSAGE';
      target: RoomMessage;
      permission: RoomPermission;
    }
  | {
      type: 'DIRECT';
      target: {
        id: number;
        name: string;
      }[];
      permission: RoomPermission;
    };

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
  secret: boolean;
  icon: string | null;
  selectableIcons: string[];
  replyPermission: RelationPermission;
  replyTarget: ReplyTarget | null;
  onReplyPermissionChange: (permission: RelationPermission) => void;
  onEditorModeChange: (mode: EditorMode) => void;
  onMessageChange: (message: string) => void;
  onNameChange: (name: string) => void;
  onIconSelect: (icon: string | null) => void;
  onSecretChange: (secret: boolean) => void;
  onSend: () => void;
  onCancelReply: () => void;
}) => {
  const [isIconSelectModalOpen, setIsIconSelectModalOpen] = useState(false);

  return (
    <>
      {props.editorMode == 'MESSAGE' && (
        <div className={roomClassName('message-editor')}>
          {props.replyTarget && (
            <div className={roomClassName('message-editor-reply-target')}>
              <div
                className={roomClassName(
                  'message-editor-reply-target-icon-wapper'
                )}
              >
                <Icon path={mdiChevronDoubleRight} />
              </div>
              {props.replyTarget.type == 'MESSAGE' && (
                <div
                  className={roomClassName('message-editor-reply-target-texts')}
                >
                  <span
                    className={roomClassName(
                      'message-editor-reply-target-name'
                    )}
                  >
                    {props.replyTarget.target.name}
                  </span>
                  <span
                    className={roomClassName(
                      'message-editor-reply-target-character-id'
                    )}
                  >
                    {characterIdText(props.replyTarget.target.character)}
                  </span>
                  <span
                    className={roomClassName(
                      'message-editor-reply-target-text'
                    )}
                  >
                    <span
                      className={roomClassName(
                        'message-editor-reply-target-text-inner'
                      )}
                    >
                      {props.replyTarget.target.message}
                    </span>
                  </span>
                </div>
              )}
              <div
                className={roomClassName('message-editor-cancel-button')}
                onClick={props.onCancelReply}
              >
                キャンセル
              </div>
            </div>
          )}
          <div className={roomClassName('message-editor-main')}>
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
                  value={'' + props.secret}
                  onChange={(e) => {
                    props.onSecretChange(e.target.value == 'true');
                  }}
                  className={roomClassName('message-editor-secret-select')}
                >
                  <option value={'' + false}>通常</option>
                  <option value={'' + true}>秘話</option>
                </select>
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
                  <option value="FOLLOWED">
                    {PERMISSION_NAMES['FOLLOWED']}
                  </option>
                  <option value="MUTUAL_FOLLOW">
                    {PERMISSION_NAMES['MUTUAL_FOLLOW']}
                  </option>
                  <option value="DISALLOW">
                    {PERMISSION_NAMES['DISALLOW']}
                  </option>
                </select>
                <div
                  className={roomClassName('message-editor-add-reply-target')}
                >
                  <Icon
                    className={roomClassName(
                      'message-editor-add-reply-target-icon'
                    )}
                    path={mdiAccountPlus}
                  />
                </div>
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
  const referRootHref = {
    pathname: '/rooms/messages',
    query: toParsedUrlQueryInput({
      ...props.currentFetchConfig,
      category: 'conversation',
      referRoot: props.message.referRoot,
    }),
  };

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
          {props.message.refer != null && props.message.referRoot != null && (
            <Link href={referRootHref}>
              <a className={roomClassName('message-recipients')}>
                <div className={roomClassName('message-recipients-icon')}>
                  <Icon path={mdiChevronDoubleRight} />
                </div>
                <>
                  {props.message.recipients.map((recipient) => {
                    return (
                      <span
                        key={recipient.id}
                        className={roomClassName('message-recipient')}
                      >
                        {recipient.name}({recipient.id})
                      </span>
                    );
                  })}
                </>
              </a>
            </Link>
          )}
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
          <Link href={referRootHref}>
            <a className={classnames(roomClassName('message-aside-date'))}>
              {stringifyDate(new Date(props.message.postedAt))}
            </a>
          </Link>
        )}
        <div
          className={roomClassName('message-aside-comments')}
          onClick={props.onClickReply}
        >
          <Icon
            path={mdiMessageOutline}
            className={roomClassName('message-aside-comments-icon')}
          />
          <div className={roomClassName('message-aside-comments-count')}>
            {props.message.repliedCount}
          </div>
        </div>
      </div>
    </div>
  );
};

const MessagesViewMainColumn = (props: {
  room:
    | ({
        id: number;
        title: string;
      } & RoomOwnPermissions)
    | null;
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

  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('UNOPENED');
  const [icon, setIcon] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [secret, setSecret] = useState(false);
  const [replyPermission, setReplyPermission] =
    useState<RelationPermission>('ALL');

  const messageName = name || props.character.name;

  const fetchError =
    props.fetchConfigError ||
    (props.messages == undefined ? '読み込み中です' : undefined);

  const messageActions: ReactNode[] = [];
  if (props.room != null) {
    messageActions.push(
      <div
        className={classnames(roomClassName('main-column-button'), {
          [roomClassName('disabled')]: false,
        })}
        onClick={() =>
          setEditorMode(editorMode == 'UNOPENED' ? 'MESSAGE' : 'UNOPENED')
        }
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
      {(props.room || replyTarget) && (
        <MessageEditor
          editorMode={editorMode}
          icon={icon}
          name={name}
          message={message}
          secret={secret}
          selectableIcons={props.character.icons}
          replyPermission={replyPermission}
          replyTarget={replyTarget}
          onSecretChange={setSecret}
          onSend={async () => {
            if (!message) {
              toast.error('メッセージが入力されていません');
              return;
            }

            if (!csrfHeader) return;
            if (!props.room && !replyTarget) return;

            if (replyTarget != null && replyTarget.type == 'MESSAGE') {
              await toast.promise(
                axios.post(
                  `/rooms/${replyTarget.target.room.id}/messages`,
                  {
                    room: replyTarget.target.room.id,
                    icon: icon || '',
                    name: name,
                    message: message,
                    refer: replyTarget.target.id,
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
            } else if (props.room) {
              await toast.promise(
                axios.post(
                  `/rooms/${props.room.id}/messages`,
                  {
                    room: props.room.id,
                    icon: icon || '',
                    name: name,
                    message: message,
                    refer: null,
                    directReply:
                      replyTarget?.type == 'DIRECT'
                        ? replyTarget.target.map((target) => target.id)
                        : null,
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
            } else {
              return;
            }

            setMessage('');
            setEditorMode('UNOPENED');
            props.onRefreshRequired();
          }}
          onIconSelect={setIcon}
          onNameChange={setName}
          onEditorModeChange={setEditorMode}
          onMessageChange={setMessage}
          onReplyPermissionChange={setReplyPermission}
          onCancelReply={() => setReplyTarget(null)}
        />
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
          {props.messages.length == 0 && editorMode == 'UNOPENED' && (
            <CommentarySection>メッセージがありません。</CommentarySection>
          )}
          {props.room && editorMode == 'MESSAGE' && (
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
          {0 < props.messages.length && (
            <div className={roomClassName('messages')}>
              {props.messages.map((message) => {
                return (
                  <Message
                    key={message.id}
                    message={message}
                    currentFetchConfig={props.currentFetchConfig}
                    onClickReply={async () => {
                      try {
                        const permissions: RoomOwnPermissions =
                          props.room && props.room.id == message.room.id
                            ? {
                                banned: props.room.banned,
                                permissions: props.room.permissions,
                              }
                            : (
                                await axios.get<RoomOwnPermissions>(
                                  `/rooms/${message.room.id}/permissions`
                                )
                              ).data;

                        if (
                          permissions.banned ||
                          !permissions.permissions.write
                        ) {
                          toast.error(
                            '指定のルームで発言を行う権限がありません'
                          );
                          return;
                        }

                        if (!permissions.permissions.useReply) {
                          toast.error(
                            '指定のルームで返信機能を利用する権限がありません'
                          );
                          return;
                        }

                        setReplyTarget({
                          type: 'MESSAGE',
                          target: message,
                          permission: permissions.permissions,
                        });
                        setEditorMode('MESSAGE');
                      } catch (e) {
                        console.log(e);
                        toast.error(
                          '発言権限のチェック中にエラーが発生しました'
                        );
                      }
                    }}
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
