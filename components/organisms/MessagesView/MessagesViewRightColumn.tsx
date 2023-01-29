import { mdiCheck, mdiFloppy, mdiMagnify, mdiSwapHorizontal } from '@mdi/js';
import Icon from '@mdi/react';
import classnames from 'classnames';
import { useRouter } from 'next/router';
import { MouseEventHandler, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import SelectAsync from 'react-select/async';

import {
  getCategories,
  getCategoryName,
  toQueryString,
} from './FetchOptionManager';
import { NamedMessagesFetchConfig, MessagesFetchConfig } from './types';

import SelectOption from '@/components/atoms/SelectOption/SelectOption';
import ConfirmModal from '@/components/molecules/ConfirmModal/ConfirmModal';
import useCsrfHeader from 'hooks/useCsrfHeader';
import roomClassName from 'lib/roomClassName';
import axios from 'plugins/axios';

type SelectOption = {
  value: number;
  label: string;
};

const MenuItem = (props: {
  label: string;
  icon: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  disabled?: boolean;
}) => {
  return (
    <div
      className={classnames(roomClassName('right-menu'), {
        [roomClassName('disabled')]: !!props.disabled,
      })}
      onClick={props.onClick}
    >
      <div className={roomClassName('right-menu-icon')}>
        <Icon path={props.icon} />
      </div>
      <div className={roomClassName('right-menu-label')}>{props.label}</div>
    </div>
  );
};

const ToggleMenu = (props: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  stable?: boolean;
}) => {
  return (
    <MenuItem
      label={props.label}
      icon={props.stable ? mdiSwapHorizontal : mdiCheck}
      onClick={() => props.onChange(!props.value)}
      disabled={!props.value}
    />
  );
};

