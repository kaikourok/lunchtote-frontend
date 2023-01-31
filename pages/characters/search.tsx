import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import CharacterList from '@/components/organisms/CharacterList/CharacterList';
import PageData from '@/components/organisms/PageData/PageData';
import SearchForm from '@/components/organisms/SearchForm/SearchForm';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import Heading from 'components/atoms/Heading/Heading';
import Loading from 'components/organisms/Loading/Loading';
import useAuthenticationStatus from 'hooks/useAuthenticationStatus';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import axios from 'plugins/axios';
import styles from 'styles/pages/characters/search.module.scss';

type Order = 'id';
type Sort = 'asc' | 'desc';

type OrderOption = { label: string; order: Order; sort: Sort };

type Character = {
  id: number;
  name: string;
  tags: string[];
  summary: string;
  mainicon: string;
};

type Response = {
  characters: Character[];
  isContinue: boolean;
};

const minSuffix = '-min';
const maxSuffix = '-max';

const orderLabels: { order: Order; label: string }[] = [
  { order: 'id', label: '登録番号' },
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

const isOrder = (order: unknown): order is Order => {
  return typeof order == 'string' && order == 'id';
};

const queryNumber = (query: string | string[] | undefined) => {
  if (typeof query !== 'string') {
    return null;
  } else {
    const number = Number(query);
    return isNaN(number) ? null : number;
  }
};

const Index: NextPage = () => {
  const router = useRouter();

  const { isAuthenticated, isAuthenticationTried } = useAuthenticationStatus();
  useRequireAuthenticated();

  const csrfHeader = useCsrfHeader();

  const [loadEnd, setLoadEnd] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
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

    return 0;
  })();
  const [orderOptionIndex, setOrderOptionIndex] = useState(
    orderOptionIndexValue
  );
  useEffect(
    () => setOrderOptionIndex(orderOptionIndexValue),
    [router.query.sort, router.query.order]
  );

  const followValue =
    router.query.follow === undefined ? null : router.query.follow == 't';
  const [follow, setFollow] = useState(followValue);
  useEffect(() => setFollow(followValue), [router.query.follow]);

  const followedValue =
    router.query.followed === undefined ? null : router.query.followed == 't';
  const [followed, setFollowed] = useState(followedValue);
  useEffect(() => setFollowed(followedValue), [router.query.followed]);

  const tagsValue =
    typeof router.query.tags == 'string'
      ? decodeURIComponent(router.query.tags).split(/\s+/)
      : [];
  const [tags, setTags] = useState(tagsValue);
  useEffect(() => setTags(tagsValue), [router.query.tags]);

  const nameValue =
    typeof router.query.name == 'string' ? router.query.name : '';
  const [name, setName] = useState(nameValue);
  useEffect(() => setName(nameValue), [router.query.name]);

  const [orderOptionIndexInput, setOrderOptionIndexInput] =
    useState(orderOptionIndex);
  const [followInput, setFollowInput] = useState(followValue);
  const [followedInput, setFollowedInput] = useState(followedValue);
  const [tagsInput, setTagsInput] = useState(tagsValue.join(' '));
  const [nameInput, setNameInput] = useState(nameValue);
  useEffect(() => {
    if (router.isReady) {
      setOrderOptionIndexInput(orderOptionIndex);
      setFollowInput(followValue);
      setFollowedInput(followedValue);
      setTagsInput(tagsValue.join(' '));
      setNameInput(nameValue);
    }
  }, [router.isReady]);

  useEffect(() => {
    if (!isAuthenticated || !csrfHeader || !router.isReady) return;

    (async () => {
      setLoadEnd(false);

      const response = await axios.post<Response>(`/characters/search`, {
        order: orderOptions[orderOptionIndex].order,
        sort: orderOptions[orderOptionIndex].sort,
        follow,
        followed,
        tags,
        name,
      });

      setCharacters(response.data.characters);
      setIsContinue(response.data.isContinue);
      setLoadEnd(true);
    })();
  }, [
    isAuthenticated,
    csrfHeader,
    router.isReady,
    orderOptionIndex,
    follow,
    followed,
    tags,
    name,
  ]);

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
      <PageData title="キャラクター検索" />
      <Heading>キャラクター検索</Heading>
      <SearchForm onSearch={() => {}}>
        <SearchForm.TextFields>
          <SearchForm.TextField
            label="名前"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <SearchForm.TextField
            label="タグ"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            help={
              <>
                スペースで区切ることでAND検索、先頭に-
                <span className={styles['supplement']}>（半角ハイフン）</span>
                をつけることで除外検索ができます。
              </>
            }
          />
          <SearchForm.TextField
            label="スキル名"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            help={
              <>
                スペースで区切ることでAND検索、先頭に-
                <span className={styles['supplement']}>（半角ハイフン）</span>
                をつけることで除外検索ができます。
                <br />
                変更後のスキル名ではなく、デフォルトのスキル名が検索対象となります。
              </>
            }
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
            value={followInput}
            onChange={(value) => setFollowInput(value)}
            options={[
              { label: 'フォロー条件なし', value: null },
              { label: 'フォロー中', value: true },
              { label: 'フォロー外', value: false },
            ]}
            enabled={followInput !== null}
          />
          <SearchForm.Options
            value={followedInput}
            onChange={(value) => setFollowedInput(value)}
            options={[
              { label: 'フォロワー条件なし', value: null },
              { label: 'フォロワー', value: true },
              { label: 'フォロワー外', value: false },
            ]}
            enabled={followedInput !== null}
          />
        </SearchForm.OptionGroup>
        <SearchForm.Buttons>
          <SearchForm.SearchButton />
        </SearchForm.Buttons>
      </SearchForm>
      <Heading>検索結果</Heading>
      {!loadEnd ? (
        <Loading />
      ) : (
        <>
          {/*<CharacterList noCharactersMessage="条件に合致するキャラクターが存在しません。">
            {characters.map((character) => {
              return <CharacterList.Item key={character.id} {...character} />;
            })}
          </CharacterList>*/}
        </>
      )}
      {loadEnd && isContinue && (
        <div
          className={styles['continue-load-button']}
          onClick={async () => {
            const response = await axios.post<Response>(
              `/characters/search`,
              {
                follow: follow,
                followed: followed,
                tags: tags,
                name: name,
                offset: characters.length,
              },
              {
                headers: csrfHeader,
              }
            );

            const newCharacters = [...characters, ...response.data.characters];
            setCharacters(newCharacters);
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
