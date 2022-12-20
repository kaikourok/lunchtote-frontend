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
  MessagesFetchCategory,
  MessagesFetchConfig,
  NamedMessagesFetchConfig,
  RoomMessage,
  RoomRelations,
} from './types';

import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import Loading from '@/components/organisms/Loading/Loading';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import roomClassName from 'lib/roomClassName';
import axios from 'plugins/axios';
import { selectCharacter } from 'store/selector/character';

type RoomInitialData = {
  title: string;
  relations: RoomRelations;
  permissions: RoomPermission;
  banned: boolean;
};

type MessageEditRequiredData = {
  character: { name: string };
  icons: CharacterIcon[];
};

type RoomMessageResponse = {
  messages: RoomMessage[];
  isContinueFollowing: boolean | null;
  isContinuePrevious: boolean | null;
};

const MessagesView = () => {
  useRequireAuthenticated();

  const router = useRouter();

  const roomMode = router.isReady && router.query.room;

  const characterId = useSelector(selectCharacter)?.id;

  const { data: roomData } = useSWR<RoomInitialData>(
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

  const savedFetchConfigs: NamedMessagesFetchConfig[] = [
    {
      name: '全体',
      category: 'all',
      room: null,
      list: null,
      search: null,
      referRoot: null,
      character: null,
      relateFilter: false,
      children: true,
    },
    {
      name: '返信',
      category: 'all',
      room: null,
      list: null,
      search: null,
      referRoot: null,
      character: null,
      relateFilter: false,
      children: true,
    },
    {
      name: 'リスト',
      category: 'all',
      room: null,
      list: null,
      search: null,
      referRoot: null,
      character: null,
      relateFilter: false,
      children: true,
    },
  ];

  if (!characterId || !messageEditData || !router.isReady) {
    return <Loading />;
  }

  if (messageEditDataError) {
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
          toast.error('未実装です');
        }}
      />
      <MessagesViewRightColumn currentFetchConfig={currentFetchConfig} />
    </div>
  );
};

export default MessagesView;
