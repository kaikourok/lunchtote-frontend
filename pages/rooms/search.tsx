import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import CharacterList from '@/components/organisms/CharacterList/CharacterList';
import PageData from '@/components/organisms/PageData/PageData';
import RoomList from '@/components/organisms/RoomList/RoomList';
import SearchForm from '@/components/organisms/SearchForm/SearchForm';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import SubHeading from 'components/atoms/SubHeading/SubHeading';
import Loading from 'components/organisms/Loading/Loading';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import axios from 'plugins/axios';
import styles from 'styles/pages/characters/search.module.scss';

type Order = 'id' | 'latest-post' | 'posts-per-day';
type Sort = 'asc' | 'desc';
type Participant = 'own' | 'follow';

type OrderOption = { label: string; order: Order; sort: Sort };

type Response = {
  rooms: RoomListItem[];
  isContinue: boolean;
};

const orderLabels: { order: Order; label: string }[] = [
  { order: 'latest-post', label: '最終投稿' },
  { order: 'posts-per-day', label: '勢い' },
  { order: 'id', label: 'ルーム番号' },
];

const orderOptions = orderLabels
  .map<OrderOption[]>((order) => {
    return [
      { label: order.label + ' 昇順', order: order.order, sort: 'asc' },
      { label: order.label + ' 降順', order: order.order, sort: 'desc' },
    ];
  })
  .reduce((a, b) => {
    return [...a, ...b];
  });

const isParticipant = (participant: unknown): participant is Participant => {
  const arr: Participant[] = ['own', 'follow'];
  return (
    typeof participant == 'string' && (arr as string[]).includes(participant)
  );
};

const Index: NextPage = () => {
  const router = useRouter();
  const csrfHeader = useCsrfHeader();

  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const [loadEnd, setLoadEnd] = useState(false);
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [isContinue, setIsContinue] = useState(false);

  const orderOptionIndexValue = (() => {
    const sort = router.query.sort == 'desc' ? 'desc' : 'asc';

    for (let i = 0; i < orderOptions.length; i++) {
      if (
        orderOptions[i].order === router.query.order &&
        orderOptions[i].sort === sort
      ) {
        return i;
      }
    }

    return 1;
  })();
  const [orderOptionIndex, setOrderOptionIndex] = useState(
    orderOptionIndexValue
  );
  useEffect(
    () => setOrderOptionIndex(orderOptionIndexValue),
    [router.query.sort, router.query.order]
  );

  const participantValue = isParticipant(router.query.participant)
    ? router.query.participant
    : null;
  const [participant, setParticipant] = useState(participantValue);
  useEffect(() => setParticipant(participantValue), [router.query.participant]);

  const titleValue =
    typeof router.query.title == 'string' ? router.query.title : '';
  const [title, setName] = useState(titleValue);
  useEffect(() => setName(titleValue), [router.query.title]);

  const tagsValue =
    typeof router.query.tags == 'string'
      ? decodeURIComponent(router.query.tags).split(/\s+/)
      : [];
  const [tags, setTags] = useState(tagsValue);
  useEffect(() => setTags(tagsValue), [router.query.tags]);

  const descriptionValue =
    typeof router.query.description == 'string' ? router.query.description : '';
  const [description, setDescription] = useState(descriptionValue);
  useEffect(() => setDescription(descriptionValue), [router.query.description]);

  const [orderOptionIndexInput, setOrderOptionIndexInput] =
    useState(orderOptionIndex);
  const [titleInput, setNameInput] = useState(titleValue);
  const [tagsInput, setTagsInput] = useState(tagsValue.join(' '));
  const [descriptionInput, setDescriptionInput] = useState(descriptionValue);

  useEffect(() => {
    if (router.isReady) {
      setOrderOptionIndexInput(orderOptionIndex);
      setParticipant(participantValue);
      setNameInput(titleValue);
      setTagsInput(tagsValue.join(' '));
      setDescriptionInput(descriptionValue);
    }
  }, [router.isReady]);

  if (!isAuthenticationTried || !isAuthenticated) {
    return (
      <DefaultPage>
        <Loading />
      </DefaultPage>
    );
  }

  if (!csrfHeader) {
    return <DefaultPage>表示中にエラーが発生しました。</DefaultPage>;
  }

  return (
    <DefaultPage>
      <PageData title="ルーム検索" />
      <SubHeading>ルーム検索</SubHeading>
      <SearchForm
        onSearch={async () => {
          if (!isAuthenticated || !router.isReady) return;

          setLoadEnd(false);

          const response = await axios.post<Response>(
            `/rooms/search`,
            {
              order: orderOptions[orderOptionIndexInput].order,
              sort: orderOptions[orderOptionIndexInput].sort,
              participant: participant,
              title: title,
              tags: tags.filter((tag) => tag.indexOf('-') != 0),
              excludedTags: tags
                .filter((tag) => tag.indexOf('-') == 0)
                .map((tag) => tag.slice(1)),
              description: description,
              limit: 100,
              offset: 0,
            },
            {
              headers: csrfHeader!,
            }
          );

          setRooms(response.data.rooms);
          setIsContinue(response.data.isContinue);
          setLoadEnd(true);
        }}
      >
        <SearchForm.TextFields>
          <SearchForm.TextField
            label="ルーム名"
            value={titleInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <SearchForm.TextField
            label="タグ名"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
          <SearchForm.TextField
            label="説明文"
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
          />
        </SearchForm.TextFields>
        <SearchForm.OptionGroup>
          <SearchForm.Options
            value={orderOptionIndexInput}
            onChange={(value) => {
              setOrderOptionIndexInput(value);
            }}
            options={orderOptions.map((order, index) => {
              return { label: order.label, value: index };
            })}
          />
          <SearchForm.Options
            value={participant}
            onChange={(value) => setParticipant(value)}
            options={
              [
                { label: '登録条件なし', value: null },
                { label: '自分が参加している', value: 'own' },
                {
                  label: 'フォロー対象が参加している',
                  value: 'follow',
                },
              ] as { label: string; value: Participant | null }[]
            }
            enabled={participant !== null}
          />
        </SearchForm.OptionGroup>
        <SearchForm.Buttons>
          <SearchForm.SearchButton />
        </SearchForm.Buttons>
      </SearchForm>
      <SubHeading>検索結果</SubHeading>
      {!loadEnd ? <></> : <>{<RoomList rooms={rooms} />}</>}
      {loadEnd && isContinue && (
        <div
          className={styles['continue-load-button']}
          onClick={async () => {
            const response = await axios.post<Response>(
              `/characters/search`,
              {
                order: orderOptions[orderOptionIndexInput].order,
                sort: orderOptions[orderOptionIndexInput].sort,
                participant: participant,
                title: title,
                tags: tags.filter((tag) => tag.indexOf('-') != 0),
                excludedTags: tags
                  .filter((tag) => tag.indexOf('-') == 0)
                  .map((tag) => tag.slice(1)),
                description: description,
                limit: 100,
                offset: rooms.length,
              },
              {
                headers: csrfHeader,
              }
            );

            const newCharacters = [...rooms, ...response.data.rooms];
            setRooms(newCharacters);
            setIsContinue(response.data.isContinue);
          }}
        >
          続きを読み込む
        </div>
      )}
    </DefaultPage>
  );
};

export default Index;
