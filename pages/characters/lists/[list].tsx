import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import SelectAsync from 'react-select/async';
import useSWR, { useSWRConfig } from 'swr';

import CharacterIcon from '@/components/atoms/CharacterIcon/CharacterIcon';
import CommentarySection from '@/components/atoms/CommentarySection/CommentarySection';
import NoItemsMessage from '@/components/atoms/NoItemsMessage/NoItemsMessage';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import InputForm from '@/components/organisms/InputForm/InputForm';
import PageData from '@/components/organisms/PageData/PageData';
import DefaultPage from '@/components/template/DefaultPage/DefaultPage';
import styles from '@/styles/pages/characters/lists/[list].module.scss';
import Heading from 'components/atoms/Heading/Heading';
import Loading from 'components/organisms/Loading/Loading';
import useCsrfHeader from 'hooks/useCsrfHeader';
import useRequireAuthenticated from 'hooks/useRequireAuthenticated';
import characterIdText from 'lib/characterIdText';
import axios from 'plugins/axios';

type SelectOption = {
  value: number;
  label: string;
};

const CharacterList: NextPage = () => {
  const router = useRouter();
  const csrfHeader = useCsrfHeader();

  useRequireAuthenticated();

  const { mutate } = useSWRConfig();
  const { data, error } = useSWR<{
    name: string;
    characters: CharacterOverview[];
  }>(!router.isReady ? null : `/characters/main/lists/${router.query.list}`);
  const [removeTargetId, setRemoveTargetId] = useState<number | null>(null);
  const [selectedCharacter, setSelectedCharacter] =
    useState<SelectOption | null>(null);

  if (error) {
    return (
      <DefaultPage>
        <PageData title="リスト管理" />
        <Heading>リスト管理</Heading>
        <CommentarySection>表示中にエラーが発生しました。</CommentarySection>
      </DefaultPage>
    );
  }

  if (!data) {
    return (
      <DefaultPage>
        <PageData title="リスト管理" />
        <Heading>リスト管理</Heading>
        <Loading />
      </DefaultPage>
    );
  }

  const fetchInviteTargetSearchResult = (
    inputValue: string,
    callback: (options: SelectOption[]) => any
  ) => {
    if (!csrfHeader || !inputValue) {
      callback([]);
      return;
    }

    (async () => {
      const response = await axios.post<CharacterInlineSearchResult[]>(
        `/characters/main/lists/${router.query.list}/search-target`,
        {
          text: inputValue,
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

  const removeTarget = data.characters.filter(
    (character) => character.id == removeTargetId
  ).length
    ? data.characters.filter((character) => character.id == removeTargetId)[0]
    : null;

  return (
    <DefaultPage>
      <PageData title={`リスト管理 | ${data.name}`} />
      <Heading>リストキャラクター追加</Heading>
      <section className={styles['new-character']}>
        <InputForm
          onSubmit={(e) => {
            e.preventDefault();

            if (!csrfHeader) return;
            if (!selectedCharacter) return;

            (async () => {
              try {
                await toast.promise(
                  axios.post(
                    `/characters/main/lists/${router.query.list}/add`,
                    {
                      target: selectedCharacter.value,
                    },
                    { headers: csrfHeader }
                  ),
                  {
                    loading: 'キャラクターを追加しています',
                    success: 'キャラクターを追加しました',
                    error: 'キャラクターの追加中にエラーが発生しました',
                  }
                );

                mutate(`/characters/main/lists/${router.query.list}`);
                setSelectedCharacter(null);
              } catch (e) {
                console.log(e);
              }
            })();
          }}
        >
          <InputForm.General label="追加対象">
            <SelectAsync
              id="list-target"
              instanceId="list-target"
              placeholder="相手の登録番号もしくは名前で検索"
              value={selectedCharacter}
              onChange={(e) => {
                setSelectedCharacter(e);
              }}
              loadOptions={fetchInviteTargetSearchResult}
              loadingMessage={() => '検索中…'}
              noOptionsMessage={() => '該当なし'}
            />
          </InputForm.General>
          <InputForm.Button disabled={selectedCharacter == null}>
            追加する
          </InputForm.Button>
        </InputForm>
      </section>
      <Heading>リストキャラクター管理</Heading>
      {!data.characters.length && (
        <NoItemsMessage>リストにキャラクターが存在しません。</NoItemsMessage>
      )}
      {!!data.characters.length && (
        <section className={styles['list-characters']}>
          {data.characters.map((character) => {
            return (
              <section key={character.id} className={styles['list-character']}>
                <div className={styles['icon-wrapper']}>
                  <CharacterIcon url={character.mainicon} />
                </div>
                <Link
                  href={{
                    pathname: '/characters/[id]',
                    query: { id: character.id },
                  }}
                >
                  <a className={styles['character-names']}>
                    <span className={styles['character-name']}>
                      {character.name}
                    </span>
                    <span className={styles['character-id']}>
                      {characterIdText(character.id)}
                    </span>
                  </a>
                </Link>
                <div
                  className={styles['character-remove-button']}
                  onClick={() => setRemoveTargetId(character.id)}
                >
                  削除
                </div>
              </section>
            );
          })}
        </section>
      )}
      <ConfirmModal
        heading="キャラクターの除外"
        isOpen={removeTarget != null}
        onClose={() => setRemoveTargetId(null)}
        onCancel={() => setRemoveTargetId(null)}
        onOk={async () => {
          if (!csrfHeader || !removeTarget) return;

          try {
            await toast.promise(
              axios.post(
                `/characters/main/lists/${router.query.list}/remove`,
                {
                  target: removeTarget.id,
                },
                {
                  headers: csrfHeader,
                }
              ),
              {
                loading: 'リストから削除しています',
                success: 'リストから削除しました',
                error: 'リストの変更中にエラーが発生しました',
              }
            );

            mutate(`/characters/main/lists/${router.query.list}`);
            setRemoveTargetId(null);
          } catch (e) {
            console.log(e);
          }
        }}
      >
        {removeTarget != null && (
          <>本当に{removeTarget.name}をリストから削除しますか？</>
        )}
      </ConfirmModal>
    </DefaultPage>
  );
};

export default CharacterList;