const MessagesViewRightColumn = (props: {
  currentFetchConfig: MessagesFetchConfig;
  lists: ListOverview[];
  onTargetCharacterChange: (target: number) => void;
  onAddSavedFetchConfig: (config: NamedMessagesFetchConfig) => void;
}) => {
  const csrfHeader = useCsrfHeader();

  const router = useRouter();
  const [search, setSearch] = useState(props.currentFetchConfig.search || '');

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');

  const [selectedCharacter, setSelectedCharacter] =
    useState<SelectOption | null>(null);

  const fetchCharacterInlineSearchResult = (
    inputValue: string,
    callback: (options: SelectOption[]) => any
  ) => {
    if (!csrfHeader || !inputValue) {
      callback([]);
      return;
    }

    (async () => {
      const response = await axios.post<CharacterInlineSearchResult[]>(
        '/characters/inline-search',
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

  useEffect(() => {
    if (props.currentFetchConfig.search != null) {
      setSearch(props.currentFetchConfig.search);
    }
  }, [props.currentFetchConfig.search]);

  // 指定会話条件は選択されている時以外は出ないように
  const categories =
    props.currentFetchConfig.category == 'conversation'
      ? getCategories()
      : getCategories().filter((category) => category != 'conversation');

  return (
    <div className={roomClassName('right-column-wrapper')}>
      <div className={roomClassName('right-column')}>
        {router.isReady && (
          <SelectOption
            options={categories.map((category) => ({
              label: getCategoryName(category),
              value: category,
            }))}
            value={props.currentFetchConfig.category}
            onChange={(category) => {
              const newFetchConfig: MessagesFetchConfig = {
                ...props.currentFetchConfig,
                category: category,
              };

              router.push(router.pathname + toQueryString(newFetchConfig));
            }}
          />
        )}
        {props.currentFetchConfig.category == 'search' && (
          <div className={roomClassName('text-search-wrapper')}>
            <input
              className={roomClassName('text-search-input')}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="検索するテキスト"
            />
            <button
              className={classnames(roomClassName('text-search-button'), {
                [roomClassName('disabled')]: !search,
              })}
              type="button"
              onClick={() => {
                if (!search) {
                  toast.error('検索するテキストを入力して下さい');
                  return;
                }

                const newFetchConfig: MessagesFetchConfig = {
                  ...props.currentFetchConfig,
                  search: search,
                };

                router.push(router.pathname + toQueryString(newFetchConfig));
              }}
            >
              <Icon
                path={mdiMagnify}
                className={roomClassName('text-search-button-icon')}
              />
            </button>
          </div>
        )}
        {props.currentFetchConfig.category == 'list' && (
          <div style={{ marginTop: 5 }}>
            <SelectOption
              options={[
                {
                  label: props.lists.length
                    ? 'リストを選択'
                    : 'リストがありません',
                  value: null,
                  isPlaceholder: true,
                },
                ...props.lists.map((list) => ({
                  label: list.name,
                  value: list.id,
                })),
              ]}
              value={props.currentFetchConfig.list}
              onChange={(list) => {
                const newFetchConfig: MessagesFetchConfig = {
                  ...props.currentFetchConfig,
                  list: list,
                };

                router.push(router.pathname + toQueryString(newFetchConfig));
              }}
            />
          </div>
        )}
        {(props.currentFetchConfig.category == 'character' ||
          props.currentFetchConfig.category == 'character-replied') && (
          <div style={{ marginTop: 5 }}>
            <SelectAsync
              placeholder="キャラクターを検索"
              value={selectedCharacter}
              onChange={(e) => {
                if (e == null) return;
                setSelectedCharacter({
                  value: e.value,
                  label: e.label,
                });
                props.onTargetCharacterChange(e.value);
              }}
              loadOptions={fetchCharacterInlineSearchResult}
              loadingMessage={() => '検索中…'}
              noOptionsMessage={() => '該当なし'}
            />
          </div>
        )}
        <ToggleMenu
          label="関連性の薄い発言を非表示"
          value={!!props.currentFetchConfig.relateFilter}
          onChange={(relateFilter) => {
            const newFetchConfig: MessagesFetchConfig = {
              ...props.currentFetchConfig,
              relateFilter,
            };

            router.push(router.pathname + toQueryString(newFetchConfig));
          }}
        />
        {props.currentFetchConfig.room != null && (
          <ToggleMenu
            label="所属ルームの発言も取得"
            value={!!props.currentFetchConfig.children}
            onChange={(children) => {
              const newFetchConfig: MessagesFetchConfig = {
                ...props.currentFetchConfig,
                children,
              };

              router.push(router.pathname + toQueryString(newFetchConfig));
            }}
          />
        )}
        <MenuItem
          label="現在の設定でタブを追加"
          icon={mdiFloppy}
          onClick={() => setIsConfigModalOpen(true)}
        />
        <ConfirmModal
          heading="現在の設定でタブを追加"
          disabled={newConfigName == ''}
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          onCancel={() => setIsConfigModalOpen(false)}
          onOk={async () => {
            if (!csrfHeader) return;

            const config: NamedMessagesFetchConfig = {
              name: newConfigName,
              ...props.currentFetchConfig,
            };

            try {
              await toast.promise(
                axios.post('/rooms/fetch-configs/add', config, {
                  headers: csrfHeader,
                }),
                {
                  error: '閲覧設定の保存中にエラーが発生しました',
                  loading: '閲覧設定を保存しています',
                  success: '閲覧設定を保存しました',
                }
              );

              setNewConfigName('');
              setIsConfigModalOpen(false);
              props.onAddSavedFetchConfig(config);
            } catch (e) {
              console.log(e);
            }
          }}
        >
          <div>
            現在の閲覧設定をタブに追加します。新しい閲覧設定の名前を入力してください。
          </div>
          <div className={roomClassName('config-modal-input-wrapper')}>
            <input
              className={roomClassName('config-modal-open-input')}
              type="text"
              placeholder="新しい閲覧設定名"
              value={newConfigName}
              onChange={(e) => setNewConfigName(e.target.value)}
            />
          </div>
        </ConfirmModal>
      </div>
    </div>
  );
};

export default MessagesViewRightColumn;
