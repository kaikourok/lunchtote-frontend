import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import useSWR from 'swr';

import {
  messagesFetchConfigError,
  toMessagesFetchConfig,
  toQueryString,
} from './FetchOptionManager';
import MessagesViewLeftColumn from './MessagesViewLeftColumn';
import MessagesViewMainColumn from './MessagesViewMainColumn';
import MessagesViewRightColumn from './MessagesViewRightColumn';
import {
  MessagesFetchConfig,
  NamedMessagesFetchConfig,
  RoomMessage,
  RoomRelations,
  RoomSubscribeStates,
} from './types';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import roomClassName from 'lib/roomClassName';
import axios from 'plugins/axios';
import { selectCharacter } from 'store/selector/character';

type RoomInitialData = {
  title: string;
  relations: RoomRelations;
  permissions: RoomPermission;
  banned: boolean;
  subscribeStates: RoomSubscribeStates;
};

type MessageEditRequiredData = {
  character: { name: string };
  icons: CharacterIcon[];
  lists: ListOverview[];
};

type RoomMessageResponse = {
  messages: RoomMessage[];
  isContinueFollowing: boolean | null;
  isContinuePrevious: boolean | null;
};

const MessagesView = () => {
  const router = useRouter();
  const csrfHeader = useCsrfHeader();

  useRequireAuthenticated();

  const roomMode = router.isReady && router.query.room;

  const characterId = useSelector(selectCharacter)?.id;

  const { data: roomData, mutate: mutateRoomData } = useSWR<RoomInitialData>(
    roomMode ? `/rooms/${router.query.room}` : null
  );

  const { data: messageEditData, error: messageEditDataError } =
    useSWR<MessageEditRequiredData>(`/rooms/message-edit-data`);

  const [messages, setMessages] = useState<RoomMessage[]>();
  const [isContinueFollowing, setIsContinueFollowing] = useState(false);
  const [isContinuePrevious, setIsContinuePrevious] = useState(false);

  const [messageError, setMessageError] = useState(false);

  const currentFetchConfig = toMessagesFetchConfig(
    router.asPath.indexOf('?') == -1
      ? ''
      : router.asPath.slice(router.asPath.indexOf('?') + 1)
  );

  const queryString = toQueryString(currentFetchConfig);
  const fetchConfigError = messagesFetchConfigError(currentFetchConfig);

  useEffect(() => {
    if (!router.isReady) return;
    if (messagesFetchConfigError(toMessagesFetchConfig(queryString))) {
      setMessages(undefined);
      setIsContinueFollowing(false);
      setIsContinuePrevious(false);
      return;
    }

    (async () => {
      const response = await axios.get<RoomMessageResponse>(
        '/rooms/messages' + queryString
      );

      setMessages(response.data.messages);
      setIsContinueFollowing(response.data.isContinueFollowing || false);
      setIsContinuePrevious(response.data.isContinuePrevious || false);
    })();
  }, [router.isReady, queryString]);

  const {
    data: savedFetchConfigs,
    error: fetchConfigsError,
    mutate: mutateSavedFetchConfigs,
  } = useSWR<NamedMessagesFetchConfig[]>('/rooms/fetch-configs');

  if (
    !characterId ||
    !messageEditData ||
    !router.isReady ||
    !savedFetchConfigs
  ) {
    return <Loading />;
  }

  if (messageEditDataError || fetchConfigsError) {
    return (
      <DefaultPage>
        <PageData title="交流" />
        <CommentarySection>
          データの取得中にエラーが発生しました
        </CommentarySection>
      </DefaultPage>
    );
  }

  return (
    <div className={roomClassName('container')}>
      <PageData title={roomData ? roomData.title : '交流'} />
      <MessagesViewLeftColumn
        room={
          !roomData
            ? null
            : {
                id: Number(router.query.room),
                relations: roomData.relations,
              }
        }
        currentFetchConfig={currentFetchConfig}
        savedFetchConfigs={savedFetchConfigs}
      />
      <MessagesViewMainColumn
        room={
          roomData
            ? {
                id: Number(router.query.room),
                title: roomData.title,
                banned: roomData.banned,
                permissions: roomData.permissions,
              }
            : null
        }
        character={{
          id: characterId,
          name: messageEditData.character.name,
          icons: messageEditData.icons.map((icon) => icon.path),
        }}
        messages={messages}
        currentFetchConfig={currentFetchConfig}
        fetchConfigError={fetchConfigError}
        isContinueFollowing={isContinueFollowing}
        isContinuePrevious={isContinuePrevious}
        onRefreshRequired={async () => {
          if (messages == undefined) return;

          const queryString = toQueryString(currentFetchConfig, {
            type: 'following',
            base: messages[0]?.id ?? 0,
          });

          const response = await axios.get<RoomMessageResponse>(
            '/rooms/messages' + queryString
          );

          if (!response.data.messages.length) {
            toast.success('新着はありません');
            return;
          } else {
            setIsContinueFollowing(response.data.isContinueFollowing || false);
            setIsContinuePrevious(!!messages.length);
            setMessages([...response.data.messages, ...messages]);
            toast.success(`${response.data.messages.length}件の新着があります`);
          }
        }}
        onMessageDeleted={(messageId) => {
          if (messages) {
            setMessages(messages.filter((message) => message.id != messageId));
          }
        }}
      />
      <MessagesViewRightColumn
        currentFetchConfig={currentFetchConfig}
        subscribeStates={roomData?.subscribeStates ?? null}
        onMessageSubscribeToggle={async () => {
          if (!csrfHeader) return;
          if (!roomData) return;

          try {
            await toast.promise(
              axios.post(
                `/rooms/${router.query.room}/message-event/${
                  roomData.subscribeStates.message ? 'unsubscribe' : 'subscribe'
                }`,
                null,
                { headers: csrfHeader }
              ),
              {
                loading: `新規メッセージ通知を${
                  roomData.subscribeStates.message ? 'OFF' : 'ON'
                }にしています`,
                success: `新規メッセージ通知を${
                  roomData.subscribeStates.message ? 'OFF' : 'ON'
                }にしました`,
                error: `通知情報の変更中にエラーが発生しました`,
              }
            );

            mutateRoomData(
              {
                ...roomData,
                subscribeStates: {
                  ...roomData.subscribeStates,
                  message: !roomData.subscribeStates.message,
                },
              },
              false
            );
          } catch (e) {
            console.log(e);
          }
        }}
        onNewMemberSubscribeToggle={async () => {
          if (!csrfHeader) return;
          if (!roomData) return;

          try {
            await toast.promise(
              axios.post(
                `/rooms/${router.query.room}/new-member-event/${
                  roomData.subscribeStates.newMember
                    ? 'unsubscribe'
                    : 'subscribe'
                }`,
                null,
                { headers: csrfHeader }
              ),
              {
                loading: `新規メンバー通知を${
                  roomData.subscribeStates.newMember ? 'OFF' : 'ON'
                }にしています`,
                success: `新規メンバー通知を${
                  roomData.subscribeStates.newMember ? 'OFF' : 'ON'
                }にしました`,
                error: `通知情報の変更中にエラーが発生しました`,
              }
            );

            mutateRoomData(
              {
                ...roomData,
                subscribeStates: {
                  ...roomData.subscribeStates,
                  newMember: !roomData.subscribeStates.newMember,
                },
              },
              false
            );
          } catch (e) {
            console.log(e);
          }
        }}
        onTargetCharacterChange={(target) => {
          const newFetchConfig: MessagesFetchConfig = {
            ...currentFetchConfig,
            character: target,
          };

          router.push(router.pathname + toQueryString(newFetchConfig));
        }}
        onAddSavedFetchConfig={(config) => {
          mutateSavedFetchConfigs([...savedFetchConfigs, config], false);
        }}
        lists={messageEditData.lists}
      />
    </div>
  );
};

export default MessagesView;
